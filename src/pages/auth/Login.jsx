import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import FlexBoxComponent from "../../components/common/FlexBox";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import styled from "styled-components";
import PageContainer from "../../components/layout/PageContainer";
import SEO from "../../components/seo/SEO";

const LoginCard = styled(FlexBoxComponent)`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1);
  padding: 3.5rem 3rem;
  max-width: 520px;
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

const LoginForm = styled.form`
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

const LoginTitle = styled.h1`
  font-size: 2.25rem;
  margin-bottom: 0.5rem;
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
  margin-top: 0;

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

const LoginSubtitle = styled.h2`
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

const ForgotPasswordLink = styled.div`
  align-self: flex-end;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9rem;
  margin-top: -0.25rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark || theme.colors.accent};
    text-decoration: underline;
    transform: translateX(2px);
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
    align-self: center;
    text-align: center;
    margin-top: 0;
  }

  @media (max-width: 360px) {
    font-size: 0.8rem;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin: 2rem 0;
  text-align: center;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      ${({ theme }) => theme.colors.border}
    );
  }

  &::after {
    background: linear-gradient(
      to left,
      transparent,
      ${({ theme }) => theme.colors.border}
    );
  }

  @media (max-width: 480px) {
    margin: 1.75rem 0;
  }

  @media (max-width: 360px) {
    margin: 1.5rem 0;
  }
`;

const RegisterContainer = styled(FlexBoxComponent)`
  gap: 16px;
  margin-top: 0.75rem;

  @media (max-width: 480px) {
    gap: 14px;
  }

  @media (max-width: 360px) {
    gap: 12px;
  }
`;

const RegisterText = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }

  @media (max-width: 360px) {
    font-size: 0.8rem;
  }
`;

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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, navigateToHomeByRole, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigateToHomeByRole();
    }
  }, [isAuthenticated, user, navigate]);

  const handleNavigate = () => {
    navigateToHomeByRole();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(email, password);
      if (response.success) {
        handleNavigate();
      } else {
        setErrorMessage(response.message || "Error al iniciar sesión");
      }
    } catch (error) {
      setErrorMessage("Error de conexión. Inténtelo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      setErrorMessage("");
    }
  }, [email, password]);

  const handleRegisterClick = () => {
    navigate(ROUTES.AUTH.REGISTER);
  };

  const handleForgotPassword = () => {
    navigate(ROUTES.AUTH.FORGOT_PASSWORD);
  };

  return (
    <>
      <SEO
        title="Iniciar Sesión - ViiCommerce"
        description="Inicia sesión en ViiCommerce para acceder a nuestro catálogo de neumáticos, lubricantes y herramientas en Cuenca, Ecuador. Precios mayoristas y envío a todo el Ecuador."
        keywords="login, iniciar sesión, ViiCommerce, neumáticos, llantas, lubricantes, herramientas, Cuenca, Ecuador"
        url="https://viicommerce.com/auth/login"
      />
      <StyledPageContainer>
        <LoginCard flexDirection="column" alignItems="center">
          <LoginTitle>Bienvenido a MISTOX</LoginTitle>
          <LoginSubtitle>Iniciar Sesión</LoginSubtitle>

          <LoginForm onSubmit={handleLogin}>
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

            <Input
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña"
              leftIconName="FaLock"
              rightIconName={showPassword ? "FaEyeSlash" : "FaEye"}
              onRightIconClick={() => setShowPassword(!showPassword)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              errorMessage={errorMessage}
              fullWidth
            />

            <ForgotPasswordLink onClick={handleForgotPassword}>
              ¿Olvidaste tu contraseña?
            </ForgotPasswordLink>

            <Button
              type="submit"
              text={isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              onClick={handleLogin}
              fullWidth
            />

            <Divider />

            <RegisterContainer flexDirection="column" alignItems="center">
              <RegisterText>¿No tienes una cuenta?</RegisterText>
              <Button
                type="button"
                text="Registrarse"
                onClick={handleRegisterClick}
                variant="outlined"
              />
            </RegisterContainer>
          </LoginForm>
        </LoginCard>
      </StyledPageContainer>
    </>
  );
};

export default Login;
