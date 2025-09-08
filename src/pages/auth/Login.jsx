import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import FlexBoxComponent from "../../components/common/FlexBox";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import styled from "styled-components";
import PageContainer from "../../components/layout/PageContainer";

const LoginCard = styled(FlexBoxComponent)`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  padding: 2.5rem;
  max-width: 550px;
  width: 450px;
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

const LoginForm = styled.form`
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

const LoginTitle = styled.h1`
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

const LoginSubtitle = styled.h2`
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

const ForgotPasswordLink = styled.div`
  align-self: flex-end;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.85rem;
  margin-top: 0.25rem;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark};
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    align-self: center;
    text-align: center;
  }

  @media (max-width: 360px) {
    font-size: 0.75rem;
  }
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.border};
  margin: 1.5rem 0;

  @media (max-width: 480px) {
    margin: 1.25rem 0;
  }

  @media (max-width: 360px) {
    margin: 1rem 0;
  }
`;

const RegisterContainer = styled(FlexBoxComponent)`
  gap: 12px;
  margin-top: 0.5rem;

  @media (max-width: 480px) {
    gap: 10px;
  }

  @media (max-width: 360px) {
    gap: 8px;
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
  );
};

export default Login;
