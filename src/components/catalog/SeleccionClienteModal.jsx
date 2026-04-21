import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { api_vendedores_getClientes } from "../../api/vendedores/apiVendedores";
import RenderIcon from "../ui/RenderIcon";
import RenderLoader from "../ui/RenderLoader";

/* ─────────────────────────── Animations ─────────────────────────── */
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(32px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
`;

/* ─────────────────────────── Styled Components ─────────────────────────── */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  width: 100%;
  max-width: ${({ $isB2B }) => ($isB2B ? "900px" : "600px")};
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
  animation: ${slideUp} 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}25`};
`;

const ModalHeader = styled.div`
  padding: 1.5rem 1.75rem 1rem;
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.border}30`};
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.3;
`;

const ModalSubtitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CloseButton = styled.button`
  background: ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}30` : `${theme.colors.border}20`};
  border: none;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}20`};
    color: ${({ theme }) => theme.colors.primary};
    transform: rotate(90deg);
  }
`;

const SearchWrapper = styled.div`
  padding: 1rem 1.75rem 0.75rem;
  flex-shrink: 0;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.background}` : "#f8f9fb"};
  border: 1px solid ${({ theme }) => `${theme.colors.border}40`};
  border-radius: 12px;
  padding: 0.65rem 1rem;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}18`};
  }

  svg {
    color: ${({ theme }) => theme.colors.textLight};
    flex-shrink: 0;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const ClientList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.25rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  /* Scrollbar personalizado */
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.border} transparent;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1.75rem 0.5rem;
  background: ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.surface}cc` : "#fafbfc"};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 0.825rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.primary};
`;

const SectionBadge = styled.span`
  background: ${({ theme }) => `${theme.colors.primary}12`};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 6px;
  padding: 2px 7px;
  font-size: 0.7rem;
  font-weight: 700;
`;

const SectionDivider = styled.div`
  flex: 1;
  height: 1px;
  background: ${({ theme }) => `${theme.colors.border}25`};
`;


const EnterpriseGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const EnterpriseLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textLight};
  padding: 0.5rem 0 0.25rem;
`;

const EnterpriseDivider = styled.div`
  flex: 1;
  height: 1px;
  background: ${({ theme }) => `${theme.colors.border}30`};
`;

const ColumnsContainer = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  border-top: 1px solid ${({ theme }) => `${theme.colors.border}25`};
`;

const Column = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  
  &:first-child {
    border-right: 1px solid ${({ theme }) => `${theme.colors.border}25`};
  }
`;

const ClientCard = styled.button`
  width: 100%;
  background: ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.background}80` : "#ffffff"};
  border: 1px solid ${({ theme }) => `${theme.colors.border}30`};
  border-radius: 12px;
  padding: 0.875rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => `${theme.colors.primary}08`};
    transform: translateX(4px);
    box-shadow: 0 4px 14px ${({ theme }) => `${theme.colors.primary}15`};
  }

  &:active {
    transform: translateX(2px);
  }
`;

const ClientAvatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: ${({ theme }) =>
    `linear-gradient(135deg, ${theme.colors.primary}22, ${theme.colors.primary}11)`};
  border: 1.5px solid ${({ theme }) => `${theme.colors.primary}30`};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  font-size: 1rem;
`;

const ClientInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ClientName = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ClientMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.2rem;
`;

const ClientCode = styled.span`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-family: monospace;
`;

const EnterprisePill = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  background: ${({ theme }) => `${theme.colors.primary}15`};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 20px;
  padding: 1px 7px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const SourceTag = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  background: ${({ $source, theme }) =>
    $source === "B2B"
      ? `${theme.colors.success || "#22c55e"}15`
      : $source === "SAP"
        ? `${theme.colors.info || "#3b82f6"}15`
        : `${theme.colors.warning || "#f59e0b"}15`};
  color: ${({ $source, theme }) =>
    $source === "B2B"
      ? theme.colors.success || "#22c55e"
      : $source === "SAP"
        ? theme.colors.info || "#3b82f6"
        : theme.colors.warning || "#f59e0b"};
  border-radius: 4px;
  padding: 1px 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const ArrowIcon = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  transition: color 0.2s, transform 0.2s;
  flex-shrink: 0;

  ${ClientCard}:hover & {
    color: ${({ theme }) => theme.colors.primary};
    transform: translateX(3px);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2.5rem 1rem;
  color: ${({ theme }) => theme.colors.textLight};
  text-align: center;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 0.95rem;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
`;

const ErrorState = styled.div`
  margin: 1rem 0;
  padding: 1rem 1.25rem;
  background: ${({ theme }) => `${theme.colors.error || "#ef4444"}12`};
  border: 1px solid ${({ theme }) => `${theme.colors.error || "#ef4444"}30`};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.error || "#ef4444"};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModalFooter = styled.div`
  padding: 0.875rem 1.75rem 1.25rem;
  border-top: 1px solid ${({ theme }) => `${theme.colors.border}30`};
  flex-shrink: 0;
`;

const SkipButton = styled.button`
  width: 100%;
  background: transparent;
  border: 1.5px dashed ${({ theme }) => `${theme.colors.border}60`};
  border-radius: 10px;
  padding: 0.7rem 1rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => `${theme.colors.primary}08`};
  }
`;

const CountBadge = styled.span`
  background: ${({ theme }) => `${theme.colors.primary}18`};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 20px;
  padding: 1px 8px;
  font-size: 0.78rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

/* ─────────── SPANCOP Selection Styled Components ─────────── */

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.75;
  }
`;

const SpancopCard = styled.button`
  width: 100%;
  background: ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.background}80` : "#ffffff"};
  border: 1px solid ${({ theme }) => `${theme.colors.border}30`};
  border-radius: 14px;
  padding: 1rem 1.25rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 0.625rem;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => `${theme.colors.primary}06`};
    box-shadow: 0 4px 16px ${({ theme }) => `${theme.colors.primary}12`};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SpancopHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const SpancopId = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  background: ${({ theme }) => `${theme.colors.primary}15`};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 6px;
  padding: 2px 8px;
  font-family: monospace;
`;

const SpancopGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.375rem 1.25rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const SpancopField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const SpancopLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textLight};
`;

const SpancopValue = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/* ─────────────────────────── SPANCOP Status Indicator ─────────────────────────── */
const SpancopStatusContainer = styled.div`
  display: flex;
  gap: 0.35rem;
  margin: 0.25rem 0 0.5rem;
`;

const SpancopLetterSquare = styled.div`
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
  border-radius: 6px;
  color: ${({ $active, $past }) => ($active || $past ? "#ffffff" : "inherit")};
  background: ${({ $active, $past, theme }) => {
    if ($active) return theme.colors.success || "#22c55e";
    if ($past) return theme.colors.warning || "#f59e0b";
    return theme.mode === "dark" ? `${theme.colors.border}40` : "#f0f2f5";
  }};
  border: 1px solid ${({ $active, $past, theme }) =>
    $active || $past ? "transparent" : theme.colors.border + "40"};
  transition: all 0.2s ease;
  user-select: none;
`;

/* ─────────────────────────── Component ─────────────────────────── */

/**
 * Modal para que el vendedor seleccione un cliente antes de ingresar al catálogo.
 *
 * @param {boolean}  isOpen           - Muestra / oculta el modal
 * @param {function} onClose          - Cierra el modal sin acción
 * @param {function} onSelectClient   - (client: { ACCOUNT_USER, NAME_USER, ENTERPRISE }) => void
 * @param {function} onSkip           - Entrar al catálogo sin seleccionar cliente
 */
const SeleccionClienteModal = ({ isOpen, onClose, onSelectClient, onSkip }) => {
  const [clientes, setClientes] = useState([]);
  const [vendedorRole, setVendedorRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Estado para el paso de selección de SPANCOP (B2B)
  const [pendingClient, setPendingClient] = useState(null);

  // Cargar clientes cuando el modal se abre
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const fetchClientes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api_vendedores_getClientes();
        if (!cancelled) {
          if (res.success && res.data?.SOCIOS) {
            setClientes(res.data.SOCIOS);
            setVendedorRole(res.data.ROLE_USER);
          } else {
            setError(res.message || "No se pudieron obtener los clientes");
            setClientes([]);
          }
        }
      } catch {
        if (!cancelled) setError("Error al conectar con el servidor");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchClientes();
    return () => { cancelled = true; };
  }, [isOpen]);

  // Limpiar búsqueda y paso SPANCOP al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setPendingClient(null);
    }
  }, [isOpen]);

  // Filtrar clientes por búsqueda
  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) =>
        c.NAME_USER?.toLowerCase().includes(q) ||
        c.ACCOUNT_USER?.toLowerCase().includes(q) ||
        c.ENTERPRISE?.toLowerCase().includes(q)
    );
  }, [clientes, search]);



  // Separar clientes por tipo
  const { b2bClients, sapClients } = useMemo(() => {
    const b2b = [];
    const sap = [];
    filteredClients.forEach(c => {
      if (c.SOURCE === "B2B" || c.SOURCE === "B2B - SAP") {
        b2b.push(c);
      } else {
        sap.push(c);
      }
    });
    return { b2bClients: b2b, sapClients: sap };
  }, [filteredClients]);

  if (!isOpen) return null;

  const getInitials = (name) => {
    if (!name) return "??";
    const nameStr = String(name).trim();
    if (!nameStr) return "??";
    const parts = nameStr.split(/\s+/);
    if (parts.length >= 2 && parts[0][0] && parts[1][0]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr.slice(0, 2).toUpperCase();
  };

  const isB2B = vendedorRole === 1008;

  const handleSelectClient = (client) => {
    // Si el vendedor es B2B y el cliente tiene SOURCE "B2B" o "B2B-SAP" y tiene SPANCOPs, mostrar paso de selección
    const isB2BClient = client.SOURCE === "B2B" || client.SOURCE === "B2B - SAP";
    if (isB2B && isB2BClient && client.SPANCOPS && client.SPANCOPS.length > 0) {
      setPendingClient(client);
      return;
    }

    // Para otros casos (SAP, AMBOS o no B2B), proceder directamente y limpiar el código de spancop
    sessionStorage.removeItem("CODIGO_DATOS_SPANCOP");
    onSelectClient(client);
  };

  const handleSelectSpancop = (spancop) => {
    if (!pendingClient) return;

    // Guardar SPANCOP seleccionado en sessionStorage
    sessionStorage.setItem("CODIGO_DATOS_SPANCOP", spancop.CODIGO_DATOS_SPANCOP);

    onSelectClient(pendingClient);
  };

  const handleBackToClients = () => {
    setPendingClient(null);
  };

  const handleSkip = () => {
    // Si se salta la selección, limpiamos el código
    sessionStorage.removeItem("CODIGO_DATOS_SPANCOP");
    onSkip();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Formatear valores de SPANCOP para mostrar
  const formatValue = (val) => {
    if (!val && val !== 0) return "—";
    return String(val).replace(/([a-z])([A-Z])/g, "$1 $2");
  };

  const getSpancopStatusIndex = (status) => {
    const s = (status || "").toLowerCase().trim();
    if (!s) return -1;

    // Check for 'p_final' or any variation with 'final' first
    if (s === 'p_final' || s.includes('final') || s === 'p-pago') return 6;

    // Direct mapping for common values
    const mapping = {
      's': 0, 'p_inicial': 1, 'a': 2, 'n': 3, 'c': 4, 'o': 5, 'p_final': 6
    };
    if (mapping[s] !== undefined) return mapping[s];


    const mapping1 = {
      's-sospechoso': 0, 'p-prospecto': 1,
      'a-análisis': 2, 'n-negociación': 3,
      'c-contrato': 4, 'o-orden': 5, 'p-pago': 6
    };
    // Check by first character (e.g., "O-Orden" -> "O")

    if (mapping1[s] !== undefined) return mapping1[s];

    return -1;
  };

  const SPANCOP_LETTERS = ["S", "P", "A", "N", "C", "O", "P"];

  /* ── Vista de selección de SPANCOP (paso 2 para B2B) ── */
  if (pendingClient) {
    const spancops = pendingClient.SPANCOPS || [];

    return (
      <Overlay onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Seleccionar SPANCOP">
        <Modal $isB2B={isB2B}>
          <ModalHeader>
            <HeaderLeft>
              <BackButton onClick={handleBackToClients}>
                <RenderIcon name="FaArrowLeft" size={13} />
                Volver
              </BackButton>
              <ModalTitle>
                Selecciona un SPANCOP
                <CountBadge>{spancops.length}</CountBadge>
              </ModalTitle>
              <ModalSubtitle>
                Cliente: <strong>{pendingClient.NAME_USER}</strong>
              </ModalSubtitle>
            </HeaderLeft>
            <CloseButton onClick={onClose} aria-label="Cerrar">
              <RenderIcon name="FaXmark" size={16} />
            </CloseButton>
          </ModalHeader>

          <ClientList>
            {spancops.map((spancop) => (
              <SpancopCard
                key={spancop.CODIGO_DATOS_SPANCOP}
                onClick={() => handleSelectSpancop(spancop)}
                aria-label={`Seleccionar SPANCOP ${spancop.CODIGO_DATOS_SPANCOP}`}
              >
                <SpancopHeader>
                  <SpancopId>SPANCOP #{spancop.CODIGO_DATOS_SPANCOP}</SpancopId>
                  <ArrowIcon>
                    <RenderIcon name="FaArrowRight" size={13} />
                  </ArrowIcon>
                </SpancopHeader>

                <SpancopStatusContainer>
                  {SPANCOP_LETTERS.map((letter, idx) => {
                    const currentIndex = getSpancopStatusIndex(spancop.ESTADO_FINAL);
                    return (
                      <SpancopLetterSquare
                        key={idx}
                        $active={idx === currentIndex}
                        $past={idx < currentIndex}
                        title={`Estado: ${letter}`}
                      >
                        {letter}
                      </SpancopLetterSquare>
                    );
                  })}
                </SpancopStatusContainer>

                <SpancopGrid>
                  <SpancopField>
                    <SpancopLabel>Distribuidor</SpancopLabel>
                    <SpancopValue>{formatValue(spancop.DISTRIBUIDOR)}</SpancopValue>
                  </SpancopField>
                  <SpancopField>
                    <SpancopLabel>Cédula de Venta</SpancopLabel>
                    <SpancopValue>{formatValue(spancop.CEDULA_VENTA)}</SpancopValue>
                  </SpancopField>
                  <SpancopField>
                    <SpancopLabel>Tipo de Negocio</SpancopLabel>
                    <SpancopValue>{formatValue(spancop.TIPO_NEGOCIO)}</SpancopValue>
                  </SpancopField>
                  <SpancopField>
                    <SpancopLabel>Grupo Producto</SpancopLabel>
                    <SpancopValue>{formatValue(spancop.GRUPO_PRODUCTO)}</SpancopValue>
                  </SpancopField>
                  <SpancopField>
                    <SpancopLabel>Sector</SpancopLabel>
                    <SpancopValue>{formatValue(spancop.SECTOR)}</SpancopValue>
                  </SpancopField>
                  <SpancopField>
                    <SpancopLabel>Segmento</SpancopLabel>
                    <SpancopValue>{formatValue(spancop.SEGMENTO)}</SpancopValue>
                  </SpancopField>
                </SpancopGrid>
              </SpancopCard>
            ))}
          </ClientList>
        </Modal>
      </Overlay>
    );
  }

  /* ── Vista principal: selección de cliente (paso 1) ── */
  return (
    <Overlay onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Seleccionar cliente">
      <Modal $isB2B={isB2B}>
        {/* Header */}
        <ModalHeader>
          <HeaderLeft>
            <ModalTitle>
              Selecciona un cliente
              {!loading && clientes.length > 0 && (
                <CountBadge>{clientes.length}</CountBadge>
              )}
            </ModalTitle>
            <ModalSubtitle>
              Elige a qué cliente deseas ver el catálogo
            </ModalSubtitle>
          </HeaderLeft>
          <CloseButton onClick={onClose} aria-label="Cerrar">
            <RenderIcon name="FaXmark" size={16} />
          </CloseButton>
        </ModalHeader>

        {/* Buscador */}
        {!loading && clientes.length > 0 && (
          <SearchWrapper>
            <SearchBox>
              <RenderIcon name="FaMagnifyingGlass" size={15} />
              <SearchInput
                type="text"
                placeholder="Buscar por nombre, código o empresa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              {search && (
                <CloseButton
                  style={{ width: 24, height: 24 }}
                  onClick={() => setSearch("")}
                  aria-label="Limpiar búsqueda"
                >
                  <RenderIcon name="FaXmark" size={12} />
                </CloseButton>
              )}
            </SearchBox>
          </SearchWrapper>
        )}

        {/* Loading and Error states */}
        {loading && (
          <ClientList>
            <LoadingState>
              <RenderLoader size="44px" showSpinner floatingSpinner />
              Cargando clientes...
            </LoadingState>
          </ClientList>
        )}

        {!loading && error && (
          <ClientList>
            <ErrorState>
              <RenderIcon name="FaCircleExclamation" size={16} />
              {error}
            </ErrorState>
          </ClientList>
        )}

        {/* Columns Container */}
        {!loading && !error && filteredClients.length > 0 && (
          <ColumnsContainer>
            {/* Left Column: SAP */}
            <Column>
              <SectionHeader>
                <SectionTitle>{isB2B ? "Clientes SAP" : "Clientes"}</SectionTitle>
                <SectionBadge>{sapClients.length}</SectionBadge>
                <SectionDivider />
              </SectionHeader>
              <ClientList>
                {sapClients.length === 0 ? (
                  <EmptyState>
                    <EmptyText>
                      {isB2B ? "No hay clientes SAP" : "No hay clientes"}
                    </EmptyText>
                  </EmptyState>
                ) : (
                  sapClients.map((client) => (
                    <ClientCard
                      key={`${client.ACCOUNT_USER}-${client.ENTERPRISE}`}
                      onClick={() => handleSelectClient(client)}
                    >
                      <ClientAvatar>{getInitials(client.NAME_USER)}</ClientAvatar>
                      <ClientInfo>
                        <ClientName>{client.NAME_USER}</ClientName>
                        <ClientMeta>
                          <ClientCode>{client.ACCOUNT_USER}</ClientCode>
                          {client.ENTERPRISE && (
                            <EnterprisePill>{client.ENTERPRISE}</EnterprisePill>
                          )}
                          {client.SOURCE && (isB2B || client.SOURCE !== "SAP") && (
                            <SourceTag $source={client.SOURCE}>{client.SOURCE}</SourceTag>
                          )}
                        </ClientMeta>
                      </ClientInfo>
                      <ArrowIcon>
                        <RenderIcon name="FaArrowRight" size={14} />
                      </ArrowIcon>
                    </ClientCard>
                  ))
                )}
              </ClientList>
            </Column>

            {/* Right Column: B2B - Only for B2B Sellers */}
            {isB2B && (
              <Column>
                <SectionHeader>
                  <SectionTitle>Clientes B2B</SectionTitle>
                  <SectionBadge>{b2bClients.length}</SectionBadge>
                  <SectionDivider />
                </SectionHeader>
                <ClientList>
                  {b2bClients.length === 0 ? (
                    <EmptyState>
                      <EmptyText>No hay clientes B2B</EmptyText>
                    </EmptyState>
                  ) : (
                    b2bClients.map((client) => (
                      <ClientCard
                        key={`${client.ACCOUNT_USER}-${client.ENTERPRISE}`}
                        onClick={() => handleSelectClient(client)}
                      >
                        <ClientAvatar>{getInitials(client.NAME_USER)}</ClientAvatar>
                        <ClientInfo>
                          <ClientName>{client.NAME_USER}</ClientName>
                          <ClientMeta>
                            <ClientCode>{client.ACCOUNT_USER}</ClientCode>
                            {client.ENTERPRISE && (
                              <EnterprisePill>{client.ENTERPRISE}</EnterprisePill>
                            )}
                            {client.SOURCE && (
                              <SourceTag $source={client.SOURCE}>{client.SOURCE}</SourceTag>
                            )}
                          </ClientMeta>
                        </ClientInfo>
                        <ArrowIcon>
                          <RenderIcon name="FaArrowRight" size={14} />
                        </ArrowIcon>
                      </ClientCard>
                    ))
                  )}
                </ClientList>
              </Column>
            )}
          </ColumnsContainer>
        )}

        {!loading && !error && filteredClients.length === 0 && (
          <ClientList>
            <EmptyState>
              <RenderIcon name="FaUserSlash" size={36} />
              <EmptyText>
                {search
                  ? `No se encontraron clientes para "${search}"`
                  : "No tienes clientes asignados"}
              </EmptyText>
            </EmptyState>
          </ClientList>
        )}
      </Modal>
    </Overlay>
  );
};

export default SeleccionClienteModal;
