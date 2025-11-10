import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppTheme } from "../../context/AppThemeContext";
import PageContainer from "../../components/layout/PageContainer";
import Button from "../../components/ui/Button";
import RenderIcon from "../../components/ui/RenderIcon";
import SEO from "../../components/seo/SEO";
import { useNavigate } from "react-router-dom";
import FormularioNuevoCliente from "./FormularioNuevoCliente";
import FormularioNuevoBonoLista from "./FormularioNuevoBonoLista";
import PDFGenerator from "../../components/pdf/PDFGenerator";
import {
  api_bonos_getClientesByMayorista,
  api_bonos_getBonosByCustomer,
  api_bonos_generateQR,
  api_bonos_getSalesDataForBonus,
} from "../../api/bonos/apiBonos";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import {
  generateAndSendMultipleBonosPDF,
  downloadMultipleBonosPDF,
  previewBonosHTML,
} from "../../utils/bonoUtils";
import { ROUTES } from "../../constants/routes";
import {
  getBonoStateLabel,
  getBonoStateBackgroundColor,
  getBonoStateColor,
} from "../../constants/bonoStates";

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
  gap: 16px;
`;

const FacturaGroup = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  }
`;

const FacturaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
`;

const FacturaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FacturaNumber = styled.h4`
  margin: 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const BonosCount = styled.span`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
`;

const BonosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 12px;
`;

const BonoCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 10px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 6px ${({ theme }) => theme.colors.shadow};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const BonoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const BonoNumber = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
`;

const EstadoBadge = styled.span`
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  background-color: ${({ $estado }) =>
    getBonoStateBackgroundColor($estado, true)};
  color: ${({ $estado }) => getBonoStateColor($estado)};
`;

const BonoDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
`;

const BonoDetailItem = styled.div`
  display: flex;
  gap: 4px;
`;

const BonoDetailLabel = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.75rem;
  font-weight: 500;
`;

const BonoDetailValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 0.75rem;
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

const PreviewButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
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
    background-color: ${({ theme }) => theme.colors.primary}dd;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ViewButton = styled.button`
  background-color: #10b981;
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
    background-color: #059669;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
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

  // Estado para bonos disponibles (datos reales de la API)
  const [bonosDisponiblesData, setBonosDisponiblesData] = useState(null);
  const [loadingBonosDisponibles, setLoadingBonosDisponibles] = useState(false);

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

  const obtenerBonosDisponibles = async () => {
    try {
      setLoadingBonosDisponibles(true);

      // Obtener las empresas del usuario (asumiendo que están en user.ENTERPRISES o similar)
      const empresas = user.ENTERPRISES || "MAXXIMUNDO,AUTOLLANTA,STOX"; // Fallback

      const response = await api_bonos_getSalesDataForBonus(
        user.ACCOUNT_USER,
        empresas
      );

      if (response.success) {
        setBonosDisponiblesData(response.data);
      } else {
        console.error("Error obteniendo bonos disponibles:", response.message);
        toast.error("Error al cargar bonos disponibles");
      }
    } catch (error) {
      console.error("Error en la API de bonos disponibles:", error);
      toast.error("Error al cargar bonos disponibles");
    } finally {
      setLoadingBonosDisponibles(false);
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
    obtenerBonosDisponibles();
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

  const groupBonosByInvoice = (clientId) => {
    const clientBonos = getClientBonos(clientId);
    const grouped = {};

    clientBonos.forEach((bono) => {
      const invoiceNumber = bono.INVOICENUMBER || "Sin Factura";
      if (!grouped[invoiceNumber]) {
        grouped[invoiceNumber] = [];
      }
      grouped[invoiceNumber].push(bono);
    });

    return grouped;
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

  const handleGeneratePDF = async (invoiceNumber, bonosDeFactura) => {
    try {
      toast.info("Generando PDF con todos los bonos de la factura...");

      const downloadResponse = await downloadMultipleBonosPDF(
        bonosDeFactura,
        selectedClient,
        invoiceNumber
      );

      if (downloadResponse.success) {
        toast.success("PDF descargado exitosamente");
      } else {
        toast.error("Error al descargar el PDF");
      }
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Error al generar el PDF");
    }
  };

  const handleRedirectToVerificarBono = async (invoiceNumber) => {
    try {
      toast.info("Generando código de verificación...");

      // Generar el QR code para obtener el código encriptado
      const response = await api_bonos_generateQR(invoiceNumber);

      if (response.success && response.data.qrCode) {
        const encryptedCode = response.data.qrCode;

        // Abrir en nueva pestaña
        const preUrl =
          import.meta.env.VITE_NODE_ENV === "production"
            ? import.meta.env.VITE_PRODUCTION_URL
            : import.meta.env.VITE_DEVELOPMENT_URL;
        const verifyUrl = `${preUrl}${
          ROUTES.REENCAUCHE.VERIFICAR
        }?code=${encodeURIComponent(encryptedCode)}`;
        window.open(verifyUrl, "_blank");

        toast.success("Página de verificación abierta");
      } else {
        toast.error("Error al generar el código de verificación");
      }
    } catch (error) {
      console.error("Error al generar código:", error);
      toast.error("Error al generar el código de verificación");
    }
  };

  const handlePreviewPDF = async (invoiceNumber, bonosDeFactura) => {
    try {
      toast.info("Abriendo previsualización...");

      const previewResponse = await previewBonosHTML(
        bonosDeFactura,
        selectedClient,
        invoiceNumber
      );

      if (previewResponse.success) {
        toast.success("Previsualización abierta exitosamente");
      } else {
        toast.error("Error al abrir la previsualización");
      }
    } catch (error) {
      console.error("Error al generar previsualización:", error);
      toast.error("Error al generar la previsualización");
    }
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

      // Recargar los bonos disponibles para actualizar los contadores
      await obtenerBonosDisponibles();

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
  // Basado en BREAKDOWN_BY_DESIGN sumando AVAILABLE_BONUSES
  const getTotalBonosDisponibles = () => {
    if (!bonosDisponiblesData?.BREAKDOWN_BY_DESIGN) return 0;
    return bonosDisponiblesData.BREAKDOWN_BY_DESIGN.reduce(
      (sum, item) => sum + Number(item.AVAILABLE_BONUSES ?? 0),
      0
    );
  };

  const hayBonosDisponibles = getTotalBonosDisponibles() > 0;

  return (
    <>
      <SEO
        title="Gestión de Clientes y Bonos - Sistema de Reencauche"
        description={`Sistema de gestión de clientes y bonos de reencauche. Administra ${clientes.length} clientes y genera códigos QR para verificación de bonos. Crea, gestiona y descarga bonos en formato PDF.`}
        keywords="gestión clientes, bonos reencauche, códigos QR, generación PDF, llantas, neumáticos, clientes"
      />
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
            {loadingBonosDisponibles ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <RenderIcon
                  name="FaSpinner"
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                <span>Cargando bonos...</span>
              </div>
            ) : bonosDisponiblesData?.BREAKDOWN_BY_DESIGN &&
              Array.isArray(bonosDisponiblesData.BREAKDOWN_BY_DESIGN) ? (
              bonosDisponiblesData.BREAKDOWN_BY_DESIGN.map((product) => {
                const cantidad = Number(product.AVAILABLE_BONUSES ?? 0);

                return (
                  <BonoPorMarcaBadge
                    key={`${product.BRAND}-${product.SIZE}-${product.DESIGN}-${product.ENTERPRISE}`}
                    $cantidad={cantidad}
                  >
                    <MarcaNombre>
                      {product.BRAND} {product.SIZE} {product.DESIGN}
                    </MarcaNombre>
                    <CantidadBonos $cantidad={cantidad}>
                      {cantidad}
                    </CantidadBonos>
                  </BonoPorMarcaBadge>
                );
              })
            ) : (
              <div style={{ color: theme.colors.textLight }}>
                No hay datos de bonos disponibles
              </div>
            )}
          </BonosDisponiblesInfo>
        </BonosDisponiblesContainer>

        {/* Alerta cuando no hay bonos disponibles */}
        {!hayBonosDisponibles && (
          <AlertaBonos0>
            <RenderIcon name="FaExclamationTriangle" size={24} />
            <div>
              <strong>No tiene bonos disponibles</strong>
              <div style={{ fontSize: "0.9rem", marginTop: "4px" }}>
                No puede crear nuevos bonos hasta que haga una compra de la
                marca y rin seleccionada.
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
                    {getInitials(
                      client.CUSTOMER_NAME,
                      client.CUSTOMER_LASTNAME
                    )}
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
          <FormularioNuevoBonoLista
            selectedClient={selectedClient}
            onClose={handleCloseBonoModal}
            onBonoCreated={handleBonoCreated}
            bonosDisponiblesData={bonosDisponiblesData}
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
                    Bonos por Factura (
                    {
                      getClientBonos(selectedClient.ID_CUSTOMERRETREAD).length
                    }{" "}
                    bonos)
                  </SectionTitle>

                  {getClientBonos(selectedClient.ID_CUSTOMERRETREAD).length >
                  0 ? (
                    <BonosList>
                      {Object.entries(
                        groupBonosByInvoice(selectedClient.ID_CUSTOMERRETREAD)
                      ).map(([invoiceNumber, bonosFactura]) => (
                        <FacturaGroup key={invoiceNumber}>
                          <FacturaHeader>
                            <FacturaInfo>
                              <FacturaNumber>
                                <RenderIcon name="FaFileInvoice" size={16} />
                                {invoiceNumber}
                              </FacturaNumber>
                              <BonosCount>
                                {bonosFactura.length} bonos
                              </BonosCount>
                            </FacturaInfo>
                            <ButtonsContainer>
                              <ViewButton
                                onClick={() =>
                                  handleRedirectToVerificarBono(invoiceNumber)
                                }
                              >
                                <RenderIcon name="FaEye" size={14} />
                                Ver
                              </ViewButton>
                              <PreviewButton
                                onClick={() =>
                                  handlePreviewPDF(invoiceNumber, bonosFactura)
                                }
                              >
                                <RenderIcon name="FaEye" size={14} />
                                Preview PDF
                              </PreviewButton>
                              <PDFButton
                                onClick={() =>
                                  handleGeneratePDF(invoiceNumber, bonosFactura)
                                }
                              >
                                <RenderIcon name="FaFilePdf" size={14} />
                                Descargar PDF
                              </PDFButton>
                            </ButtonsContainer>
                          </FacturaHeader>

                          <BonosGrid>
                            {bonosFactura
                              .sort((a, b) => a.ID_BONUS - b.ID_BONUS)
                              .map((bono) => {
                                const producto = parseProductSpecification(
                                  bono.PRODUCT_SPECIFICATION
                                );
                                return (
                                  <BonoCard key={bono.ID_BONUS}>
                                    <BonoHeader>
                                      <BonoNumber>#{bono.ID_BONUS}</BonoNumber>
                                      <EstadoBadge $estado={bono.STATUS}>
                                        {getBonoStateLabel(bono.STATUS)}
                                      </EstadoBadge>
                                    </BonoHeader>
                                    <BonoDetails>
                                      <BonoDetailItem>
                                        <BonoDetailLabel>
                                          Marca:
                                        </BonoDetailLabel>
                                        <BonoDetailValue>
                                          {producto.brand}
                                        </BonoDetailValue>
                                      </BonoDetailItem>
                                      <BonoDetailItem>
                                        <BonoDetailLabel>
                                          Aro/Rin:
                                        </BonoDetailLabel>
                                        <BonoDetailValue>
                                          {producto.size}
                                        </BonoDetailValue>
                                      </BonoDetailItem>
                                      <BonoDetailItem>
                                        <BonoDetailLabel>
                                          Diseño:
                                        </BonoDetailLabel>
                                        <BonoDetailValue>
                                          {producto.design}
                                        </BonoDetailValue>
                                      </BonoDetailItem>
                                      {bono.QUANTITY && (
                                        <BonoDetailItem>
                                          <BonoDetailLabel>
                                            Cant:
                                          </BonoDetailLabel>
                                          <BonoDetailValue>
                                            {bono.QUANTITY}
                                          </BonoDetailValue>
                                        </BonoDetailItem>
                                      )}
                                      {bono.MASTER && (
                                        <BonoDetailItem>
                                          <BonoDetailLabel>
                                            Master:
                                          </BonoDetailLabel>
                                          <BonoDetailValue>
                                            {bono.MASTER}
                                          </BonoDetailValue>
                                        </BonoDetailItem>
                                      )}
                                      {bono.ITEM && (
                                        <BonoDetailItem>
                                          <BonoDetailLabel>
                                            Item:
                                          </BonoDetailLabel>
                                          <BonoDetailValue>
                                            {bono.ITEM}
                                          </BonoDetailValue>
                                        </BonoDetailItem>
                                      )}
                                    </BonoDetails>
                                  </BonoCard>
                                );
                              })}
                          </BonosGrid>
                        </FacturaGroup>
                      ))}
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
    </>
  );
};

export default ClientesReencauche;
