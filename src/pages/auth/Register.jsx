import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import FlexBoxComponent from "../../components/common/FlexBox";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAppTheme } from "../../context/AppThemeContext";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { ROUTES } from "../../constants/routes";

const FormCard = styled(FlexBoxComponent)`
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  padding: 3.5rem 3rem;
  border-radius: 24px;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 25px rgba(0, 0, 0, 0.2)"
      : "0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 25px rgba(0, 0, 0, 0.08)"};
  background-color: ${({ theme }) => theme.colors.surface};
  width: 100%;
  max-width: 550px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  animation: slideUp 0.6s ease-out;
  backdrop-filter: blur(20px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.18), 0 10px 30px rgba(0, 0, 0, 0.12);
  }

  &::after {
    content: "";
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `radial-gradient(circle, ${theme.colors.primary}10 0%, transparent 70%)`
        : `radial-gradient(circle, ${theme.colors.primary}08 0%, transparent 70%)`};
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? "0 25px 70px rgba(0, 0, 0, 0.35), 0 10px 30px rgba(0, 0, 0, 0.25)"
        : "0 25px 70px rgba(0, 0, 0, 0.15), 0 10px 30px rgba(0, 0, 0, 0.1)"};
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 768px) {
    width: 90%;
    max-width: 500px;
    padding: 3rem 2.5rem;
    margin: 0 auto;
  }

  @media (max-width: 480px) {
    width: 95%;
    padding: 2.5rem 2rem;
    margin: 0 auto;
    border-radius: 20px;
  }

  @media (max-width: 360px) {
    width: 98%;
    padding: 2rem 1.5rem;
    margin: 0 auto;
  }
`;

const Title = styled.h1`
  margin-bottom: 0.5rem;
  margin-top: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 800;
  text-align: center;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.text} 0%,
    ${({ theme }) => theme.colors.primary} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  line-height: 1.2;

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
  margin-bottom: 2.5rem;
  font-size: clamp(1rem, 2vw, 1.15rem);
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  letter-spacing: 0.2px;
  line-height: 1.6;

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

const StepsIndicator = styled.div`
  display: flex;
  margin-bottom: 2.5rem;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 8px;

  @media (max-width: 480px) {
    margin-bottom: 2rem;
    gap: 6px;
  }

  @media (max-width: 360px) {
    margin-bottom: 1.5rem;
    gap: 4px;
  }
`;

const StepDot = styled.div`
  width: ${({ $active }) => ($active ? "14px" : "12px")};
  height: ${({ $active }) => ($active ? "14px" : "12px")};
  border-radius: 50%;
  background: ${({ theme, $active }) =>
    $active
      ? `linear-gradient(135deg, ${theme.colors.primary}, ${
          theme.colors.accent || theme.colors.primary
        })`
      : theme.colors.border};
  margin: 0;
  transition: all 0.3s ease;
  box-shadow: ${({ theme, $active }) =>
    $active ? `0 2px 8px ${theme.colors.primary}40` : "none"};

  @media (max-width: 480px) {
    width: ${({ $active }) => ($active ? "12px" : "10px")};
    height: ${({ $active }) => ($active ? "12px" : "10px")};
  }

  @media (max-width: 360px) {
    width: ${({ $active }) => ($active ? "10px" : "8px")};
    height: ${({ $active }) => ($active ? "10px" : "8px")};
  }
`;

const CompanyList = styled.div`
  margin: 1rem 0;
  max-height: 150px;
  overflow-y: auto;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow}20;

  @media (max-width: 480px) {
    max-height: 120px;
  }

  @media (max-width: 360px) {
    max-height: 100px;
  }
`;

const CompanyItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
  }

  @media (max-width: 360px) {
    padding: 8px 10px;
  }
`;

const Checkbox = styled.input`
  margin-right: 12px;

  @media (max-width: 480px) {
    margin-right: 8px;
  }
`;

const CompanyName = styled.span`
  flex: 1;
  font-size: 0.9rem;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }

  @media (max-width: 360px) {
    font-size: 0.8rem;
  }
`;

const MaskedEmail = styled.div`
  padding: 14px 16px;
  background-color: ${({ theme }) => theme.colors.background + "80"};
  border-radius: 8px;
  margin-bottom: 1rem;
  width: fit-content;
  font-family: monospace;
  letter-spacing: 1px;
  font-size: 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow}10;

  @media (max-width: 768px) {
    width: 100%;
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    padding: 12px 14px;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
  }

  @media (max-width: 360px) {
    padding: 10px 12px;
    font-size: 0.75rem;
  }
`;

const InfoMessage = styled.div`
  padding: 14px 16px;
  margin: 5px 0;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.info + "20"};
  border-left: 4px solid ${({ theme }) => theme.colors.info};
  font-size: 0.9rem;
  line-height: 1.6;

  @media (max-width: 768px) {
    padding: 12px 14px;
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 0.8rem;
  }

  @media (max-width: 360px) {
    padding: 8px 10px;
    font-size: 0.75rem;
  }
`;

const PasswordRequirements = styled.ul`
  margin: 8px 0;
  padding-left: 20px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};

  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding-left: 16px;
  }

  @media (max-width: 360px) {
    font-size: 0.75rem;
    padding-left: 12px;
  }
`;

const RequirementItem = styled.li`
  margin-bottom: 4px;
  color: ${({ theme, $met }) =>
    $met ? theme.colors.success : theme.colors.textLight};

  @media (max-width: 480px) {
    margin-bottom: 3px;
  }

  @media (max-width: 360px) {
    margin-bottom: 2px;
  }
`;

const ContactMessage = styled.div`
  padding: 18px 20px;
  margin: 16px 0;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.error + "15"};
  border-left: 4px solid ${({ theme }) => theme.colors.error};
  font-size: 0.95rem;
  line-height: 1.6;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.error}20;

  @media (max-width: 768px) {
    padding: 16px 18px;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    padding: 14px 16px;
    font-size: 0.85rem;
    margin: 12px 0;
  }

  @media (max-width: 360px) {
    padding: 12px 14px;
    font-size: 0.8rem;
    margin: 10px 0;
  }
`;

const StyledForm = styled.form`
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

const BackToLoginButton = styled(Button)`
  margin: 0 !important;
  padding: 0.75rem 1.5rem !important;
  font-size: 0.85rem !important;

  @media (max-width: 480px) {
    padding: 0.65rem 1.25rem !important;
    font-size: 0.8rem !important;
  }

  @media (max-width: 360px) {
    padding: 0.6rem 1rem !important;
    font-size: 0.75rem !important;
  }
`;

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  height: 100vh;
  height: 100dvh;
  width: 100%;
  margin: 0;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
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
        ? `radial-gradient(circle at 20% 50%, ${
            theme.colors.primary
          }12 0%, transparent 50%),
           radial-gradient(circle at 80% 80%, ${
             theme.colors.accent || theme.colors.primary
           }08 0%, transparent 50%)`
        : `radial-gradient(circle at 20% 50%, ${
            theme.colors.primary
          }10 0%, transparent 50%),
           radial-gradient(circle at 80% 80%, ${
             theme.colors.accent || theme.colors.primary
           }06 0%, transparent 50%)`};
    pointer-events: none;
    z-index: 0;
  }

  &::after {
    content: "";
    position: absolute;
    top: -50%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `radial-gradient(circle, ${theme.colors.primary}08 0%, transparent 70%)`
        : `radial-gradient(circle, ${theme.colors.primary}06 0%, transparent 70%)`};
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    animation: float 20s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(-30px, -30px) scale(1.1);
    }
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

const SuccessIcon = styled.div`
  margin: 1rem 0;

  @media (max-width: 480px) {
    margin: 0.75rem 0;
  }

  @media (max-width: 360px) {
    margin: 0.5rem 0;
  }
`;

const CompanySection = styled.div`
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    margin-bottom: 1.25rem;
  }

  @media (max-width: 360px) {
    margin-bottom: 1rem;
  }
`;

const CompanyTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }

  @media (max-width: 360px) {
    font-size: 0.85rem;
  }
`;

const AdditionalAccessBox = styled.div`
  padding: 1.25rem 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.info};
  border-radius: 10px;
  margin-bottom: 1.5rem;
  background-color: ${({ theme }) => theme.colors.info}20;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.info}15;

  @media (max-width: 768px) {
    padding: 1.125rem 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 1rem 1.125rem;
    margin-bottom: 1.25rem;
  }

  @media (max-width: 360px) {
    padding: 0.875rem 1rem;
    margin-bottom: 1rem;
  }
`;

const AdditionalAccessTitle = styled.p`
  margin: 0 0 0.5rem 0;
  font-weight: 500;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }

  @media (max-width: 360px) {
    font-size: 0.85rem;
  }
`;

const AdditionalAccessText = styled.p`
  margin: 0;
  font-size: 0.9rem;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }

  @media (max-width: 360px) {
    font-size: 0.8rem;
  }
`;

// Información de contacto reutilizable
const contactInfo = {
  phone: "+593 (07) 2800 022",
  emailSoporte: "comunicacion@maxximundo.com",
  emailVentas: "comunicacion@maxximundo.com",
};

const Register = () => {
  const { theme } = useAppTheme();
  const navigate = useNavigate();
  const { verifyIdentification, registerUser } = useAuth();

  // Estados
  const [step, setStep] = useState(1);
  const [identification, setIdentification] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [existinEmails, setExistingEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [maskedEmails, setMaskedEmails] = useState("");
  const [userCompanies, setUserCompanies] = useState([]); // Nuevo estado para las empresas del usuario

  // Nuevos estados para las contraseñas
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Limpiar errores cuando se modifican los campos
  useEffect(() => {
    setError("");
  }, [identification, email]);

  useEffect(() => {
    setPasswordError("");
  }, [password, confirmPassword]);

  const checkPasswordRequirements = () => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      allMet: hasMinLength && hasUpperCase && hasLowerCase && hasNumber,
    };
  };

  // Formatear la cédula o RUC mientras el usuario escribe
  const handleIdentificationChange = (e) => {
    const value = e.target.value;
    // Permitir solo números y limitar la longitud
    const formattedValue = value.replace(/\D/g, "").slice(0, 13);
    setIdentification(formattedValue);
  };

  // Verificar identificación - con manejo mejorado de casos especiales
  const handleVerify = async () => {
    if (identification.length !== 13) {
      setError("El RUC debe tener 13 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Llamar a la función de verificación del AuthContext
      const response = await verifyIdentification(identification);

      if (response.success) {
        // Verificar si hay emails asociados
        if (!response.emails || response.emails.length === 0) {
          // Caso 1: No hay correos asociados a esta identificación
          setError(
            "No hay correos electrónicos asociados a esta identificación. "
          );
          setLoading(false);
          return;
        }

        // Usuario existente con emails
        setMaskedEmails(response.maskedEmails);
        setExistingEmails(response.emails);
        setUserName(response.userName);

        // Guardar y mostrar las empresas ya asignadas
        if (response.userCompanies && response.userCompanies.length > 0) {
          setUserCompanies(response.userCompanies);
        }

        // Avanzar al siguiente paso
        setStep(2);
      } else {
        // Manejar diferentes tipos de errores según el mensaje o código
        if (
          response.status === 404 ||
          response.message?.includes("no encontr") ||
          response.message?.includes("no exist")
        ) {
          // Caso 2: Identificación no existe en el sistema
          setError("Esta identificación no existe en nuestro sistema. ");
        } else {
          // Otros errores
          setError(response.message || "Error al verificar la identificación");
        }
      }
    } catch (err) {
      // Verificar si es un error 404
      if (err.response?.status === 404) {
        setError("Esta identificación no existe en nuestro sistema. ");
      } else {
        setError("Error de conexión. Inténtelo más tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Verificar contraseñas
  const validatePasswords = () => {
    if (!password) {
      setPasswordError("La contraseña es obligatoria");
      return false;
    }

    const requirements = checkPasswordRequirements();
    if (!requirements.allMet) {
      setPasswordError("La contraseña no cumple con los requisitos mínimos");
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return false;
    }

    // Si todo está bien, limpiar errores
    setPasswordError("");
    return true;
  };

  // Verificar email existente
  const handleEmailVerify = async () => {
    if (!email) {
      setError("Por favor ingrese su correo electrónico");
      return;
    }

    setLoading(true);

    try {
      if (existinEmails.includes(email)) {
        // Si el email es correcto, ahora vamos al paso de contraseña
        toast.success("Correo verificado correctamente");

        // Ahora iremos al paso de contraseña (2.5) en lugar del paso 3
        setStep(2.5);
      } else {
        setError("El correo electrónico ingresado no coincide");
      }
    } catch (err) {
      setError("Error de conexión. Inténtelo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Enviar contraseña y avanzar
  const handlePasswordSubmit = async () => {
    // Validar contraseñas
    if (!validatePasswords()) {
      return;
    }

    // Crear el objeto JSON con los datos del usuario
    const userData = {
      email: email,
      password: password,
      role: 3,
      account: identification,
      name: userName,
      enterprises: userCompanies.join(","),
    };

    const response = await registerUser(userData);

    if (response.success) {
      toast.success("Usuario registrado exitosamente");
      // Avanzar al paso 3
      setStep(3);
    } else {
      // Manejar errores de registro
      setError(response.message || "Error al registrar el usuario");
    }
  };

  // Renderizar paso 1: Ingreso de RUC
  const renderStep1 = () => (
    <>
      <Title>Registro de usuario</Title>
      <Subtitle>Ingresa el RUC de la empresa asociada</Subtitle>

      <StyledForm>
        <Input
          label="RUC"
          value={identification}
          onChange={handleIdentificationChange}
          placeholder="Ejemplo: 0102999999001"
          required
          leftIconName="FaIdCard"
          leftIconLibrary={4}
          errorMessage={error}
        />

        {error ? (
          <ContactMessage>
            <p>{error}{" "}Por favor comuníquese con soporte para poder ayudarlo.</p>
            <p style={{ marginTop: "8px", fontWeight: "500" }}>Contacto:</p>
            <ul style={{ margin: "4px 0 0 16px" }}>
              <li>Teléfono: {contactInfo.phone}</li>
              <li>
                Email:{" "}
                {error.includes("actualizar sus datos")
                  ? contactInfo.emailSoporte
                  : contactInfo.emailVentas}
              </li>
            </ul>
          </ContactMessage>
        ) : (
          <div
            style={{
              color: theme.colors.error,
              fontSize: "0.85rem",
              marginTop: "8px",
            }}
          >
            {error}
          </div>
        )}

        <Button
          type="submit"
          text="Verificar"
          disabled={identification.length !== 13 || loading}
          onClick={async (e) => {
            e.preventDefault();
            await handleVerify();
          }}
        />

        <BackToLoginButton
          text="Volver a inicio de sesión"
          variant="outlined"
          onClick={() => navigate(ROUTES.AUTH.LOGIN)}
        />
      </StyledForm>
    </>
  );

  // Renderizar paso 2: Selección de empresas o verificación de email
  const renderStep2 = () => (
    <>
      <Title>Registro de usuario</Title>

      <>
        <Subtitle>Verificar correo electrónico</Subtitle>
        <InfoMessage>
          Ya existe la identificación en nuestro sistema. Para continuar,
          ingresa uno de los correos electrónicos asociado a tu cuenta.
          <br />
          <strong>
            Si no tienes acceso a ninguno de estos correos, por favor contacta a
            soporte.
            <ul style={{ margin: "4px 0 0 16px" }}>
              <li>Teléfono: {contactInfo.phone}</li>
              <li>
                Email:{" "}
                {error.includes("actualizar sus datos")
                  ? contactInfo.emailSoporte
                  : contactInfo.emailVentas}
              </li>
            </ul>
          </strong>
        </InfoMessage>

        <MaskedEmail>
          Correo/s registrado/s:{" "}
          <div>
            {maskedEmails.map((maskedEmail, index) => (
              <li key={index}>{maskedEmail}</li>
            ))}
          </div>
        </MaskedEmail>

        <StyledForm
          onSubmit={(e) => {
            e.preventDefault();
            handleEmailVerify();
          }}
        >
          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu correo"
            required
            leftIconName="FaEnvelope"
            errorMessage={error}
          />

          <Button type="submit" text="Verificar correo" />

          <Button text="Volver" variant="outlined" onClick={() => setStep(1)} />
        </StyledForm>
      </>
    </>
  );

  // Renderizar paso 2.5: Configuración de contraseña
  const renderPasswordStep = () => (
    <>
      <Title>Configurar contraseña</Title>
      <Subtitle>Establece una contraseña segura</Subtitle>

      <InfoMessage>
        Para completar la verificación de tu cuenta, por favor establece una
        contraseña segura.
      </InfoMessage>

      <StyledForm>
        <Input
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingresa tu contraseña"
          required
          leftIconName="FaLock"
          rightIcon={{
            name: showPassword ? "Eye" : "EyeOff",
            library: 4,
            onClick: () => setShowPassword(!showPassword),
            style: { cursor: "pointer" },
          }}
          errorMessage={passwordError}
        />

        <PasswordRequirements>
          {Object.entries(checkPasswordRequirements()).map(([req, met]) => {
            if (req === "allMet") return null;

            let label = "";
            switch (req) {
              case "hasMinLength":
                label = "Al menos 8 caracteres";
                break;
              case "hasUpperCase":
                label = "Al menos una mayúscula (A-Z)";
                break;
              case "hasLowerCase":
                label = "Al menos una minúscula (a-z)";
                break;
              case "hasNumber":
                label = "Al menos un número (0-9)";
                break;
              case "hasSpecialChar":
                label = "Al menos un carácter especial (!@#$...)";
                break;
              default:
                break;
            }

            return (
              <RequirementItem key={req} $met={met}>
                {label}
              </RequirementItem>
            );
          })}
        </PasswordRequirements>

        <Input
          label="Confirmar contraseña"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirma tu contraseña"
          required
          leftIconName="FaLock"
        />

        <Button
          text="Continuar"
          disabled={loading}
          onClick={async (e) => {
            e.preventDefault();
            await handlePasswordSubmit();
          }}
        />

        <Button text="Volver" variant="outlined" onClick={() => setStep(2)} />
      </StyledForm>
    </>
  );

  // Renderizar paso 3: Selección de empresas para usuario existente
  const renderStep3 = () => (
    <>
      <Title>Cuenta verificada</Title>
      <Subtitle>Información de acceso</Subtitle>

      <SuccessIcon>
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ margin: "0 auto", display: "block" }}
        >
          <path
            d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9819C18.7182 19.709 16.9033 20.9726 14.8354 21.584C12.7674 22.1954 10.5573 22.122 8.53447 21.3747C6.51168 20.6274 4.78465 19.2462 3.61096 17.4371C2.43727 15.628 1.87979 13.488 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98234 16.07 2.86"
            stroke={theme.colors.success}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 4L12 14.01L9 11.01"
            stroke={theme.colors.success}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </SuccessIcon>

      <InfoMessage style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        Hemos verificado tu cuenta exitosamente
      </InfoMessage>

      {userCompanies && userCompanies.length > 0 && (
        <CompanySection>
          <CompanyTitle>
            Actualmente tienes acceso a las siguientes empresas:
          </CompanyTitle>
          <CompanyList>
            {userCompanies.map((companyName, index) => (
              <CompanyItem key={index} style={{ cursor: "default" }}>
                <CompanyName>{companyName}</CompanyName>
              </CompanyItem>
            ))}
          </CompanyList>
        </CompanySection>
      )}

      <AdditionalAccessBox>
        <AdditionalAccessTitle>
          ¿Necesitas acceso a más empresas?
        </AdditionalAccessTitle>
        <AdditionalAccessText>
          Para solicitar acceso a empresas adicionales, inicia sesión con tu
          cuenta y podrás hacerlo desde el panel principal.
        </AdditionalAccessText>
      </AdditionalAccessBox>

      <Button
        text="Ir a inicio de sesión"
        onClick={() => navigate(ROUTES.AUTH.LOGIN)}
      />
    </>
  );

  // Modificar renderCurrentStep para incluir el nuevo paso
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 2.5: // Nuevo paso para contraseña
        return renderPasswordStep();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <StyledPageContainer>
      <FormCard flexDirection="column" alignItems="center">
        <StepsIndicator>
          <StepDot $active={step >= 1} />
          <StepDot $active={step >= 2} />
          <StepDot $active={step >= 2.5} />
          <StepDot $active={step >= 3} />
        </StepsIndicator>

        {renderCurrentStep()}
      </FormCard>
    </StyledPageContainer>
  );
};

export default Register;
