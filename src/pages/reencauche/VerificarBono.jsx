import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppTheme } from "../../context/AppThemeContext";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import RenderIcon from "../../components/ui/RenderIcon";
import PageContainer from "../../components/layout/PageContainer";
import SEO from "../../components/seo/SEO";
import { toast } from "react-toastify";
import {
  api_bonos_verifyQRCode,
  api_bonos_verifyQRCodeMaster,
  api_bonos_generateQRMaster,
  api_bonos_updateMasterItem,
  api_bonos_useBonuses,
  api_bonos_rejectBonus,
} from "../../api/bonos/apiBonos";
import {
  getBonoStateLabel,
  getBonoStateBackgroundColor,
  getBonoStateColor,
} from "../../constants/bonoStates";

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
  margin-bottom: 16px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.5rem;
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 1.3rem;
    gap: 6px;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.95rem;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.9rem;
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
  gap: 8px;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 6px;
    margin-bottom: 6px;
  }
`;

const InfoItem = styled.div`
  text-align: left;
`;

const InfoLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 2px;
  font-weight: 500;
`;

const InfoValue = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    word-break: break-word;
  }
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  background-color: ${({ $estado }) => getBonoStateBackgroundColor($estado)};
  color: ${({ $estado }) => getBonoStateColor($estado)};

  @media (max-width: 768px) {
    padding: 3px 6px;
    font-size: 0.65rem;
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
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const InfoSection = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BonosList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const BonoCard = styled.div`
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary + "10" : theme.colors.surface};
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.primary : theme.colors.border};
  border-radius: 6px;
  padding: 12px;
  transition: all 0.2s ease;
  cursor: ${({ $selectable }) => ($selectable ? "pointer" : "default")};
  min-height: 120px;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: ${({ theme, $selectable }) =>
      $selectable ? theme.colors.primary : "transparent"};
    box-shadow: ${({ $selectable }) =>
      $selectable ? "0 1px 4px rgba(0, 0, 0, 0.1)" : "none"};
  }
`;

const BonoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const BonoTitle = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.8rem;
`;

const BonoDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 6px;
  flex: 1;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 6px;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 768px) {
    flex-direction: row;
    gap: 12px;
  }
`;

const InfoGridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const CompactButton = styled(Button)`
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 0.85rem;
    min-height: 40px;
  }
`;

const SmallButton = styled.button`
  background-color: transparent;
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover:not(:disabled) {
    background-color: #dc3545;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 3px 6px;
    font-size: 0.6rem;
  }
`;

const VerificarBono = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const mstr = searchParams.get("mstr");
  const navigate = useNavigate();
  const { theme } = useAppTheme();
  const { user, isAuthenticated } = useAuth();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBonos, setSelectedBonos] = useState({});
  const [bonoInputs, setBonoInputs] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [rejectingBonos, setRejectingBonos] = useState({});
  const [showRejectForm, setShowRejectForm] = useState({});

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

        // Validar que el rol tenga acceso al tipo de URL correcto
        if (user?.ROLE_NAME === ROLES.CLIENTE && !code && mstr) {
          throw new Error(
            "No se encontró información relacionada. Los clientes solo pueden acceder con código de factura."
          );
        }

        if (user?.ROLE_NAME === ROLES.REENCAUCHE_USER && code && !mstr) {
          throw new Error(
            "No se encontró información relacionada. Los usuarios de reencauche solo pueden acceder con código de master."
          );
        }

        let response;

        if (code) {
          // Para CLIENTE - usar código de factura
          const decodedCode = decodeURIComponent(code);
          response = await api_bonos_verifyQRCode(decodedCode);
        } else if (mstr) {
          // Para REENCAUCHE_USER - usar código de master
          const decodedMstr = decodeURIComponent(mstr);
          response = await api_bonos_verifyQRCodeMaster(decodedMstr);
        } else {
          throw new Error("Código QR no válido");
        }

        if (response.success) {
          setVerificationData(response.data);
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

    if (
      isAuthenticated &&
      user?.ROLE_NAME &&
      [ROLES.CLIENTE, ROLES.REENCAUCHE_USER].includes(user.ROLE_NAME)
    ) {
      loadBonoData();
    }
  }, [code, mstr, isAuthenticated, user]);

  // Funciones para CLIENTE y REENCAUCHE_USER
  const handleToggleBono = (idBono) => {
    // Si el formulario de rechazo está activo, no permitir seleccionar
    if (showRejectForm[idBono]) {
      toast.error(
        "Este bono tiene el formulario de rechazo activo. Ciérrelo primero."
      );
      return;
    }

    setSelectedBonos((prev) => ({
      ...prev,
      [idBono]: !prev[idBono],
    }));
  };

  const handleInputChange = (idBono, field, value) => {
    setBonoInputs((prev) => ({
      ...prev,
      [idBono]: {
        ...prev[idBono],
        [field]: value,
      },
    }));
  };

  const handleActivarBonos = async () => {
    try {
      // Solo considerar bonos PENDIENTE seleccionados
      const selectedBonosList = Object.keys(selectedBonos).filter(
        (id) => selectedBonos[id]
      );

      if (selectedBonosList.length === 0) {
        toast.error("Debe seleccionar al menos un bono PENDIENTE");
        return;
      }

      const updates = [];
      let hasErrors = false;

      for (const idBono of selectedBonosList) {
        // Verificar que el bono sea PENDIENTE
        const bono = verificationData.bonuses.find(
          (b) => b.ID_BONUS === parseInt(idBono)
        );
        if (bono && bono.STATUS !== "PENDIENTE") {
          toast.error("Solo se pueden activar bonos con estado PENDIENTE");
          hasErrors = true;
          break;
        }

        const inputs = bonoInputs[idBono] || {};
        if (!inputs.MASTER || !inputs.ITEM) {
          toast.error(
            `Complete MASTER e ITEM para todos los bonos seleccionados`
          );
          hasErrors = true;
          break;
        }
        updates.push({
          ID_BONUS: parseInt(idBono),
          MASTER: inputs.MASTER.trim(),
          ITEM: inputs.ITEM.trim(),
        });
      }

      if (hasErrors) return;

      // Obtener masters únicos (sin duplicados)
      const uniqueMasters = [
        ...new Set(updates.map((update) => update.MASTER)),
      ];
      console.log(uniqueMasters);

      // Generar QR para cada master único
      const qrPromises = uniqueMasters.map(async (master) => {
        const qrResponse = await api_bonos_generateQRMaster(master);
        console.log("master", master);
        console.log(qrResponse);
        if (qrResponse.success) {
          return {
            master: master,
            qrCode: qrResponse.data.qrCode,
          };
        } else {
          throw new Error(
            `Error generando QR para master ${master}: ${qrResponse.message}`
          );
        }
      });

      try {
        const qrResults = await Promise.all(qrPromises);

        // Construir los links de verificación usando los QR generados
        const preUrl =
          import.meta.env.VITE_NODE_ENV === "production"
            ? import.meta.env.VITE_PRODUCTION_URL
            : import.meta.env.VITE_DEVELOPMENT_URL;

        const links = qrResults.map(
          (result) =>
            `${preUrl}${ROUTES.REENCAUCHE.VERIFICAR}?mstr=${encodeURIComponent(
              result.qrCode
            )}`
        );
        console.log("Links generados:", links);

        setSubmitting(true);
        const response = await api_bonos_updateMasterItem(updates, links);

        if (response.success) {
          toast.success("Bonos activados exitosamente");

          // Limpiar estados
          setSelectedBonos({});
          setBonoInputs({});

          // Recargar datos del bono
          let refreshResponse;
          if (code) {
            const decodedCode = decodeURIComponent(code);
            refreshResponse = await api_bonos_verifyQRCode(decodedCode);
          } else if (mstr) {
            const decodedMstr = decodeURIComponent(mstr);
            refreshResponse = await api_bonos_verifyQRCodeMaster(decodedMstr);
          }

          if (refreshResponse?.success) {
            setVerificationData(refreshResponse.data);
          }
        } else {
          toast.error(response.message || "Error al activar bonos");
        }
      } catch (qrError) {
        console.error("Error generando QR codes:", qrError);
        toast.error("Error al generar códigos QR: " + qrError.message);
      }
    } catch (error) {
      console.error("Error activando bonos:", error);
      toast.error("Error al activar bonos");
    } finally {
      setSubmitting(false);
    }
  };

  // Función para usar bonos (REENCAUCHE_USER)
  const handleUsarBonos = async () => {
    try {
      // Solo considerar bonos ACTIVO seleccionados
      const selectedBonosList = Object.keys(selectedBonos).filter(
        (id) => selectedBonos[id]
      );

      if (selectedBonosList.length === 0) {
        toast.error("Debe seleccionar al menos un bono ACTIVO");
        return;
      }

      const updates = [];
      let hasErrors = false;

      for (const idBono of selectedBonosList) {
        // Verificar que el bono sea ACTIVO
        const bono = verificationData.bonuses.find(
          (b) => b.ID_BONUS === parseInt(idBono)
        );
        if (bono && bono.STATUS !== "ACTIVO") {
          toast.error("Solo se pueden usar bonos con estado ACTIVO");
          hasErrors = true;
          break;
        }

        const inputs = bonoInputs[idBono] || {};
        if (!inputs.RETREADINVOICE) {
          toast.error(
            `Complete la factura de reencauche para todos los bonos seleccionados`
          );
          hasErrors = true;
          break;
        }
        updates.push({
          ID_BONUS: parseInt(idBono),
          RETREADINVOICE: inputs.RETREADINVOICE.trim(),
          ID_USER: user.ID_USER,
        });
      }

      if (hasErrors) return;

      setSubmitting(true);
      const response = await api_bonos_useBonuses(updates);

      if (response.success) {
        toast.success("Bonos utilizados exitosamente");

        // Limpiar estados
        setSelectedBonos({});
        setBonoInputs({});

        // Recargar datos del bono
        let refreshResponse;
        if (code) {
          const decodedCode = decodeURIComponent(code);
          refreshResponse = await api_bonos_verifyQRCode(decodedCode);
        } else if (mstr) {
          const decodedMstr = decodeURIComponent(mstr);
          refreshResponse = await api_bonos_verifyQRCodeMaster(decodedMstr);
        }

        if (refreshResponse?.success) {
          setVerificationData(refreshResponse.data);
        }
      } else {
        toast.error(response.message || "Error al usar bonos");
      }
    } catch (error) {
      console.error("Error usando bonos:", error);
      toast.error("Error al usar bonos");
    } finally {
      setSubmitting(false);
    }
  };

  // Función para mostrar el formulario de rechazo
  const handleToggleRejectForm = (idBono) => {
    // Si el bono está seleccionado para usar, no permitir abrir formulario de rechazo
    if (selectedBonos[idBono]) {
      toast.error(
        "Este bono está seleccionado para usar. Deselecciónelo primero."
      );
      return;
    }

    setShowRejectForm((prev) => ({
      ...prev,
      [idBono]: !prev[idBono],
    }));
  };

  // Función para rechazar un bono individual (REENCAUCHE_USER)
  const handleRechazarBono = async (idBono) => {
    try {
      // Verificar que el bono sea ACTIVO
      const bono = verificationData.bonuses.find(
        (b) => b.ID_BONUS === parseInt(idBono)
      );

      if (!bono || bono.STATUS !== "ACTIVO") {
        toast.error("Solo se pueden rechazar bonos con estado ACTIVO");
        return;
      }

      const inputs = bonoInputs[idBono] || {};
      const rejectionReason = inputs.REJECTION_REASON;

      if (!rejectionReason || rejectionReason.trim() === "") {
        toast.error("Debe ingresar un motivo de rechazo");
        return;
      }

      setRejectingBonos((prev) => ({ ...prev, [idBono]: true }));

      const response = await api_bonos_rejectBonus(
        parseInt(idBono),
        rejectionReason.trim(),
        user.ID_USER
      );

      if (response.success) {
        const { rejectedBonus, replacementBonus } = response.data;

        // Mensaje personalizado con información del reemplazo
        toast.success(
          response.message ||
            `Bono #${rejectedBonus.ID_BONUS} rechazado. Se creó el bono #${replacementBonus.ID_BONUS} como reemplazo`
        );

        // Actualizar la lista de bonos localmente
        setVerificationData((prevData) => {
          const updatedBonuses = prevData.bonuses.map((b) => {
            // Actualizar el bono rechazado
            if (b.ID_BONUS === rejectedBonus.ID_BONUS) {
              return {
                ...b,
                STATUS: rejectedBonus.STATUS,
                REJECT_REASON: rejectedBonus.REJECT_REASON,
                ID_USER_REJECT: rejectedBonus.ID_USER_REJECT,
                ID_BONUS_REPLACE: rejectedBonus.ID_BONUS_REPLACE,
                updatedAt: rejectedBonus.updatedAt,
              };
            }
            return b;
          });

          // Agregar el nuevo bono de reemplazo si no existe
          const replacementExists = updatedBonuses.some(
            (b) => b.ID_BONUS === replacementBonus.ID_BONUS
          );

          if (!replacementExists) {
            // Parsear la especificación del producto para el nuevo bono
            const spec =
              replacementBonus.PRODUCT_SPECIFICATION?.split(";") || [];
            const newBonoWithParsedData = {
              ...replacementBonus,
              BRAND: spec[0] || "N/A",
              SIZE: spec[1] || "N/A",
              DESIGN: spec[2] || "N/A",
            };
            updatedBonuses.push(newBonoWithParsedData);
          }

          return {
            ...prevData,
            bonuses: updatedBonuses,
            totalBonuses: updatedBonuses.length,
          };
        });

        // Limpiar estados de este bono
        setBonoInputs((prev) => {
          const newInputs = { ...prev };
          delete newInputs[idBono];
          return newInputs;
        });
        setShowRejectForm((prev) => {
          const newForm = { ...prev };
          delete newForm[idBono];
          return newForm;
        });
      } else {
        toast.error(response.message || "Error al rechazar el bono");
      }
    } catch (error) {
      console.error("Error rechazando bono:", error);
      toast.error("Error al rechazar el bono");
    } finally {
      setRejectingBonos((prev) => ({ ...prev, [idBono]: false }));
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

  // Vista para CLIENTE
  if (user?.ROLE_NAME === ROLES.CLIENTE && verificationData) {
    const selectedCount = Object.values(selectedBonos).filter(Boolean).length;
    const isMaster = !!mstr; // Determinar si es Master o Factura

    return (
      <>
        <SEO
          title={`Verificar Bono ${
            isMaster ? "Master" : "Factura"
          } - Sistema de Bonos`}
          description={`Sistema de verificación y activación de bonos de reencauche. ${
            isMaster ? "Master" : "Factura"
          }: ${verificationData.invoiceNumber} con ${
            verificationData.totalBonuses
          } bonos disponibles.`}
          keywords="bonos, reencauche, verificación, activación, llantas, neumáticos"
        />
        <PageContainer fullWidth>
          <div
            style={{
              padding: "16px 24px",
              maxWidth: "1400px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            <Header>
              <Title>
                <RenderIcon
                  name={isMaster ? "FaQrcode" : "FaFileInvoice"}
                  size={20}
                />
                {isMaster ? "Master: " : "Factura: "}
                {verificationData.invoiceNumber}
              </Title>
              <Subtitle>
                {verificationData.totalBonuses} bonos disponibles
              </Subtitle>
            </Header>

            {/* Mostrar info del socio comercial siempre, cliente solo si NO es master */}
            {(verificationData.businessPartner ||
              (!isMaster && verificationData.customer)) && (
              <InfoSection>
                <InfoGridContainer>
                  {!isMaster && verificationData.customer && (
                    <div>
                      <SectionTitle>
                        <RenderIcon name="FaUser" size={14} />
                        Información del Cliente
                      </SectionTitle>
                      <InfoGrid>
                        <InfoItem>
                          <InfoLabel>Nombre</InfoLabel>
                          <InfoValue>
                            {verificationData.customer.CUSTOMER_NAME}{" "}
                            {verificationData.customer.CUSTOMER_LASTNAME}
                          </InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>CI/RUC</InfoLabel>
                          <InfoValue>
                            {verificationData.customer.CUSTOMER_IDENTIFICATION}
                          </InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Email</InfoLabel>
                          <InfoValue>
                            {verificationData.customer.CUSTOMER_EMAIL ||
                              "No registrado"}
                          </InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Teléfono</InfoLabel>
                          <InfoValue>
                            {verificationData.customer.CUSTOMER_PHONE ||
                              "No registrado"}
                          </InfoValue>
                        </InfoItem>
                      </InfoGrid>
                    </div>
                  )}

                  {verificationData.businessPartner && (
                    <div>
                      <SectionTitle>
                        <RenderIcon name="FaBuilding" size={14} />
                        Socio Comercial
                      </SectionTitle>
                      <InfoGrid>
                        <InfoItem>
                          <InfoLabel>Contacto</InfoLabel>
                          <InfoValue>
                            {verificationData.businessPartner.NAME_USER}
                          </InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>RUC</InfoLabel>
                          <InfoValue>
                            {verificationData.businessPartner.ACCOUNT_USER}
                          </InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Email</InfoLabel>
                          <InfoValue>
                            {verificationData.businessPartner.EMAIL}
                          </InfoValue>
                        </InfoItem>
                      </InfoGrid>
                    </div>
                  )}
                </InfoGridContainer>
              </InfoSection>
            )}

            <InfoSection>
              <SectionTitle>
                <RenderIcon name="FaTicketAlt" size={14} />
                Lista de Bonos ({selectedCount} seleccionados)
              </SectionTitle>
              <BonosList>
                {verificationData.bonuses &&
                verificationData.bonuses.length > 0 ? (
                  verificationData.bonuses.map((bono) => (
                    <BonoCard
                      key={bono.ID_BONUS}
                      $selected={selectedBonos[bono.ID_BONUS]}
                      $selectable={bono.STATUS === "PENDIENTE"}
                      onClick={() =>
                        bono.STATUS === "PENDIENTE" &&
                        handleToggleBono(bono.ID_BONUS)
                      }
                    >
                      <BonoHeader>
                        <BonoTitle>Bono #{bono.ID_BONUS}</BonoTitle>
                        <StatusBadge $estado={bono.STATUS}>
                          {getBonoStateLabel(bono.STATUS)}
                        </StatusBadge>
                      </BonoHeader>
                      <BonoDetails>
                        <InfoItem>
                          <InfoLabel>Marca</InfoLabel>
                          <InfoValue>{bono?.BRAND || "N/A"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Aro/Rin</InfoLabel>
                          <InfoValue>{bono?.SIZE || "N/A"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Diseño</InfoLabel>
                          <InfoValue>{bono?.DESIGN || "N/A"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Fecha</InfoLabel>
                          <InfoValue>{formatDate(bono.createdAt)}</InfoValue>
                        </InfoItem>
                      </BonoDetails>
                      {console.log("bono", bono)}

                      {/* Mostrar MASTER e ITEM para bonos ACTIVO y USADO */}
                      {(bono.STATUS === "ACTIVO" || bono.STATUS === "USADO") &&
                        (bono.MASTER ||
                          bono.ITEM ||
                          bono.REJECT_INFORMATION ||
                          bono.REJECTED_INFORMATION) && (
                          <div
                            style={{
                              marginTop: "4px",
                              paddingTop: "4px",
                              borderTop: `1px solid ${theme.colors.border}`,
                            }}
                          >
                            <BonoDetails>
                              <InfoItem>
                                <InfoLabel>Master</InfoLabel>
                                <InfoValue>{bono.MASTER || "N/A"}</InfoValue>
                              </InfoItem>
                              <InfoItem>
                                <InfoLabel>Item</InfoLabel>
                                <InfoValue>{bono.ITEM || "N/A"}</InfoValue>
                              </InfoItem>
                            </BonoDetails>
                            {(bono.REJECT_INFORMATION ||
                              bono.REJECTED_INFORMATION) && (
                              <BonoDetails style={{ marginTop: "4px" }}>
                                <InfoItem style={{ gridColumn: "1 / -1" }}>
                                  <InfoLabel>Información de Rechazo</InfoLabel>
                                  <InfoValue
                                    style={{
                                      color: "#dc3545",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {bono.REJECT_INFORMATION ||
                                      bono.REJECTED_INFORMATION}
                                  </InfoValue>
                                </InfoItem>
                              </BonoDetails>
                            )}
                          </div>
                        )}

                      {/* Campos de entrada solo para bonos PENDIENTE */}
                      {selectedBonos[bono.ID_BONUS] &&
                        bono.STATUS === "PENDIENTE" && (
                          <InputRow onClick={(e) => e.stopPropagation()}>
                            <Input
                              label="Master *"
                              type="text"
                              value={bonoInputs[bono.ID_BONUS]?.MASTER || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  bono.ID_BONUS,
                                  "MASTER",
                                  e.target.value
                                )
                              }
                              placeholder="Ingrese Master"
                              fullWidth
                            />
                            <Input
                              label="Item *"
                              type="text"
                              value={bonoInputs[bono.ID_BONUS]?.ITEM || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  bono.ID_BONUS,
                                  "ITEM",
                                  e.target.value
                                )
                              }
                              placeholder="Ingrese Item"
                              fullWidth
                            />
                          </InputRow>
                        )}
                    </BonoCard>
                  ))
                ) : (
                  <EmptyState>
                    <RenderIcon name="FaBoxOpen" size={48} />
                    <p>No hay bonos disponibles</p>
                  </EmptyState>
                )}
              </BonosList>
            </InfoSection>

            <Footer>
              <CompactButton
                text="Volver al Inicio"
                variant="outlined"
                onClick={() => navigate("/")}
                leftIconName="FaHome"
              />
              <CompactButton
                text={
                  submitting
                    ? "Activando..."
                    : `Activar Bonos (${selectedCount})`
                }
                variant="solid"
                backgroundColor={theme.colors.primary}
                onClick={handleActivarBonos}
                disabled={submitting || selectedCount === 0}
                leftIconName="FaCheck"
              />
            </Footer>
          </div>
        </PageContainer>
      </>
    );
  }

  // Vista para REENCAUCHE_USER
  if (user?.ROLE_NAME === ROLES.REENCAUCHE_USER && verificationData) {
    const filteredBonos =
      verificationData.bonuses?.filter(
        (bono) =>
          bono.STATUS === "ACTIVO" ||
          bono.STATUS === "USADO" ||
          bono.STATUS === "RECHAZADO"
      ) || [];
    const selectedCount = Object.values(selectedBonos).filter(Boolean).length;
    const isMaster = !!mstr; // Determinar si es Master o Factura

    return (
      <>
        <SEO
          title={`Verificar Bono ${
            isMaster ? "Master" : "Factura"
          } - Sistema de Bonos`}
          description={`Sistema de verificación y gestión de bonos de reencauche. ${
            isMaster ? "Master" : "Factura"
          }: ${verificationData.invoiceNumber} con ${
            filteredBonos.length
          } bonos activos, usados y rechazados.`}
          keywords="bonos, reencauche, verificación, activación, llantas, neumáticos, gestión"
        />
        <PageContainer fullWidth>
          <div
            style={{
              padding: "16px 24px",
              maxWidth: "1400px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            <Header>
              <Title>
                <RenderIcon
                  name={isMaster ? "FaQrcode" : "FaFileInvoice"}
                  size={20}
                />
                {isMaster
                  ? `Master: ${verificationData.master}`
                  : `Factura: ${verificationData.invoiceNumber}`}
              </Title>
              <Subtitle>{filteredBonos.length} bonos</Subtitle>
            </Header>

            {/* Mostrar info del socio comercial siempre, cliente solo si NO es master */}
            {(verificationData.businessPartner ||
              (!isMaster && verificationData.customer)) && (
              <InfoSection>
                <InfoGridContainer>
                  {!isMaster && verificationData.customer && (
                    <div>
                      <SectionTitle>
                        <RenderIcon name="FaUser" size={14} />
                        Información del Cliente
                      </SectionTitle>
                      <InfoGrid>
                        <InfoItem>
                          <InfoLabel>Nombre</InfoLabel>
                          <InfoValue>
                            {verificationData.customer.CUSTOMER_NAME}{" "}
                            {verificationData.customer.CUSTOMER_LASTNAME}
                          </InfoValue>
                        </InfoItem>
                      </InfoGrid>
                    </div>
                  )}

                  {verificationData.businessPartner && (
                    <div>
                      <SectionTitle>
                        <RenderIcon name="FaBuilding" size={14} />
                        Socio Comercial
                      </SectionTitle>
                      <InfoGrid>
                        <InfoItem>
                          <InfoLabel>Contacto</InfoLabel>
                          <InfoValue>
                            {verificationData.businessPartner.NAME_USER}
                          </InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>RUC</InfoLabel>
                          <InfoValue>
                            {verificationData.businessPartner.ACCOUNT_USER}
                          </InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Email</InfoLabel>
                          <InfoValue>
                            {verificationData.businessPartner.EMAIL}
                          </InfoValue>
                        </InfoItem>
                      </InfoGrid>
                    </div>
                  )}
                </InfoGridContainer>
              </InfoSection>
            )}

            <InfoSection>
              <SectionTitle>
                <RenderIcon name="FaTicketAlt" size={14} />
                Lista de Bonos ({selectedCount} seleccionados)
              </SectionTitle>
              <BonosList>
                {console.log("verificationData", verificationData)}
                {verificationData.bonuses &&
                verificationData.bonuses.length > 0 ? (
                  verificationData.bonuses
                    .filter(
                      (bono) =>
                        bono.STATUS === "ACTIVO" ||
                        bono.STATUS === "USADO" ||
                        bono.STATUS === "RECHAZADO"
                    )
                    .map((bono) => (
                      <BonoCard
                        key={bono.ID_BONUS}
                        $selected={selectedBonos[bono.ID_BONUS]}
                        $selectable={
                          bono.STATUS === "ACTIVO" &&
                          !showRejectForm[bono.ID_BONUS]
                        }
                        onClick={() =>
                          bono.STATUS === "ACTIVO" &&
                          !showRejectForm[bono.ID_BONUS] &&
                          handleToggleBono(bono.ID_BONUS)
                        }
                      >
                        <BonoHeader>
                          <BonoTitle>Bono #{bono.ID_BONUS}</BonoTitle>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {bono.STATUS === "ACTIVO" && (
                              <SmallButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleRejectForm(bono.ID_BONUS);
                                }}
                                disabled={selectedBonos[bono.ID_BONUS]}
                              >
                                <RenderIcon name="FaTimes" size={10} />
                                Rechazar
                              </SmallButton>
                            )}
                            <StatusBadge $estado={bono.STATUS}>
                              {getBonoStateLabel(bono.STATUS)}
                            </StatusBadge>
                          </div>
                        </BonoHeader>
                        <BonoDetails>
                          <InfoItem>
                            <InfoLabel>Marca</InfoLabel>
                            <InfoValue>{bono?.BRAND || "N/A"}</InfoValue>
                          </InfoItem>
                          <InfoItem>
                            <InfoLabel>Aro/Rin</InfoLabel>
                            <InfoValue>{bono?.SIZE || "N/A"}</InfoValue>
                          </InfoItem>
                          <InfoItem>
                            <InfoLabel>Diseño</InfoLabel>
                            <InfoValue>{bono?.DESIGN || "N/A"}</InfoValue>
                          </InfoItem>
                          <InfoItem>
                            <InfoLabel>Fecha</InfoLabel>
                            <InfoValue>{formatDate(bono.createdAt)}</InfoValue>
                          </InfoItem>
                        </BonoDetails>

                        {/* Mostrar MASTER e ITEM para todos los estados */}
                        {(bono.MASTER ||
                          bono.ITEM ||
                          bono.RETREADINVOICE ||
                          bono.REJECT_REASON ||
                          bono.REJECT_INFORMATION ||
                          bono.REJECTED_INFORMATION) && (
                          <div
                            style={{
                              marginTop: "4px",
                              paddingTop: "4px",
                              borderTop: `1px solid ${theme.colors.border}`,
                            }}
                          >
                            <BonoDetails>
                              <InfoItem>
                                <InfoLabel>Master</InfoLabel>
                                <InfoValue>{bono.MASTER || "N/A"}</InfoValue>
                              </InfoItem>
                              <InfoItem>
                                <InfoLabel>Item</InfoLabel>
                                <InfoValue>{bono.ITEM || "N/A"}</InfoValue>
                              </InfoItem>
                            </BonoDetails>
                            {bono.RETREADINVOICE && (
                              <BonoDetails style={{ marginTop: "4px" }}>
                                <InfoItem style={{ gridColumn: "1 / -1" }}>
                                  <InfoLabel>Factura de Reencauche</InfoLabel>
                                  <InfoValue>{bono.RETREADINVOICE}</InfoValue>
                                </InfoItem>
                              </BonoDetails>
                            )}
                            {bono.REJECT_REASON && (
                              <BonoDetails style={{ marginTop: "4px" }}>
                                <InfoItem style={{ gridColumn: "1 / -1" }}>
                                  <InfoLabel>Motivo de Rechazo</InfoLabel>
                                  <InfoValue
                                    style={{
                                      color: "#dc3545",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {bono.REJECT_REASON}
                                  </InfoValue>
                                </InfoItem>
                              </BonoDetails>
                            )}
                            {(bono.REJECT_INFORMATION ||
                              bono.REJECTED_INFORMATION) && (
                              <BonoDetails style={{ marginTop: "4px" }}>
                                <InfoItem style={{ gridColumn: "1 / -1" }}>
                                  <InfoLabel>Información de Rechazo</InfoLabel>
                                  <InfoValue
                                    style={{
                                      color: "#dc3545",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {bono.REJECT_INFORMATION ||
                                      bono.REJECTED_INFORMATION}
                                  </InfoValue>
                                </InfoItem>
                              </BonoDetails>
                            )}
                          </div>
                        )}

                        {/* Campos de acción para bonos ACTIVO */}
                        {bono.STATUS === "ACTIVO" && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              marginTop: "8px",
                              paddingTop: "8px",
                              borderTop: `1px solid ${theme.colors.border}`,
                            }}
                          >
                            {/* Sección para usar bono - solo visible si está seleccionado */}
                            {selectedBonos[bono.ID_BONUS] && (
                              <div style={{ marginBottom: "8px" }}>
                                <Input
                                  label="Factura de Reencauche *"
                                  type="text"
                                  value={
                                    bonoInputs[bono.ID_BONUS]?.RETREADINVOICE ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      bono.ID_BONUS,
                                      "RETREADINVOICE",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ingrese número de factura"
                                  fullWidth
                                />
                              </div>
                            )}

                            {/* Sección para rechazar bono - solo visible si showRejectForm está activo */}
                            {showRejectForm[bono.ID_BONUS] && (
                              <div>
                                <Input
                                  label="Motivo de Rechazo *"
                                  type="text"
                                  value={
                                    bonoInputs[bono.ID_BONUS]
                                      ?.REJECTION_REASON || ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      bono.ID_BONUS,
                                      "REJECTION_REASON",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ingrese motivo de rechazo"
                                  fullWidth
                                />
                                <div style={{ marginTop: "8px" }}>
                                  <CompactButton
                                    text={
                                      rejectingBonos[bono.ID_BONUS]
                                        ? "Rechazando..."
                                        : "Confirmar Rechazo"
                                    }
                                    variant="outlined"
                                    onClick={() =>
                                      handleRechazarBono(bono.ID_BONUS)
                                    }
                                    disabled={rejectingBonos[bono.ID_BONUS]}
                                    leftIconName="FaCheck"
                                    style={{
                                      width: "100%",
                                      borderColor: "#dc3545",
                                      color: "#dc3545",
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </BonoCard>
                    ))
                ) : (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: "40px 20px",
                      color: theme.colors.textLight,
                    }}
                  >
                    <RenderIcon name="FaBoxOpen" size={48} />
                    <p>No hay bonos activos o usados disponibles</p>
                  </div>
                )}
              </BonosList>
            </InfoSection>

            <Footer>
              <CompactButton
                text="Volver al Inicio"
                variant="outlined"
                onClick={() => navigate("/")}
                leftIconName="FaHome"
              />
              <CompactButton
                text={
                  submitting ? "Usando..." : `Usar Bonos (${selectedCount})`
                }
                variant="solid"
                backgroundColor={theme.colors.primary}
                onClick={handleUsarBonos}
                disabled={submitting || selectedCount === 0}
                leftIconName="FaCheck"
              />
            </Footer>
          </div>
        </PageContainer>
      </>
    );
  }

  // Fallback (no debería llegar aquí)
  return null;
};

export default VerificarBono;
