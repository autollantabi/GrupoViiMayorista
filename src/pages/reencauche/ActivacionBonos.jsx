import React from "react";
import styled from "styled-components";
import { useAppTheme } from "../../context/AppThemeContext";
import PageContainer from "../../components/layout/PageContainer";
import RenderIcon from "../../components/ui/RenderIcon";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
`;

const InstructionsCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  border: 2px solid ${({ theme }) => theme.colors.primary}20;
`;

const QRIcon = styled.div`
  width: 120px;
  height: 120px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary}20,
    ${({ theme }) => theme.colors.primary}40
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  border: 3px solid ${({ theme }) => theme.colors.primary};
`;

const Title = styled.h1`
  font-size: 2rem;
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0 0 32px 0;
  line-height: 1.6;
`;

const InstructionsContainer = styled.div`
  text-align: left;
  margin: 24px 0;
`;

const InstructionStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const StepDescription = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0;
  line-height: 1.5;
`;

const WarningBox = styled.div`
  background-color: ${({ theme }) => theme.colors.warning}20;
  border: 1px solid ${({ theme }) => theme.colors.warning};
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0;
  text-align: left;
`;

const WarningTitle = styled.h4`
  font-size: 1.1rem;
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.warning};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WarningText = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0;
  line-height: 1.5;
`;

const ActivacionBonos = () => {
  const { theme } = useAppTheme();
  const navigate = useNavigate();

  const goBack = () => {
    navigate("/");
  };

  return (
    <PageContainer backButtonOnClick={goBack} backButtonText="Volver al inicio">
      <Container>
        <InstructionsCard>
          <QRIcon>
            <RenderIcon
              name="FaQrcode"
              size={48}
              color={theme.colors.primary}
            />
          </QRIcon>

          <Title>
            <RenderIcon name="FaMobile" size={32} />
            Activación de Bonos
          </Title>

          <Subtitle>
            Sigue estas instrucciones para activar un bono usando el código QR
          </Subtitle>

          <InstructionsContainer>
            <InstructionStep>
              <StepNumber>1</StepNumber>
              <StepContent>
                <StepTitle>Abrir el Lector de Códigos QR</StepTitle>
                <StepDescription>
                  En tu celular, abre la aplicación de cámara o cualquier lector
                  de códigos QR. La mayoría de celulares tienen esta función
                  integrada en la cámara.
                </StepDescription>
              </StepContent>
            </InstructionStep>

            <InstructionStep>
              <StepNumber>2</StepNumber>
              <StepContent>
                <StepTitle>Escanear el Código QR del Bono</StepTitle>
                <StepDescription>
                  Apunta la cámara hacia el código QR que aparece en el bono del
                  cliente. El código se escaneará automáticamente y te llevará a
                  una página web.
                </StepDescription>
              </StepContent>
            </InstructionStep>

            <InstructionStep>
              <StepNumber>3</StepNumber>
              <StepContent>
                <StepTitle>Verificar la Información del Bono</StepTitle>
                <StepDescription>
                  Una vez abierta la página, verás los detalles del bono: tipo
                  de llanta, número de factura, cliente, etc. Revisa que la
                  información sea correcta.
                </StepDescription>
              </StepContent>
            </InstructionStep>

            <InstructionStep>
              <StepNumber>4</StepNumber>
              <StepContent>
                <StepTitle>Hacer Clic en "Usar Bono"</StepTitle>
                <StepDescription>
                  Si la información es correcta, haz clic en el botón "Usar
                  Bono" para activarlo. El bono se marcará como usado y no podrá
                  ser utilizado nuevamente.
                </StepDescription>
              </StepContent>
            </InstructionStep>
          </InstructionsContainer>

          <WarningBox>
            <WarningTitle>
              <RenderIcon name="FaExclamationTriangle" size={16} />
              Importante
            </WarningTitle>
            <WarningText>
              <strong>Si el bono ya está usado:</strong> El sistema te mostrará
              un mensaje indicando que el bono ya fue utilizado anteriormente y
              no está disponible para activación.
            </WarningText>
          </WarningBox>
        </InstructionsCard>
      </Container>
    </PageContainer>
  );
};

export default ActivacionBonos;
