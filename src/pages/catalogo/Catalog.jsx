import React, { useState, useCallback, useEffect } from "react";
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
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding: 40px;
  }
`;

const WelcomeHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

const WelcomeDescription = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const LinesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-top: 40px;
  justify-items: center;

  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-top: 60px;
    justify-content: center;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    justify-content: center;
  }
`;

const LineCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 32px 24px;
  cursor: pointer;
  min-width: 350px;
  max-width: 360px;
  width: 100%;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    padding: 24px 20px;
    min-width: 100%;
    max-width: 100%;
  }
`;

const LineIcon = styled.div`
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

const LineTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 12px 0;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 8px;
  }
`;

const LineDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0 0 16px 0;
  line-height: 1.5;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 12px;
  }
`;

const LineCount = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 5px 10px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  gap: 20px;

  @media (max-width: 768px) {
    padding: 40px 15px;
    gap: 16px;
  }
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 1rem;
`;

const UnauthorizedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  gap: 20px;
  min-height: 60vh;

  @media (max-width: 768px) {
    padding: 40px 15px;
    gap: 16px;
  }
`;

const UnauthorizedTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const UnauthorizedMessage = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 1.1rem;
  margin: 0;
  max-width: 500px;

  @media (max-width: 768px) {
    font-size: 1rem;
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
  max-width: 500px;
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  font-weight: 500;
`;

const FormInput = styled.input`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
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
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;

  &:hover:not(:disabled) {
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

const SuccessMessage = styled.div`
  background: ${({ theme }) => theme.colors.success}15;
  border: 1px solid ${({ theme }) => theme.colors.success};
  color: ${({ theme }) => theme.colors.success};
  padding: 16px 20px;
  border-radius: 8px;
  text-align: center;
  margin-top: 24px;
  max-width: 500px;
`;

const BackButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.textLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.textLight};
  }
`;

const Catalog = () => {
  const { empresaName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { loadProductsForEmpresa, catalogByEmpresa, loadingByEmpresa } =
    useProductCatalog();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pendingRestore, setPendingRestore] = useState(null);
  const [initialSort, setInitialSort] = useState("default");
  const [restoreApplied, setRestoreApplied] = useState(false);

  // Estados para el formulario de solicitud de acceso
  const [accessRequestForm, setAccessRequestForm] = useState({
    telefono: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Funciones para manejar localStorage del producto seleccionado
  const saveSelectedProduct = useCallback((product) => {
    try {
      if (product) {
        localStorage.setItem("selectedProduct", JSON.stringify(product));
      } else {
        localStorage.removeItem("selectedProduct");
      }
    } catch (error) {
      console.warn("Error saving selected product to localStorage:", error);
    }
  }, []);

  const loadSelectedProduct = useCallback(() => {
    try {
      const saved = localStorage.getItem("selectedProduct");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn("Error loading selected product from localStorage:", error);
      return null;
    }
  }, []);

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

      if (isCompleteUpdate) {
        // Si es una actualización completa, primero eliminar todos los parámetros de filtros
        // pero preservar page, sort, limit
        const preservedParams = {
          page: newParams.get("page"),
          sort: newParams.get("sort"),
          limit: newParams.get("limit"),
        };

        // Eliminar todos los parámetros de filtros (filtro_* y dma_*)
        const keysToDelete = [];
        newParams.forEach((value, key) => {
          if (
            key.startsWith("filtro_") ||
            key.startsWith("dma_") ||
            key === "linea" ||
            key === "step" ||
            key === "search"
          ) {
            keysToDelete.push(key);
          }
        });
        keysToDelete.forEach((key) => newParams.delete(key));

        // Restaurar parámetros preservados
        Object.entries(preservedParams).forEach(([key, value]) => {
          if (value) {
            newParams.set(key, value);
          }
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
    setSelectedProduct(null); // Limpiar el producto seleccionado
    if (linea === null) {
      selectLinea(null); // Volver a bienvenidos solo si se pasa null
    } else {
      selectLinea(linea); // Cambiar a otra línea
    }
  };

  const handleBreadcrumbFilterSelect = (filterId) => {
    setSelectedProduct(null); // Limpiar el producto seleccionado

    // Si es un filtro adicional (DMA_*), usar goToAdditionalFilter
    // Si es un filtro del flujo principal, usar goToFilterStep
    if (filterId.startsWith("DMA_")) {
      goToAdditionalFilter(filterId);
    } else {
      goToFilterStep(filterId);
    }
  };

  const handleBreadcrumbProductsSelect = () => {
    setSelectedProduct(null); // Limpiar el producto seleccionado para regresar al ProductGrid
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleBackToCatalog = () => {
    setSelectedProduct(null);
  };

  const handleAdditionalFilterSelect = (filterId, value) => {
    applyAdditionalFilter(filterId, value);
  };

  const handleAdditionalFilterClear = (filterId) => {
    clearAdditionalFilter(filterId);
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

  // Cargar producto seleccionado desde localStorage al inicializar
  useEffect(() => {
    const savedProduct = loadSelectedProduct();
    if (savedProduct) {
      setSelectedProduct(savedProduct);
    }
  }, [loadSelectedProduct]);

  // Guardar producto seleccionado cuando cambie
  useEffect(() => {
    saveSelectedProduct(selectedProduct);
  }, [selectedProduct, saveSelectedProduct]);

  // Verificar si el usuario tiene acceso a la empresa
  if (empresaName && user) {
    const userAccess = user?.EMPRESAS || [];
    const empresaNameUpper = empresaName.toUpperCase();

    if (!userAccess.includes(empresaNameUpper)) {
      return (
        <CatalogContainer>
          <MainContent>
            <UnauthorizedContainer>
              <RenderIcon
                name="FaLock"
                size={60}
                style={{ color: "var(--color-error, #ef4444)" }}
              />
              <UnauthorizedTitle>
                Solicitar Acceso a {empresaName}
              </UnauthorizedTitle>

              {!requestSubmitted ? (
                <>
                  <UnauthorizedMessage>
                    No tienes permisos para acceder al catálogo de{" "}
                    <strong>{empresaName}</strong>. Completa el siguiente
                    formulario para solicitar acceso y nos contactaremos
                    contigo.
                  </UnauthorizedMessage>

                  <AccessRequestForm onSubmit={handleAccessRequestSubmit}>
                    {/* Información del usuario (solo lectura) */}
                    <FormGroup>
                      <FormLabel>RUC / Cédula</FormLabel>
                      <FormInput
                        type="text"
                        value={user?.ACCOUNT_USER || "No disponible"}
                        disabled
                        style={{
                          backgroundColor: "#f3f4f6",
                          cursor: "not-allowed",
                        }}
                      />
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormInput
                        type="text"
                        value={user?.NAME_USER || "No disponible"}
                        disabled
                        style={{
                          backgroundColor: "#f3f4f6",
                          cursor: "not-allowed",
                        }}
                      />
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormInput
                        type="email"
                        value={user?.EMAIL || "No disponible"}
                        disabled
                        style={{
                          backgroundColor: "#f3f4f6",
                          cursor: "not-allowed",
                        }}
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

                  <BackButton onClick={() => navigate("/")}>
                    Volver al Inicio
                  </BackButton>
                </>
              ) : (
                <>
                  <SuccessMessage>
                    <RenderIcon
                      name="FaCheckCircle"
                      size={40}
                      style={{ marginBottom: "12px" }}
                    />
                    <p
                      style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}
                    >
                      ¡Solicitud Enviada Exitosamente!
                    </p>
                    <p style={{ margin: "8px 0 0 0" }}>
                      Hemos recibido tu solicitud de acceso a{" "}
                      <strong>{empresaName}</strong>. Nos contactaremos contigo
                      pronto.
                    </p>
                  </SuccessMessage>
                  <UnauthorizedButton onClick={() => navigate("/")}>
                    Volver al Inicio
                  </UnauthorizedButton>
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
            <RenderIcon
              name="FaSpinner"
              size={30}
              style={{ animation: "spin 1s linear infinite" }}
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
                <RenderIcon
                  name="FaSpinner"
                  size={30}
                  style={{ animation: "spin 1s linear infinite" }}
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

  // Si hay un producto seleccionado, redirigir a la página de detalle
  if (selectedProduct) {
    navigate(`/productos/${selectedProduct.id}`, {
      state: {
        product: selectedProduct,
        empresaId: empresaName,
        prevUrl: `/catalogo/${empresaName || ""}`,
      },
    });
    return null;
  }

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
            <RenderIcon
              name="FaSpinner"
              size={30}
              style={{ animation: "spin 1s linear infinite" }}
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
