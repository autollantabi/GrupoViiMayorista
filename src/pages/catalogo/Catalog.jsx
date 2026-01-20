import React, { useState, useCallback, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import FilterCards from "../../components/catalog/FilterCards";
import ProductGridView from "../../components/catalog/ProductGridView";
import AdditionalFilters from "../../components/catalog/AdditionalFilters";
import CatalogBreadcrumb from "../../components/catalog/CatalogBreadcrumb";
import useCatalogFlow from "../../hooks/useCatalogFlow";
import { useProductCatalog } from "../../context/ProductCatalogContext";
import RenderIcon from "../../components/ui/RenderIcon";
import RenderLoader from "../../components/ui/RenderLoader";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { api_email_solicitudEmpresa } from "../../api/email/apiEmail";

const CatalogContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  width: 100%;
  height: calc(100vh - 45px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MainContent = styled.div`
  background: ${({ theme }) => theme.colors.background};
  width: 100%;
  height: calc(100vh - 45px);
  overflow-y: auto;
  overflow-x: hidden;
`;

const MainContentProducts = styled.div`
  background: ${({ theme }) => theme.colors.background};
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
`;

const ContentWithFilters = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  align-items: stretch;

  @media (min-width: 1024px) {
    flex-direction: row;
    min-height: 0;
    align-items: stretch;
  }
`;

const WelcomeScreen = styled.div`
  padding: 4rem 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;

  @media (min-width: 768px) {
    padding: 5rem 3rem;
  }

  @media (min-width: 1024px) {
    padding: 6rem 4rem;
  }
`;

const WelcomeHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  animation: fadeInUp 0.8s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 3rem;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  margin: 0 0 1.5rem 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 50%, ${theme.colors.secondary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 50%, ${theme.colors.secondary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const WelcomeDescription = styled.p`
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 auto;
  line-height: 1.7;
  max-width: 700px;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const LinesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 3rem;
  justify-items: center;
  animation: fadeInUp 0.8s ease-out 0.2s backwards;

  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-top: 4rem;
    justify-content: center;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2.5rem;
    justify-content: center;
  }
`;

const LineCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  padding: 2.5rem 2rem;
  cursor: pointer;
  min-width: 350px;
  max-width: 380px;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 2px 8px rgba(0, 0, 0, 0.06)"};


  &:hover {
    transform: translateY(-6px);
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? "0 12px 32px rgba(0, 0, 0, 0.25)"
        : "0 12px 32px rgba(0, 0, 0, 0.12)"};
    border-color: ${({ theme }) => theme.colors.primary};

    &::before {
      transform: scaleX(1);
    }
  }

  &:active {
    transform: translateY(-3px);
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    min-width: 100%;
    max-width: 100%;
    border-radius: 16px;
  }
`;

const LineIcon = styled.div`
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  justify-content: center;
  transition: transform 0.3s ease;

  ${LineCard}:hover & {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    margin-bottom: 1.25rem;
  }
`;

const LineTitle = styled.h3`
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.75rem 0;
  text-align: center;
  line-height: 1.3;

  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
  }
`;

const LineDescription = styled.p`
  font-size: clamp(0.9rem, 1.5vw, 1rem);
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 1.25rem 0;
  line-height: 1.6;
  text-align: center;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const LineCount = styled.span`
  display: inline-block;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primary}dd)`
      : theme.colors.primary};
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  width: 100%;
  box-shadow: 0 4px 12px ${({ theme }) => `${theme.colors.primary}30`};
  transition: all 0.3s ease;

  ${LineCard}:hover & {
    transform: scale(1.05);
    box-shadow: 0 6px 16px ${({ theme }) => `${theme.colors.primary}40`};
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.45rem 1rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 45px);
  width: 100%;
  gap: 1.5rem;
  padding: 2rem;
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  margin: 0;
  text-align: center;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const UnauthorizedContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4rem 2rem;
  gap: 2rem;
  min-height: calc(100dvh - 45px);
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`
      : `linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)`};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `radial-gradient(ellipse at top center, ${theme.colors.primary}15 0%, transparent 50%),
           radial-gradient(ellipse at bottom center, ${theme.colors.warning}10 0%, transparent 50%)`
        : `radial-gradient(ellipse at top center, ${theme.colors.primary}10 0%, transparent 50%),
           radial-gradient(ellipse at bottom center, ${theme.colors.warning}08 0%, transparent 50%)`};
    pointer-events: none;
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
    gap: 1.5rem;
  }
`;

const UnauthorizedContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const UnauthorizedLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const UnauthorizedRight = styled.div`
  display: flex;
  flex-direction: column;
`;

const UnauthorizedIconWrapper = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.warning}30, ${theme.colors.warning}20)`
      : `linear-gradient(135deg, ${theme.colors.warning}20, ${theme.colors.warning}15)`};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px ${({ theme }) => `${theme.colors.warning}30`};
  border: 2px solid ${({ theme }) => `${theme.colors.warning}40`};
  animation: fadeInUp 0.6s ease-out;
  flex-shrink: 0;

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

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const TitleWithIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: fadeInUp 0.6s ease-out 0.1s backwards;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
`;

const UnauthorizedTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  margin: 0;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.warning} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.warning} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.6s ease-out 0.1s backwards;
  line-height: 1.2;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const UnauthorizedMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(1rem, 2vw, 1.15rem);
  margin: 0;
  line-height: 1.7;
  animation: fadeInUp 0.6s ease-out 0.2s backwards;

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }

  @media (max-width: 768px) {
    text-align: center;
    font-size: 1rem;
  }
`;

const UnauthorizedFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  animation: fadeInUp 0.6s ease-out 0.3s backwards;

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const UnauthorizedFeature = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;

  svg {
    color: ${({ theme }) => theme.colors.warning};
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const UnauthorizedButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;

  &:hover {
    background: ${({ theme }) =>
      theme.colors.primaryDark || theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const AccessRequestForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: ${({ theme }) => theme.colors.surface};
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 10px 40px rgba(0, 0, 0, 0.2)"
      : "0 10px 40px rgba(0, 0, 0, 0.08)"};
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  animation: fadeInUp 0.6s ease-out 0.3s backwards;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    gap: 1.25rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const FormInput = styled.input`
  padding: 0.875rem 1rem;
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  border-radius: 12px;
  font-size: 1rem;
  background: ${({ theme }) =>
    theme.mode === "dark" ? theme.colors.background : "#ffffff"};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }

  &:disabled {
    background: ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.background}80` : "#f3f4f6"};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const FormTextarea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.2s ease;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px ${({ theme }) => `${theme.colors.primary}30`};

  &:hover:not(:disabled) {
    background: ${({ theme }) =>
      theme.colors.primaryDark || theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px ${({ theme }) => `${theme.colors.primary}40`};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `${theme.colors.success}20`
      : `${theme.colors.success}15`};
  border: 2px solid ${({ theme }) => theme.colors.success};
  color: ${({ theme }) => theme.colors.success};
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  margin-top: 1rem;
  max-width: 550px;
  box-shadow: 0 4px 20px ${({ theme }) => `${theme.colors.success}20`};
  animation: fadeInUp 0.6s ease-out;

  p {
    margin: 0;
    line-height: 1.6;
  }

  strong {
    font-weight: 700;
  }
`;

const BackLink = styled.a`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  margin-bottom: 1rem;
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    align-self: center;
  }
`;

const Catalog = () => {
  const { empresaName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    loadProductsForEmpresa,
    catalogByEmpresa,
    loadingByEmpresa,
    reloadProductsForEmpresa,
  } = useProductCatalog();
  const [pendingRestore, setPendingRestore] = useState(null);
  const [initialSort, setInitialSort] = useState("default");
  const [restoreApplied, setRestoreApplied] = useState(false);

  // Guardar la URL actual del catálogo en localStorage para "Seguir comprando"
  useEffect(() => {
    const currentUrl = location.pathname + location.search;
    // Solo guardar si es una ruta del catálogo
    if (
      currentUrl.startsWith("/catalogo") ||
      currentUrl.startsWith("/busqueda")
    ) {
      localStorage.setItem("lastCatalogUrl", currentUrl);
    }
  }, [location.pathname, location.search]);

  // Estados para el formulario de solicitud de acceso
  const [accessRequestForm, setAccessRequestForm] = useState({
    telefono: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Ya no necesitamos las funciones de localStorage para selectedProduct
  // La navegación se hace directamente desde handleProductSelect

  // Cargar productos de la empresa cuando hay empresaName
  useEffect(() => {
    if (empresaName && !catalogByEmpresa[empresaName]) {
      loadProductsForEmpresa(empresaName);
    }
  }, [empresaName]);

  // Función para actualizar la URL - MERGE con parámetros existentes
  const updateURL = useCallback(
    (params, isCompleteUpdate = false) => {
      // Crear nuevos params basados en los existentes (para preservar page, sort, limit)
      const newParams = new URLSearchParams(searchParams);

      // Verificar qué parámetros se están agregando/actualizando
      const paramsToAdd = Object.keys(params).filter(
        (key) =>
          params[key] !== null &&
          params[key] !== undefined &&
          params[key] !== ""
      );

      if (isCompleteUpdate) {
        // Si es una actualización completa, primero eliminar todos los parámetros de filtros
        // pero preservar page, sort, limit, y stock
        const preservedParams = {
          page: newParams.get("page") || "1",
          sort: newParams.get("sort") || "default",
          limit: newParams.get("limit") || "144",
          stock: newParams.get("stock") || "all",
        };

        // Eliminar todos los parámetros de filtros (filtro_* y dma_*)
        // y también linea, step, search para reemplazarlos con los nuevos valores
        // PERO NO eliminar linea si se está agregando en esta misma llamada
        const keysToDelete = [];
        newParams.forEach((value, key) => {
          if (
            key.startsWith("filtro_") ||
            key.startsWith("dma_") ||
            key === "step" ||
            key === "search"
          ) {
            keysToDelete.push(key);
          }
          // Solo eliminar linea si NO se está agregando en esta llamada
          if (key === "linea" && !paramsToAdd.includes("linea")) {
            keysToDelete.push(key);
          }
        });
        keysToDelete.forEach((key) => newParams.delete(key));

        // Restaurar parámetros preservados (siempre con valores por defecto si no existen)
        Object.entries(preservedParams).forEach(([key, value]) => {
          newParams.set(key, value);
        });
      }

      // Agregar o actualizar solo los parámetros que se pasan
      // URLSearchParams.set() codifica automáticamente los valores
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          newParams.set(key, value);
        } else {
          // Si el valor es vacío/null, eliminar el parámetro
          newParams.delete(key);
        }
      });

      setSearchParams(newParams, { replace: true });
    },
    [setSearchParams, searchParams]
  );

  const {
    selectedLinea,
    selectedValues,
    filteredProducts,
    availableLines,
    currentStepOptions,
    flowConfig,
    additionalFilters,
    loading,
    isAtProductView,
    currentStep,
    searchQuery,
    selectLinea,
    selectFilterValue,
    applyAdditionalFilter,
    clearAdditionalFilter,
    clearAllAdditionalFilters,
    goToAdditionalFilter,
    handleSearchChange,
    goToFilterStep,
    isInitialized,
    setSelectedValues,
    setCurrentStepIndex,
  } = useCatalogFlow(
    empresaName,
    empresaName ? catalogByEmpresa[empresaName] : null,
    searchParams,
    updateURL
  );

  const handleLineaSelect = (linea) => {
    selectLinea(linea);
  };

  const handleFilterSelect = (value) => {
    selectFilterValue(value);
  };

  const handleBreadcrumbLineaSelect = (linea) => {
    if (linea === null) {
      selectLinea(null); // Volver a bienvenidos solo si se pasa null
    } else {
      selectLinea(linea); // Cambiar a otra línea
    }
  };

  const handleBreadcrumbFilterSelect = (filterId) => {
    // Si es un filtro adicional (DMA_*), usar goToAdditionalFilter
    // Si es un filtro del flujo principal, usar goToFilterStep
    if (filterId.startsWith("DMA_")) {
      goToAdditionalFilter(filterId);
    } else {
      goToFilterStep(filterId);
    }
  };

  const handleBreadcrumbProductsSelect = () => {
    // Ya no necesitamos limpiar selectedProduct ya que no lo usamos
  };

  const handleProductSelect = (product) => {
    // Navegar directamente sin usar estado intermedio para evitar re-renderizados
    if (!product || !product.id) {
      console.error("Error: Producto o ID inválido", product);
      return;
    }

    // Construir la URL completa con todos los parámetros de búsqueda actuales
    const currentUrl = `/catalogo/${empresaName || ""}${location.search}`;

    // Navegar directamente al detalle del producto
    navigate(
      `/productos/${product.id}?prevUrl=${encodeURIComponent(currentUrl)}`,
      {
        state: {
          product: product,
          empresaId: empresaName,
        },
        replace: false,
      }
    );
  };

  const handleBackToCatalog = () => {
    // Ya no necesitamos limpiar selectedProduct ya que no lo usamos
  };

  const handleAdditionalFilterSelect = (filterId, value) => {
    applyAdditionalFilter(filterId, value);
  };

  const handleAdditionalFilterClear = (filterId) => {
    clearAdditionalFilter(filterId);
  };

  const handleClearAllAdditionalFilters = () => {
    clearAllAdditionalFilters();
  };

  // Ya no necesitamos el sistema de restore desde location.state
  // porque ahora todo se maneja a través de la URL
  // Mantenemos este código por compatibilidad pero ya no se usará
  useEffect(() => {
    if (location.state?.filters) {
      // Si hay estado en location, limpiarlo ya que ahora usamos URL
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Funciones para el formulario de solicitud de acceso
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAccessRequestForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAccessRequestSubmit = async (e) => {
    e.preventDefault();

    // Validar teléfono
    if (!accessRequestForm.telefono || !accessRequestForm.telefono.trim()) {
      toast.error("Por favor, ingresa tu número de teléfono");
      return;
    }

    // Validar que existan los datos del usuario
    if (!user?.ACCOUNT_USER || !user?.NAME_USER || !user?.EMAIL) {
      toast.error("Faltan datos en tu perfil de usuario");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api_email_solicitudEmpresa({
        cuenta: user.ACCOUNT_USER,
        nombre: user.NAME_USER,
        correo: user.EMAIL,
        telefono: accessRequestForm.telefono.trim(),
        empresa: empresaName,
      });

      if (response.success) {
        toast.success("Solicitud enviada exitosamente");
        setRequestSubmitted(true);
      } else {
        toast.error(response.message || "Error al enviar la solicitud");
      }
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      toast.error("Error al enviar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reiniciar estado del formulario cuando cambia la empresa
  useEffect(() => {
    setRequestSubmitted(false);
    setAccessRequestForm({
      telefono: "",
    });
  }, [empresaName, user]);

  // Ya no necesitamos los useEffect para manejar selectedProduct
  // La navegación se hace directamente desde handleProductSelect

  // Verificar si el usuario tiene acceso a la empresa
  if (empresaName && user) {
    const userAccess = user?.EMPRESAS || [];
    const empresaNameUpper = empresaName.toUpperCase();

    if (!userAccess.includes(empresaNameUpper)) {
      return (
        <CatalogContainer>
          <MainContent>
            <UnauthorizedContainer>
              {!requestSubmitted ? (
                <UnauthorizedContent>
                  <UnauthorizedLeft>
                    <BackLink onClick={(e) => { e.preventDefault(); navigate("/"); }}>
                      <RenderIcon name="FaArrowLeft" size={14} />
                      Volver al Inicio
                    </BackLink>
                    <TitleWithIcon>
                      <UnauthorizedIconWrapper>
                        <RenderIcon
                          name="FaLock"
                          size={30}
                          style={{ color: "var(--color-warning, #f59e0b)" }}
                        />
                      </UnauthorizedIconWrapper>
                      <UnauthorizedTitle>
                        Solicitar Acceso a {empresaName}
                      </UnauthorizedTitle>
                    </TitleWithIcon>
                    <UnauthorizedMessage>
                      No tienes permisos para acceder al catálogo de{" "}
                      <strong>{empresaName}</strong>. Completa el siguiente
                      formulario para solicitar acceso y nos contactaremos
                      contigo.
                    </UnauthorizedMessage>
                    <UnauthorizedFeatures>
                      <UnauthorizedFeature>
                        <RenderIcon name="FaCircleCheck" size={18} />
                        <span>Proceso rápido y sencillo</span>
                      </UnauthorizedFeature>
                      <UnauthorizedFeature>
                        <RenderIcon name="FaCircleCheck" size={18} />
                        <span>Respuesta en 24-48 horas</span>
                      </UnauthorizedFeature>
                      <UnauthorizedFeature>
                        <RenderIcon name="FaCircleCheck" size={18} />
                        <span>Acceso completo al catálogo</span>
                      </UnauthorizedFeature>
                    </UnauthorizedFeatures>
                  </UnauthorizedLeft>

                  <UnauthorizedRight>
                    <AccessRequestForm onSubmit={handleAccessRequestSubmit}>
                    {/* Información del usuario (solo lectura) */}
                    <FormGroup>
                      <FormLabel>RUC / Cédula</FormLabel>
                      <FormInput
                        type="text"
                        value={user?.ACCOUNT_USER || "No disponible"}
                        disabled
                      />
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormInput
                        type="text"
                        value={user?.NAME_USER || "No disponible"}
                        disabled
                      />
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormInput
                        type="email"
                        value={user?.EMAIL || "No disponible"}
                        disabled
                      />
                    </FormGroup>

                    <FormGroup>
                      <FormLabel htmlFor="telefono">Teléfono *</FormLabel>
                      <FormInput
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={accessRequestForm.telefono}
                        onChange={handleFormChange}
                        placeholder="0987654321"
                        required
                      />
                    </FormGroup>

                    <SubmitButton type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <RenderIcon
                            name="FaSpinner"
                            size={16}
                            style={{
                              animation: "spin 1s linear infinite",
                              marginRight: "8px",
                            }}
                          />
                          Enviando...
                        </>
                      ) : (
                        "Enviar Solicitud"
                      )}
                    </SubmitButton>
                    </AccessRequestForm>
                  </UnauthorizedRight>
                </UnauthorizedContent>
              ) : (
                <>
                  <SuccessMessage>
                    <RenderIcon
                      name="FaCircleCheck"
                      size={48}
                      style={{ marginBottom: "1rem", display: "block", margin: "0 auto 1rem" }}
                    />
                    <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
                      ¡Solicitud Enviada Exitosamente!
                    </p>
                    <p style={{ margin: "0.75rem 0 0 0", fontSize: "1rem" }}>
                      Hemos recibido tu solicitud de acceso a{" "}
                      <strong>{empresaName}</strong>. Nos contactaremos contigo
                      pronto.
                    </p>
                  </SuccessMessage>
                  <BackLink onClick={(e) => { e.preventDefault(); navigate("/"); }}>
                    <RenderIcon name="FaArrowLeft" size={14} />
                    Volver al Inicio
                  </BackLink>
                </>
              )}
            </UnauthorizedContainer>
          </MainContent>
        </CatalogContainer>
      );
    }
  }

  // Mostrar carga si estamos cargando productos de empresa
  if (empresaName && loadingByEmpresa[empresaName]) {
    return (
      <CatalogContainer>
        <MainContent>
          <LoadingContainer>
            <RenderLoader
              size="64px"
              showSpinner={true}
              floatingSpinner={true}
            />
            <LoadingText>Cargando productos de {empresaName}...</LoadingText>
          </LoadingContainer>
        </MainContent>
      </CatalogContainer>
    );
  }

  // Pantalla de bienvenida cuando no hay línea seleccionada
  if (!selectedLinea) {
    return (
      <CatalogContainer>
        <MainContent>
          <WelcomeScreen>
            <WelcomeHeader>
              <WelcomeTitle>
                {empresaName
                  ? `Catálogo de ${empresaName}`
                  : "Bienvenido al Catálogo"}
              </WelcomeTitle>
              <WelcomeDescription>
                {empresaName
                  ? `Explora los productos disponibles de ${empresaName}. Selecciona una línea de negocio para comenzar.`
                  : "Explora nuestra amplia gama de productos de alta calidad. Selecciona una línea de negocio para comenzar a filtrar productos."}
              </WelcomeDescription>
            </WelcomeHeader>

            {loading ? (
              <LoadingContainer>
                <RenderLoader
                  size="64px"
                  showSpinner={true}
                  floatingSpinner={true}
                />
                <LoadingText>
                  Cargando líneas de negocio disponibles...
                </LoadingText>
              </LoadingContainer>
            ) : availableLines.length > 0 ? (
              <LinesGrid>
                {availableLines.map((linea) => (
                  <LineCard
                    key={linea.key}
                    onClick={() => handleLineaSelect(linea.key)}
                  >
                    <LineIcon>
                      <RenderIcon name={linea.icon} size={70} />
                    </LineIcon>
                    <LineTitle>{linea.name}</LineTitle>
                    <LineDescription>{linea.description}</LineDescription>
                    <LineCount>{linea.count} productos</LineCount>
                  </LineCard>
                ))}
              </LinesGrid>
            ) : (
              <LoadingContainer>
                <RenderIcon name="FaBox" size={48} />
                <LoadingText>
                  No hay líneas de negocio disponibles en este momento.
                </LoadingText>
              </LoadingContainer>
            )}
          </WelcomeScreen>
        </MainContent>
      </CatalogContainer>
    );
  }

  // Ya no necesitamos verificar selectedProduct ya que la navegación es directa

  // Pantalla de productos cuando se han completado todos los filtros
  if (isAtProductView) {
    return (
      <CatalogContainer>
        <CatalogBreadcrumb
          selectedLinea={selectedLinea}
          selectedValues={selectedValues}
          availableLines={availableLines}
          onLineaSelect={handleBreadcrumbLineaSelect}
          onFilterSelect={handleBreadcrumbFilterSelect}
          onProductsSelect={handleBreadcrumbProductsSelect}
          currentStep={currentStep}
          flowConfig={flowConfig}
          isAtProductView={isAtProductView}
        />

        <MainContentProducts>
          <ContentWithFilters>
            <AdditionalFilters
              filters={additionalFilters}
              selectedValues={selectedValues}
              searchQuery={searchQuery}
              onFilterSelect={handleAdditionalFilterSelect}
              onClearFilter={handleAdditionalFilterClear}
              onClearAllFilters={handleClearAllAdditionalFilters}
              onSearchChange={handleSearchChange}
            />
            <ProductGridView
              products={filteredProducts}
              catalogState={{
                selectedLinea,
                selectedValues,
                availableLines,
                flowConfig,
                searchQuery,
              }}
              onProductSelect={handleProductSelect}
              initialSort={initialSort}
              loading={loading}
              empresaName={empresaName}
              onReloadProducts={reloadProductsForEmpresa}
            />
          </ContentWithFilters>
        </MainContentProducts>
      </CatalogContainer>
    );
  }

  // Pantalla de filtros en cascada
  return (
    <CatalogContainer>
      <CatalogBreadcrumb
        selectedLinea={selectedLinea}
        selectedValues={selectedValues}
        availableLines={availableLines}
        onLineaSelect={handleBreadcrumbLineaSelect}
        onFilterSelect={handleBreadcrumbFilterSelect}
        onProductsSelect={handleBreadcrumbProductsSelect}
        currentStep={currentStep}
        flowConfig={flowConfig}
        isAtProductView={isAtProductView}
      />

      <MainContent>
        {loading ? (
          <LoadingContainer>
            <RenderLoader
              size="64px"
              showSpinner={true}
              floatingSpinner={true}
            />
            <LoadingText>Cargando productos...</LoadingText>
          </LoadingContainer>
        ) : (
          <FilterCards
            step={currentStep}
            options={currentStepOptions}
            selectedValue={selectedValues[currentStep?.id]}
            onSelect={handleFilterSelect}
          />
        )}
      </MainContent>
    </CatalogContainer>
  );
};

export default Catalog;
