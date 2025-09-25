import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import FilterCards from "../../components/catalog/FilterCards";
import ProductGridView from "../../components/catalog/ProductGridView";
import AdditionalFilters from "../../components/catalog/AdditionalFilters";
import CatalogBreadcrumb from "../../components/catalog/CatalogBreadcrumb";
import useCatalogFlow from "../../hooks/useCatalogFlow";
import { useProductCatalog } from "../../context/ProductCatalogContext";
import RenderIcon from "../../components/ui/RenderIcon";
import ProductDetail from "../../components/catalog/ProductDetail";

const CatalogContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  width: 100%;
`;

const MainContent = styled.main`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  width: 100%;
`;

const ContentWithFilters = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;

  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

const WelcomeScreen = styled.div`
  padding: 20px;
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

  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-top: 60px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
`;

const LineCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 32px 24px;
  cursor: pointer;
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

const Catalog = () => {
  const { empresaName } = useParams();
  const { loadProductsForEmpresa, catalogByEmpresa, loadingByEmpresa } =
    useProductCatalog();
  const [selectedProduct, setSelectedProduct] = useState(null);

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
  } = useCatalogFlow(
    empresaName,
    empresaName ? catalogByEmpresa[empresaName] : null
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

  // Si hay un producto seleccionado, mostrar el detalle
  if (selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        onBack={handleBackToCatalog}
        onLineaSelect={handleBreadcrumbLineaSelect}
        onFilterSelect={handleBreadcrumbFilterSelect}
        onProductsSelect={handleBreadcrumbProductsSelect}
        catalogState={{
          selectedLinea,
          selectedValues,
          availableLines,
          flowConfig,
        }}
        isAtProductView={isAtProductView}
        empresaName={empresaName}
      />
    );
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

        <MainContent>
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
              }}
              onProductSelect={handleProductSelect}
            />
          </ContentWithFilters>
        </MainContent>
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
