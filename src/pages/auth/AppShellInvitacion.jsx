import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import FlexBoxComponent from "../../components/common/FlexBox";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import RenderIcon from "../../components/ui/RenderIcon";
import {
  api_shell_invitation_get,
  api_shell_invitation_sendOtp,
  api_shell_invitation_verifyOtp,
  api_shell_invitation_register,
} from "../../api/shell/apiShellInvitacion";

/**
 * Registro en Club Shell Maxx desde la invitación que envía el asesor.
 *
 * Pantalla pública: el invitado todavía no tiene usuario de nada. La credencial es el token del
 * enlace (que llega por correo) más el código de un solo uso (que llega por WhatsApp al celular
 * que la empresa ya tiene registrado del cliente).
 *
 * A diferencia de /app-shell, aquí NO se lee nada de la sesión: el `sap_code` y las direcciones
 * los resuelve el backend, que es quien sabe a qué cuenta corresponde el token.
 */

const OTP_LENGTH = 6;

// Styled Components (mismo patrón que Login/Register/ForgotPassword, que también son públicas)
const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* A diferencia de ForgotPassword, aquí la altura NO se fija ni se recorta el desbordamiento:
     el paso 2 tiene seis campos y en móvil quedaría cortado. */
  min-height: 100dvh;
  height: auto;
  width: 100%;
  margin: 0;
  padding: 2rem 1rem;
  position: relative;
  overflow-y: auto;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface}15 50%, ${theme.colors.background} 100%)`
      : `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.primary}05 50%, ${theme.colors.background} 100%)`};

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `radial-gradient(circle at 20% 50%, ${theme.colors.primary}12 0%, transparent 50%)`
        : `radial-gradient(circle at 20% 50%, ${theme.colors.primary}10 0%, transparent 50%)`};
    pointer-events: none;
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 480px) {
    padding: 1rem 0.5rem;
  }
`;

const Card = styled(FlexBoxComponent)`
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 24px;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 20px 60px rgba(0, 0, 0, 0.3)"
      : "0 20px 60px rgba(0, 0, 0, 0.1)"};
  padding: 3rem 2.5rem;
  max-width: 520px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  animation: slideUp 0.5s ease-out;
  flex-shrink: 0;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.accent || theme.colors.primary}
    );
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 480px) {
    width: 95%;
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }
`;

const Logo = styled.img`
  width: 72px;
  height: auto;
  display: block;
  margin: 0 auto 1.25rem;
`;

const Title = styled.h1`
  font-size: clamp(1.6rem, 4vw, 2.1rem);
  margin: 0 0 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  font-weight: 400;
  margin: 0 0 2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const CodeInputContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 16px 0;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const CodeDigit = styled.input`
  width: 45px;
  height: 55px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  /* El código es alfanumérico en mayúsculas, no numérico como el de recuperar contraseña. */
  text-transform: uppercase;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}25;
    transform: scale(1.05);
  }

  @media (max-width: 480px) {
    width: 38px;
    height: 48px;
    font-size: 1.3rem;
  }

  @media (max-width: 360px) {
    width: 34px;
    height: 44px;
    font-size: 1.2rem;
  }
`;

const Message = styled.div`
  margin: 8px 0;
  padding: 12px 16px;
  font-size: 0.9rem;
  border-radius: 8px;
  line-height: 1.5;
  color: ${({ theme, $type }) =>
    $type === "success" ? theme.colors.success : theme.colors.error};
  background-color: ${({ theme, $type }) =>
    $type === "success" ? theme.colors.success + "15" : theme.colors.error + "15"};
  border-left: 4px solid
    ${({ theme, $type }) => ($type === "success" ? theme.colors.success : theme.colors.error)};
`;

const Instructions = styled.p`
  text-align: center;
  margin: 0 0 20px;
  padding: 14px 16px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
  background-color: ${({ theme }) => theme.colors.info + "15"};
  border-left: 4px solid ${({ theme }) => theme.colors.info};
  border-radius: 8px;
`;

const ResendRow = styled.div`
  text-align: center;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ResendLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    color: ${({ theme }) => theme.colors.textSecondary};
    cursor: default;
  }
`;

const StatusIconWrap = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, $error }) =>
    $error ? `${theme.colors.error}20` : `${theme.colors.primary}20`};
  border-radius: 50%;
  color: ${({ theme, $error }) => ($error ? theme.colors.error : theme.colors.primary)};
`;

const emptyCode = () => Array(OTP_LENGTH).fill("");

const AppShellInvitacion = () => {
  const { token } = useParams();

  // 'loading' | 'otp' | 'form' | 'done' | 'blocked'
  const [step, setStep] = useState("loading");
  const [managerName, setManagerName] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [message, setMessage] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [code, setCode] = useState(emptyCode);
  const [registrationKey, setRegistrationKey] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    correo: "",
    fechaNacimiento: "",
    telefono: "",
  });

  // useMemo y no createRef() suelto: recrearlos en cada render deja las referencias colgando
  // entre el render y el commit.
  const codeRefs = useMemo(
    () => Array.from({ length: OTP_LENGTH }, () => React.createRef()),
    []
  );

  // Evita que el envío automático del código se dispare dos veces con StrictMode en desarrollo,
  // que monta los efectos por partida doble. Cada envío gasta un mensaje de WhatsApp.
  const otpRequested = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * Al abrir el enlace: se valida y, si sirve, se pide el código.
   *
   * El GET va primero y es barato, así que la pantalla puede mostrar el nombre mientras el
   * envío —que implica buscar el celular del cliente— ocurre a continuación.
   */
  useEffect(() => {
    if (!token || otpRequested.current) return;
    otpRequested.current = true;

    let cancelled = false;

    async function iniciar() {
      const invitation = await api_shell_invitation_get(token);

      if (cancelled) return;

      if (!invitation.success) {
        setMessage({ type: "error", text: invitation.message });
        setStep("blocked");
        return;
      }

      setManagerName(invitation.data?.name || "");
      setStep("otp");

      const sent = await api_shell_invitation_sendOtp(token);

      if (cancelled) return;

      if (!sent.success) {
        setMessage({ type: "error", text: sent.message });
        return;
      }

      setMaskedPhone(sent.data?.maskedPhone || "");
      setMessage({ type: "success", text: sent.message });
    }

    iniciar();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResend = async () => {
    setIsSending(true);
    setMessage(null);
    setCode(emptyCode());

    const sent = await api_shell_invitation_sendOtp(token);

    setIsSending(false);
    setMessage({ type: sent.success ? "success" : "error", text: sent.message });

    if (sent.success) {
      setMaskedPhone(sent.data?.maskedPhone || maskedPhone);
      codeRefs[0]?.current?.focus();
    }
  };

  const handleCodeChange = (index, rawValue) => {
    const value = rawValue.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (value.length > 1) {
      // Pegado del código completo desde WhatsApp.
      const pasted = value.slice(0, OTP_LENGTH).split("");
      const next = emptyCode();
      pasted.forEach((char, i) => {
        next[i] = char;
      });
      setCode(next);

      const firstEmpty = next.findIndex((char) => char === "");
      const focusIndex = firstEmpty === -1 ? OTP_LENGTH - 1 : firstEmpty;
      codeRefs[focusIndex]?.current?.focus();
      return;
    }

    const next = [...code];
    next[index] = value;
    setCode(next);

    if (value && index < OTP_LENGTH - 1) {
      codeRefs[index + 1]?.current?.focus();
    }
  };

  const handleCodeKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      codeRefs[index - 1]?.current?.focus();
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    const otp = code.join("");

    if (otp.length !== OTP_LENGTH) {
      setMessage({ type: "error", text: `Ingresa el código de ${OTP_LENGTH} caracteres` });
      return;
    }

    setMessage(null);

    const result = await api_shell_invitation_verifyOtp(token, otp);

    if (!result.success) {
      setMessage({ type: "error", text: result.message });
      setCode(emptyCode());
      codeRefs[0]?.current?.focus();
      return;
    }

    const prefill = result.data?.prefill ?? {};

    setRegistrationKey(result.data?.registrationKey ?? null);
    setFormData((prev) => ({
      ...prev,
      nombre: prefill.name || "",
      apellido: prefill.lastname || "",
      cedula: prefill.cardId || "",
      correo: prefill.email || "",
      telefono: prefill.phone || "",
    }));
    setStep("form");
    window.scrollTo(0, 0);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage(null);

    const result = await api_shell_invitation_register(registrationKey, {
      name: formData.nombre.trim(),
      lastname: formData.apellido.trim(),
      card_id: formData.cedula.trim(),
      email: formData.correo.trim(),
      phone: formData.telefono.trim(),
      birth_date: formData.fechaNacimiento,
    });

    if (!result.success) {
      setMessage({ type: "error", text: result.message });

      // La llave dura poco: si expiró hay que volver a validar el código, no reintentar el envío.
      if (result.status === 401) {
        setStep("otp");
        setCode(emptyCode());
        setRegistrationKey(null);
      }
      return;
    }

    toast.success("¡Listo! Tu usuario de Club Shell Maxx fue creado.");
    setStep("done");
    window.scrollTo(0, 0);
  };

  const renderOtpStep = () => (
    <>
      <Title>Confirma que eres tú</Title>
      <Subtitle>
        {managerName ? `Hola ${managerName}, ` : ""}
        para continuar necesitamos verificar tu identidad.
      </Subtitle>

      <Instructions>
        {maskedPhone
          ? `Enviamos un código de ${OTP_LENGTH} caracteres por WhatsApp al ${maskedPhone}.`
          : "Estamos enviando tu código por WhatsApp..."}
      </Instructions>

      {message && <Message $type={message.type}>{message.text}</Message>}

      <Form onSubmit={handleVerify}>
        <CodeInputContainer>
          {code.map((digit, index) => (
            <CodeDigit
              key={index}
              ref={codeRefs[index]}
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              value={digit}
              onChange={(event) => handleCodeChange(index, event.target.value)}
              onKeyDown={(event) => handleCodeKeyDown(index, event)}
            />
          ))}
        </CodeInputContainer>

        <Button type="submit" text="Verificar código" fullWidth leftIconName="FaCheck" />

        <ResendRow>
          ¿No te llegó?{" "}
          <ResendLink type="button" onClick={handleResend} disabled={isSending}>
            {isSending ? "Enviando..." : "Enviar de nuevo"}
          </ResendLink>
        </ResendRow>
      </Form>
    </>
  );

  const renderFormStep = () => (
    <>
      <Title>Completa tu registro</Title>
      <Subtitle>Revisa tus datos y confirma para crear tu usuario de Club Shell Maxx.</Subtitle>

      {message && <Message $type={message.type}>{message.text}</Message>}

      <Form onSubmit={handleRegister}>
        <FormRow>
          <Input
            label="Nombre"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Ingresa tu nombre"
            required
            fullWidth
            leftIconName="FaUser"
          />
          <Input
            label="Apellido"
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleInputChange}
            placeholder="Ingresa tu apellido"
            required
            fullWidth
            leftIconName="FaUser"
          />
        </FormRow>

        <Input
          label="Cédula"
          type="text"
          name="cedula"
          value={formData.cedula}
          onChange={handleInputChange}
          placeholder="Ingresa tu cédula"
          required
          fullWidth
          leftIconName="FaIdCard"
        />

        <Input
          label="Correo"
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleInputChange}
          placeholder="correo@ejemplo.com"
          required
          fullWidth
          leftIconName="FaEnvelope"
        />

        <Input
          label="Fecha de Nacimiento"
          type="date"
          name="fechaNacimiento"
          value={formData.fechaNacimiento}
          onChange={handleInputChange}
          required
          fullWidth
          leftIconName="FaCalendar"
        />

        <Input
          label="Teléfono"
          type="tel"
          name="telefono"
          value={formData.telefono}
          onChange={handleInputChange}
          placeholder="0999999999"
          required
          fullWidth
          leftIconName="FaPhone"
        />

        <Button type="submit" text="Crear mi usuario" fullWidth leftIconName="FaPaperPlane" />
      </Form>
    </>
  );

  const renderDoneStep = () => (
    <>
      <StatusIconWrap>
        <RenderIcon name="FaCircleCheck" size={32} />
      </StatusIconWrap>
      <Title>¡Bienvenido a Club Shell Maxx!</Title>
      <Subtitle>
        Tu usuario fue creado. Te enviamos por correo las instrucciones para acceder a la
        aplicación.
      </Subtitle>
    </>
  );

  const renderBlockedStep = () => (
    <>
      <StatusIconWrap $error>
        <RenderIcon name="FaCircleExclamation" size={32} />
      </StatusIconWrap>
      <Title>No pudimos abrir tu invitación</Title>
      <Subtitle>{message?.text || "El enlace no es válido."}</Subtitle>
      <Instructions>
        Si crees que se trata de un error, comunícate con el asesor que te envió la invitación.
      </Instructions>
    </>
  );

  const renderStep = () => {
    switch (step) {
      case "otp":
        return renderOtpStep();
      case "form":
        return renderFormStep();
      case "done":
        return renderDoneStep();
      case "blocked":
        return renderBlockedStep();
      default:
        return <Subtitle>Validando tu invitación...</Subtitle>;
    }
  };

  return (
    <>
      {/* No se usa <SEO>: ese componente fuerza `index, follow` y un canonical hacia la home.
          El Disallow: /auth/ de robots.txt evita el rastreo; esto cubre el enlace directo. */}
      <Helmet>
        <title>Registro Club Shell Maxx</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <StyledPageContainer>
        <Card flexDirection="column" alignItems="center">
          <Logo src="/shell/ShellLogo.png" alt="Club Shell Maxx" />
          {renderStep()}
        </Card>
      </StyledPageContainer>
    </>
  );
};

export default AppShellInvitacion;
