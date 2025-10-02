import React, { useState, useEffect } from "react";
import styled from "styled-components";
import PageContainer from "../../components/layout/PageContainer";
import Input from "../../components/ui/Input";
import RenderIcon from "../../components/ui/RenderIcon";
import { ROUTES } from "../../constants/routes";
import { useNavigate } from "react-router-dom";
import { api_bonos_getBonosByReencaucheUser } from "../../api/bonos/apiBonos";
import { useAuth } from "../../context/AuthContext";

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatsText = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 500;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  width: auto;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const BonosList = styled.div`
  display: grid;
  gap: 16px;
`;

const BonoCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const BonoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
`;

const BonoNumber = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.1rem;
`;

const EstadoBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${({ theme, $estado }) =>
    $estado === "usado"
      ? theme.colors.error + "20"
      : theme.colors.success + "20"};
  color: ${({ theme, $estado }) =>
    $estado === "usado" ? theme.colors.error : theme.colors.success};
`;

const BonoDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
`;

const BonoDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BonoDetailLabel = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 500;
`;

const BonoDetailValue = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.textLight};
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const EmptyDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
`;

const BonosActivados = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [bonosActivados, setBonosActivados] = useState([]);
  const { user } = useAuth();

  const obtenerBonosActivados = async () => {
    const response = await api_bonos_getBonosByReencaucheUser(user.ID_USER);
    if (response.success) {
      setBonosActivados(response.data);
    }
  };

  useEffect(() => {
    obtenerBonosActivados();
  }, [user]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const filteredBonos = bonosActivados.filter(
    (bono) =>
      bono.INVOICENUMBER.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bono.customerRetread?.CUSTOMER_NAME.toLowerCase().includes(
        searchTerm.toLowerCase()
      ) ||
      bono.customerRetread?.CUSTOMER_LASTNAME.toLowerCase().includes(
        searchTerm.toLowerCase()
      ) ||
      bono.customerRetread?.CUSTOMER_IDENTIFICATION.includes(searchTerm)
  );

  const getEstadoLabel = (estado) => {
    const estados = {
      ACTIVO: "Activo",
      USADO: "Usado",
      VENCIDO: "Vencido",
    };
    return estados[estado] || estado;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const parseProductSpecification = (specification) => {
    if (!specification || specification === "") {
      return { brand: "N/A", size: "N/A", design: "N/A" };
    }
    const parts = specification.split(";");
    return {
      brand: parts[0] || "N/A",
      size: parts[1] || "N/A",
      design: parts[2] || "N/A",
    };
  };

  const goBack = () => {
    navigate(ROUTES.REENCAUCHE.HOME);
  };

  return (
    <PageContainer backButtonOnClick={goBack} backButtonText="Volver al inicio">
      <Container>
        <Header>
          <TitleContainer>
            <Title>
              <RenderIcon name="FaCheckCircle" size={28} />
              Bonos Activados
            </Title>
            <StatsText>
              Total: {bonosActivados.length} bonos activados
            </StatsText>
          </TitleContainer>
          <SearchContainer>
            <Input
              type="text"
              placeholder="Buscar por factura, cliente o CI/RUC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIconName="FaSearch"
              style={{
                minWidth: "200px",
                width: isMobile ? "100%" : "auto",
              }}
              fullWidth={isMobile}
            />
          </SearchContainer>
        </Header>

        {filteredBonos.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <RenderIcon name="FaSearch" size={48} />
            </EmptyIcon>
            <EmptyTitle>No se encontraron bonos</EmptyTitle>
            <EmptyDescription>
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "Aún no has activado ningún bono"}
            </EmptyDescription>
          </EmptyState>
        ) : (
          <BonosList>
            {filteredBonos.map((bono) => (
              <BonoCard key={bono.ID_BONUS}>
                <BonoHeader>
                  <BonoNumber>Factura: {bono.INVOICENUMBER}</BonoNumber>
                  <EstadoBadge $estado={bono.STATUS.toLowerCase()}>
                    {getEstadoLabel(bono.STATUS)}
                  </EstadoBadge>
                </BonoHeader>

                <BonoDetails>
                  <BonoDetailItem>
                    <BonoDetailLabel>Cliente</BonoDetailLabel>
                    <BonoDetailValue>
                      {bono.customerRetread?.CUSTOMER_NAME}{" "}
                      {bono.customerRetread?.CUSTOMER_LASTNAME}
                    </BonoDetailValue>
                  </BonoDetailItem>

                  <BonoDetailItem>
                    <BonoDetailLabel>CI/RUC</BonoDetailLabel>
                    <BonoDetailValue>
                      {bono.customerRetread?.CUSTOMER_IDENTIFICATION}
                    </BonoDetailValue>
                  </BonoDetailItem>

                  <BonoDetailItem>
                    <BonoDetailLabel>Marca</BonoDetailLabel>
                    <BonoDetailValue>
                      {
                        parseProductSpecification(bono.PRODUCT_SPECIFICATION)
                          .brand
                      }
                    </BonoDetailValue>
                  </BonoDetailItem>

                  <BonoDetailItem>
                    <BonoDetailLabel>Tamaño</BonoDetailLabel>
                    <BonoDetailValue>
                      {
                        parseProductSpecification(bono.PRODUCT_SPECIFICATION)
                          .size
                      }
                    </BonoDetailValue>
                  </BonoDetailItem>

                  <BonoDetailItem>
                    <BonoDetailLabel>Diseño</BonoDetailLabel>
                    <BonoDetailValue>
                      {
                        parseProductSpecification(bono.PRODUCT_SPECIFICATION)
                          .design
                      }
                    </BonoDetailValue>
                  </BonoDetailItem>

                  <BonoDetailItem>
                    <BonoDetailLabel>Fecha de Uso</BonoDetailLabel>
                    <BonoDetailValue>
                      {formatDate(bono.updatedAt)}
                    </BonoDetailValue>
                  </BonoDetailItem>
                </BonoDetails>
              </BonoCard>
            ))}
          </BonosList>
        )}
      </Container>
    </PageContainer>
  );
};

export default BonosActivados;
