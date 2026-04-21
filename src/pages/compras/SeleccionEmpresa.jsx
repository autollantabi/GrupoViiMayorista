import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import RenderIcon from '../../components/ui/RenderIcon';
import { empresas as mockEmpresas, getEmpresaLogo } from '../../mock/products';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  items-align: center;
  justify-content: flex-start;
  min-height: calc(100vh - 80px);
  padding: 4rem 2rem;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`
      : `linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)`};
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
`;

const Header = styled.div`
  margin-bottom: 4rem;
  animation: fadeInDown 0.8s ease-out;

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Title = styled.h2`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  margin-bottom: 1.5rem;
  background: ${({ theme }) =>
    `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.7;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  width: 100%;
  margin-top: 2rem;
  animation: fadeInUp 0.8s ease-out 0.2s backwards;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CompanyCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid ${({ theme }) => theme.colors.border}40;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows?.medium || '0 4px 12px rgba(0,0,0,0.08)'};
  position: relative;
  opacity: ${({ $hasAccess }) => ($hasAccess ? 1 : 0.9)};

  &:hover {
    transform: translateY(-10px);
    border-color: ${({ theme, $hasAccess }) => ($hasAccess ? theme.colors.primary : theme.colors.warning) + '60'};
    box-shadow: ${({ theme }) => theme.shadows?.large || '0 12px 30px rgba(0,0,0,0.15)'};
  }
`;

const Badge = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: ${({ $hasAccess, theme }) =>
    $hasAccess ? theme.colors.success : theme.colors.warning};
  color: white;
  box-shadow: 0 4px 12px ${({ $hasAccess, theme }) => ($hasAccess ? theme.colors.success : theme.colors.warning)}40;
`;

const LogoWrapper = styled.div`
  height: 220px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: ${({ theme }) =>
    theme.mode === "dark" ? theme.colors.background : "#fafafa"};
  transition: background 0.3s ease;

  img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    transition: transform 0.5s ease;
  }

  ${CompanyCard}:hover img {
    transform: scale(1.1);
  }
`;

const CardBody = styled.div`
  padding: 2rem;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CompanyName = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const Description = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ActionText = styled.div`
  margin-top: auto;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme, $hasAccess }) => ($hasAccess ? theme.colors.primary : theme.colors.textSecondary)};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding-top: 1rem;
`;

const SeleccionEmpresa = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleCompanySelect = (empresaName) => {
    const lines = user?.LINEAS || [];
    const firstLine = lines.length > 0 ? lines[0] : null;
    const nameUpper = empresaName.toUpperCase();

    if (firstLine) {
      navigate(`/catalogo/${nameUpper}?linea=${encodeURIComponent(firstLine)}`);
    } else {
      navigate(`/catalogo/${nameUpper}`);
    }
  };

  const userAccessList = (user?.EMPRESAS || []).map(e => e.toUpperCase());

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>Explora Nuestros Catálogos</Title>
          <Subtitle>
            Selecciona la empresa con la que deseas interactuar. Puedes navegar por los catálogos disponibles o solicitar acceso a nuevos.
          </Subtitle>
        </Header>

        <Grid>
          {mockEmpresas.map((empresa) => {
            const hasAccess = userAccessList.includes(empresa.nombre.toUpperCase());
            const logo = getEmpresaLogo(empresa, theme.mode === 'dark');

            return (
              <CompanyCard
                key={empresa.id}
                $hasAccess={hasAccess}
                onClick={() => handleCompanySelect(empresa.nombre)}
              >
                <Badge $hasAccess={hasAccess}>
                  <RenderIcon
                    name={hasAccess ? "FaCircleCheck" : "FaLock"}
                    size={14}
                  />
                  <span>{hasAccess ? "Disponible" : "Solicitar acceso"}</span>
                </Badge>

                <LogoWrapper>
                  <img src={logo} alt={`Logo de ${empresa.nombre}`} />
                </LogoWrapper>

                <CardBody>
                  <CompanyName>{empresa.nombre}</CompanyName>
                  <Description>{empresa.descripcion}</Description>
                  <ActionText $hasAccess={hasAccess}>
                    {hasAccess ? "Ver Catálogo" : "Ver detalles y solicitar"}
                    <RenderIcon name="FaArrowRight" size={14} />
                  </ActionText>
                </CardBody>
              </CompanyCard>
            );
          })}
        </Grid>
      </ContentWrapper>
    </PageContainer>
  );
};

export default SeleccionEmpresa;
