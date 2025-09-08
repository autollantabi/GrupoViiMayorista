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
import PageContainer from "../../components/layout/PageContainer";

const FormCard = styled(FlexBoxComponent)`
  border: solid 1px ${({ theme }) => theme.colors.border};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: ${({ theme }) => theme.colors.surface};
  width: 500px;
  margin: 1rem;

  @media (max-width: 768px) {
    width: 90%;
    max-width: 450px;
    padding: 1.75rem;
  }

  @media (max-width: 480px) {
    width: 95%;
    padding: 1.5rem;
    margin: 0.5rem;
  }

  @media (max-width: 360px) {
    width: 98%;
    padding: 1rem;
    margin: 0.25rem;
  }
`;

const Title = styled.h1`
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.8rem;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }

  @media (max-width: 480px) {
    font-size: 1.4rem;
  }

  @media (max-width: 360px) {
    font-size: 1.2rem;
  }
`;

const Subtitle = styled.h2`
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 1.25rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 360px) {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }
`;

const StepsIndicator = styled.div`
  display: flex;
  margin-bottom: 2rem;
  justify-content: center;
  width: 100%;

  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }

  @media (max-width: 360px) {
    margin-bottom: 1rem;
  }
`;

const StepDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};
  margin: 0 6px;
  transition: background-color 0.3s;

  @media (max-width: 480px) {
    width: 10px;
    height: 10px;
    margin: 0 4px;
  }

  @media (max-width: 360px) {
    width: 8px;
    height: 8px;
    margin: 0 3px;
  }
`;

const CompanyList = styled.div`
  margin: 1rem 0;
  max-height: 150px;
  overflow-y: auto;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;

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
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.background + "80"};
  border-radius: 4px;
  margin-bottom: 1rem;
  width: fit-content;
  font-family: monospace;
  letter-spacing: 1px;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    width: 100%;
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    padding: 10px;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
  }

  @media (max-width: 360px) {
    padding: 8px;
    font-size: 0.75rem;
  }
`;

const InfoMessage = styled.div`
  padding: 12px;
  margin: 5px 0;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.info + "20"};
  border-left: 3px solid ${({ theme }) => theme.colors.info};
  font-size: 0.9rem;

  @media (max-width: 768px) {
    padding: 10px;
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 0.8rem;
  }

  @media (max-width: 360px) {
    padding: 6px;
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
  padding: 16px;
  margin: 16px 0;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.surface || "#ffecec"};
  border-left: 4px solid ${({ theme }) => theme.colors.error};
  font-size: 0.95rem;
  line-height: 1.5;

  @media (max-width: 768px) {
    padding: 14px;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    padding: 12px;
    font-size: 0.85rem;
    margin: 12px 0;
  }

  @media (max-width: 360px) {
    padding: 10px;
    font-size: 0.8rem;
    margin: 10px 0;
  }
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  @media (max-width: 480px) {
    gap: 14px;
  }

  @media (max-width: 360px) {
    gap: 12px;
  }
`;

const StyledPageContainer = styled(PageContainer)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
  }

  @media (max-width: 360px) {
    padding: 0.25rem;
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
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.info};
  border-radius: 4px;
  margin-bottom: 1.5rem;
  background-color: ${({ theme }) => theme.colors.info}20;

  @media (max-width: 768px) {
    padding: 0.875rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
    margin-bottom: 1.25rem;
  }

  @media (max-width: 360px) {
    padding: 0.625rem;
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
  phone: "02-222-3333",
  emailSoporte: "soporte@maxximundo.com",
  emailVentas: "ventas@maxximundo.com",
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
    if (identification.length < 10) {
      setError("La cédula o RUC debe tener al menos 10 dígitos");
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

  // Renderizar paso 1: Ingreso de cédula/RUC
  const renderStep1 = () => (
    <>
      <Title>Registro de usuario</Title>
      <Subtitle>Ingresa tu cédula o RUC</Subtitle>

      <StyledForm>
        <Input
          label="Cédula o RUC"
          value={identification}
          onChange={handleIdentificationChange}
          placeholder="Ejemplo: 1234567890001"
          required
          leftIconName="FaIdCard"
          leftIconLibrary={4}
          errorMessage={error}
        />

        {error ? (
          <ContactMessage>
            <p>{error}Por favor comuníquese con soporte para poder ayudarlo.</p>
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
          disabled={identification.length < 10 || loading}
          onClick={async (e) => {
            e.preventDefault();
            await handleVerify();
          }}
        />

        <Button
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
