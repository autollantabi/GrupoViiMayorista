import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import ProductCard from "../ui/ProductCard";
import { PRODUCT_LINE_CONFIG } from "../../constants/productLineConfig";
import Select from "../ui/Select";
import Input from "../ui/Input";
import RenderLoader from "../ui/RenderLoader";

const ProductGridContainer = styled.div`
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  height: 100%;
  padding: 10px 0 16px 16px;

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

  @media (max-width: 1024px) {
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
    text-align: center;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  width: 100%;
  min-width: 0;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
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

  @media (max-width: 1024px) {
    gap: 12px;
    margin-bottom: 16px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    margin-bottom: 14px;
  }

  @media (max-width: 480px) {
    gap: 8px;
    margin-bottom: 12px;
  }

  /* Ajustar tamaño de los Selects en móvil */
  & > div {
    @media (max-width: 1024px) {
      font-size: 0.85rem;
    }

    @media (max-width: 768px) {
      font-size: 0.8rem;
    }

    @media (max-width: 480px) {
      font-size: 0.75rem;
    }
  }
`;

const ProductsInfo = styled.div`
  text-align: left;
  display: flex;
  justify-content: flex-start;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
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

  @media (max-width: 1024px) {
    width: 36px;
    height: 36px;
    min-width: 36px;
    font-size: 13px;
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    min-width: 32px;
    font-size: 11px;
  }

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    min-width: 28px;
    font-size: 10px;
  }
`;

const PaginationInput = styled(Input)`
  width: 80px;
  text-align: center;
  margin: 0 8px;

  @media (max-width: 1024px) {
    width: 70px;
    margin: 0 6px;
    font-size: 13px;
  }

  @media (max-width: 768px) {
    width: 60px;
    margin: 0 4px;
    font-size: 12px;
  }

  @media (max-width: 480px) {
    width: 50px;
    margin: 0 4px;
    font-size: 11px;
  }
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

  @media (max-width: 1024px) {
    font-size: 13px;
  }

  @media (max-width: 768px) {
    font-size: 12px;
  }

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
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

const ProductGridView = ({
  products,
  catalogState,
  onProductSelect,
  initialSort = "default",
  loading = false,
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
  const urlStockFilter = searchParams.get("stock") || "all";

  const [sortBy, setSortBy] = useState(urlSort);
  // Validar que el límite inicial sea mínimo 144
  const validInitialLimit = urlLimit < 144 ? 144 : urlLimit;
  const [itemsPerPage, setItemsPerPage] = useState(validInitialLimit);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [pageInput, setPageInput] = useState(urlPage.toString());
  const [stockFilter, setStockFilter] = useState(urlStockFilter);

  // Ref para rastrear si estamos actualizando desde la URL
  const isUpdatingFromURL = React.useRef(false);
  const lastSyncedState = React.useRef({
    sortBy: urlSort,
    currentPage: urlPage,
    itemsPerPage: validInitialLimit,
    stockFilter: urlStockFilter,
  });

  // Flag para saber si es el primer render
  const isFirstRender = React.useRef(true);

  // Referencia para el contenedor de paginación
  const paginationContainerRef = React.useRef(null);
  // Referencia para el contenedor con scroll
  const scrollContainerRef = React.useRef(null);

  // Ref para saber si ya se hizo scroll al producto
  const scrollToProductDoneRef = React.useRef(false);
  // Ref para rastrear los filtros anteriores para limpiar producto guardado cuando cambien
  const prevFiltersForProductRef = React.useRef(null);

  // Función para solicitar acceso a una empresa
  const handleRequestAccess = (empresaId) => {
    // Aquí podrías implementar la lógica para solicitar acceso
  };

  // Función para generar una clave única basada en los filtros actuales
  const getProductStorageKey = React.useCallback(() => {
    const filtersKey = JSON.stringify({
      selectedLinea,
      selectedValues,
      searchQuery: catalogSearch,
      sortBy,
    });
    return `productGrid_lastProduct_${filtersKey}`;
  }, [selectedLinea, selectedValues, catalogSearch, sortBy]);

  // Función para guardar el ID del producto que se está viendo
  const saveLastViewedProduct = React.useCallback(
    (productId) => {
      const storageKey = getProductStorageKey();
      try {
        if (productId) {
          localStorage.setItem(storageKey, productId.toString());
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch (error) {
        console.warn("Error saving last viewed product:", error);
      }
    },
    [getProductStorageKey]
  );

  // Función para obtener el ID del último producto visto
  const getLastViewedProduct = React.useCallback(() => {
    const storageKey = getProductStorageKey();
    try {
      const productId = localStorage.getItem(storageKey);
      return productId ? productId : null;
    } catch (error) {
      console.warn("Error getting last viewed product:", error);
      return null;
    }
  }, [getProductStorageKey]);

  // Función para hacer scroll hasta un producto específico
  const scrollToProduct = React.useCallback(
    (productId) => {
      if (!productId || scrollToProductDoneRef.current) return;

      // Buscar el elemento del producto en el DOM
      const productElement = document.querySelector(
        `[data-product-id="${productId}"]`
      );

      if (productElement && scrollContainerRef.current) {
        // Calcular la posición del elemento relativa al contenedor con scroll
        const containerRect =
          scrollContainerRef.current.getBoundingClientRect();
        const elementRect = productElement.getBoundingClientRect();

        // Calcular el scroll necesario para centrar el producto
        const scrollTop =
          scrollContainerRef.current.scrollTop +
          elementRect.top -
          containerRect.top -
          containerRect.height / 2 +
          elementRect.height / 2;

        // Hacer scroll suave hasta el producto
        scrollContainerRef.current.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: "smooth",
        });

        scrollToProductDoneRef.current = true;

        // Limpiar el producto guardado después de hacer scroll
        setTimeout(() => {
          saveLastViewedProduct(null);
        }, 1000);
      }
    },
    [saveLastViewedProduct]
  );

  // Limpiar producto guardado cuando cambian los filtros
  React.useEffect(() => {
    const currentFiltersKey = JSON.stringify({
      selectedLinea,
      selectedValues,
      searchQuery: catalogSearch,
      sortBy,
    });

    if (
      prevFiltersForProductRef.current !== null &&
      prevFiltersForProductRef.current !== currentFiltersKey
    ) {
      // Los filtros cambiaron, limpiar el producto guardado de los filtros anteriores
      try {
        const oldStorageKey = `productGrid_lastProduct_${prevFiltersForProductRef.current}`;
        localStorage.removeItem(oldStorageKey);
      } catch (error) {
        console.warn("Error clearing old product:", error);
      }
      scrollToProductDoneRef.current = false;
    }

    prevFiltersForProductRef.current = currentFiltersKey;
  }, [selectedLinea, selectedValues, catalogSearch, sortBy]);

  // Guardar el producto cuando se hace clic en él y llamar al handler original
  const handleProductClick = React.useCallback(
    (product) => {
      if (product && product.id) {
        saveLastViewedProduct(product.id);
      }
      // Llamar al handler original para que Catalog maneje la navegación
      // NO navegar desde aquí para evitar múltiples navegaciones
      if (onProductSelect) {
        onProductSelect(product);
      }
    },
    [saveLastViewedProduct, onProductSelect]
  );

  // Sincronizar estado local con URL cuando cambien los searchParams (solo lectura desde URL)
  useEffect(() => {
    const urlSortValue = searchParams.get("sort") || initialSort || "default";
    const urlPageValue = parseInt(searchParams.get("page") || "1", 10);
    const urlLimitValue = parseInt(searchParams.get("limit") || "144", 10);
    const urlStockFilterValue = searchParams.get("stock") || "all";

    // Solo actualizar si los valores de la URL son diferentes a los que tenemos sincronizados
    if (
      urlSortValue !== lastSyncedState.current.sortBy ||
      urlPageValue !== lastSyncedState.current.currentPage ||
      urlLimitValue !== lastSyncedState.current.itemsPerPage ||
      urlStockFilterValue !== lastSyncedState.current.stockFilter
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
      if (urlStockFilterValue !== stockFilter) {
        setStockFilter(urlStockFilterValue);
      }

      lastSyncedState.current = {
        sortBy: urlSortValue,
        currentPage: urlPageValue,
        itemsPerPage: validUrlLimit,
        stockFilter: urlStockFilterValue,
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
      if (!params.has("stock")) {
        params.set("stock", stockFilter);
        needsInit = true;
      }

      if (needsInit) {
        lastSyncedState.current = {
          sortBy,
          currentPage,
          itemsPerPage,
          stockFilter,
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

    // SIEMPRE asegurar que stock esté presente en URL
    if (!params.has("stock") || params.get("stock") !== stockFilter) {
      params.set("stock", stockFilter);
      needsUpdate = true;
    }

    if (needsUpdate) {
      lastSyncedState.current = {
        sortBy,
        currentPage,
        itemsPerPage,
        stockFilter,
      };
      setSearchParams(params, { replace: true });
    }
  }, [
    sortBy,
    currentPage,
    itemsPerPage,
    stockFilter,
    searchParams,
    setSearchParams,
  ]);

  // Filtrar y ordenar productos
  const processedProducts = useMemo(() => {
    if (!products || products.length === 0)
      return { items: [], totalItems: 0, totalPages: 0 };

    let filtered = [...products];

    // Aplicar filtro de stock
    if (stockFilter === "available") {
      // Solo productos con stock > 1
      filtered = filtered.filter((product) => product.stock > 1);
    } else if (stockFilter === "low_stock") {
      // Solo productos con stock <= 1
      filtered = filtered.filter((product) => product.stock <= 1);
    }
    // Si stockFilter === "all", no filtrar

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
  }, [products, sortBy, itemsPerPage, currentPage, stockFilter]);

  // Buscar y hacer scroll al producto guardado cuando se monta o cambian los productos
  React.useEffect(() => {
    if (processedProducts.items.length > 0 && !scrollToProductDoneRef.current) {
      const lastProductId = getLastViewedProduct();

      if (lastProductId) {
        // Buscar el producto en la lista actual
        const productExists = processedProducts.items.some(
          (p) => p.id.toString() === lastProductId.toString()
        );

        if (productExists) {
          // Intentar hacer scroll al producto después de que se rendericen
          const scrollTimeout = setTimeout(() => {
            scrollToProduct(lastProductId);
          }, 300);

          return () => clearTimeout(scrollTimeout);
        } else {
          // El producto no está en esta página, limpiar
          saveLastViewedProduct(null);
          scrollToProductDoneRef.current = true;
        }
      } else {
        // No hay producto guardado, hacer scroll a 0 cuando cambia la página
        if (scrollContainerRef.current && currentPage > 0) {
          scrollContainerRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
        scrollToProductDoneRef.current = true;
      }
    }
  }, [
    processedProducts.items.length,
    currentPage,
    getLastViewedProduct,
    scrollToProduct,
    saveLastViewedProduct,
  ]);

  // Resetear flag cuando cambia la página para permitir nueva búsqueda
  React.useEffect(() => {
    scrollToProductDoneRef.current = false;
  }, [currentPage]);

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

  const handleStockFilterChange = (e) => {
    const value = e.target.value;
    setStockFilter(value);
    // Resetear a página 1 cuando cambia el filtro de stock
    setCurrentPage(1);
    setPageInput("1");
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

  // Mostrar loading si está cargando
  if (loading) {
    return (
      <ProductGridContainer>
        <LoadingContainer>
          <RenderLoader size="64px" showSpinner={true} floatingSpinner={true} />
          <LoadingText>Cargando productos...</LoadingText>
        </LoadingContainer>
      </ProductGridContainer>
    );
  }

  // Mostrar mensaje de "No se encontraron productos" solo si no está cargando y no hay productos
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

              <Select
                options={[
                  { value: "all", label: "Todos" },
                  { value: "available", label: "Disponibles" },
                  { value: "low_stock", label: "Poco stock" },
                ]}
                value={stockFilter}
                onChange={handleStockFilterChange}
                preValue="Stock:"
                placeholder="Filtrar por stock"
                width="auto"
              />
            </SelectsContainer>
          )}
        </SortContainer>

        <ProductsGrid>
          {processedProducts.items.map((product, index) => (
            <div
              key={`${product.empresaId}-${product.id}-${index}`}
              data-product-id={product.id}
            >
              <ProductCard
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
                onClick={() => handleProductClick(product)}
              />
            </div>
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
                  id="pagination-jump-page"
                  name="pagination-jump-page"
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
                  autoComplete="off"
                />
              </PaginationJumpRow>
            </PaginationContainer>
          )}
      </GridScrollableContent>
    </ProductGridContainer>
  );
};

export default ProductGridView;
