import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import ProductCard from "../ui/ProductCard";
import { PRODUCT_LINE_CONFIG } from "../../constants/productLineConfig";
import Select from "../ui/Select";
import Input from "../ui/Input";

const ProductGridContainer = styled.div`
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  height: 100%;
  padding: 10px 0 0 10px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const GridScrollableContent = styled.div`
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px; /* espacio para scrollbar */
  min-width: 0;

  /* Scrollbar personalizado */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.textLight};
  }

  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.border}
    ${({ theme }) => theme.colors.background};
`;

const ResultsInfo = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 1.2rem;
  font-weight: 600;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  width: 100%;
  min-width: 0;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 10px;
  }
`;

const NoResultsContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};

  @media (max-width: 768px) {
    padding: 30px 20px;
  }

  @media (max-width: 480px) {
    padding: 24px 16px;
  }
`;

const NoResultsIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.textLight};

  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 14px;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 12px;
  }
`;

const NoResultsTitle = styled.h2`
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 14px;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-bottom: 12px;
  }
`;

const NoResultsText = styled.p`
  margin: 0 0 24px 0;
  color: ${({ theme }) => theme.colors.textLight};
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    margin-bottom: 20px;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 16px;
    font-size: 0.85rem;
  }
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const ProductsInfo = styled.div`
  width: 100%;
  text-align: left;
  display: flex;
  justify-content: flex-start;
`;

const SelectsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  flex-direction: row;

  @media (max-width: 768px) {
    justify-content: center;
    width: 100%;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding-top: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  align-self: stretch;

  @media (max-width: 768px) {
    margin-top: 20px;
    padding-top: 16px;
    gap: 12px;
  }
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.surface};
  color: ${({ $isActive, theme }) => ($isActive ? "#fff" : theme.colors.text)};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: ${({ $isActive, theme }) =>
      $isActive ? theme.colors.primary : theme.colors.border};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    min-width: 36px;
    font-size: 12px;
  }
`;

const PaginationInput = styled(Input)`
  width: 80px;
  text-align: center;
  margin: 0 8px;
`;

const PaginationPagesContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 4px;
  padding: 0 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  scroll-behavior: smooth;

  /* Ocultar scrollbar en webkit */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Asegurar que no cause overflow en el contenedor padre */
  min-width: 0;
  flex-shrink: 1;
`;

const PaginationJumpRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 16px;
  margin-bottom: 16px;
`;

const PaginationLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const ProductGridView = ({
  products,
  catalogState,
  onProductSelect,
  initialSort = "default",
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    selectedLinea,
    selectedValues,
    searchQuery: catalogSearch = "",
  } = catalogState || {};

  // Leer valores iniciales desde la URL
  const urlSort = searchParams.get("sort") || initialSort || "default";
  const urlPage = parseInt(searchParams.get("page") || "1", 10);
  const urlLimit = parseInt(searchParams.get("limit") || "144", 10);

  const [sortBy, setSortBy] = useState(urlSort);
  // Validar que el límite inicial sea mínimo 144
  const validInitialLimit = urlLimit < 144 ? 144 : urlLimit;
  const [itemsPerPage, setItemsPerPage] = useState(validInitialLimit);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [pageInput, setPageInput] = useState(urlPage.toString());

  // Ref para rastrear si estamos actualizando desde la URL
  const isUpdatingFromURL = React.useRef(false);
  const lastSyncedState = React.useRef({
    sortBy: urlSort,
    currentPage: urlPage,
    itemsPerPage: validInitialLimit,
  });

  // Flag para saber si es el primer render
  const isFirstRender = React.useRef(true);

  // Referencia para el contenedor de paginación
  const paginationContainerRef = React.useRef(null);
  // Referencia para el contenedor con scroll
  const scrollContainerRef = React.useRef(null);

  // Función para solicitar acceso a una empresa
  const handleRequestAccess = (empresaId) => {
    // Aquí podrías implementar la lógica para solicitar acceso
  };

  // Sincronizar estado local con URL cuando cambien los searchParams (solo lectura desde URL)
  useEffect(() => {
    const urlSortValue = searchParams.get("sort") || initialSort || "default";
    const urlPageValue = parseInt(searchParams.get("page") || "1", 10);
    const urlLimitValue = parseInt(searchParams.get("limit") || "144", 10);

    // Solo actualizar si los valores de la URL son diferentes a los que tenemos sincronizados
    if (
      urlSortValue !== lastSyncedState.current.sortBy ||
      urlPageValue !== lastSyncedState.current.currentPage ||
      urlLimitValue !== lastSyncedState.current.itemsPerPage
    ) {
      isUpdatingFromURL.current = true;

      if (urlSortValue !== sortBy) {
        setSortBy(urlSortValue);
      }
      if (urlPageValue !== currentPage) {
        setCurrentPage(urlPageValue);
        setPageInput(urlPageValue.toString());
      }
      // Validar que el valor de la URL sea mínimo 144
      const validUrlLimit = urlLimitValue < 144 ? 144 : urlLimitValue;
      if (validUrlLimit !== itemsPerPage) {
        setItemsPerPage(validUrlLimit);
      }

      lastSyncedState.current = {
        sortBy: urlSortValue,
        currentPage: urlPageValue,
        itemsPerPage: validUrlLimit,
      };

      // Resetear el flag después de un pequeño delay
      setTimeout(() => {
        isUpdatingFromURL.current = false;
      }, 100);
    }
  }, [searchParams.toString()]); // Solo cuando cambie la URL como string

  // Sincronizar URL con estado local - SIEMPRE asegurar que los parámetros estén presentes
  useEffect(() => {
    // En el primer render, asegurar que los parámetros estén presentes
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const params = new URLSearchParams(searchParams);
      let needsInit = false;

      if (!params.has("sort")) {
        params.set("sort", sortBy);
        needsInit = true;
      }
      if (!params.has("page")) {
        params.set("page", currentPage.toString());
        needsInit = true;
      }
      if (!params.has("limit")) {
        const validLimit = itemsPerPage < 144 ? 144 : itemsPerPage;
        params.set("limit", validLimit.toString());
        if (itemsPerPage !== validLimit) {
          setItemsPerPage(validLimit);
        }
        needsInit = true;
      }

      if (needsInit) {
        lastSyncedState.current = {
          sortBy,
          currentPage,
          itemsPerPage,
        };
        setSearchParams(params, { replace: true });
        return;
      }
    }

    // No actualizar si el cambio viene de la URL
    if (isUpdatingFromURL.current) {
      return;
    }

    const params = new URLSearchParams(searchParams);
    let needsUpdate = false;

    // SIEMPRE asegurar que sort esté presente en URL
    if (!params.has("sort") || params.get("sort") !== sortBy) {
      params.set("sort", sortBy);
      needsUpdate = true;
    }

    // SIEMPRE asegurar que page esté presente en URL
    if (!params.has("page") || params.get("page") !== currentPage.toString()) {
      params.set("page", currentPage.toString());
      needsUpdate = true;
    }

    // SIEMPRE asegurar que limit esté presente en URL
    // Validar que sea mínimo 144
    const validLimit = itemsPerPage < 144 ? 144 : itemsPerPage;
    if (!params.has("limit") || params.get("limit") !== validLimit.toString()) {
      params.set("limit", validLimit.toString());
      if (itemsPerPage !== validLimit) {
        setItemsPerPage(validLimit);
      }
      needsUpdate = true;
    }

    if (needsUpdate) {
      lastSyncedState.current = {
        sortBy,
        currentPage,
        itemsPerPage,
      };
      setSearchParams(params, { replace: true });
    }
  }, [sortBy, currentPage, itemsPerPage, searchParams, setSearchParams]);

  // Filtrar y ordenar productos
  const processedProducts = useMemo(() => {
    if (!products || products.length === 0)
      return { items: [], totalItems: 0, totalPages: 0 };

    let filtered = [...products];

    // Aplicar ordenamiento
    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "default":
      default:
        // Ordenar por DMA_INDICE_CLASIFICACION (A, B, C)
        filtered.sort((a, b) => {
          const getClassificationOrder = (classification) => {
            switch (classification) {
              case "A":
                return 1;
              case "B":
                return 2;
              case "C":
                return 3;
              default:
                return 4; // Para valores no definidos, van al final
            }
          };

          const orderA = getClassificationOrder(
            a.originalData.DMA_INDICE_CLASIFICACION
          );
          const orderB = getClassificationOrder(
            b.originalData.DMA_INDICE_CLASIFICACION
          );

          return orderA - orderB;
        });
        break;
    }

    // Calcular paginación
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const items = filtered.slice(startIndex, endIndex);

    return { items, totalItems, totalPages };
  }, [products, sortBy, itemsPerPage, currentPage]);

  // Resetear página si la página actual excede el total de páginas disponibles
  useEffect(() => {
    if (
      processedProducts.totalPages > 0 &&
      currentPage > processedProducts.totalPages
    ) {
      isUpdatingFromURL.current = true;
      setCurrentPage(1);
      setPageInput("1");

      // Actualizar el estado sincronizado
      lastSyncedState.current = {
        ...lastSyncedState.current,
        currentPage: 1,
      };

      // Actualizar la URL directamente
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      setSearchParams(params, { replace: true });

      // Resetear el flag después de un pequeño delay
      setTimeout(() => {
        isUpdatingFromURL.current = false;
      }, 100);
    }
  }, [
    processedProducts.totalPages,
    currentPage,
    searchParams,
    setSearchParams,
  ]);

  // Resetear página cuando cambien los filtros del catálogo (selectedLinea, selectedValues)
  // Usar un ref para rastrear los valores anteriores y solo resetear cuando realmente cambien
  const prevFiltersRef = React.useRef({
    selectedLinea,
    selectedValues: JSON.stringify(selectedValues),
  });

  useEffect(() => {
    const currentFilters = {
      selectedLinea,
      selectedValues: JSON.stringify(selectedValues),
    };

    // Solo resetear si realmente cambiaron los filtros (no solo la página)
    if (
      prevFiltersRef.current.selectedLinea !== currentFilters.selectedLinea ||
      prevFiltersRef.current.selectedValues !== currentFilters.selectedValues
    ) {
      // Cuando cambian los filtros del catálogo, resetear a página 1
      // Marcar que estamos actualizando desde el reset para evitar conflictos
      isUpdatingFromURL.current = true;
      setCurrentPage(1);
      setPageInput("1");
      prevFiltersRef.current = currentFilters;

      // Actualizar el estado sincronizado
      lastSyncedState.current = {
        ...lastSyncedState.current,
        currentPage: 1,
      };

      // Actualizar la URL directamente para asegurar que page=1 esté presente
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      setSearchParams(params, { replace: true });

      // Resetear el flag después de un pequeño delay
      setTimeout(() => {
        isUpdatingFromURL.current = false;
      }, 100);
    }
  }, [selectedLinea, selectedValues, searchParams, setSearchParams]);

  // Efecto para hacer scroll hacia arriba cuando cambie la página
  useEffect(() => {
    if (scrollContainerRef.current && currentPage > 0) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [currentPage]);

  // Efecto para hacer scroll automático a la página actual en la paginación
  React.useEffect(() => {
    if (paginationContainerRef.current && currentPage > 0) {
      const container = paginationContainerRef.current;
      const activeButton = container.querySelector(
        `[data-page="${currentPage}"]`
      );

      if (activeButton) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        // Calcular si el botón está visible
        const isVisible =
          buttonRect.left >= containerRect.left &&
          buttonRect.right <= containerRect.right;

        if (!isVisible) {
          // Hacer scroll para centrar el botón activo
          const scrollLeft =
            activeButton.offsetLeft -
            container.offsetWidth / 2 +
            activeButton.offsetWidth / 2;

          container.scrollTo({
            left: Math.max(0, scrollLeft),
            behavior: "smooth",
          });
        }
      }
    }
  }, [currentPage]);

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
  };

  const handleItemsPerPageChange = (e) => {
    const value = e.target.value;
    setItemsPerPage(parseInt(value));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setPageInput(page.toString());
  };

  // Manejar cambio de página por input
  const handlePageInputChange = (e) => {
    const value = e.target.value;
    setPageInput(value);

    // Solo cambiar página si el valor es un número válido
    const pageNum = parseInt(value);
    if (
      !isNaN(pageNum) &&
      pageNum >= 1 &&
      pageNum <= processedProducts.totalPages
    ) {
      setCurrentPage(pageNum);
    }
  };

  const handlePageInputBlur = () => {
    const pageNum = parseInt(pageInput);

    // Si está vacío o no es un número válido, volver a la página actual
    if (isNaN(pageNum) || pageInput.trim() === "") {
      setPageInput(currentPage.toString());
      return;
    }

    if (pageNum < 1) {
      setPageInput("1");
      setCurrentPage(1);
    } else if (pageNum > processedProducts.totalPages) {
      setPageInput(processedProducts.totalPages.toString());
      setCurrentPage(processedProducts.totalPages);
    } else {
      setCurrentPage(pageNum);
    }
  };

  if (!products || products.length === 0) {
    return (
      <ProductGridContainer>
        <NoResultsContainer>
          <NoResultsIcon>🔍</NoResultsIcon>
          <NoResultsTitle>No se encontraron productos</NoResultsTitle>
          <NoResultsText>
            No hay productos disponibles con los filtros seleccionados. Intenta
            ajustar los filtros o selecciona otra categoría.
          </NoResultsText>
        </NoResultsContainer>
      </ProductGridContainer>
    );
  }

  return (
    <ProductGridContainer>
      <GridScrollableContent ref={scrollContainerRef}>
        <SortContainer>
         

          {/* Solo mostrar el selector de ordenación si hay productos */}
          {processedProducts && processedProducts.items.length > 0 && (
            <SelectsContainer>
              <Select
                options={[
                  { value: "default", label: "Destacados" },
                  { value: "price_asc", label: "Menor precio" },
                  { value: "price_desc", label: "Mayor precio" },
                  { value: "name_asc", label: "Alfabético (A-Z)" },
                  { value: "rating", label: "Mejor valorados" },
                ]}
                value={sortBy}
                onChange={handleSortChange}
                preValue="Ord:"
                placeholder="Ordenar por..."
                width="auto"
              />

              <Select
                options={[
                  { value: 144, label: "144" },
                  { value: 288, label: "288" },
                  { value: 432, label: "432" },
                  { value: 576, label: "576" },
                ]}
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                preValue="Ver:"
                postValue=" productos"
                placeholder="Mostrar items"
                width="auto"
              />
            </SelectsContainer>
          )}
           <ProductsInfo>
            <ResultsInfo>
              Mostrando {processedProducts.totalItems} producto
              {processedProducts.totalItems !== 1 ? "s" : ""}
            </ResultsInfo>
          </ProductsInfo>
        </SortContainer>

        <ProductsGrid>
          {processedProducts.items.map((product, index) => (
            <ProductCard
              key={`${product.empresaId}-${product.id}-${index}`}
              product={product}
              lineConfig={
                PRODUCT_LINE_CONFIG[product.lineaNegocio] ||
                PRODUCT_LINE_CONFIG.DEFAULT
              }
              restricted={false}
              onRequestAccess={handleRequestAccess}
              // Pasar información de catálogo para preservar contexto
              currentFilters={{
                selectedLinea,
                selectedValues,
              }}
              currentSearch={catalogSearch}
              currentSort={sortBy}
            />
          ))}
        </ProductsGrid>

        {/* Paginación */}
        {processedProducts &&
          processedProducts.totalItems > 0 &&
          processedProducts.totalPages > 1 && (
            <PaginationContainer>
              {/* Botones de páginas con scroll horizontal */}
              <PaginationPagesContainer ref={paginationContainerRef}>
                {Array.from(
                  { length: processedProducts.totalPages },
                  (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationButton
                        key={pageNum}
                        data-page={pageNum}
                        $isActive={currentPage === pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          setPageInput(pageNum.toString());
                        }}
                      >
                        {pageNum}
                      </PaginationButton>
                    );
                  }
                )}
              </PaginationPagesContainer>

              {/* Input para saltar a página específica - centrado abajo */}
              <PaginationJumpRow>
                <PaginationLabel>Ir a:</PaginationLabel>
                <PaginationInput
                  type="number"
                  min="1"
                  max={processedProducts.totalPages}
                  value={pageInput}
                  onChange={handlePageInputChange}
                  onBlur={handlePageInputBlur}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handlePageInputBlur();
                    }
                  }}
                  placeholder={`1-${processedProducts.totalPages}`}
                />
              </PaginationJumpRow>
            </PaginationContainer>
          )}
      </GridScrollableContent>
    </ProductGridContainer>
  );
};

export default ProductGridView;
