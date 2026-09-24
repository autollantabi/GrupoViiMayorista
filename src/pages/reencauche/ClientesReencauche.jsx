import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppTheme } from "../../context/AppThemeContext";
import PageContainer from "../../components/layout/PageContainer";
import Button from "../../components/ui/Button";
import RenderIcon from "../../components/ui/RenderIcon";
import SEO from "../../components/seo/SEO";
import { useNavigate } from "react-router-dom";
import FormularioNuevoBonoLista from "./FormularioNuevoBonoLista";
import PDFGenerator from "../../components/pdf/PDFGenerator";
import {
  api_bonos_getBonosByMayoristaUser,
  api_bonos_generateQRMaster,
  api_bonos_getSalesDataForBonus,
} from "../../api/bonos/apiBonos";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import {
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
  background-color: ${({ theme }) => theme.colors.surface};
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
  flex-wrap: wrap;
  gap: 12px;
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
  background-color: ${({ theme }) => theme.colors.background};
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

const ButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
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
  flex-wrap: wrap;
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
  const [showBonoModal, setShowBonoModal] = useState(false);
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);
  const [selectedBono, setSelectedBono] = useState(null);
  const [bonosMayorista, setBonosMayorista] = useState([]);
  const [loadingBonos, setLoadingBonos] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estado para bonos disponibles (datos reales de la API)
  const [bonosDisponiblesData, setBonosDisponiblesData] = useState(null);
  const [loadingBonosDisponibles, setLoadingBonosDisponibles] = useState(false);

  const obtenerBonosMayorista = async () => {
    try {
      setLoadingBonos(true);
      const response = await api_bonos_getBonosByMayoristaUser(user.ID_USER);
      if (response.success) {
        setBonosMayorista(response.data);
      } else {
        console.error("Error obteniendo bonos del mayorista:", response.message);
      }
    } catch (error) {
      console.error("Error en la API:", error);
    } finally {
      setLoadingBonos(false);
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

  useEffect(() => {
    obtenerBonosMayorista();
    obtenerBonosDisponibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const groupBonosByMaster = () => {
    const grouped = {};

    bonosMayorista.forEach((bono) => {
      const master = bono.MASTER || bono.INVOICENUMBER || "Sin Master";
      if (!grouped[master]) {
        grouped[master] = [];
      }
      grouped[master].push(bono);
    });

    return grouped;
  };

  const filteredGroupEntries = Object.entries(groupBonosByMaster()).filter(
    ([master, bonosDelGrupo]) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        master.toLowerCase().includes(term) ||
        bonosDelGrupo.some((bono) =>
          (bono.INVOICENUMBER || "").toLowerCase().includes(term)
        )
      );
    }
  );

  const handleNewBono = () => {
    if (!hayBonosDisponibles) {
      toast.error("No tiene bonos disponibles para activar");
      return;
    }
    setShowBonoModal(true);
  };

  const handleCloseBonoModal = () => {
    setShowBonoModal(false);
  };

  const handleBonoCreated = async () => {
    try {
      await obtenerBonosDisponibles();
      await obtenerBonosMayorista();
    } catch (error) {
      console.error("Error actualizando datos:", error);
    }
  };

  const handleGeneratePDF = async (master, bonosDeFactura) => {
    try {
      const downloadResponse = await downloadMultipleBonosPDF(
        bonosDeFactura,
        null,
        master
      );

      if (!downloadResponse.success) {
        toast.error("Error al descargar el PDF");
      }
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Error al generar el PDF");
    }
  };

  const handleRedirectToVerificarBono = async (master) => {
    try {
      toast.info("Generando código de verificación...");

      const response = await api_bonos_generateQRMaster(master);

      if (response.success && response.data.qrCode) {
        const encryptedMaster = response.data.qrCode;

        const verifyUrl = `${window.location.origin}${
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

  const handlePreviewPDF = async (master, bonosDeFactura) => {
    try {
      const previewResponse = await previewBonosHTML(
        bonosDeFactura,
        null,
        master
      );

      if (!previewResponse.success) {
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
        title="Gestión de Bonos - Sistema de Reencauche"
        description="Sistema de activación de bonos de reencauche. Activa bonos por Aro/Rin y genera códigos QR para verificación, sin necesidad de asociar un cliente final."
        keywords="gestión bonos, bonos reencauche, códigos QR, llantas, neumáticos"
      />
      <PageContainer
        backButtonOnClick={() => navigate("/")}
        backButtonText="Volver al inicio"
      >
        <PageHeader>
          <PageTitle>
            <RenderIcon name="FaTicket" size={32} />
            Bonos de Reencauche
          </PageTitle>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Buscar por Master o Factura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              text="Nuevo Bono"
              variant="solid"
              backgroundColor={
                hayBonosDisponibles ? theme.colors.success : theme.colors.textLight
              }
              leftIconName="FaTicket"
              onClick={handleNewBono}
              disabled={!hayBonosDisponibles}
              title={!hayBonosDisponibles ? "No hay bonos disponibles" : undefined}
            />
            <Button
              text="Ver bonos por clientes"
              variant="outlined"
              leftIconName="FaUsers"
              onClick={() => navigate(ROUTES.ECOMMERCE.REENCAUCHE_CLIENTES)}
            />
          </SearchContainer>
        </PageHeader>

        {/* Sección de bonos disponibles */}
        <BonosDisponiblesContainer>
          <BonosDisponiblesInfo>
            <RenderIcon name="FaTicket" size={16} />
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
                No puede activar nuevos bonos hasta que haga una compra de la
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

        <BonosSection>
          <SectionTitle>
            <RenderIcon name="FaHistory" size={20} />
            Historial de Bonos Activados ({bonosMayorista.length} bonos)
          </SectionTitle>

          {loadingBonos ? (
            <EmptyState>
              <EmptyIcon>
                <RenderIcon
                  name="FaSpinner"
                  size={64}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              </EmptyIcon>
              <h3>Cargando bonos...</h3>
            </EmptyState>
          ) : filteredGroupEntries.length === 0 ? (
            <EmptyBonos>
              <EmptyBonosIcon>
                <RenderIcon name="FaTicket" size={48} />
              </EmptyBonosIcon>
              <h4>No hay bonos registrados</h4>
              <p>
                {searchTerm
                  ? "Intenta con otros términos de búsqueda."
                  : "Aún no ha activado ningún bono. Usa el botón 'Nuevo Bono' para comenzar."}
              </p>
            </EmptyBonos>
          ) : (
            <BonosList>
              {filteredGroupEntries.map(([master, bonosDelGrupo]) => (
                <FacturaGroup key={master}>
                  <FacturaHeader>
                    <FacturaInfo>
                      <FacturaNumber>
                        <RenderIcon name="FaFileInvoice" size={16} />
                        {master}
                      </FacturaNumber>
                      <BonosCount>{bonosDelGrupo.length} bonos</BonosCount>
                    </FacturaInfo>
                    <ButtonsContainer>
                      <Button
                        text="Ver"
                        leftIconName="FaEye"
                        size="small"
                        backgroundColor="#10b981"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleRedirectToVerificarBono(master);
                        }}
                      />
                      <Button
                        text="Visualizar PDF"
                        leftIconName="FaEye"
                        size="small"
                        variant="solid"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handlePreviewPDF(master, bonosDelGrupo);
                        }}
                      />
                      <Button
                        text="Descargar PDF"
                        leftIconName="FaFilePdf"
                        size="small"
                        backgroundColor="#ef4444"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleGeneratePDF(master, bonosDelGrupo);
                        }}
                      />
                    </ButtonsContainer>
                  </FacturaHeader>

                  <BonosGrid>
                    {bonosDelGrupo
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
                                <BonoDetailLabel>Marca:</BonoDetailLabel>
                                <BonoDetailValue>
                                  {producto.brand}
                                </BonoDetailValue>
                              </BonoDetailItem>
                              <BonoDetailItem>
                                <BonoDetailLabel>Aro/Rin:</BonoDetailLabel>
                                <BonoDetailValue>
                                  {producto.size}
                                </BonoDetailValue>
                              </BonoDetailItem>
                              <BonoDetailItem>
                                <BonoDetailLabel>
                                  Factura:
                                </BonoDetailLabel>
                                <BonoDetailValue>
                                  {bono.INVOICENUMBER || "N/A"}
                                </BonoDetailValue>
                              </BonoDetailItem>
                              {bono.ITEM && (
                                <BonoDetailItem>
                                  <BonoDetailLabel>Item:</BonoDetailLabel>
                                  <BonoDetailValue>
                                    {bono.ITEM}
                                  </BonoDetailValue>
                                </BonoDetailItem>
                              )}
                              <BonoDetailItem>
                                <BonoDetailLabel>Fecha:</BonoDetailLabel>
                                <BonoDetailValue>
                                  {formatDate(bono.createdAt)}
                                </BonoDetailValue>
                              </BonoDetailItem>
                            </BonoDetails>
                          </BonoCard>
                        );
                      })}
                  </BonosGrid>
                </FacturaGroup>
              ))}
            </BonosList>
          )}
        </BonosSection>

        {/* Formulario de nuevo bono */}
        {showBonoModal && (
          <FormularioNuevoBonoLista
            onClose={handleCloseBonoModal}
            onBonoCreated={handleBonoCreated}
            bonosDisponiblesData={bonosDisponiblesData}
            mayoristaUserId={user.ID_USER}
          />
        )}

        {/* Generador de PDF */}
        {showPDFGenerator && selectedBono && (
          <PDFGenerator bono={selectedBono} onClose={handleClosePDFGenerator} />
        )}
      </PageContainer>
    </>
  );
};

export default ClientesReencauche;
