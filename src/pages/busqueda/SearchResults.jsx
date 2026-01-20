import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import ProductCard from "../../components/ui/ProductCard";
import RenderIcon from "../../components/ui/RenderIcon";
import { PRODUCT_LINE_CONFIG } from "../../constants/productLineConfig";
import { useAuth } from "../../context/AuthContext";
import { useProductCatalog } from "../../context/ProductCatalogContext";
import PageContainer from "../../components/layout/PageContainer";

const PageHeader = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
    gap: 12px;
  }

  @media (max-width: 480px) {
    margin-bottom: 16px;
    gap: 10px;
  }
`;

const PageTitle = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.8rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const SearchInfo = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textLight};

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const SearchBarContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};

  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 16px;
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const SearchInputContainer = styled.div`
  flex: 1;
  min-width: 300px;

  @media (max-width: 768px) {
    min-width: 100%;
  }

  @media (max-width: 480px) {
    min-width: 100%;
  }
`;

const SearchButtonContainer = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 12px;
  }

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

// Botón para abrir filtros en móvil
const MobileFiltersButton = styled.button`
  display: none;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};
  transition: all 0.2s ease;
  margin-bottom: 16px;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

// Modal para filtros móviles
const FiltersModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const FiltersModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  max-width: 90vw;
  max-height: 85vh;
  min-height: 70vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 32px ${({ theme }) => theme.colors.shadow};

  @media (max-width: 768px) {
    padding: 20px;
    max-width: 95vw;
    max-height: 90vh;
    min-height: 75vh;
  }

  @media (max-width: 480px) {
    padding: 16px;
    max-width: 98vw;
    max-height: 95vh;
    min-height: 80vh;
  }
`;

const FiltersModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const FiltersModalTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.3rem;
`;

const CloseFiltersButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const FiltersBar = styled.div`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.surface} 0%,
    ${({ theme }) => theme.colors.background} 100%
  );
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 8px 25px ${({ theme }) => theme.colors.shadow};
  border: 1px solid ${({ theme }) => `${theme.colors.border}40`};
  position: relative;
  overflow: visible;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.primaryLight}
    );
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const FiltersContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 1;
`;

const FiltersHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    gap: 16px;
  }

  @media (max-width: 480px) {
    gap: 14px;
  }
`;

const FiltersTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    gap: 10px;
    margin-bottom: 16px;
    padding-bottom: 10px;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
    gap: 8px;
    margin-bottom: 14px;
    padding-bottom: 8px;
  }
`;

const FiltersControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;

  @media (max-width: 1024px) {
    gap: 16px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  @media (max-width: 480px) {
    gap: 14px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => `${theme.colors.border}30`};
  transition: all 0.3s ease;
  position: relative;
  min-width: 200px;
  flex: 1;
  z-index: 1;

  &:hover {
    border-color: ${({ theme }) => `${theme.colors.primary}40`};
    box-shadow: 0 4px 15px ${({ theme }) => `${theme.colors.primary}15`};
    transform: translateY(-2px);
    z-index: 10;
  }

  @media (max-width: 1024px) {
    min-width: 180px;
  }

  @media (max-width: 768px) {
    padding: 14px;
    gap: 6px;
    min-width: auto;
    flex: none;
  }

  @media (max-width: 480px) {
    padding: 12px;
    gap: 5px;
  }
`;

const RestrictedProductsNotice = styled.div`
  background: linear-gradient(
    135deg,
    ${({ theme }) => `${theme.colors.primary}08`} 0%,
    ${({ theme }) => `${theme.colors.primary}12`} 100%
  );
  border: 1px solid ${({ theme }) => `${theme.colors.primary}30`};
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1.5;
  width: 100%;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 0 2px 2px 0;
  }

  svg {
    margin-top: 2px;
    flex-shrink: 0;
    background: ${({ theme }) => `${theme.colors.primary}20`};
    padding: 6px;
    border-radius: 8px;
    font-size: 0.9rem;
  }

  span {
    flex: 1;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 0.85rem;
    gap: 10px;
  }

  @media (max-width: 480px) {
    padding: 12px 14px;
    font-size: 0.8rem;
    gap: 8px;
  }
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
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

const ProductCardWrapper = styled.div`
  width: 100%;
  height: 100%;
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 32px;
  margin-bottom: 16px;
  gap: 8px;

  @media (max-width: 768px) {
    margin-top: 24px;
    margin-bottom: 12px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    margin-top: 20px;
    margin-bottom: 10px;
    gap: 4px;
  }
`;

const PageButton = styled(Button)`
  width: 35px;
  height: 35px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.white : theme.colors.text};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.border};

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.primaryLight};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      background-color: ${({ $active, theme }) =>
        $active ? theme.colors.primary : theme.colors.surface};
      border-color: ${({ $active, theme }) =>
        $active ? theme.colors.primary : theme.colors.border};
    }
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }
`;

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = searchParams.get("q") || "";
  const initialPriceRange = searchParams.get("priceRange") || "all";
  const initialSortOption = searchParams.get("sortOption") || "relevance";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const { user, navigateToHomeByRole } = useAuth();
  const { loadProductsBySearchTerm } = useProductCatalog();
  const { isClient } = useAuth(); // Obtener el estado de cliente

  // Guardar la URL actual del catálogo en localStorage para "Seguir comprando"
  useEffect(() => {
    const currentUrl = location.pathname + location.search;
    // Solo guardar si es una ruta del catálogo o búsqueda
    if (
      currentUrl.startsWith("/catalogo") ||
      currentUrl.startsWith("/busqueda")
    ) {
      localStorage.setItem("lastCatalogUrl", currentUrl);
    }
  }, [location.pathname, location.search]);

  // Cambiar el estado inicial a null para diferenciar entre "sin búsqueda" y "búsqueda sin resultados"
  const [results, setResults] = useState(null);
  const [filteredResults, setFilteredResults] = useState([]);
  const [sortOption, setSortOption] = useState(initialSortOption);
  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchInput, setSearchInput] = useState(query); // Estado para el input de búsqueda
  // Validar que el límite inicial sea mínimo 144
  const initialLimit = parseInt(searchParams.get("limit") || "144", 10);
  const validInitialLimit = initialLimit < 144 ? 144 : initialLimit;
  const [productsPerPage, setProductsPerPage] = useState(validInitialLimit); // Estado para productos por página
  const [currentLimit, setCurrentLimit] = useState(validInitialLimit); // Estado para el límite actual

  // Estado para modal de filtros móviles
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  // userAccess con useMemo para evitar advertencia de dependencias
  const userAccess = React.useMemo(() => user?.EMPRESAS || [], [user]);

  // Ref para saber si ya se hizo scroll al producto
  const scrollToProductDoneRef = React.useRef(false);
  // Ref para rastrear los filtros anteriores para limpiar producto guardado cuando cambien
  const prevFiltersForProductRef = React.useRef(null);

  // Actualizar la URL cuando cambian los filtros o la página
  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (priceRange && priceRange !== "all") params.priceRange = priceRange;
    if (sortOption && sortOption !== "relevance")
      params.sortOption = sortOption;
    if (currentPage && currentPage !== 1) params.page = currentPage;
    // Validar que el límite sea mínimo 144
    const validLimit = productsPerPage < 144 ? 144 : productsPerPage;
    if (validLimit && validLimit !== 144) params.limit = validLimit;
    // Siempre incluir limit en la URL, incluso si es 144 (valor por defecto)
    if (!params.limit) params.limit = validLimit.toString();
    setSearchParams(params, { replace: true });
  }, [
    query,
    priceRange,
    sortOption,
    currentPage,
    productsPerPage,
    setSearchParams,
  ]);

  // Buscar productos cuando cambia la query
  useEffect(() => {
    const fetchSearchResults = async () => {
      // Si no hay consulta, no hacemos nada
      if (!query) {
        setResults(null);
        setFilteredResults([]);
        return;
      }

      // Indicar que estamos cargando
      setLoading(true);

      try {
        // Usar la función del contexto para buscar productos
        const response = await loadProductsBySearchTerm(query);

        if (response.success && response.data) {
          // Agregar hasAccess y relevanceScore aquí si es necesario
          const queryLower = query.toLowerCase();
          const apiResults = response.data.map((product) => {
            let relevanceScore = 0;
            if (product.name && product.name.toLowerCase().includes(queryLower))
              relevanceScore += 10;
            if (
              product.name &&
              product.name.toLowerCase().startsWith(queryLower)
            )
              relevanceScore += 5;
            if (
              product.brand &&
              product.brand.toLowerCase().includes(queryLower)
            )
              relevanceScore += 3;
            if (
              product.specs &&
              product.specs.disenio &&
              product.specs.disenio.toLowerCase().includes(queryLower)
            )
              relevanceScore += 2;
            let hasAccess = false;
            if (isClient) {
              hasAccess = userAccess.includes(product.empresaId);
            } else {
              hasAccess = true; // Administradores y coordinadoras tienen acceso a todos los productos
            }
            return {
              ...product,
              relevanceScore,
              hasAccess,
            };
          });
          setResults(apiResults);
          setFilteredResults(apiResults);
        } else {
          console.error("Error en la búsqueda:", response.message);
          setResults([]);
          setFilteredResults([]);
        }
      } catch (error) {
        console.error("Error al buscar productos:", error);
        setResults([]);
        setFilteredResults([]);
      } finally {
        // Finalizar carga independientemente del resultado
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, navigate, userAccess, loadProductsBySearchTerm]);

  // Aplicar filtros y ordenamiento
  useEffect(() => {
    if (results === null) return; // No hacer nada si no hay resultados
    let filtered = [...results];

    // Separar productos con acceso y sin acceso
    const accessibleProducts = filtered.filter((product) => product.hasAccess);
    const restrictedProducts = filtered.filter((product) => !product.hasAccess);

    // Aplicar filtro de precio solo a productos con acceso
    if (priceRange !== "all") {
      const filteredAccessible = accessibleProducts.filter((item) => {
        switch (priceRange) {
          case "under-100":
            return item.price < 100;
          case "100-200":
            return item.price >= 100 && item.price <= 200;
          case "200-300":
            return item.price > 200 && item.price <= 300;
          case "over-300":
            return item.price > 300;
          default:
            return true;
        }
      });
      accessibleProducts.length = 0; // Limpiar el array
      accessibleProducts.push(...filteredAccessible); // Agregar los filtrados
    }

    // Ordenar productos con acceso según la opción seleccionada
    switch (sortOption) {
      case "price-low":
        accessibleProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        accessibleProducts.sort((a, b) => b.price - a.price);
        break;
      case "name":
        accessibleProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "discount":
        accessibleProducts.sort(
          (a, b) => (b.discount || 0) - (a.discount || 0)
        );
        break;
      case "relevance":
      default:
        accessibleProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
    }

    // Ordenar productos restringidos por relevancia
    restrictedProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Combinar productos con acceso primero, luego los restringidos
    const finalResults = [...accessibleProducts, ...restrictedProducts];
    setFilteredResults(finalResults);
  }, [results, sortOption, priceRange]);

  // Cuando cambian los filtros o la página desde la URL, actualiza el estado local
  useEffect(() => {
    setSortOption(initialSortOption);
    setPriceRange(initialPriceRange);
    setCurrentPage(initialPage);
  }, [initialSortOption, initialPriceRange, initialPage]);

  // Sincronizar searchInput con la query de la URL
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Sincronizar estados con parámetros de URL al cargar la página
  useEffect(() => {
    const limitFromUrl = parseInt(searchParams.get("limit") || "144", 10);
    // Validar que el límite sea mínimo 144
    const validLimit = limitFromUrl < 144 ? 144 : limitFromUrl;
    if (validLimit !== productsPerPage) {
      setProductsPerPage(validLimit);
      setCurrentLimit(validLimit);
    }
  }, [searchParams, productsPerPage]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reiniciar a la primera página al cambiar filtro
  };

  const handlePriceRangeChange = (e) => {
    setPriceRange(e.target.value);
    setCurrentPage(1); // Reiniciar a la primera página al cambiar filtro
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (e) => {
    const newLimit = Number(e.target.value);
    // Validar que el límite sea mínimo 144
    const validLimit = newLimit < 144 ? 144 : newLimit;
    setProductsPerPage(validLimit);
    setCurrentLimit(validLimit);
    setCurrentPage(1); // Reiniciar a la primera página al cambiar el límite
  };

  // Función para manejar el envío del formulario de búsqueda
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const params = new URLSearchParams();
      params.set("q", searchInput.trim());
      setSearchParams(params);
    }
  };

  // Función para limpiar la búsqueda
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchParams({});
  };

  // Funciones para modal de filtros
  const openFiltersModal = () => setIsFiltersModalOpen(true);
  const closeFiltersModal = () => setIsFiltersModalOpen(false);

  // Variables de paginación y acceso
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredResults.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredResults.length / productsPerPage);

  const handleNavigate = () => {
    navigateToHomeByRole();
  };

  // Función para solicitar acceso a una empresa
  const handleRequestAccess = (empresaId) => {
    navigate(`/catalogo/${empresaId}`);
  };

  // Función para generar una clave única basada en los filtros actuales de búsqueda
  const getProductStorageKey = React.useCallback(() => {
    const filtersKey = JSON.stringify({
      query,
      sortOption,
      priceRange,
    });
    return `searchResults_lastProduct_${filtersKey}`;
  }, [query, sortOption, priceRange]);

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

      if (productElement) {
        // Usar scrollIntoView para hacer scroll hasta el producto
        productElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
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

  // Limpiar producto guardado cuando cambian los filtros de búsqueda
  React.useEffect(() => {
    const currentFiltersKey = JSON.stringify({
      query,
      sortOption,
      priceRange,
    });

    if (
      prevFiltersForProductRef.current !== null &&
      prevFiltersForProductRef.current !== currentFiltersKey
    ) {
      // Los filtros cambiaron, limpiar el producto guardado de los filtros anteriores
      try {
        const oldStorageKey = `searchResults_lastProduct_${prevFiltersForProductRef.current}`;
        localStorage.removeItem(oldStorageKey);
      } catch (error) {
        console.warn("Error clearing old product:", error);
      }
      scrollToProductDoneRef.current = false;
    }

    prevFiltersForProductRef.current = currentFiltersKey;
  }, [query, sortOption, priceRange]);

  // Hacer scroll al producto cuando se cargan los resultados
  React.useEffect(() => {
    if (
      !loading &&
      filteredResults.length > 0 &&
      currentProducts.length > 0 &&
      !scrollToProductDoneRef.current
    ) {
      const lastViewedProductId = getLastViewedProduct();
      if (lastViewedProductId) {
        // Esperar un poco para que el DOM se renderice completamente
        const timer = setTimeout(() => {
          scrollToProduct(lastViewedProductId);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [
    loading,
    filteredResults,
    currentProducts,
    getLastViewedProduct,
    scrollToProduct,
  ]);

  // Handler para cuando se hace clic en un producto
  const handleProductClick = React.useCallback(
    (product) => {
      if (!product || !product.id) return;

      // Guardar el ID del producto antes de navegar
      saveLastViewedProduct(product.id);

      // Construir la URL anterior con todos los parámetros de búsqueda
      let currentUrl = `/busqueda?q=${encodeURIComponent(query)}`;
      if (sortOption && sortOption !== "relevance") {
        currentUrl += `&sortOption=${sortOption}`;
      }
      if (priceRange && priceRange !== "all") {
        currentUrl += `&priceRange=${priceRange}`;
      }
      if (currentPage && currentPage !== 1) {
        currentUrl += `&page=${currentPage}`;
      }
      if (productsPerPage && productsPerPage !== 144) {
        currentUrl += `&limit=${productsPerPage}`;
      }

      // Navegar al detalle del producto
      navigate(
        `/productos/${product.id}?prevUrl=${encodeURIComponent(currentUrl)}`,
        {
          state: {
            product,
            empresaId: product.empresaId,
          },
          replace: false,
        }
      );
    },
    [
      saveLastViewedProduct,
      query,
      sortOption,
      priceRange,
      currentPage,
      productsPerPage,
      navigate,
    ]
  );

  // Función para obtener las opciones de ordenamiento
  const getSortOptions = () => {
    return [
      { value: "relevance", label: "Relevancia" },
      { value: "price-low", label: "Precio: Menor a Mayor" },
      { value: "price-high", label: "Precio: Mayor a Menor" },
      { value: "name", label: "Nombre" },
      { value: "discount", label: "Mayor descuento" },
    ];
  };

  // Función para obtener las opciones de filtro de precio
  const getPriceFilterOptions = () => {
    return [
      { value: "all", label: "Todos los precios" },
      { value: "under-100", label: "Menos de $100" },
      { value: "100-200", label: "$100 - $200" },
      { value: "200-300", label: "$200 - $300" },
      { value: "over-300", label: "Más de $300" },
    ];
  };

  return (
    <PageContainer
      style={{ padding: "16px" }}
    >
      <PageHeader>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <PageTitle>Resultados de búsqueda</PageTitle>
          {results && (
            <SearchInfo>
              - Se encontraron {filteredResults.length} resultados para "{query}
              "
            </SearchInfo>
          )}
        </div>
      </PageHeader>

      {/* Estado: Cargando resultados */}
      {loading && (
        <NoResultsContainer>
          <RenderIcon
            name="FaSpinner"
            size={30}
            style={{ animation: "spin 1s linear infinite" }}
          />
          <NoResultsTitle>Buscando productos...</NoResultsTitle>
          <NoResultsText>
            Estamos buscando los mejores resultados para "{query}".
          </NoResultsText>
        </NoResultsContainer>
      )}

      {/* Barra de búsqueda */}
      <SearchBarContainer>
        <SearchForm onSubmit={handleSearchSubmit}>
          <SearchInputContainer>
            <Input
              type="text"
              placeholder="Buscar productos en todas las empresas..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIconName="FaMagnifyingGlass"
              fullWidth={true}
            />
          </SearchInputContainer>
          <SearchButtonContainer>
            <Button
              text="Buscar"
              variant="solid"
              type="submit"
              leftIconName="FaMagnifyingGlass"
              disabled={!searchInput.trim()}
            />
            {query && (
              <Button
                text="Limpiar"
                variant="outlined"
                onClick={handleClearSearch}
                leftIconName="FaXmark"
              />
            )}
          </SearchButtonContainer>
        </SearchForm>
      </SearchBarContainer>

      {/* Estado: No hay consulta de búsqueda */}
      {!loading && results === null && (
        <NoResultsContainer>
          <RenderIcon name="FaMagnifyingGlass" size={30} />
          <NoResultsTitle>Busca en todas las empresas</NoResultsTitle>
          <NoResultsText>
            Escribe el nombre del producto, marca o características que buscas
            para encontrar los mejores resultados en todas las empresas
            disponibles.
          </NoResultsText>
        </NoResultsContainer>
      )}

      {/* Estado: Hay resultados de búsqueda */}
      {!loading && results && results.length > 0 && (
        <>
          {/* Botón de filtros para móvil */}
          <MobileFiltersButton onClick={openFiltersModal}>
            <RenderIcon name="FaFilter" size={16} />
            <span>Filtros y Ordenamiento</span>
            <span
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "0.8rem",
              }}
            >
              {filteredResults.length}
            </span>
          </MobileFiltersButton>

          {/* Barra de filtros para desktop */}
          <FiltersBar>
            <FiltersContent>
              <FiltersHeader>
                <FiltersTitle>Filtros y Ordenamiento</FiltersTitle>

                {/* Mostrar aviso si hay productos restringidos */}
                {results && results.some((product) => !product.hasAccess) && (
                  <RestrictedProductsNotice>
                    <RenderIcon name="FaCircleInfo" size={16} />
                    <span>
                      Algunos productos requieren autorización especial. Los
                      filtros se aplican solo a productos accesibles, mientras
                      que los productos restringidos aparecen al final de la
                      lista.
                    </span>
                  </RestrictedProductsNotice>
                )}

                <FiltersControls>
                  <FilterGroup>
                    <Select
                      options={getPriceFilterOptions()}
                      value={priceRange}
                      onChange={handlePriceRangeChange}
                      placeholder="Seleccionar precio"
                      width="100%"
                      label="Rango de Precio"
                      name="priceRange"
                    />
                  </FilterGroup>

                  <FilterGroup>
                    <Select
                      options={getSortOptions()}
                      value={sortOption}
                      onChange={handleSortChange}
                      placeholder="Ordenar por..."
                      width="100%"
                      label="Ordenar por"
                      name="sortOption"
                    />
                  </FilterGroup>

                  <FilterGroup>
                    <Select
                      options={[
                        { value: 144, label: "144 productos" },
                        { value: 288, label: "288 productos" },
                        { value: 432, label: "432 productos" },
                        { value: 576, label: "576 productos" },
                      ]}
                      value={currentLimit}
                      onChange={handleItemsPerPageChange}
                      label="Productos por página"
                      placeholder="Seleccionar cantidad"
                      width="100%"
                      name="itemsPerPage"
                    />
                  </FilterGroup>
                </FiltersControls>
              </FiltersHeader>
            </FiltersContent>
          </FiltersBar>

          {filteredResults.length > 0 && (
            <div
              style={{
                textAlign: "right",
                color: ({ theme }) => theme.colors.textLight,
                marginBottom: "10px",
                fontSize: "0.9rem",
                padding: "0 4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: window.innerWidth <= 480 ? "0.8rem" : "0.9rem",
                  }}
                >
                  Mostrando {indexOfFirstProduct + 1}-
                  {Math.min(indexOfLastProduct, filteredResults.length)} de{" "}
                  {filteredResults.length} productos
                </span>
              </div>
            </div>
          )}

          <ProductsGrid>
            {currentProducts.map((product, index) => (
              <ProductCardWrapper
                key={`${product.empresaId}-${product.id}-${
                  indexOfFirstProduct + index
                }`}
                data-product-id={product.id}
              >
                <ProductCard
                  product={product}
                  lineConfig={
                    PRODUCT_LINE_CONFIG[product.lineaNegocio] ||
                    PRODUCT_LINE_CONFIG.DEFAULT
                  }
                  restricted={!product.hasAccess}
                  onRequestAccess={handleRequestAccess}
                  onClick={handleProductClick}
                  // Pasar información de búsqueda para preservar contexto
                  currentFilters={{
                    searchTerm: query,
                    sortBy: sortOption,
                    priceRange: priceRange,
                  }}
                  currentSearch={query}
                  currentSort={sortOption}
                />
              </ProductCardWrapper>
            ))}
          </ProductsGrid>

          {/* Agregar el componente de paginación */}
          {filteredResults.length > productsPerPage && (
            <PaginationContainer>
              <PageButton
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                leftIconName={"FaAngleDoubleLeft"}
                size="small"
              />

              <PageButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                leftIconName={"FaAngleLeft"}
                size="small"
              />

              {/* Generar botones de página */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;

                // Mostrar máximo 5 botones de página
                if (
                  pageNumber === 1 || // Primera página
                  pageNumber === totalPages || // Última página
                  (pageNumber >= currentPage - 1 &&
                    pageNumber <= currentPage + 1) // Páginas cercanas a la actual
                ) {
                  return (
                    <PageButton
                      key={`page-${pageNumber}`}
                      $active={currentPage === pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      text={pageNumber}
                      size="small"
                    />
                  );
                } else if (
                  (pageNumber === 2 && currentPage > 3) || // Mostrar puntos suspensivos después de la primera página
                  (pageNumber === totalPages - 1 &&
                    currentPage < totalPages - 2) // Mostrar puntos suspensivos antes de la última página
                ) {
                  return <span key={`dots-${pageNumber}`}>...</span>;
                }
                return null;
              })}

              <PageButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                leftIconName={"FaAngleRight"}
                size="small"
              />

              <PageButton
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                leftIconName={"FaAngleDoubleRight"}
                size="small"
              />
            </PaginationContainer>
          )}

          {filteredResults.length === 0 && (
            <NoResultsContainer>
              <NoResultsIcon>🔍</NoResultsIcon>
              <NoResultsTitle>
                No se encontraron productos con los filtros seleccionados
              </NoResultsTitle>
              <NoResultsText>
                Prueba con otros filtros o busca con términos más generales.
              </NoResultsText>
              <Button
                text="Limpiar filtros"
                variant="outlined"
                onClick={() => {
                  setSortOption("relevance");
                  setPriceRange("all");
                }}
              />
            </NoResultsContainer>
          )}
        </>
      )}

      {/* Modal de filtros para móviles */}
      <FiltersModalOverlay
        $isOpen={isFiltersModalOpen}
        onClick={closeFiltersModal}
      >
        <FiltersModalContent onClick={(e) => e.stopPropagation()}>
          <FiltersModalHeader>
            <FiltersModalTitle>Filtros y Ordenamiento</FiltersModalTitle>
            <CloseFiltersButton onClick={closeFiltersModal}>
              <RenderIcon name="FaXmark" size={20} />
            </CloseFiltersButton>
          </FiltersModalHeader>

          {/* Contenido del modal */}
          <div style={{ padding: "0" }}>
            {/* Mostrar aviso si hay productos restringidos */}
            {results && results.some((product) => !product.hasAccess) && (
              <RestrictedProductsNotice>
                <RenderIcon name="FaCircleInfo" size={16} />
                <span>
                  Algunos productos requieren autorización especial. Los filtros
                  se aplican solo a productos accesibles, mientras que los
                  productos restringidos aparecen al final de la lista.
                </span>
              </RestrictedProductsNotice>
            )}

            {/* Controles de filtros */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                marginTop: "20px",
                marginBottom: "20px",
              }}
            >
              <div>
                <FilterLabel>Rango de Precio</FilterLabel>
                <Select
                  options={getPriceFilterOptions()}
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                  placeholder="Seleccionar precio"
                  width="100%"
                  label=""
                  name="priceRange"
                />
              </div>

              <div>
                <FilterLabel>Ordenar por</FilterLabel>
                <Select
                  options={getSortOptions()}
                  value={sortOption}
                  onChange={handleSortChange}
                  placeholder="Ordenar por..."
                  width="100%"
                  label=""
                  name="sortOption"
                />
              </div>

              <div>
                <FilterLabel>Productos por página</FilterLabel>
                <Select
                  options={[
                    { value: 144, label: "144 productos" },
                    { value: 288, label: "288 productos" },
                    { value: 432, label: "432 productos" },
                    { value: 576, label: "576 productos" },
                  ]}
                  value={currentLimit}
                  onChange={handleItemsPerPageChange}
                  label=""
                  placeholder="Seleccionar cantidad"
                  width="100%"
                  name="itemsPerPage"
                />
              </div>
            </div>
          </div>
        </FiltersModalContent>
      </FiltersModalOverlay>

      {/* Estado: No hay resultados para la búsqueda */}
      {!loading && results && results.length === 0 && (
        <NoResultsContainer>
          <RenderIcon name="FaMagnifyingGlass" size={30} />
          <NoResultsTitle>No se encontraron resultados</NoResultsTitle>
          <NoResultsText>
            No pudimos encontrar productos que coincidan con "{query}". Intenta
            con otras palabras o revisa la ortografía.
          </NoResultsText>
          <Button
            text="Volver al inicio"
            variant="solid"
            backgroundColor={({ theme }) => theme.colors.primary}
            onClick={handleNavigate}
          />
        </NoResultsContainer>
      )}
    </PageContainer>
  );
};

export default SearchResults;
