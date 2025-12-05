import React, { useState, useEffect } from "react";
import styled from "styled-components";
import PageContainer from "../../components/layout/PageContainer";
import Input from "../../components/ui/Input";
import RenderIcon from "../../components/ui/RenderIcon";
import SEO from "../../components/seo/SEO";
import { ROUTES } from "../../constants/routes";
import { useNavigate } from "react-router-dom";
import {
  api_bonos_getBonosByReencaucheUser,
  api_bonos_generateQRMaster,
  api_bonos_processBonusExcel,
  api_bonos_processRejectBonusExcel,
} from "../../api/bonos/apiBonos";
import { useAuth } from "../../context/AuthContext";
import {
  getBonoStateLabel,
  getBonoStateBackgroundColor,
  getBonoStateColor,
} from "../../constants/bonoStates";
import ExportToExcel from "../../components/export/ExportToExcel";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";

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
  gap: 20px;
`;

const FacturaGroup = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const FacturaHeader = styled.div`
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
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

const FacturaTitle = styled.h2`
  font-size: 1.2rem;
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FacturaStats = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const BonosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BonoCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const BonoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const BonoNumber = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
`;

const EstadoBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  background-color: ${({ $estado }) =>
    getBonoStateBackgroundColor($estado?.toUpperCase())};
  color: ${({ $estado }) => getBonoStateColor($estado?.toUpperCase())};
`;

const BonoDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
  flex: 1;
`;

const BonoDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const BonoDetailLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 500;
`;

const BonoDetailValue = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  word-break: break-word;
`;

const AdditionalInfo = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
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

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 850px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const UploadSection = styled.div`
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: ${({ theme }) => theme.colors.background};
`;

const ModalContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const UploadsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
`;

const SummaryColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

const UploadTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UploadHint = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const FileInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;

  &::file-selector-button {
    margin-right: 12px;
    border: none;
    border-radius: 6px;
    padding: 8px 14px;
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  &::file-selector-button:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const ResultSection = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 20px;
  background: ${({ theme }) => theme.colors.surface};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ResultContent = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding-right: 4px;

  /* Estilos personalizados para el scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.colors.background};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.textLight};
  }

  /* Para Firefox */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.border}
    ${({ theme }) => theme.colors.background};
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 1rem;
`;

const SummaryLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SummaryValue = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const SummaryMetrics = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const SummaryChip = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => `${theme.colors.border}80`};
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
`;

const BonusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const BonusCard = styled.div`
  border-radius: 6px;
  border: 1px solid ${({ theme }) => `${theme.colors.border}80`};
  background: ${({ theme }) => theme.colors.background};
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  font-size: 0.82rem;
`;

const BonusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.8rem;
  flex-wrap: wrap;
`;

const BonusField = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.colors.textLight};

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }
`;

const RejectReasonContainer = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  width: 100%;
`;

const BonosActivados = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [bonosActivados, setBonosActivados] = useState([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [useBonosFile, setUseBonosFile] = useState(null);
  const [rejectBonosFile, setRejectBonosFile] = useState(null);
  const [isProcessingUse, setIsProcessingUse] = useState(false);
  const [isProcessingReject, setIsProcessingReject] = useState(false);
  const [processType, setProcessType] = useState(null);
  const [processData, setProcessData] = useState(null);
  const { user } = useAuth();

  const obtenerBonosActivados = async () => {
    const response = await api_bonos_getBonosByReencaucheUser(user.ID_USER);

    if (response.success) {
      // La API ya envía los datos agrupados por master
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

  // Filtrar grupos por Master (la API ya viene agrupada)
  const filteredGrupos = bonosActivados.filter((grupo) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      grupo.master.toLowerCase().includes(searchLower) ||
      grupo.bonuses.some((bono) =>
        bono.INVOICENUMBER.toLowerCase().includes(searchLower)
      ) ||
      grupo.customer?.CUSTOMER_NAME.toLowerCase().includes(searchLower) ||
      grupo.customer?.CUSTOMER_LASTNAME.toLowerCase().includes(searchLower) ||
      grupo.customer?.CUSTOMER_IDENTIFICATION.includes(searchTerm) ||
      grupo.businessPartner?.NAME_USER.toLowerCase().includes(searchLower) ||
      grupo.businessPartner?.ACCOUNT_USER.includes(searchTerm)
    );
  });

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

  // Calcular total de bonos
  const totalBonos = bonosActivados.reduce(
    (sum, grupo) => sum + grupo.totalBonuses,
    0
  );

  // Calcular total de grupos Master
  const totalGruposMaster = filteredGrupos.length;

  const handleRedirectToVerificarBono = async (master) => {
    try {
      toast.info("Generando código de verificación...");

      // Generar el QR code para obtener el código encriptado desde el Master
      const response = await api_bonos_generateQRMaster(master);

      if (response.success && response.data.qrCode) {
        const encryptedMaster = response.data.qrCode;

        // Abrir en nueva pestaña con el parámetro mstr
        const preUrl =
          import.meta.env.VITE_NODE_ENV === "production"
            ? import.meta.env.VITE_PRODUCTION_URL
            : import.meta.env.VITE_DEVELOPMENT_URL;
        const verifyUrl = `${preUrl}${
          ROUTES.REENCAUCHE.VERIFICAR
        }?mstr=${encodeURIComponent(encryptedMaster)}`;
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

  const goBack = () => {
    navigate(ROUTES.REENCAUCHE.HOME);
  };

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setUseBonosFile(null);
    setRejectBonosFile(null);
    setIsProcessingUse(false);
    setIsProcessingReject(false);
    setProcessType(null);
    setProcessData(null);
  };

  const handleProcessUseBonos = async () => {
    if (!useBonosFile) {
      toast.error("Selecciona un archivo para procesar bonos.");
      return;
    }
    if (!user?.ID_USER) {
      toast.error("No se encontró información del usuario.");
      return;
    }

    try {
      setIsProcessingUse(true);
      const formData = new FormData();
      formData.append("excelFile", useBonosFile);
      formData.append("userId", user.ID_USER);

      const response = await api_bonos_processBonusExcel(formData);
      if (response.success) {
        toast.success(
          response.message || "Archivo procesado correctamente para usar bonos."
        );
        setProcessType("use");
        setProcessData(response.data || null);
      } else {
        toast.error(
          response.message || "No se pudo procesar el archivo para usar bonos."
        );
        setProcessType("use");
        setProcessData(response.data || null);
      }
    } catch (error) {
      console.error("Error al preparar archivo para usar bonos:", error);
      toast.error("No se pudo preparar el archivo.");
    } finally {
      setIsProcessingUse(false);
    }
  };

  const handleProcessRejectBonos = async () => {
    if (!rejectBonosFile) {
      toast.error("Selecciona un archivo para rechazar bonos.");
      return;
    }
    if (!user?.ID_USER) {
      toast.error("No se encontró información del usuario.");
      return;
    }

    try {
      setIsProcessingReject(true);
      const formData = new FormData();
      formData.append("excelFile", rejectBonosFile);
      formData.append("userId", user.ID_USER);

      const response = await api_bonos_processRejectBonusExcel(formData);
      if (response.success) {
        toast.success(
          response.message ||
            "Archivo procesado correctamente para rechazar bonos."
        );
        setProcessType("reject");
        setProcessData(response.data || null);
      } else {
        toast.error(
          response.message ||
            "No se pudo procesar el archivo para rechazar bonos."
        );
        setProcessType("reject");
        setProcessData(response.data || null);
      }
    } catch (error) {
      console.error("Error al preparar archivo para rechazar bonos:", error);
      toast.error("No se pudo preparar el archivo.");
    } finally {
      setIsProcessingReject(false);
    }
  };

  return (
    <>
      <SEO
        title="Historial de Bonos - Sistema de Reencauche"
        description={`Historial de bonos de reencauche. ${totalBonos} bonos agrupados en ${totalGruposMaster} grupos por Master. Visualiza, gestiona y exporta el historial completo de bonos activados.`}
        keywords="historial bonos, reencauche, bonos activados, gestión bonos, llantas, neumáticos, exportar excel"
      />
      <PageContainer
        backButtonOnClick={goBack}
        backButtonText="Volver al inicio"
      >
        <Container>
          <Header>
            <TitleContainer>
              <Title>
                <RenderIcon name="FaHistory" size={28} />
                Historial de Bonos
              </Title>
              <StatsText>
                {totalBonos} bonos agrupados en {totalGruposMaster} grupo
                {totalGruposMaster !== 1 ? "s" : ""} por Master
              </StatsText>
            </TitleContainer>
            <SearchContainer>
              <Input
                type="text"
                placeholder="Buscar por Master, factura, cliente o CI/RUC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIconName="FaSearch"
                style={{
                  minWidth: "200px",
                  width: isMobile ? "100%" : "auto",
                }}
                fullWidth={isMobile}
              />
              <ExportToExcel
                data={bonosActivados}
                fileName="historial_bonos_reencauche"
                buttonText={isMobile ? "Excel" : "Exportar a Excel"}
                backgroundColor="#10b981"
                size="medium"
              />
              <Button
                text="Importar Excel"
                variant="outlined"
                size="medium"
                onClick={handleOpenImportModal}
                leftIconName="FaFileImport"
              />
            </SearchContainer>
          </Header>

          {filteredGrupos.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <RenderIcon name="FaSearch" size={48} />
              </EmptyIcon>
              <EmptyTitle>No se encontraron bonos</EmptyTitle>
              <EmptyDescription>
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Aún no has usado ningún bono"}
              </EmptyDescription>
            </EmptyState>
          ) : (
            <BonosList>
              {filteredGrupos.map((grupo) => (
                <FacturaGroup key={grupo.master}>
                  <FacturaHeader>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        <FacturaTitle>
                          <RenderIcon name="FaTag" size={18} />
                          Master: {grupo.master}
                        </FacturaTitle>
                        <ViewButton
                          onClick={() =>
                            handleRedirectToVerificarBono(grupo.master)
                          }
                        >
                          <RenderIcon name="FaEye" size={12} />
                          Ver
                        </ViewButton>
                      </div>
                      <FacturaStats>
                        {grupo.totalBonuses} bono
                        {grupo.totalBonuses > 1 ? "s" : ""} (Activos:{" "}
                        {grupo.bonusTypes?.activos || 0}, Usados:{" "}
                        {grupo.bonusTypes?.usados || 0}, Rechazados:{" "}
                        {grupo.bonusTypes?.rechazados || 0})
                      </FacturaStats>
                    </div>
                    {grupo.businessPartner && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          fontSize: "0.85rem",
                          color: "inherit",
                        }}
                      >
                        <div style={{ fontWeight: "600" }}>
                          <RenderIcon
                            name="FaBuilding"
                            size={14}
                            style={{ marginRight: "6px" }}
                          />
                          {grupo.businessPartner.NAME_USER}
                        </div>
                        <div style={{ fontSize: "0.8rem" }}>
                          RUC: {grupo.businessPartner.ACCOUNT_USER}
                        </div>
                        <div style={{ fontSize: "0.8rem" }}>
                          Email: {grupo.businessPartner.EMAIL}
                        </div>
                      </div>
                    )}
                  </FacturaHeader>

                  <BonosGrid>
                    {grupo.bonuses.map((bono) => (
                      <BonoCard key={bono.ID_BONUS}>
                        <BonoHeader>
                          <BonoNumber>Bono #{bono.ID_BONUS}</BonoNumber>
                          <EstadoBadge $estado={bono.STATUS.toLowerCase()}>
                            {getBonoStateLabel(bono.STATUS)}
                          </EstadoBadge>
                        </BonoHeader>

                        <BonoDetails>
                          <BonoDetailItem>
                            <BonoDetailLabel>Factura</BonoDetailLabel>
                            <BonoDetailValue>
                              {bono.INVOICENUMBER || "N/A"}
                            </BonoDetailValue>
                          </BonoDetailItem>

                          <BonoDetailItem>
                            <BonoDetailLabel>Marca</BonoDetailLabel>
                            <BonoDetailValue>
                              {bono.parsedProduct?.BRAND || "N/A"}
                            </BonoDetailValue>
                          </BonoDetailItem>

                          <BonoDetailItem>
                            <BonoDetailLabel>Aro/Rin</BonoDetailLabel>
                            <BonoDetailValue>
                              {bono.parsedProduct?.SIZE || "N/A"}
                            </BonoDetailValue>
                          </BonoDetailItem>

                          <BonoDetailItem>
                            <BonoDetailLabel>Diseño</BonoDetailLabel>
                            <BonoDetailValue>
                              {bono.parsedProduct?.DESIGN || "N/A"}
                            </BonoDetailValue>
                          </BonoDetailItem>
                        </BonoDetails>

                        {/* Información adicional según el estado */}
                        {(bono.ITEM ||
                          bono.RETREADINVOICE ||
                          bono.REJECT_REASON ||
                          bono.REJECT_INFORMATION) && (
                          <AdditionalInfo>
                            {/* Item y Master para ACTIVO, USADO y RECHAZADO */}
                            {(bono.STATUS === "ACTIVO" ||
                              bono.STATUS === "USADO" ||
                              bono.STATUS === "RECHAZADO") && (
                              <>
                                <BonoDetailItem>
                                  <BonoDetailLabel>Item</BonoDetailLabel>
                                  <BonoDetailValue>
                                    {bono.ITEM || "N/A"}
                                  </BonoDetailValue>
                                </BonoDetailItem>
                                <BonoDetailItem>
                                  <BonoDetailLabel>Master</BonoDetailLabel>
                                  <BonoDetailValue>
                                    {bono.MASTER || "N/A"}
                                  </BonoDetailValue>
                                </BonoDetailItem>
                              </>
                            )}

                            {/* Factura de Reencauche solo para USADO */}
                            {bono.STATUS === "USADO" && bono.RETREADINVOICE && (
                              <BonoDetailItem style={{ gridColumn: "1 / -1" }}>
                                <BonoDetailLabel>
                                  Factura de Reencauche
                                </BonoDetailLabel>
                                <BonoDetailValue>
                                  {bono.RETREADINVOICE}
                                </BonoDetailValue>
                              </BonoDetailItem>
                            )}

                            {/* Motivo de Rechazo solo para RECHAZADO */}
                            {bono.STATUS === "RECHAZADO" &&
                              bono.REJECT_REASON && (
                                <BonoDetailItem
                                  style={{ gridColumn: "1 / -1" }}
                                >
                                  <BonoDetailLabel>
                                    Motivo de Rechazo
                                  </BonoDetailLabel>
                                  <BonoDetailValue
                                    style={{
                                      color: "#dc3545",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {bono.REJECT_REASON}
                                  </BonoDetailValue>
                                </BonoDetailItem>
                              )}

                            {/* Información de Rechazo solo para RECHAZADO */}
                            {bono.REJECT_INFORMATION && (
                              <BonoDetailItem style={{ gridColumn: "1 / -1" }}>
                                <BonoDetailLabel>
                                  Información de Rechazo
                                </BonoDetailLabel>
                                <BonoDetailValue
                                  style={{
                                    color: "#dc3545",
                                    fontWeight: "500",
                                  }}
                                >
                                  {bono.REJECT_INFORMATION}
                                </BonoDetailValue>
                              </BonoDetailItem>
                            )}
                          </AdditionalInfo>
                        )}
                      </BonoCard>
                    ))}
                  </BonosGrid>
                </FacturaGroup>
              ))}
            </BonosList>
          )}
        </Container>
      </PageContainer>

      {isImportModalOpen && (
        <ModalOverlay>
          <ModalContainer>
            <ModalHeader>
              <ModalTitle>
                <RenderIcon name="FaFileExcel" size={20} /> Importar archivos de
                bonos
              </ModalTitle>
              <CloseButton onClick={handleCloseImportModal}>
                <RenderIcon name="FaTimes" size={18} />
              </CloseButton>
            </ModalHeader>

            <ModalContentLayout>
              <UploadsColumn>
                <UploadSection>
                  <UploadTitle>
                    <RenderIcon name="FaCheckCircle" size={16} />
                    Suba aquí para usar bonos
                  </UploadTitle>
                  <UploadHint>
                    Formato permitido: .xlsx o .xls. Carga el listado de bonos a
                    utilizar. El archivo debe tener las columnas: "master",
                    "item" y "factura".
                  </UploadHint>
                  <FileInput
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setUseBonosFile(file);
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      text={isProcessingUse ? "Procesando..." : "Procesar uso"}
                      variant="solid"
                      size="small"
                      onClick={handleProcessUseBonos}
                      disabled={isProcessingUse}
                      leftIconName="FaPlay"
                    />
                  </div>
                </UploadSection>

                <UploadSection>
                  <UploadTitle>
                    <RenderIcon name="FaTimesCircle" size={16} />
                    Suba aquí para rechazar bonos
                  </UploadTitle>
                  <UploadHint>
                    Formato permitido: .xlsx o .xls. Carga el listado de bonos a
                    rechazar. El archivo debe tener las columnas: "master",
                    "item" y "razon".
                  </UploadHint>
                  <FileInput
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setRejectBonosFile(file);
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      text={
                        isProcessingReject
                          ? "Procesando..."
                          : "Procesar rechazo"
                      }
                      variant="solid"
                      size="small"
                      onClick={handleProcessRejectBonos}
                      disabled={isProcessingReject}
                      leftIconName="FaBan"
                      backgroundColor="#dc3545"
                    />
                  </div>
                </UploadSection>
              </UploadsColumn>

              {processData && (
                <SummaryColumn>
                  <ResultSection>
                    <ResultHeader>
                      <RenderIcon
                        name={processType === "use" ? "FaCheckCircle" : "FaBan"}
                        size={18}
                      />
                      Resumen de procesamiento (
                      {processType === "use" ? "usar bonos" : "rechazar bonos"})
                    </ResultHeader>

                    {processData.summary ? (
                      <SummaryMetrics>
                        <SummaryChip>
                          <SummaryLabel>Total de filas</SummaryLabel>
                          <SummaryValue>
                            {processData.summary.totalRows ?? 0}
                          </SummaryValue>
                        </SummaryChip>
                        {processType === "use" ? (
                          <>
                            <SummaryChip>
                              <SummaryLabel>Bonos procesados</SummaryLabel>
                              <SummaryValue>
                                {processData.summary.bonusesProcessed ?? 0}
                              </SummaryValue>
                            </SummaryChip>
                            <SummaryChip>
                              <SummaryLabel>Bonos no procesados</SummaryLabel>
                              <SummaryValue>
                                {processData.summary.bonusesNotProcessed ?? 0}
                              </SummaryValue>
                            </SummaryChip>
                          </>
                        ) : (
                          <>
                            <SummaryChip>
                              <SummaryLabel>Bonos rechazados</SummaryLabel>
                              <SummaryValue>
                                {processData.summary.bonusesRejected ?? 0}
                              </SummaryValue>
                            </SummaryChip>
                            <SummaryChip>
                              <SummaryLabel>
                                Bonos de reemplazo creados
                              </SummaryLabel>
                              <SummaryValue>
                                {processData.summary
                                  .replacementBonusesCreated ?? 0}
                              </SummaryValue>
                            </SummaryChip>
                            <SummaryChip>
                              <SummaryLabel>Bonos no procesados</SummaryLabel>
                              <SummaryValue>
                                {processData.summary.bonusesNotProcessed ?? 0}
                              </SummaryValue>
                            </SummaryChip>
                          </>
                        )}
                      </SummaryMetrics>
                    ) : (
                      <SummaryLabel>
                        No se recibió resumen del procesamiento.
                      </SummaryLabel>
                    )}
                  </ResultSection>

                  {processType === "reject" && processData.rejectedBonuses && (
                    <ResultSection style={{ flex: 1, minHeight: 0 }}>
                      <ResultHeader>
                        <RenderIcon name="FaBan" size={18} />
                        Bonos rechazados
                      </ResultHeader>
                      <ResultContent>
                        <BonusList>
                          {processData.rejectedBonuses.map((bono, index) => (
                            <BonusCard
                              key={`rejected-${index}`}
                              style={{
                                flexDirection: "column",
                                alignItems: "flex-start",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  flexWrap: "wrap",
                                  width: "100%",
                                }}
                              >
                                <BonusField>
                                  BONO{" "}
                                  <strong>#{bono.ID_BONUS ?? "N/A"}</strong>
                                </BonusField>
                                <BonusField>
                                  MASTER <strong>{bono.MASTER ?? "N/A"}</strong>
                                </BonusField>
                                <BonusField>
                                  ITEM <strong>{bono.ITEM ?? "N/A"}</strong>
                                </BonusField>
                              </div>
                              {bono.REJECT_REASON && (
                                <RejectReasonContainer>
                                  <BonusField>
                                    RAZÓN <strong>{bono.REJECT_REASON}</strong>
                                  </BonusField>
                                </RejectReasonContainer>
                              )}
                            </BonusCard>
                          ))}
                        </BonusList>
                      </ResultContent>
                    </ResultSection>
                  )}

                  {processData.notProcessedBonuses && (
                    <>
                      {Object.entries(processData.notProcessedBonuses).map(
                        ([category, items]) =>
                          Array.isArray(items) &&
                          items.length > 0 && (
                            <ResultSection
                              key={category}
                              style={{ flex: 1, minHeight: 0 }}
                            >
                              <ResultHeader>
                                <RenderIcon
                                  name="FaExclamationTriangle"
                                  size={18}
                                />
                                Bonos no procesados -{" "}
                                {category === "notFoundOrNotActive"
                                  ? "No encontrados o inactivos"
                                  : category === "alreadyRejected"
                                  ? "Ya rechazados"
                                  : category === "rejectErrors"
                                  ? "Errores al rechazar"
                                  : category === "otherErrors"
                                  ? "Otros errores"
                                  : category}
                              </ResultHeader>
                              <ResultContent>
                                <BonusList>
                                  {items.map((item, index) => (
                                    <BonusCard key={`${category}-${index}`}>
                                      {item.row !== undefined && (
                                        <BonusField>
                                          FILA{" "}
                                          <strong>{item.row ?? "N/A"}</strong>
                                        </BonusField>
                                      )}
                                      {item.master !== undefined && (
                                        <BonusField>
                                          MASTER{" "}
                                          <strong>
                                            {item.master ?? "N/A"}
                                          </strong>
                                        </BonusField>
                                      )}
                                      {item.item !== undefined && (
                                        <BonusField>
                                          ITEM{" "}
                                          <strong>{item.item ?? "N/A"}</strong>
                                        </BonusField>
                                      )}
                                      {item.ID_BONUS !== undefined && (
                                        <BonusField>
                                          BONO{" "}
                                          <strong>
                                            #{item.ID_BONUS ?? "N/A"}
                                          </strong>
                                        </BonusField>
                                      )}
                                      {item.error && (
                                        <BonusField>
                                          ERROR{" "}
                                          <strong style={{ color: "#dc3545" }}>
                                            {item.error}
                                          </strong>
                                        </BonusField>
                                      )}
                                    </BonusCard>
                                  ))}
                                </BonusList>
                              </ResultContent>
                            </ResultSection>
                          )
                      )}
                    </>
                  )}
                </SummaryColumn>
              )}
            </ModalContentLayout>
          </ModalContainer>
        </ModalOverlay>
      )}
    </>
  );
};

export default BonosActivados;
