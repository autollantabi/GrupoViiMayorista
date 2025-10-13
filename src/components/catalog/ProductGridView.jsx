import React, { useState, useMemo } from "react";
import styled from "styled-components";
import ProductCard from "../ui/ProductCard";
import { PRODUCT_LINE_CONFIG } from "../../constants/productLineConfig";
import Select from "../ui/Select";
import Input from "../ui/Input";

const ProductGridContainer = styled.div`
  flex: 1;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
  padding: 16px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const GridHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 20px;
  }
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
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SelectsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
    width: 100%;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 30px;
  padding-top: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;

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

const ProductGridView = ({ products, catalogState, onProductSelect }) => {
  const { selectedLinea, selectedValues } = catalogState || {};
  const [sortBy, setSortBy] = useState("default");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");

  // Referencia para el contenedor de paginación
  const paginationContainerRef = React.useRef(null);

  // Función para solicitar acceso a una empresa
  const handleRequestAccess = (empresaId) => {
    // Aquí podrías implementar la lógica para solicitar acceso
    // console.log("Solicitar acceso a empresa:", empresaId);
  };

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

  // Resetear página cuando cambien los filtros
  React.useEffect(() => {
    setCurrentPage(1);
    setPageInput("1");
  }, [sortBy, itemsPerPage]);

  // Efecto para hacer scroll automático a la página actual
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
      <SortContainer>
        <ProductsInfo>
          <ResultsInfo>
            Mostrando {processedProducts.totalItems} producto
            {processedProducts.totalItems !== 1 ? "s" : ""}
          </ResultsInfo>
        </ProductsInfo>

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
              preValue="Ordenar por:"
              placeholder="Ordenar por..."
            />

            <Select
              options={[
                { value: 12, label: "12" },
                { value: 36, label: "36" },
                { value: 72, label: "72" },
                { value: 144, label: "144" },
              ]}
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              preValue="Mostrar: "
              postValue=" items por página"
              placeholder="Mostrar items"
            />
          </SelectsContainer>
        )}
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
            currentSearch=""
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
              {Array.from({ length: processedProducts.totalPages }, (_, i) => {
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
              })}
            </PaginationPagesContainer>

            {/* Input para saltar a página específica - centrado abajo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                marginTop: "16px",
              }}
            >
              <span style={{ color: "#666", fontSize: "14px" }}>Ir a:</span>
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
            </div>
          </PaginationContainer>
        )}
    </ProductGridContainer>
  );
};

export default ProductGridView;
