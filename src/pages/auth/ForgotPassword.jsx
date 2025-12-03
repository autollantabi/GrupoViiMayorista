import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import FlexBoxComponent from "../../components/common/FlexBox";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import { api_users_getByEmail } from "../../api/users/apiUsers";
import PageContainer from "../../components/layout/PageContainer";

// Styled Components (reutilizando algunos del Login)
const StyledPageContainer = styled(PageContainer)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 1rem;
  position: relative;
  background: ${({ theme }) =>
    theme.name === "dark"
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
      theme.name === "dark"
        ? `radial-gradient(circle at 20% 50%, ${
            theme.colors.primary
          }08 0%, transparent 50%),
           radial-gradient(circle at 80% 80%, ${
             theme.colors.accent || theme.colors.primary
           }06 0%, transparent 50%)`
        : `radial-gradient(circle at 20% 50%, ${
            theme.colors.primary
          }08 0%, transparent 50%),
           radial-gradient(circle at 80% 80%, ${
             theme.colors.accent || theme.colors.primary
           }06 0%, transparent 50%)`};
    pointer-events: none;
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    padding: 1.5rem 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 1rem 0.5rem;
  }

  @media (max-width: 360px) {
    padding: 0.75rem 0.25rem;
  }
`;

const Card = styled(FlexBoxComponent)`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1);
  padding: 3.5rem 3rem;
  max-width: 480px;
  width: 100%;
  margin: 1rem;
  position: relative;
  overflow: hidden;
  animation: slideUp 0.5s ease-out;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.18), 0 10px 30px rgba(0, 0, 0, 0.12);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    width: 90%;
    max-width: 450px;
    padding: 3rem 2.5rem;
  }

  @media (max-width: 480px) {
    width: 95%;
    padding: 2.5rem 2rem;
    margin: 0.5rem;
    border-radius: 16px;
  }

  @media (max-width: 360px) {
    width: 98%;
    padding: 2rem 1.5rem;
    margin: 0.25rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;

  @media (max-width: 480px) {
    gap: 18px;
  }

  @media (max-width: 360px) {
    gap: 16px;
  }
`;

const Title = styled.h1`
  font-size: 2.25rem;
  margin-bottom: 0.5rem;
  margin-top: 0;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  font-weight: 700;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.accent || theme.colors.primary}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }

  @media (max-width: 360px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 400;
  margin-bottom: 2.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  letter-spacing: 0.3px;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
    margin-bottom: 1.75rem;
  }

  @media (max-width: 360px) {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
`;

const BackLink = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 24px;
  align-self: flex-start;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark || theme.colors.accent};
    text-decoration: underline;
    transform: translateX(-2px);
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-bottom: 18px;
    gap: 6px;
  }

  @media (max-width: 360px) {
    font-size: 0.75rem;
    margin-bottom: 16px;
    gap: 4px;
  }
`;

const CodeInputContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 16px 0;

  @media (max-width: 480px) {
    gap: 8px;
    margin: 14px 0;
  }

  @media (max-width: 360px) {
    gap: 6px;
    margin: 12px 0;
  }
`;

const CodeDigit = styled.input`
  width: 45px;
  height: 55px;
  text-align: center;
  font-size: 1.6rem;
  font-weight: 600;
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

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary}80;
  }

  @media (max-width: 768px) {
    width: 42px;
    height: 52px;
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    width: 38px;
    height: 48px;
    font-size: 1.4rem;
  }

  @media (max-width: 360px) {
    width: 34px;
    height: 44px;
    font-size: 1.3rem;
  }
`;

const Message = styled.div`
  margin: 8px 0;
  padding: 12px 16px;
  font-size: 0.9rem;
  border-radius: 8px;
  line-height: 1.5;
  color: ${({ theme, type }) =>
    type === "success" ? theme.colors.success : theme.colors.error};
  background-color: ${({ theme, type }) =>
    type === "success"
      ? theme.colors.success + "15"
      : theme.colors.error + "15"};
  border-left: 4px solid
    ${({ theme, type }) =>
      type === "success" ? theme.colors.success : theme.colors.error};
  box-shadow: 0 2px 8px
    ${({ theme, type }) =>
      type === "success"
        ? theme.colors.success + "20"
        : theme.colors.error + "20"};

  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 10px 14px;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin: 6px 0;
    padding: 8px 12px;
  }

  @media (max-width: 360px) {
    font-size: 0.75rem;
    margin: 5px 0;
    padding: 6px 10px;
  }
`;

const CodeInstructions = styled.p`
  text-align: center;
  margin: 0 0 20px;
  padding: 14px 16px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
  background-color: ${({ theme }) => theme.colors.info + "15"};
  border-left: 4px solid ${({ theme }) => theme.colors.info};
  border-radius: 8px;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin: 0 0 18px;
    padding: 12px 14px;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin: 0 0 16px;
    padding: 10px 12px;
  }

  @media (max-width: 360px) {
    font-size: 0.75rem;
    margin: 0 0 14px;
    padding: 8px 10px;
  }
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { sendVerificationCode, verifyCode, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Referencias para los inputs de código
  const codeInputRefs = Array.from({ length: 6 }, () => React.createRef());

  // Manejar cambio en el input de código
  const handleCodeChange = (index, value) => {
    if (value.length > 1) {
      // Si se pega un código completo
      const pastedCode = value.slice(0, 6).split("");
      const newCode = [...code];

      pastedCode.forEach((digit, i) => {
        if (i < 6) newCode[i] = digit;
      });

      setCode(newCode);

      // Enfocar el último input o el siguiente vacío
      const nextEmptyIndex = newCode.findIndex((digit) => digit === "");
      if (nextEmptyIndex !== -1) {
        codeInputRefs[nextEmptyIndex].current.focus();
      } else {
        codeInputRefs[5].current.focus();
      }
    } else {
      // Manejo normal de un solo dígito
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-avanzar al siguiente input
      if (value !== "" && index < 5) {
        codeInputRefs[index + 1].current.focus();
      }
    }
  };

  // Manejar tecla backspace en el input de código
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeInputRefs[index - 1].current.focus();
    }
  };

  // Verificar correo electrónico
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await api_users_getByEmail(email);
      if (response.success) {
        // Enviar código de verificación
        const codeResponse = await sendVerificationCode(email);
        if (codeResponse.success) {
          toast.success("Código de verificación enviado a su correo");
          setStep(2);
        } else {
          setMessage({
            text: codeResponse.message || "Error al enviar el código",
            type: "error",
          });
        }
      } else {
        setMessage({
          text: "No existe una cuenta asociada a este correo electrónico",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({ text: "Error al verificar el correo", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar código ingresado
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    const codeString = code.join("");
    if (codeString.length !== 6) {
      setMessage({
        text: "Ingrese el código de 6 dígitos completo",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await verifyCode(codeString);
      if (response.success && response.isValid) {
        toast.success("Código verificado correctamente");
        setStep(3);
      } else {
        setMessage({ text: response.message, type: "error" });
      }
    } catch (error) {
      setMessage({
        text: error.message || "Error al verificar el código",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Establecer nueva contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    if (password !== confirmPassword) {
      setMessage({ text: "Las contraseñas no coinciden", type: "error" });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage({
        text: "La contraseña debe tener al menos 6 caracteres",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await resetPassword(password);
      if (response.success) {
        toast.success("Contraseña actualizada correctamente");
        // Agregar mensaje en el componente
        setMessage({
          text: "¡Tu contraseña ha sido actualizada con éxito! Serás redirigido al inicio de sesión.",
          type: "success",
        });
        // Redirigir al login después de un breve momento
        setTimeout(() => {
          navigate(ROUTES.AUTH.LOGIN);
        }, 3000); // Aumenté el tiempo para que el usuario pueda ver el mensaje
      } else {
        setMessage({
          text: response.message || "Error al actualizar la contraseña",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({
        text: error.message || "Error al actualizar la contraseña",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Volver al paso anterior o al login
  const handleBack = () => {
    if (step === 1) {
      navigate(ROUTES.AUTH.LOGIN);
    } else {
      setStep(step - 1);
      setMessage({ text: "", type: "" });
    }
  };

  useEffect(() => {
    // Limpiar mensaje al cambiar inputs
    if (message.text) {
      setMessage({ text: "", type: "" });
    }
  }, [email, code, password, confirmPassword]);

  return (
    <StyledPageContainer>
      <Card flexDirection="column" alignItems="center">
        <BackLink onClick={handleBack}>
          <FaArrowLeft /> {step === 1 ? "Volver al inicio de sesión" : "Volver"}
        </BackLink>

        <Title>Recuperar contraseña</Title>
        {step === 1 && <Subtitle>Ingresa tu correo electrónico</Subtitle>}
        {step === 2 && <Subtitle>Ingresa el código de verificación</Subtitle>}
        {step === 3 && <Subtitle>Establece tu nueva contraseña</Subtitle>}

        {step === 1 && (
          <Form>
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="Ingresa tu correo"
              leftIconName="FaEnvelope"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />

            {message.text && (
              <Message type={message.type}>{message.text}</Message>
            )}

            <Button
              type="submit"
              text={isLoading ? "Verificando..." : "Continuar"}
              fullWidth
              onClick={async (e) => {
                await handleVerifyEmail(e);
              }}
            />
          </Form>
        )}

        {step === 2 && (
          <Form>
            <CodeInstructions>
              Hemos enviado un código de verificación de 6 dígitos a {email}
            </CodeInstructions>

            <CodeInputContainer>
              {code.map((digit, index) => (
                <CodeDigit
                  key={index}
                  ref={codeInputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={6} // Permitir pegado de código completo
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  required
                />
              ))}
            </CodeInputContainer>

            {message.text && (
              <Message type={message.type}>{message.text}</Message>
            )}

            <Button
              type="submit"
              text={isLoading ? "Verificando..." : "Verificar código"}
              fullWidth
              onClick={async (e) => {
                await handleVerifyCode(e);
              }}
            />

            <Button
              type="button"
              text="Reenviar código"
              variant="outlined"
              onClick={() => sendVerificationCode(email)}
              fullWidth
            />
          </Form>
        )}

        {step === 3 && (
          <Form>
            <Input
              label="Nueva contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu nueva contraseña"
              leftIconName="FaLock"
              rightIconName={showPassword ? "FaEyeSlash" : "FaEye"}
              onRightIconClick={() => setShowPassword(!showPassword)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            <Input
              label="Confirmar contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="Confirma tu nueva contraseña"
              leftIconName="FaLock"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
            />

            {message.text && (
              <Message type={message.type}>{message.text}</Message>
            )}

            {(message.type !== "success" || !message) && (
              <Button
                type="submit"
                text={isLoading ? "Actualizando..." : "Actualizar contraseña"}
                fullWidth
                onClick={async (e) => {
                  await handleResetPassword(e);
                }}
              />
            )}
          </Form>
        )}
      </Card>
    </StyledPageContainer>
  );
};

export default ForgotPassword;
