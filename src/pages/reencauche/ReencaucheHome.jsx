import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import PageContainer from "../../components/layout/PageContainer";
import Button from "../../components/ui/Button";
import RenderIcon from "../../components/ui/RenderIcon";
import { ROUTES } from "../../constants/routes";

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 0;
`;

const WelcomeSection = styled.div`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary}15,
    ${({ theme }) => theme.colors.primary}25
  );
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0 0 24px 0;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

const FeatureCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px ${({ theme }) => theme.colors.shadow};
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.primaryDark || theme.colors.primary}
  );
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: white;
  font-size: 1.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0 0 20px 0;
  line-height: 1.6;
`;

const ReencaucheHome = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: "FaCheckCircle",
      title: "Bonos Activados",
      description:
        "Visualiza todos los bonos que has activado y su estado actual.",
    },
    {
      icon: "FaQrcode",
      title: "Activación de Bonos",
      description:
        "Escanea códigos QR para activar y verificar bonos de reencauche.",
    },
  ];

  return (
    <PageContainer>
      <HomeContainer>
        <WelcomeSection>
          <WelcomeTitle>
            <RenderIcon
              name="FaRecycle"
              size={40}
              style={{ marginRight: "12px" }}
            />
            Sistema de Reencauche
          </WelcomeTitle>
          <WelcomeSubtitle>
            Bienvenido al sistema de gestión de reencauche de neumáticos
          </WelcomeSubtitle>
        </WelcomeSection>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>
                <RenderIcon name={feature.icon} size={24} />
              </FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <Button
                text="Acceder"
                variant="outlined"
                size="small"
                style={{ width: "100%" }}
                onClick={() => {
                  if (feature.title === "Bonos Activados") {
                    navigate(ROUTES.REENCAUCHE.CLIENTES);
                  } else if (feature.title === "Activación de Bonos") {
                    navigate(ROUTES.REENCAUCHE.ACTIVACION);
                  }
                }}
              />
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </HomeContainer>
    </PageContainer>
  );
};

export default ReencaucheHome;
