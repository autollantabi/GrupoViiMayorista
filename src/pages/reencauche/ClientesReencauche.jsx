import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppTheme } from "../../context/AppThemeContext";
import PageContainer from "../../components/layout/PageContainer";
import Button from "../../components/ui/Button";
import RenderIcon from "../../components/ui/RenderIcon";
import { useNavigate } from "react-router-dom";
import FormularioNuevoCliente from "./FormularioNuevoCliente";
import FormularioNuevoBono from "./FormularioNuevoBono";
import PDFGenerator from "../../components/pdf/PDFGenerator";
import {
  api_bonos_getClientesByMayorista,
  api_bonos_getBonosByCustomer,
} from "../../api/bonos/apiBonos";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  min-width: 300px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const ClientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const ClientCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${({ theme }) => theme.colors.shadow};
  }
`;

const ClientHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const ClientAvatar = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.primaryDark || theme.colors.primary}
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  margin-right: 16px;
`;

const ClientInfo = styled.div`
  flex: 1;
`;

const ClientName = styled.h3`
  margin: 0 0 4px 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.1rem;
`;

const ClientCompany = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
`;

const ClientDetails = styled.div`
  margin-bottom: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const DetailLabel = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: ${({ theme, $status }) => {
    switch ($status) {
      case "activo":
        return theme.colors.success + "20";
      case "inactivo":
        return theme.colors.error + "20";
      case "pendiente":
        return theme.colors.warning + "20";
      default:
        return theme.colors.textLight + "20";
    }
  }};
  color: ${({ theme, $status }) => {
    switch ($status) {
      case "activo":
        return theme.colors.success;
      case "inactivo":
        return theme.colors.error;
      case "pendiente":
        return theme.colors.warning;
      default:
        return theme.colors.textLight;
    }
  }};
`;

const ClientActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.textLight};
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Estilos para el modal de detalles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ModalClientInfo = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalClientName = styled.h3`
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.3rem;
`;

const ModalClientDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const ModalDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ModalDetailLabel = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 500;
`;

const ModalDetailValue = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const BonosSection = styled.div`
  margin-top: 24px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BonosList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BonoCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  }
`;

const BonoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const BonoNumber = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
`;

const EstadoBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: ${({ theme, $estado }) => {
    switch ($estado) {
      case "ACTIVO":
        return theme.colors.success + "20";
      case "USADO":
        return theme.colors.warning + "20";
      case "VENCIDO":
        return theme.colors.error + "20";
      case "PENDIENTE":
        return theme.colors.warning + "20";
      default:
        return theme.colors.textLight + "20";
    }
  }};
  color: ${({ theme, $estado }) => {
    switch ($estado) {
      case "ACTIVO":
        return theme.colors.success;
      case "USADO":
        return theme.colors.warning;
      case "VENCIDO":
        return theme.colors.error;
      case "PENDIENTE":
        return theme.colors.warning;
      default:
        return theme.colors.textLight;
    }
  }};
`;

const BonoDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  font-size: 0.9rem;
`;

const BonoDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const BonoDetailLabel = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.8rem;
`;

const BonoDetailValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const EmptyBonos = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.textLight};
`;

const EmptyBonosIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const BonoActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  gap: 8px;
`;

const PDFButton = styled.button`
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.error}dd;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const BonosDisponiblesContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const BonosDisponiblesInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BonosDisponiblesLabel = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 500;
`;

const BonoPorMarcaBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: ${({ theme, $cantidad }) =>
    $cantidad === 0 ? theme.colors.error + "15" : theme.colors.success + "15"};
  border: 1px solid
    ${({ theme, $cantidad }) =>
      $cantidad === 0
        ? theme.colors.error + "40"
        : theme.colors.success + "40"};
  border-radius: 6px;
  padding: 6px 12px;
`;

const MarcaNombre = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
`;

const CantidadBonos = styled.span`
  font-size: 1.1rem;
  font-weight: bold;
  color: ${({ theme, $cantidad }) =>
    $cantidad === 0 ? theme.colors.error : theme.colors.success};
  min-width: 20px;
  text-align: center;
`;

const AlertaBonos = styled.div`
  background-color: ${({ theme }) => theme.colors.warning}20;
  border: 1px solid ${({ theme }) => theme.colors.warning};
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.95rem;
`;

const AlertaBonos0 = styled.div`
  background-color: ${({ theme }) => theme.colors.error}20;
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ theme }) => theme.colors.error};
  font-size: 1rem;
  font-weight: 500;
`;

const ClientesReencauche = () => {
  const { theme } = useAppTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [showClientModal, setShowClientModal] = useState(false);
  const [showBonoModal, setShowBonoModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);
  const [selectedBono, setSelectedBono] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [bonos, setBonos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock de bonos disponibles por marca (en el futuro vendrá de la API)
  const [bonosDisponiblesPorMarca, setBonosDisponiblesPorMarca] = useState({
    HAOHUA: 20, // Bonos disponibles para la marca HAOHUA
  });

  const obtenerClientesDeMayorista = async () => {
    try {
      setLoading(true);
      const response = await api_bonos_getClientesByMayorista(user.ID_USER);
      if (response.success) {
        setClientes(response.data);
      } else {
        console.error("Error obteniendo clientes:", response.message);
      }
    } catch (error) {
      console.error("Error en la API:", error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerBonosDeCliente = async (idCliente) => {
    try {
      const response = await api_bonos_getBonosByCustomer(idCliente);
      if (response.success) {
        setBonos(response.data);
      } else {
        console.error("Error obteniendo bonos:", response.message);
        setBonos([]);
      }
    } catch (error) {
      console.error("Error en la API de bonos:", error);
      setBonos([]);
    }
  };

  useEffect(() => {
    obtenerClientesDeMayorista();
  }, []);

  const filteredClients = clientes.filter(
    (client) =>
      client.CUSTOMER_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.CUSTOMER_LASTNAME.toLowerCase().includes(
        searchTerm.toLowerCase()
      ) ||
      client.CUSTOMER_IDENTIFICATION.includes(searchTerm)
  );

  const getInitials = (nombre, apellido) => {
    if (!nombre || !apellido) return "??";
    return (nombre[0] + apellido[0]).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getClientBonos = (clientId) => {
    return bonos.filter((bono) => bono.ID_CUSTOMERRETREAD === clientId);
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

  const getTipoLlantaLabel = (bono) => {
    const spec = parseProductSpecification(bono.PRODUCT_SPECIFICATION);
    return `${spec.brand} - ${spec.size} - ${spec.design}`;
  };

  const getEstadoLabel = (estado) => {
    const estados = {
      ACTIVO: "Activo",
      USADO: "Usado",
      VENCIDO: "Vencido",
      PENDIENTE: "Pendiente",
    };
    return estados[estado] || estado;
  };

  const handleViewClient = (clientId) => {
    const client = clientes.find((c) => c.ID_CUSTOMERRETREAD === clientId);
    setSelectedClient(client);

    setShowDetailsModal(true);
    // Obtener bonos del cliente
    obtenerBonosDeCliente(clientId);
  };

  const handleNewBono = (clientId) => {
    if (!hayBonosDisponibles) {
      toast.error("No tiene bonos disponibles para crear nuevos bonos");
      return;
    }
    const client = clientes.find((c) => c.ID_CUSTOMERRETREAD === clientId);
    setSelectedClient(client);
    setShowBonoModal(true);
  };

  const handleNewBonoGeneric = () => {
    if (!hayBonosDisponibles) {
      toast.error("No tiene bonos disponibles para crear nuevos bonos");
      return;
    }
    setSelectedClient(null);
    setShowBonoModal(true);
  };

  const handleNewClient = () => {
    setShowClientModal(true);
  };

  const handleCloseBonoModal = () => {
    setShowBonoModal(false);
    setSelectedClient(null);
  };

  const handleCloseClientModal = () => {
    setShowClientModal(false);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedClient(null);
  };

  const handleGeneratePDF = (bono) => {
    setSelectedBono(bono);
    setShowPDFGenerator(true);
  };

  const handleClosePDFGenerator = () => {
    setShowPDFGenerator(false);
    setSelectedBono(null);
  };

  const handleClientCreated = async (newClient) => {
    // El cliente ya fue creado en el formulario, solo recargar la lista
    await obtenerClientesDeMayorista();
  };

  const handleBonoCreated = async (newBono) => {
    try {
      // El bono ya fue creado en el formulario, solo recargar los datos

      // Decrementar el contador de bonos disponibles para la marca
      // En el futuro esto se consultará de la API
      const marcaBono = "HAOHUA"; // Por ahora hardcodeado
      setBonosDisponiblesPorMarca((prev) => ({
        ...prev,
        [marcaBono]: Math.max(0, (prev[marcaBono] || 0) - 1),
      }));

      // Si hay un cliente seleccionado, recargar sus bonos
      if (selectedClient) {
        await obtenerBonosDeCliente(selectedClient.ID_CUSTOMERRETREAD);
      }

      // Recargar la lista de clientes para actualizar estadísticas
      await obtenerClientesDeMayorista();
    } catch (error) {
      console.error("Error actualizando datos:", error);
    }
  };

  // Función para verificar si hay bonos disponibles
  const getTotalBonosDisponibles = () => {
    return Object.values(bonosDisponiblesPorMarca).reduce(
      (sum, cantidad) => sum + cantidad,
      0
    );
  };

  const hayBonosDisponibles = getTotalBonosDisponibles() > 0;

  return (
    <PageContainer
      backButtonOnClick={() => navigate("/")}
      backButtonText="Volver al inicio"
    >
      <PageHeader>
        <PageTitle>
          <RenderIcon name="FaUsers" size={32} />
          Clientes de Bonos
        </PageTitle>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            text="Nuevo Cliente"
            variant="solid"
            backgroundColor={theme.colors.primary}
            leftIconName="FaPlus"
            onClick={handleNewClient}
          />
        </SearchContainer>
      </PageHeader>

      {/* Sección de bonos disponibles */}
      <BonosDisponiblesContainer>
        <BonosDisponiblesInfo>
          <RenderIcon name="FaTicketAlt" size={16} />
          <BonosDisponiblesLabel>Bonos disponibles:</BonosDisponiblesLabel>
          {Object.entries(bonosDisponiblesPorMarca).map(([marca, cantidad]) => (
            <BonoPorMarcaBadge key={marca} $cantidad={cantidad}>
              <MarcaNombre>{marca}</MarcaNombre>
              <CantidadBonos $cantidad={cantidad}>{cantidad}</CantidadBonos>
            </BonoPorMarcaBadge>
          ))}
        </BonosDisponiblesInfo>
      </BonosDisponiblesContainer>

      {/* Alerta cuando no hay bonos disponibles */}
      {!hayBonosDisponibles && (
        <AlertaBonos0>
          <RenderIcon name="FaExclamationTriangle" size={24} />
          <div>
            <strong>No tiene bonos disponibles</strong>
            <div style={{ fontSize: "0.9rem", marginTop: "4px" }}>
              No puede crear nuevos bonos hasta que haga una compra de la marca
              y rin seleccionada.
            </div>
          </div>
        </AlertaBonos0>
      )}

      {/* Alerta cuando quedan pocos bonos */}
      {hayBonosDisponibles && getTotalBonosDisponibles() <= 5 && (
        <AlertaBonos>
          <RenderIcon name="FaExclamationCircle" size={20} />
          <span>
            <strong>Atención:</strong> Quedan pocos bonos disponibles (
            {getTotalBonosDisponibles()} restantes)
          </span>
        </AlertaBonos>
      )}

      {loading ? (
        <EmptyState>
          <EmptyIcon>
            <RenderIcon
              name="FaSpinner"
              size={64}
              style={{ animation: "spin 1s linear infinite" }}
            />
          </EmptyIcon>
          <h3>Cargando clientes...</h3>
          <p>Obteniendo información de la base de datos.</p>
        </EmptyState>
      ) : filteredClients.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <RenderIcon name="FaSearch" size={64} />
          </EmptyIcon>
          <h3>No se encontraron clientes</h3>
          <p>
            {!hayBonosDisponibles
              ? "No tiene bonos disponibles para asignar. Contacte con el administrador."
              : searchTerm
              ? "Intenta con otros términos de búsqueda o agrega un nuevo cliente."
              : "Aún no has agregado ningún cliente. Agrega tu primer cliente para comenzar."}
          </p>
        </EmptyState>
      ) : (
        <ClientsGrid>
          {filteredClients.map((client) => (
            <ClientCard key={client.ID_CUSTOMERRETREAD}>
              <ClientHeader>
                <ClientAvatar>
                  {getInitials(client.CUSTOMER_NAME, client.CUSTOMER_LASTNAME)}
                </ClientAvatar>
                <ClientInfo>
                  <ClientName>
                    {client.CUSTOMER_NAME} {client.CUSTOMER_LASTNAME}
                  </ClientName>
                  <ClientCompany>
                    CI/RUC: {client.CUSTOMER_IDENTIFICATION}
                  </ClientCompany>
                </ClientInfo>
              </ClientHeader>

              <ClientDetails>
                <DetailRow>
                  <DetailLabel>Último Bono:</DetailLabel>
                  <DetailValue>
                    {formatDate(client.LASTACTIVEBONUS)}
                  </DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Total Bonos:</DetailLabel>
                  <DetailValue>{client.TOTALBONUS}</DetailValue>
                </DetailRow>
              </ClientDetails>

              <ClientActions>
                <Button
                  text="Ver Detalles"
                  variant="outlined"
                  size="small"
                  leftIconName="FaEye"
                  onClick={() => handleViewClient(client.ID_CUSTOMERRETREAD)}
                />
                <Button
                  text="Nuevo Bono"
                  variant="solid"
                  size="small"
                  backgroundColor={
                    hayBonosDisponibles
                      ? theme.colors.success
                      : theme.colors.textLight
                  }
                  leftIconName="FaTicketAlt"
                  onClick={() => handleNewBono(client.ID_CUSTOMERRETREAD)}
                  disabled={!hayBonosDisponibles}
                  title={
                    !hayBonosDisponibles
                      ? "No hay bonos disponibles"
                      : undefined
                  }
                />
              </ClientActions>
            </ClientCard>
          ))}
        </ClientsGrid>
      )}

      {/* Formulario de nuevo cliente */}
      {showClientModal && (
        <FormularioNuevoCliente
          onClose={handleCloseClientModal}
          onClientCreated={handleClientCreated}
        />
      )}

      {/* Formulario de nuevo bono */}
      {showBonoModal && (
        <FormularioNuevoBono
          selectedClient={selectedClient}
          onClose={handleCloseBonoModal}
          onBonoCreated={handleBonoCreated}
        />
      )}

      {/* Generador de PDF */}
      {showPDFGenerator && selectedBono && (
        <PDFGenerator bono={selectedBono} onClose={handleClosePDFGenerator} />
      )}

      {/* Modal de detalles del cliente */}
      {showDetailsModal && selectedClient && (
        <ModalOverlay onClick={handleCloseDetailsModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <RenderIcon name="FaUser" size={24} />
                Detalles del Cliente
              </ModalTitle>
              <CloseButton onClick={handleCloseDetailsModal}>
                <RenderIcon name="FaTimes" size={16} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <ModalClientInfo>
                <ModalClientName>
                  {selectedClient.CUSTOMER_NAME}{" "}
                  {selectedClient.CUSTOMER_LASTNAME}
                </ModalClientName>
                <ModalClientDetails>
                  <ModalDetailItem>
                    <ModalDetailLabel>CI/RUC:</ModalDetailLabel>
                    <ModalDetailValue>
                      {selectedClient.CUSTOMER_IDENTIFICATION}
                    </ModalDetailValue>
                  </ModalDetailItem>
                  <ModalDetailItem>
                    <ModalDetailLabel>Correo Electrónico:</ModalDetailLabel>
                    <ModalDetailValue>
                      {selectedClient.CUSTOMER_EMAIL || "No registrado"}
                    </ModalDetailValue>
                  </ModalDetailItem>
                  <ModalDetailItem>
                    <ModalDetailLabel>Número de Celular:</ModalDetailLabel>
                    <ModalDetailValue>
                      {selectedClient.CUSTOMER_PHONE || "No registrado"}
                    </ModalDetailValue>
                  </ModalDetailItem>
                  <ModalDetailItem>
                    <ModalDetailLabel>Total Bonos:</ModalDetailLabel>
                    <ModalDetailValue>
                      {selectedClient.TOTALBONUS}
                    </ModalDetailValue>
                  </ModalDetailItem>
                  <ModalDetailItem>
                    <ModalDetailLabel>Último Bono:</ModalDetailLabel>
                    <ModalDetailValue>
                      {formatDate(selectedClient.LASTACTIVEBONUS)}
                    </ModalDetailValue>
                  </ModalDetailItem>
                </ModalClientDetails>
              </ModalClientInfo>

              <BonosSection>
                <SectionTitle>
                  <RenderIcon name="FaTicketAlt" size={20} />
                  Lista de Bonos (
                  {getClientBonos(selectedClient.ID_CUSTOMERRETREAD).length})
                </SectionTitle>

                {getClientBonos(selectedClient.ID_CUSTOMERRETREAD).length >
                0 ? (
                  <BonosList>
                    {getClientBonos(selectedClient.ID_CUSTOMERRETREAD).map(
                      (bono) => (
                        <BonoCard key={bono.ID_BONUS}>
                          <BonoHeader>
                            <BonoNumber>{bono.INVOICENUMBER}</BonoNumber>
                            <EstadoBadge $estado={bono.STATUS}>
                              {getEstadoLabel(bono.STATUS)}
                            </EstadoBadge>
                          </BonoHeader>
                          <BonoDetails>
                            <BonoDetailItem>
                              <BonoDetailLabel>Marca:</BonoDetailLabel>
                              <BonoDetailValue>
                                {
                                  parseProductSpecification(
                                    bono.PRODUCT_SPECIFICATION
                                  ).brand
                                }
                              </BonoDetailValue>
                            </BonoDetailItem>
                            <BonoDetailItem>
                              <BonoDetailLabel>Tamaño:</BonoDetailLabel>
                              <BonoDetailValue>
                                {
                                  parseProductSpecification(
                                    bono.PRODUCT_SPECIFICATION
                                  ).size
                                }
                              </BonoDetailValue>
                            </BonoDetailItem>
                            <BonoDetailItem>
                              <BonoDetailLabel>Diseño:</BonoDetailLabel>
                              <BonoDetailValue>
                                {
                                  parseProductSpecification(
                                    bono.PRODUCT_SPECIFICATION
                                  ).design
                                }
                              </BonoDetailValue>
                            </BonoDetailItem>
                            <BonoDetailItem>
                              <BonoDetailLabel>Factura:</BonoDetailLabel>
                              <BonoDetailValue>
                                {bono.INVOICENUMBER}
                              </BonoDetailValue>
                            </BonoDetailItem>
                            <BonoDetailItem>
                              <BonoDetailLabel>Fecha Creación:</BonoDetailLabel>
                              <BonoDetailValue>
                                {formatDate(bono.createdAt)}
                              </BonoDetailValue>
                            </BonoDetailItem>
                          </BonoDetails>
                          <BonoActions>
                            <PDFButton onClick={() => handleGeneratePDF(bono)}>
                              <RenderIcon name="FaFilePdf" size={12} />
                              PDF
                            </PDFButton>
                          </BonoActions>
                        </BonoCard>
                      )
                    )}
                  </BonosList>
                ) : (
                  <EmptyBonos>
                    <EmptyBonosIcon>
                      <RenderIcon name="FaTicketAlt" size={48} />
                    </EmptyBonosIcon>
                    <h4>No hay bonos registrados</h4>
                    <p>Este cliente aún no tiene bonos asociados.</p>
                  </EmptyBonos>
                )}
              </BonosSection>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default ClientesReencauche;
