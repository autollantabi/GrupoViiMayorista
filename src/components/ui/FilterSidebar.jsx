import React, { useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import Button from "./Button";
import { CATEGORY_TYPE_LABELS } from "../../constants/productLineConfig";
import RenderIcon from "./RenderIcon";
import Select from "./Select";
import Input from "./Input";
import { TAXES, calculatePriceWithIVA } from "../../constants/taxes";
import { useAppTheme } from "../../context/AppThemeContext";

const SidebarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 300px;

  @media (max-width: 1024px) {
    max-width: 100%;
  }
`;

const SidebarContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  box-shadow: 0 2px 6px ${({ theme }) => theme.colors.shadow};
  padding: 20px;
  height: fit-content;
  margin-right: 20px;
  min-width: 250px;

  @media (max-width: 1024px) {
    margin-right: 0;
    margin-bottom: 16px;
    min-width: auto;
  }

  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 8px;
  }
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

const SectionSubTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1rem;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: ${({ $isNotCollapsible }) =>
    $isNotCollapsible ? "flex-start" : "space-between"};
  gap: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  .title-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  svg {
    color: ${({ theme }) => theme.colors.primary};
    transition: transform 0.2s ease;
    transform: ${({ $isCollapsed }) =>
      $isCollapsed ? "rotate(-90deg)" : "rotate(0deg)"};
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 24px;
`;

const CollapsibleContent = styled.div`
  overflow: visible;
  transition: all 0.3s ease;
  max-height: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "none")};
  opacity: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "1")};
  margin-top: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "12px")};
  pointer-events: ${({ $isCollapsed }) => ($isCollapsed ? "none" : "auto")};
  visibility: ${({ $isCollapsed }) => ($isCollapsed ? "hidden" : "visible")};
`;

const ChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: ${({ selected, disabled, theme }) =>
    selected
      ? theme.colors.primary
      : disabled
      ? `${theme.colors.textLight}15`
      : theme.colors.surface};
  color: ${({ selected, disabled, theme }) =>
    selected
      ? theme.colors.white
      : disabled
      ? theme.colors.textLight
      : theme.colors.text};
  border: 1px solid
    ${({ selected, disabled, theme }) =>
      selected
        ? theme.colors.primary
        : disabled
        ? theme.colors.border
        : theme.colors.border};
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

  &:hover {
    background-color: ${({ selected, disabled, theme }) =>
      !disabled &&
      (selected ? theme.colors.primaryDark : theme.colors.primaryLight)};
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(-1px)")};
  }

  &:active {
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(0)")};
  }
`;

const ProductsCount = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
  margin-bottom: 16px;
  text-align: center;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const BusinessLineSelector = styled.div`
  margin-bottom: 24px;
`;

const BusinessLineButton = styled.button`
  display: block;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 8px;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.white : theme.colors.text};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.border};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.primaryDark : theme.colors.primaryLight};
    color: ${({ $active, theme }) =>
      $active ? theme.colors.white : theme.colors.primary};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const PriceRangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PriceSelectGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PriceLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 4px;
`;

const SearchInput = styled.div`
  margin-bottom: 12px;
  position: relative;
`;

const SearchInputField = styled(Input)`
  width: 100%;
  font-size: 0.85rem;

  input {
    padding: 6px 30px 6px 8px;
    font-size: 0.85rem;
  }
`;

const ClearSearchButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }
`;

// Función para obtener filtros de neumáticos
function getNeumaticosFilters(productos, selectedRin, selectedAncho) {
  if (!productos || productos.length === 0) {
    return {
      rinOptions: [],
      anchoOptions: [],
      altoOptions: [],
    };
  }

  const llantasProducts = productos.filter(
    (product) => product.lineaNegocio === "LLANTAS"
  );

  const rinSet = new Set();
  llantasProducts.forEach((product) => {
    if (product.specs && product.specs.rin) {
      rinSet.add(String(product.specs.rin));
    }
  });

  const anchoSet = new Set();
  if (selectedRin) {
    const filteredByRin = llantasProducts.filter(
      (product) =>
        product.specs && String(product.specs.rin) === String(selectedRin)
    );
    filteredByRin.forEach((product) => {
      if (product.specs && product.specs.ancho) {
        anchoSet.add(String(product.specs.ancho));
      }
    });
  }

  const altoSet = new Set();
  if (selectedAncho) {
    const filteredByAncho = llantasProducts.filter(
      (product) =>
        product.specs &&
        String(product.specs.rin) === String(selectedRin) &&
        String(product.specs.ancho) === String(selectedAncho)
    );
    filteredByAncho.forEach((product) => {
      if (product.specs && product.specs.serie) {
        altoSet.add(String(product.specs.serie));
      }
    });
  }

  return {
    rinOptions: Array.from(rinSet).sort((a, b) => parseInt(a) - parseInt(b)),
    anchoOptions: Array.from(anchoSet).sort(
      (a, b) => parseInt(a) - parseInt(b)
    ),
    altoOptions: Array.from(altoSet).sort((a, b) => parseInt(a) - parseInt(b)),
  };
}

// Styled components para modal móvil
const MobileFilterButton = styled.button`
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

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    display: flex;
  }
`;

const ModalOverlay = styled.div`
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

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 32px ${({ theme }) => theme.colors.shadow};

  @media (max-width: 768px) {
    padding: 20px;
    max-width: 95vw;
    max-height: 95vh;
  }

  @media (max-width: 480px) {
    padding: 16px;
    max-width: 98vw;
    max-height: 98vh;
  }
`;

const MobileFilterSection = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 16px;
  }
`;

const MobileSectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 12px;
  }
`;

const MobileSelect = styled(Select)`
  width: 100% !important;
  margin-bottom: 8px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.3rem;
`;

const CloseButton = styled.button`
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

const FilterSidebar = React.memo(
  ({
    allProducts = [],
    lineaNegocio = "DEFAULT",
    availableBusinessLines = [],
    onBusinessLineChange,
    selectedCategories = [],
    selectedBrands = [],
    selectedPriceRange = null,
    selectedRinProp = "",
    selectedAnchoProp = "",
    selectedAltoProp = "",
    onApplyFilters,
    countFilteredProducts = 0,
  }) => {
    // Solo estado local para grupos colapsados
    const [collapsedGroups, setCollapsedGroups] = useState(new Set());

    // Estados para búsquedas de características
    const [searchTerms, setSearchTerms] = useState({});

    // Estado para modal móvil
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const { theme } = useAppTheme();

    // Detectar si estamos en móvil
    React.useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 1024);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Funciones auxiliares para el modal móvil
    const getCategoryFilters = () => {
      if (!allProducts || allProducts.length === 0) return {};

      const filters = {};
      allProducts.forEach((product) => {
        if (product.filtersByType) {
          Object.entries(product.filtersByType).forEach(([type, values]) => {
            if (!filters[type]) filters[type] = [];
            if (Array.isArray(values)) {
              values.forEach((value) => {
                const stringValue = String(value);
                if (!filters[type].find((item) => item.value === stringValue)) {
                  filters[type].push({
                    value: stringValue,
                    label: stringValue,
                    disabled: false,
                  });
                }
              });
            }
          });
        }
      });

      return filters;
    };

    const getBrandFilters = () => {
      if (!allProducts || allProducts.length === 0) return [];

      const brands = [
        ...new Set(allProducts.map((product) => product.brand).filter(Boolean)),
      ];
      return brands.map((brand) => ({
        value: String(brand),
        label: String(brand),
      }));
    };

    const getRinOptions = () => {
      if (!allProducts || allProducts.length === 0) return [];

      const rins = [
        ...new Set(
          allProducts.map((product) => product.specs?.rin).filter(Boolean)
        ),
      ];
      return rins.map((rin) => ({
        value: String(rin),
        label: String(rin),
      }));
    };

    const getAnchoOptions = () => {
      if (!allProducts || allProducts.length === 0) return [];

      const anchos = [
        ...new Set(
          allProducts.map((product) => product.specs?.ancho).filter(Boolean)
        ),
      ];
      return anchos.map((ancho) => ({
        value: String(ancho),
        label: String(ancho),
      }));
    };

    const getAltoOptions = () => {
      if (!allProducts || allProducts.length === 0) return [];

      const altos = [
        ...new Set(
          allProducts.map((product) => product.specs?.serie).filter(Boolean)
        ),
      ];
      return altos.map((alto) => ({
        value: String(alto),
        label: String(alto),
      }));
    };

    // Calcular rango de precios disponible basado en productos filtrados
    const availablePriceRange = useMemo(() => {
      if (!allProducts || allProducts.length === 0) {
        return { min: 0, max: 100 };
      }

      const relevantProducts = allProducts.filter(
        (product) =>
          lineaNegocio === "DEFAULT" || product.lineaNegocio === lineaNegocio
      );

      // Aplicar filtros actuales para obtener productos disponibles
      const availableProducts = relevantProducts.filter((product) => {
        // Filtro de categorías
        if (selectedCategories.length > 0) {
          const hasAllCategories = selectedCategories.every(
            (selectedCategory) => {
              if (!product.filtersByType) return false;
              return Object.values(product.filtersByType).some(
                (filterArray) =>
                  Array.isArray(filterArray) &&
                  filterArray.includes(selectedCategory)
              );
            }
          );
          if (!hasAllCategories) return false;
        }

        // Filtro de marcas
        if (selectedBrands.length > 0) {
          if (!selectedBrands.includes(product.brand)) return false;
        }

        // Filtros de medidas para LLANTAS
        if (lineaNegocio === "LLANTAS") {
          if (
            selectedRinProp &&
            String(product.specs?.rin) !== String(selectedRinProp)
          )
            return false;
          if (
            selectedAnchoProp &&
            String(product.specs?.ancho) !== String(selectedAnchoProp)
          )
            return false;
          if (
            selectedAltoProp &&
            String(product.specs?.serie) !== String(selectedAltoProp)
          )
            return false;
        }

        return true;
      });

      const pricesWithIVA = availableProducts
        .map((product) => {
          if (product.price === null || product.price === undefined)
            return null;

          const discountedPrice = product.discount
            ? product.price * (1 - product.discount / 100)
            : product.price;

          return calculatePriceWithIVA(
            discountedPrice,
            product.iva || TAXES.IVA_PERCENTAGE
          );
        })
        .filter((price) => price !== null);

      if (pricesWithIVA.length === 0) return { min: 0, max: 100 };

      // Redondear a múltiplos de 10
      const rawMin = Math.min(...pricesWithIVA);
      const rawMax = Math.max(...pricesWithIVA);

      return {
        min: Math.floor(rawMin / 10) * 10,
        max: Math.ceil(rawMax / 10) * 10,
      };
    }, [
      allProducts,
      lineaNegocio,
      selectedCategories,
      selectedBrands,
      selectedRinProp,
      selectedAnchoProp,
      selectedAltoProp,
    ]);

    // Calcular categorías agrupadas
    const categoriesGroupedByType = useMemo(() => {
      if (!allProducts || allProducts.length === 0) {
        return {};
      }

      const relevantProducts = allProducts.filter(
        (product) =>
          lineaNegocio === "DEFAULT" || product.lineaNegocio === lineaNegocio
      );

      const groupedFilters = {};

      relevantProducts.forEach((product) => {
        if (!product || !product.filtersByType) return;

        Object.entries(product.filtersByType).forEach(
          ([filterType, filterValues]) => {
            if (!groupedFilters[filterType]) {
              groupedFilters[filterType] = new Set();
            }

            if (Array.isArray(filterValues)) {
              filterValues.forEach((value) => {
                groupedFilters[filterType].add(value);
              });
            }
          }
        );
      });

      const result = {};
      Object.entries(groupedFilters).forEach(([type, valuesSet]) => {
        result[type] = Array.from(valuesSet).sort();
      });

      return result;
    }, [allProducts, lineaNegocio]);

    // Calcular marcas disponibles
    const availableBrands = useMemo(() => {
      if (!allProducts || allProducts.length === 0) {
        return [];
      }

      const relevantProducts = allProducts.filter(
        (product) =>
          lineaNegocio === "DEFAULT" || product.lineaNegocio === lineaNegocio
      );

      const brandsSet = new Set();

      relevantProducts.forEach((product) => {
        if (product && product.brand) {
          brandsSet.add(String(product.brand));
        }
      });

      return Array.from(brandsSet).sort();
    }, [allProducts, lineaNegocio]);

    // Calcular filtros disponibles con estado
    const availableFiltersWithStatus = useMemo(() => {
      if (!allProducts || allProducts.length === 0) {
        return { categories: {}, brands: [] };
      }

      const relevantProducts = allProducts.filter(
        (product) =>
          lineaNegocio === "DEFAULT" || product.lineaNegocio === lineaNegocio
      );

      const availableProducts = relevantProducts.filter((product) => {
        if (selectedCategories.length > 0) {
          const hasAllCategories = selectedCategories.every(
            (selectedCategory) => {
              if (!product.filtersByType) return false;
              return Object.values(product.filtersByType).some(
                (filterArray) =>
                  Array.isArray(filterArray) &&
                  filterArray.includes(selectedCategory)
              );
            }
          );
          if (!hasAllCategories) return false;
        }

        if (selectedBrands.length > 0) {
          if (!selectedBrands.includes(product.brand)) return false;
        }

        const shouldApplyPriceFilter =
          selectedPriceRange &&
          (selectedPriceRange.min > 0 ||
            selectedPriceRange.max < availablePriceRange.max);

        if (shouldApplyPriceFilter) {
          if (product.price !== null && product.price !== undefined) {
            const discountedPrice = product.discount
              ? product.price * (1 - product.discount / 100)
              : product.price;
            const priceWithIVA = calculatePriceWithIVA(
              discountedPrice,
              product.iva || TAXES.IVA_PERCENTAGE
            );

            if (
              priceWithIVA < selectedPriceRange.min ||
              priceWithIVA > selectedPriceRange.max
            ) {
              return false;
            }
          } else {
            return false;
          }
        }

        if (lineaNegocio === "LLANTAS") {
          if (
            selectedRinProp &&
            String(product.specs?.rin) !== String(selectedRinProp)
          )
            return false;
          if (
            selectedAnchoProp &&
            String(product.specs?.ancho) !== String(selectedAnchoProp)
          )
            return false;
          if (
            selectedAltoProp &&
            String(product.specs?.serie) !== String(selectedAltoProp)
          )
            return false;
        }

        return true;
      });

      const availableCategories = {};
      Object.keys(categoriesGroupedByType).forEach((filterType) => {
        availableCategories[filterType] = new Set();
      });

      const availableBrandsSet = new Set();

      availableProducts.forEach((product) => {
        if (product.filtersByType) {
          Object.entries(product.filtersByType).forEach(
            ([filterType, filterValues]) => {
              if (Array.isArray(filterValues)) {
                filterValues.forEach((value) => {
                  if (availableCategories[filterType]) {
                    availableCategories[filterType].add(value);
                  }
                });
              }
            }
          );
        }

        if (product.brand) {
          availableBrandsSet.add(product.brand);
        }
      });

      const categoriesWithStatus = {};
      Object.entries(categoriesGroupedByType).forEach(
        ([filterType, allValues]) => {
          categoriesWithStatus[filterType] = allValues.map((value) => ({
            value,
            disabled:
              !availableCategories[filterType].has(value) &&
              !selectedCategories.includes(value),
          }));
        }
      );

      const brandsWithStatus = availableBrands.map((brand) => ({
        value: brand,
        disabled:
          !availableBrandsSet.has(brand) && !selectedBrands.includes(brand),
      }));

      return {
        categories: categoriesWithStatus,
        brands: brandsWithStatus,
      };
    }, [
      allProducts,
      lineaNegocio,
      selectedCategories,
      selectedBrands,
      selectedPriceRange,
      availablePriceRange,
      categoriesGroupedByType,
      availableBrands,
      selectedRinProp,
      selectedAnchoProp,
      selectedAltoProp,
    ]);

    // Handlers simples que solo llaman a onApplyFilters
    const handleCategoryChange = useCallback(
      (category) => {
        const newCategories = selectedCategories.includes(category)
          ? selectedCategories.filter((c) => c !== category)
          : [...selectedCategories, category];

        onApplyFilters({
          categories: newCategories,
          brands: selectedBrands,
          price: selectedPriceRange,
          businessLine: lineaNegocio,
          rin: selectedRinProp,
          ancho: selectedAnchoProp,
          alto: selectedAltoProp,
        });
      },
      [
        selectedCategories,
        selectedBrands,
        selectedPriceRange,
        lineaNegocio,
        selectedRinProp,
        selectedAnchoProp,
        selectedAltoProp,
        onApplyFilters,
      ]
    );

    const handleBrandChange = useCallback(
      (brand) => {
        const newBrands = selectedBrands.includes(brand)
          ? selectedBrands.filter((b) => b !== brand)
          : [...selectedBrands, brand];

        onApplyFilters({
          categories: selectedCategories,
          brands: newBrands,
          price: selectedPriceRange,
          businessLine: lineaNegocio,
          rin: selectedRinProp,
          ancho: selectedAnchoProp,
          alto: selectedAltoProp,
        });
      },
      [
        selectedCategories,
        selectedBrands,
        selectedPriceRange,
        lineaNegocio,
        selectedRinProp,
        selectedAnchoProp,
        selectedAltoProp,
        onApplyFilters,
      ]
    );

    const handlePriceChange = useCallback(
      (type, value) => {
        const numValue = parseFloat(value) || 0;
        const newPriceRange = {
          ...selectedPriceRange,
          [type]: numValue,
        };

        if (type === "min" && newPriceRange.max < numValue) {
          newPriceRange.max = numValue;
        }

        onApplyFilters({
          categories: selectedCategories,
          brands: selectedBrands,
          price: newPriceRange,
          businessLine: lineaNegocio,
          rin: selectedRinProp,
          ancho: selectedAnchoProp,
          alto: selectedAltoProp,
        });
      },
      [
        selectedCategories,
        selectedBrands,
        selectedPriceRange,
        lineaNegocio,
        selectedRinProp,
        selectedAnchoProp,
        selectedAltoProp,
        onApplyFilters,
      ]
    );

    const handleRinChange = useCallback(
      (value) => {
        onApplyFilters({
          categories: selectedCategories,
          brands: selectedBrands,
          price: selectedPriceRange,
          businessLine: lineaNegocio,
          rin: value,
          ancho: "", // Reset ancho when rin changes
          alto: "", // Reset alto when rin changes
        });
      },
      [
        selectedCategories,
        selectedBrands,
        selectedPriceRange,
        lineaNegocio,
        onApplyFilters,
      ]
    );

    const handleAnchoChange = useCallback(
      (value) => {
        onApplyFilters({
          categories: selectedCategories,
          brands: selectedBrands,
          price: selectedPriceRange,
          businessLine: lineaNegocio,
          rin: selectedRinProp,
          ancho: value,
          alto: "", // Reset alto when ancho changes
        });
      },
      [
        selectedCategories,
        selectedBrands,
        selectedPriceRange,
        lineaNegocio,
        selectedRinProp,
        onApplyFilters,
      ]
    );

    const handleAltoChange = useCallback(
      (value) => {
        onApplyFilters({
          categories: selectedCategories,
          brands: selectedBrands,
          price: selectedPriceRange,
          businessLine: lineaNegocio,
          rin: selectedRinProp,
          ancho: selectedAnchoProp,
          alto: value,
        });
      },
      [
        selectedCategories,
        selectedBrands,
        selectedPriceRange,
        lineaNegocio,
        selectedRinProp,
        selectedAnchoProp,
        onApplyFilters,
      ]
    );

    const toggleGroup = useCallback((groupName) => {
      setCollapsedGroups((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(groupName)) {
          newSet.delete(groupName);
        } else {
          newSet.add(groupName);
        }
        return newSet;
      });
    }, []);

    // Función para manejar cambios en los términos de búsqueda
    const handleSearchChange = useCallback((filterType, value) => {
      setSearchTerms((prev) => ({
        ...prev,
        [filterType]: value,
      }));
    }, []);

    // Función para limpiar búsqueda de una característica específica
    const clearSearch = useCallback((filterType) => {
      setSearchTerms((prev) => {
        const newTerms = { ...prev };
        delete newTerms[filterType];
        return newTerms;
      });
    }, []);

    // Función para filtrar items basado en la búsqueda
    const getFilteredItems = useCallback(
      (items, filterType) => {
        const searchTerm = searchTerms[filterType] || "";
        if (!searchTerm.trim()) return items;

        return items.filter((item) =>
          item.value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      },
      [searchTerms]
    );

    const clearAllFilters = useCallback(() => {
      onApplyFilters({
        categories: [],
        brands: [],
        price: {
          min: availablePriceRange.min, // Ya está redondeado
          max: availablePriceRange.max, // Ya está redondeado
        },
        businessLine: lineaNegocio,
        rin: "",
        ancho: "",
        alto: "",
      });
    }, [
      lineaNegocio,
      availablePriceRange.min,
      availablePriceRange.max,
      onApplyFilters,
    ]);

    const neumaticosFilters = useMemo(() => {
      if (lineaNegocio !== "LLANTAS") return null;
      return getNeumaticosFilters(
        allProducts,
        selectedRinProp,
        selectedAnchoProp
      );
    }, [allProducts, lineaNegocio, selectedRinProp, selectedAnchoProp]);

    const priceOptions = useMemo(() => {
      const options = [];
      const minRounded = availablePriceRange.min; // Ya está redondeado
      const maxRounded = availablePriceRange.max; // Ya está redondeado

      for (let price = minRounded; price <= maxRounded; price += 10) {
        options.push({
          label: `$${price}`,
          value: price,
        });
      }

      return options;
    }, [availablePriceRange.min, availablePriceRange.max]);

    const maxPriceOptions = useMemo(() => {
      const options = [];
      const maxRounded = availablePriceRange.max; // Ya está redondeado
      const currentMin = selectedPriceRange?.min || availablePriceRange.min;

      // Asegurar que el mínimo sea al menos el valor mínimo seleccionado
      const startPrice = Math.max(currentMin, availablePriceRange.min);

      for (let price = startPrice; price <= maxRounded; price += 10) {
        options.push({
          label: `$${price}`,
          value: price,
        });
      }

      return options;
    }, [
      availablePriceRange.max,
      availablePriceRange.min,
      selectedPriceRange?.min,
    ]);

    return (
      <>
        {/* Botón de filtros para móvil */}
        <MobileFilterButton onClick={openModal}>
          <RenderIcon name="FaFilter" size={16} />
          <span>Filtros</span>
          <span
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "0.8rem",
            }}
          >
            {countFilteredProducts}
          </span>
        </MobileFilterButton>

        {/* Sidebar normal para desktop */}
        <SidebarWrapper style={{ display: isMobile ? "none" : "flex" }}>
          <SidebarContainer>
            <SectionTitle>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <RenderIcon name="FaFilter" size={16} />
                Filtros
              </div>
              <Button
                text="Limpiar filtros"
                variant="outlined"
                leftIconName="FaTimes"
                size="small"
                onClick={clearAllFilters}
                fullWidth={false}
              />
            </SectionTitle>
            {countFilteredProducts > 0 && (
              <ProductsCount>
                {countFilteredProducts} productos encontrados
              </ProductsCount>
            )}

            {availableBusinessLines.length > 1 && (
              <BusinessLineSelector>
                <SectionSubTitle $isNotCollapsible>
                  <RenderIcon name="FaIndustry" size={18} />
                  Línea de Negocio
                </SectionSubTitle>
                {availableBusinessLines.map((line) => (
                  <BusinessLineButton
                    key={line}
                    $active={lineaNegocio === line}
                    onClick={() =>
                      onBusinessLineChange && onBusinessLineChange(line)
                    }
                  >
                    {line}
                  </BusinessLineButton>
                ))}
              </BusinessLineSelector>
            )}
            {lineaNegocio === "LLANTAS" && neumaticosFilters && (
              <FilterGroup>
                <SectionSubTitle
                  $isCollapsed={collapsedGroups.has("medidas")}
                  onClick={() => toggleGroup("medidas")}
                >
                  <div className="title-content">
                    <RenderIcon name="FaRuler" size={18} />
                    Filtrar por medidas
                  </div>
                  <RenderIcon name="FaChevronDown" size={14} />
                </SectionSubTitle>
                <CollapsibleContent
                  $isCollapsed={collapsedGroups.has("medidas")}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Select
                      options={neumaticosFilters.rinOptions.map((rin) => ({
                        label: rin,
                        value: rin,
                      }))}
                      value={selectedRinProp}
                      onChange={(e) => handleRinChange(e.target.value)}
                      placeholder="Rin"
                      width="120px"
                      withSearch
                      disabled={false}
                    />
                    <Select
                      options={neumaticosFilters.anchoOptions.map((ancho) => ({
                        label: ancho,
                        value: ancho,
                      }))}
                      value={selectedAnchoProp}
                      onChange={(e) => handleAnchoChange(e.target.value)}
                      placeholder="Ancho"
                      width="120px"
                      disabled={!selectedRinProp}
                    />
                    {neumaticosFilters.altoOptions.length > 0 && (
                      <Select
                        options={neumaticosFilters.altoOptions.map((alto) => ({
                          label: alto,
                          value: alto,
                        }))}
                        value={selectedAltoProp}
                        onChange={(e) => handleAltoChange(e.target.value)}
                        placeholder="Alto/Serie"
                        width="120px"
                        disabled={!selectedAnchoProp}
                      />
                    )}
                  </div>
                </CollapsibleContent>
              </FilterGroup>
            )}
            {availableFiltersWithStatus.brands.length > 0 && (
              <FilterGroup>
                <SectionSubTitle
                  $isCollapsed={collapsedGroups.has("marcas")}
                  onClick={() => toggleGroup("marcas")}
                >
                  <div className="title-content">
                    <RenderIcon name="FaTrademark" size={18} />
                    Marcas
                  </div>
                  <RenderIcon name="FaChevronDown" size={14} />
                </SectionSubTitle>
                <CollapsibleContent
                  $isCollapsed={collapsedGroups.has("marcas")}
                >
                  {availableFiltersWithStatus.brands.length > 15 && (
                    <SearchInput>
                      <SearchInputField
                        placeholder="Buscar marcas..."
                        value={searchTerms["marcas"] || ""}
                        onChange={(e) =>
                          handleSearchChange("marcas", e.target.value)
                        }
                        leftIconName="FaSearch"
                        fullWidth
                      />
                      {searchTerms["marcas"] && (
                        <ClearSearchButton
                          onClick={() => clearSearch("marcas")}
                          title="Limpiar búsqueda"
                        >
                          <RenderIcon name="FaTimes" size={12} />
                        </ClearSearchButton>
                      )}
                    </SearchInput>
                  )}
                  <ChipsContainer>
                    {getFilteredItems(
                      availableFiltersWithStatus.brands,
                      "marcas"
                    ).map((brandItem, index) => (
                      <Chip
                        key={`brand-${brandItem.value}-${index}`}
                        selected={selectedBrands.includes(brandItem.value)}
                        disabled={brandItem.disabled}
                        onClick={() =>
                          !brandItem.disabled &&
                          handleBrandChange(brandItem.value)
                        }
                      >
                        {brandItem.value}
                      </Chip>
                    ))}
                  </ChipsContainer>
                </CollapsibleContent>
              </FilterGroup>
            )}
            {Object.keys(availableFiltersWithStatus.categories).length > 0 &&
              Object.entries(availableFiltersWithStatus.categories).map(
                ([filterType, filterItems]) => (
                  <FilterGroup key={filterType}>
                    <SectionSubTitle
                      $isCollapsed={collapsedGroups.has(filterType)}
                      onClick={() => toggleGroup(filterType)}
                    >
                      <div className="title-content">
                        <RenderIcon name="FaTag" size={18} />
                        {CATEGORY_TYPE_LABELS[filterType] ||
                          filterType.charAt(0).toUpperCase() +
                            filterType.slice(1)}
                      </div>
                      <RenderIcon name="FaChevronDown" size={14} />
                    </SectionSubTitle>
                    <CollapsibleContent
                      $isCollapsed={collapsedGroups.has(filterType)}
                    >
                      {filterItems.length > 15 && (
                        <SearchInput>
                          <SearchInputField
                            placeholder={`Buscar en ${
                              CATEGORY_TYPE_LABELS[filterType] || filterType
                            }...`}
                            value={searchTerms[filterType] || ""}
                            onChange={(e) =>
                              handleSearchChange(filterType, e.target.value)
                            }
                            leftIconName="FaSearch"
                            fullWidth
                          />
                          {searchTerms[filterType] && (
                            <ClearSearchButton
                              onClick={() => clearSearch(filterType)}
                              title="Limpiar búsqueda"
                            >
                              <RenderIcon name="FaTimes" size={12} />
                            </ClearSearchButton>
                          )}
                        </SearchInput>
                      )}
                      <ChipsContainer>
                        {getFilteredItems(filterItems, filterType).map(
                          (filterItem, index) => (
                            <Chip
                              key={`${filterType}-${filterItem.value}-${index}`}
                              selected={selectedCategories.includes(
                                filterItem.value
                              )}
                              disabled={filterItem.disabled}
                              onClick={() =>
                                !filterItem.disabled &&
                                handleCategoryChange(filterItem.value)
                              }
                            >
                              {filterItem.value}
                            </Chip>
                          )
                        )}
                      </ChipsContainer>
                    </CollapsibleContent>
                  </FilterGroup>
                )
              )}

            <FilterGroup>
              <SectionSubTitle
                $isCollapsed={collapsedGroups.has("precio")}
                onClick={() => toggleGroup("precio")}
              >
                <div className="title-content">
                  <RenderIcon name="FaDollarSign" size={16} />
                  Rango de Precio
                </div>
                <RenderIcon name="FaChevronDown" size={14} />
              </SectionSubTitle>
              <CollapsibleContent $isCollapsed={collapsedGroups.has("precio")}>
                <PriceRangeContainer>
                  <PriceSelectGroup>
                    <div>
                      <PriceLabel>Desde:</PriceLabel>
                      <Select
                        options={priceOptions}
                        value={
                          selectedPriceRange?.min || availablePriceRange.min
                        }
                        onChange={(e) =>
                          handlePriceChange("min", e.target.value)
                        }
                        placeholder="Precio mínimo"
                        width="100px"
                        withSearch
                      />
                    </div>
                    <div>
                      <PriceLabel>Hasta:</PriceLabel>
                      <Select
                        options={maxPriceOptions}
                        value={
                          selectedPriceRange?.max || availablePriceRange.max
                        }
                        onChange={(e) =>
                          handlePriceChange("max", e.target.value)
                        }
                        placeholder="Precio máximo"
                        width="100px"
                        withSearch
                      />
                    </div>
                  </PriceSelectGroup>
                </PriceRangeContainer>
              </CollapsibleContent>
            </FilterGroup>
          </SidebarContainer>
        </SidebarWrapper>

        {/* Modal para móviles */}
        <ModalOverlay $isOpen={isModalOpen} onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Filtros de Productos</ModalTitle>
              <CloseButton onClick={closeModal}>
                <RenderIcon name="FaTimes" size={20} />
              </CloseButton>
            </ModalHeader>

            {/* Contenido del modal optimizado para móviles */}
            <div style={{ padding: "0" }}>
              {/* Botón de Limpiar Filtros */}
              <div
                style={{
                  display: "flex",
                  marginBottom: "20px",
                  padding: "0 16px",
                }}
              >
                <Button
                  text="Limpiar Filtros"
                  variant="outlined"
                  onClick={() => {
                    // Limpiar todos los filtros
                    onApplyFilters({
                      categories: [],
                      brands: [],
                      price: null,
                      businessLine: "DEFAULT",
                      rin: "",
                      ancho: "",
                      alto: "",
                    });
                    closeModal();
                  }}
                  style={{ width: "100%" }}
                />
              </div>

              {/* Línea de Negocio */}
              {availableBusinessLines.length > 1 && (
                <MobileFilterSection>
                  <MobileSectionTitle>
                    <RenderIcon name="FaIndustry" size={18} />
                    Línea de Negocio
                  </MobileSectionTitle>
                  {availableBusinessLines.map((line) => (
                    <div
                      key={line}
                      style={{
                        padding: "8px 12px",
                        marginBottom: "8px",
                        backgroundColor:
                          lineaNegocio === line
                            ? theme.colors.primary
                            : theme.colors.surface,
                        color:
                          lineaNegocio === line
                            ? theme.colors.white
                            : theme.colors.text,
                        border: "1px solid",
                        borderColor:
                          lineaNegocio === line
                            ? theme.colors.primary
                            : theme.colors.border,
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontSize: "0.9rem",
                      }}
                      onClick={() =>
                        onBusinessLineChange && onBusinessLineChange(line)
                      }
                    >
                      {line}
                    </div>
                  ))}
                </MobileFilterSection>
              )}

              {/* Filtros específicos para LLANTAS */}
              {lineaNegocio === "LLANTAS" && neumaticosFilters && (
                <MobileFilterSection>
                  <MobileSectionTitle>
                    <RenderIcon name="FaRuler" size={18} />
                    Filtrar por medidas
                  </MobileSectionTitle>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          marginBottom: "8px",
                          fontSize: "0.9rem",
                          color: theme.colors.textLight,
                        }}
                      >
                        Rin:
                      </div>
                      <Select
                        options={neumaticosFilters.rinOptions.map((rin) => ({
                          label: rin,
                          value: rin,
                        }))}
                        value={selectedRinProp}
                        onChange={(e) => handleRinChange(e.target.value)}
                        placeholder="Rin"
                        width="100%"
                        label=""
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          marginBottom: "8px",
                          fontSize: "0.9rem",
                          color: theme.colors.textLight,
                        }}
                      >
                        Ancho:
                      </div>
                      <Select
                        options={neumaticosFilters.anchoOptions.map(
                          (ancho) => ({
                            label: ancho,
                            value: ancho,
                          })
                        )}
                        value={selectedAnchoProp}
                        onChange={(e) => handleAnchoChange(e.target.value)}
                        placeholder="Ancho"
                        width="100%"
                        disabled={!selectedRinProp}
                        label=""
                      />
                    </div>
                    {neumaticosFilters.altoOptions.length > 0 && (
                      <div>
                        <div
                          style={{
                            marginBottom: "8px",
                            fontSize: "0.9rem",
                            color: theme.colors.textLight,
                          }}
                        >
                          Alto:
                        </div>
                        <Select
                          options={neumaticosFilters.altoOptions.map(
                            (alto) => ({
                              label: alto,
                              value: alto,
                            })
                          )}
                          value={selectedAltoProp}
                          onChange={(e) => handleAltoChange(e.target.value)}
                          placeholder="Alto"
                          width="100%"
                          disabled={!selectedAnchoProp}
                          label=""
                        />
                      </div>
                    )}
                  </div>
                </MobileFilterSection>
              )}

              {/* Marcas */}
              {availableFiltersWithStatus.brands.length > 0 && (
                <MobileFilterSection>
                  <MobileSectionTitle>
                    <RenderIcon name="FaTrademark" size={18} />
                    Marcas
                  </MobileSectionTitle>
                  {availableFiltersWithStatus.brands.length > 15 && (
                    <div style={{ marginBottom: "12px" }}>
                      <Input
                        placeholder="Buscar marcas..."
                        value={searchTerms["marcas"] || ""}
                        onChange={(e) =>
                          handleSearchChange("marcas", e.target.value)
                        }
                        leftIconName="FaSearch"
                        fullWidth={true}
                      />
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {getFilteredItems(
                      availableFiltersWithStatus.brands,
                      "marcas"
                    ).map((brandItem, index) => (
                      <div
                        key={`brand-${brandItem.value}-${index}`}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "16px",
                          fontSize: "0.85rem",
                          cursor: brandItem.disabled
                            ? "not-allowed"
                            : "pointer",
                          backgroundColor: selectedBrands.includes(
                            brandItem.value
                          )
                            ? theme.colors.primary
                            : brandItem.disabled
                            ? theme.colors.border
                            : theme.colors.surface,
                          color: selectedBrands.includes(brandItem.value)
                            ? theme.colors.white
                            : brandItem.disabled
                            ? theme.colors.textLight
                            : theme.colors.text,
                          border: "1px solid",
                          borderColor: selectedBrands.includes(brandItem.value)
                            ? theme.colors.primary
                            : brandItem.disabled
                            ? theme.colors.border
                            : theme.colors.border,
                          opacity: brandItem.disabled ? 0.6 : 1,
                          transition: "all 0.2s ease",
                        }}
                        onClick={() =>
                          !brandItem.disabled &&
                          handleBrandChange(brandItem.value)
                        }
                      >
                        {brandItem.value}
                      </div>
                    ))}
                  </div>
                </MobileFilterSection>
              )}

              {/* Categorías */}
              {Object.keys(availableFiltersWithStatus.categories).length > 0 &&
                Object.entries(availableFiltersWithStatus.categories).map(
                  ([filterType, filterItems]) => (
                    <MobileFilterSection key={filterType}>
                      <MobileSectionTitle>
                        <RenderIcon name="FaTag" size={18} />
                        {CATEGORY_TYPE_LABELS[filterType] ||
                          filterType.charAt(0).toUpperCase() +
                            filterType.slice(1)}
                      </MobileSectionTitle>
                      {filterItems.length > 15 && (
                        <div style={{ marginBottom: "12px" }}>
                          <Input
                            placeholder={`Buscar en ${
                              CATEGORY_TYPE_LABELS[filterType] || filterType
                            }...`}
                            value={searchTerms[filterType] || ""}
                            onChange={(e) =>
                              handleSearchChange(filterType, e.target.value)
                            }
                            leftIconName="FaSearch"
                            fullWidth={true}
                          />
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          maxHeight: "200px",
                          overflowY: "auto",
                        }}
                      >
                        {getFilteredItems(filterItems, filterType).map(
                          (filterItem, index) => (
                            <div
                              key={`${filterType}-${filterItem.value}-${index}`}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "16px",
                                fontSize: "0.85rem",
                                cursor: filterItem.disabled
                                  ? "not-allowed"
                                  : "pointer",
                                backgroundColor: selectedCategories.includes(
                                  filterItem.value
                                )
                                  ? theme.colors.primary
                                  : filterItem.disabled
                                  ? theme.colors.border
                                  : theme.colors.surface,
                                color: selectedCategories.includes(
                                  filterItem.value
                                )
                                  ? theme.colors.white
                                  : filterItem.disabled
                                  ? theme.colors.textLight
                                  : theme.colors.text,
                                border: "1px solid",
                                borderColor: selectedCategories.includes(
                                  filterItem.value
                                )
                                  ? theme.colors.primary
                                  : filterItem.disabled
                                  ? theme.colors.border
                                  : theme.colors.border,
                                opacity: filterItem.disabled ? 0.6 : 1,
                                transition: "all 0.2s ease",
                              }}
                              onClick={() =>
                                !filterItem.disabled &&
                                handleCategoryChange(filterItem.value)
                              }
                            >
                              {filterItem.value}
                            </div>
                          )
                        )}
                      </div>
                    </MobileFilterSection>
                  )
                )}

              {/* Rango de Precio */}
              <MobileFilterSection>
                <MobileSectionTitle>
                  <RenderIcon name="FaDollarSign" size={18} />
                  Rango de Precio
                </MobileSectionTitle>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "120px" }}>
                    <div
                      style={{
                        marginBottom: "8px",
                        fontSize: "0.9rem",
                        color: theme.colors.textLight,
                      }}
                    >
                      Desde:
                    </div>
                    <Select
                      options={priceOptions}
                      value={selectedPriceRange?.min || availablePriceRange.min}
                      onChange={(e) => handlePriceChange("min", e.target.value)}
                      placeholder="Precio mínimo"
                      width="100%"
                      label=""
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: "120px" }}>
                    <div
                      style={{
                        marginBottom: "8px",
                        fontSize: "0.9rem",
                        color: theme.colors.textLight,
                      }}
                    >
                      Hasta:
                    </div>
                    <Select
                      options={maxPriceOptions}
                      value={selectedPriceRange?.max || availablePriceRange.max}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                      placeholder="Precio máximo"
                      width="100%"
                      label=""
                    />
                  </div>
                </div>
              </MobileFilterSection>
            </div>
          </ModalContent>
        </ModalOverlay>
      </>
    );
  }
);

FilterSidebar.displayName = "FilterSidebar";

export default FilterSidebar;
