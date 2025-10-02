import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppTheme } from "../../context/AppThemeContext";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";
import Button from "../../components/ui/Button";
import RenderIcon from "../../components/ui/RenderIcon";
import PageContainer from "../../components/layout/PageContainer";
import { toast } from "react-toastify";
import {
  api_bonos_verifyQRCode,
  api_bonos_useBonus,
} from "../../api/bonos/apiBonos";
import { parseProductSpecification } from "../../utils/bonoUtils";

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;

  @media (max-width: 768px) {
    padding: 24px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: 2rem;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    gap: 8px;
    flex-direction: column;
    text-align: center;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 1.1rem;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.4;
  }
`;

const BonoInfo = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 768px) {
    padding: 20px 16px;
    margin: 20px 0;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
`;

const InfoItem = styled.div`
  text-align: left;
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 4px;
  font-weight: 500;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    word-break: break-word;
  }
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background-color: ${({ $estado }) => {
    switch ($estado) {
      case "ACTIVO":
        return "#d4edda";
      case "USADO":
        return "#fff3cd";
      case "VENCIDO":
        return "#f8d7da";
      default:
        return "#e2e3e5";
    }
  }};
  color: ${({ $estado }) => {
    switch ($estado) {
      case "ACTIVO":
        return "#155724";
      case "USADO":
        return "#856404";
      case "VENCIDO":
        return "#721c24";
      default:
        return "#6c757d";
    }
  }};

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 30px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
  }
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid #f5c6cb;

  @media (max-width: 768px) {
    padding: 12px;
    margin: 16px 0;
    font-size: 0.9rem;
  }
`;

const LoadingMessage = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 1.1rem;
  margin: 20px 0;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin: 16px 0;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ResponsiveContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const VerificarBono = () => {
  const [searchParams] = useSearchParams();
  const codigo = searchParams.get("codigo");
  const navigate = useNavigate();
  const { theme } = useAppTheme();
  const { user, isAuthenticated } = useAuth();
  const [bonoData, setBonoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usandoBono, setUsandoBono] = useState(false);

  // Función para obtener el label del tipo de llanta
  const getTipoLlantaLabel = (bono) => {
    const spec = parseProductSpecification(bono.PRODUCT_SPECIFICATION);
    return `${spec.brand} - ${spec.size} - ${spec.design}`;
  };

  // Función para obtener el label del estado
  const getEstadoLabel = (estado) => {
    const estados = {
      ACTIVO: "Activo",
      USADO: "Usado",
      VENCIDO: "Vencido",
      PENDIENTE: "Pendiente",
    };
    return estados[estado] || estado;
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Verificar autenticación y roles
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Verificar que el usuario tenga el rol correcto
    const allowedRoles = [ROLES.CLIENTE, ROLES.REENCAUCHE_USER];

    if (!allowedRoles.includes(user?.ROLE_NAME)) {
      setError("No tienes permisos para acceder a esta página");
      setLoading(false);
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Cargar datos del bono
  useEffect(() => {
    const loadBonoData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!codigo) {
          throw new Error("Código QR no válido");
        }

        // Decodificar el parámetro de la URL
        const decodedData = decodeURIComponent(codigo);

        // Enviar el código encriptado al backend para que lo desencripte y valide
        const response = await api_bonos_verifyQRCode(decodedData);

        if (response.success) {
          setBonoData(response.data.bonus);
        } else {
          throw new Error(
            response.message || "Error al verificar el código QR"
          );
        }
      } catch (err) {
        console.error("Error cargando bono:", err);
        setError(err.message || "Error al cargar los datos del bono");
      } finally {
        setLoading(false);
      }
    };

    // Solo cargar datos si el usuario está autenticado y tiene el rol correcto
    if (
      isAuthenticated &&
      user?.ROLE_NAME &&
      [ROLES.CLIENTE, ROLES.REENCAUCHE_USER].includes(user.ROLE_NAME)
    ) {
      loadBonoData();
    }
  }, [codigo, isAuthenticated, user]);

  // Función para usar el bono
  const handleUsarBono = async () => {
    try {
      setUsandoBono(true);
      const idUser = user.ID_USER;

      // Simular uso del bono
      const response = await api_bonos_useBonus(bonoData.ID_BONUS, idUser);
      if (response.success) {
        toast.success("¡Bono utilizado exitosamente!");
      } else {
        toast.error("Error al usar el bono. Intente nuevamente.");
      }

      // Redirigir o cerrar
      navigate("/");
    } catch (error) {
      console.error("Error usando bono:", error);
      toast.error("Error al usar el bono. Intente nuevamente.");
    } finally {
      setUsandoBono(false);
    }
  };

  if (loading) {
    return (
      <PageContainer
        fullWidth
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "40px 20px",
          minHeight: "calc(100vh - 80px)",
        }}
      >
        <ResponsiveContainer>
          <Card>
            <LoadingMessage>
              <RenderIcon
                name="FaSpinner"
                size={24}
                style={{ animation: "spin 1s linear infinite" }}
              />
              <br />
              Verificando bono...
            </LoadingMessage>
          </Card>
        </ResponsiveContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer
        fullWidth
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "40px 20px",
          minHeight: "calc(100vh - 80px)",
        }}
      >
        <ResponsiveContainer>
          <Card>
            <Header>
              <Title>
                <RenderIcon name="FaExclamationTriangle" size={32} />
                Error
              </Title>
              <Subtitle>No se pudo verificar el bono</Subtitle>
            </Header>

            <ErrorMessage>{error}</ErrorMessage>

            <Actions>
              <Button
                text="Volver al Inicio"
                variant="outlined"
                onClick={() => navigate("/")}
                leftIconName="FaHome"
              />
            </Actions>
          </Card>
        </ResponsiveContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      fullWidth
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "40px 20px",
        minHeight: "calc(100vh - 80px)",
      }}
    >
      <ResponsiveContainer>
        <Card>
          <Header>
            <Title>
              <RenderIcon name="FaTicketAlt" size={32} />
              Bono Verificado
            </Title>
            <Subtitle>
              Los datos del bono han sido verificados correctamente
            </Subtitle>
          </Header>

          <BonoInfo>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Número de Factura</InfoLabel>
                <InfoValue>{bonoData.INVOICENUMBER}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Estado</InfoLabel>
                <InfoValue>
                  <StatusBadge $estado={bonoData.STATUS}>
                    {getEstadoLabel(bonoData.STATUS)}
                  </StatusBadge>
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Tipo de Llanta</InfoLabel>
                <InfoValue>{getTipoLlantaLabel(bonoData)}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Fecha de Creación</InfoLabel>
                <InfoValue>{formatDate(bonoData.createdAt)}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Cliente</InfoLabel>
                <InfoValue>
                  {bonoData.customerRetread
                    ? `${bonoData.customerRetread.CUSTOMER_NAME} ${bonoData.customerRetread.CUSTOMER_LASTNAME}`
                    : "N/A"}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>CI/RUC</InfoLabel>
                <InfoValue>
                  {bonoData.customerRetread
                    ? bonoData.customerRetread.CUSTOMER_IDENTIFICATION
                    : "N/A"}
                </InfoValue>
              </InfoItem>
            </InfoGrid>
          </BonoInfo>

          <Actions>
            <Button
              text="Volver al Inicio"
              variant="outlined"
              onClick={() => navigate("/")}
              leftIconName="FaHome"
            />
            {user?.ROLE_NAME === ROLES.REENCAUCHE_USER && (
              <Button
                text={usandoBono ? "Usando..." : "Usar Bono"}
                variant="solid"
                backgroundColor={theme.colors.primary}
                onClick={handleUsarBono}
                disabled={usandoBono || bonoData.STATUS !== "ACTIVO"}
                leftIconName="FaCheck"
              />
            )}
          </Actions>

          {user?.ROLE_NAME === ROLES.REENCAUCHE_USER &&
            bonoData.STATUS !== "ACTIVO" && (
              <div
                style={{
                  marginTop: "20px",
                  color: theme.colors.textLight,
                  fontSize: "0.9rem",
                }}
              >
                Este bono no está disponible para uso
              </div>
            )}
        </Card>
      </ResponsiveContainer>
    </PageContainer>
  );
};

export default VerificarBono;
