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

const Card = styled(FlexBoxComponent)`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  padding: 2.5rem;
  max-width: 420px;
  width: 420px;
  margin: 1rem;

  @media (max-width: 768px) {
    width: 90%;
    max-width: 400px;
    padding: 2rem;
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

const Form = styled.form`
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

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;

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
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.textLight};
  text-align: center;

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

const BackLink = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s ease;
  margin-bottom: 20px;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark};
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 18px;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-bottom: 16px;
    gap: 6px;
  }

  @media (max-width: 360px) {
    font-size: 0.75rem;
    margin-bottom: 14px;
    gap: 4px;
  }
`;

const CodeInputContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 10px 0;

  @media (max-width: 480px) {
    gap: 6px;
    margin: 8px 0;
  }

  @media (max-width: 360px) {
    gap: 4px;
    margin: 6px 0;
  }
`;

const CodeDigit = styled.input`
  width: 40px;
  height: 50px;
  text-align: center;
  font-size: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }

  @media (max-width: 768px) {
    width: 38px;
    height: 48px;
    font-size: 1.4rem;
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 46px;
    font-size: 1.3rem;
  }

  @media (max-width: 360px) {
    width: 32px;
    height: 42px;
    font-size: 1.2rem;
  }
`;

const Message = styled.div`
  margin: 8px 0;
  font-size: 0.9rem;
  color: ${({ theme, type }) =>
    type === "success" ? theme.colors.success : theme.colors.error};

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin: 6px 0;
  }

  @media (max-width: 360px) {
    font-size: 0.75rem;
    margin: 5px 0;
  }
`;

const CodeInstructions = styled.p`
  text-align: center;
  margin: 0 0 16px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin: 0 0 14px;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin: 0 0 12px;
  }

  @media (max-width: 360px) {
    font-size: 0.75rem;
    margin: 0 0 10px;
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
