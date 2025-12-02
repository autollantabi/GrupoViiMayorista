import { useState, useEffect, useMemo, useCallback } from "react";
import { useProductCatalog } from "../context/ProductCatalogContext";
import catalogFlowConfig from "../config/catalogFlow.json";

const useCatalogFlow = (
  empresaName = null,
  empresaProducts = null,
  urlParams = null,
  updateURL = null
) => {
  const [selectedLinea, setSelectedLinea] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedValues, setSelectedValues] = useState({});
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingFilter, setEditingFilter] = useState(null);

  const { products, loading } = useProductCatalog();

  // Usar productos de empresa si están disponibles, sino usar todos los productos
  const productsToUse = empresaProducts || products;

  // Funciones para manejar localStorage del catálogo (sin conflictos con carrito)
  const saveToLocalStorage = useCallback((state) => {
    try {
      localStorage.setItem("catalogState", JSON.stringify(state));
    } catch (error) {
      console.warn("Error saving to localStorage:", error);
    }
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem("catalogState");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn("Error loading from localStorage:", error);
      return null;
    }
  }, []);

  // Función auxiliar para obtener descripción de línea
  const getLineDescription = (linea) => {
    const descriptions = {
      LLANTAS: "Para vehículos",
      "LLANTAS MOTO": "Para motocicletas",
      LUBRICANTES: "Aceites y fluidos",
      HERRAMIENTAS: "Equipos profesionales",
    };
    return descriptions[linea] || "Productos disponibles";
  };

  // Función auxiliar para obtener icono de línea
  const getLineIcon = (linea) => {
    const icons = {
      LLANTAS: "FaCar",
      "LLANTAS MOTO": "FaMotorcycle",
      LUBRICANTES: "FaOilCan",
      HERRAMIENTAS: "FaTools",
    };
    return icons[linea] || "FaBox";
  };

  // Función auxiliar para obtener el campo de filtro
  const getFilterField = (stepId) => {
    const fieldMap = {
      categoria: "DMA_CATEGORIA",
      aplicacion: "DMA_APLICACION",
      clase: "DMA_CLASE",
      clasificacion: "DMA_CLASIFICACION",
      grupo: "DMA_GRUPO",
      subgrupo: "DMA_SUBGRUPO",
      subgrupo2: "DMA_SUBGRUPO2",
      tipo: "DMA_TIPO",
    };
    return fieldMap[stepId] || null;
  };

  // Función auxiliar para obtener descripción del filtro
  const getFilterDescription = (stepId, value) => {
    const descriptions = {
      categoria: `Productos de la categoría ${value}`,
      aplicacion: `Productos para ${value}`,
      clase: `Lubricantes de clase ${value}`,
      clasificacion: `Clasificación ${value}`,
      grupo: `Herramientas del grupo ${value}`,
      subgrupo: `Subgrupo ${value}`,
      subgrupo2: `Subgrupo 2 ${value}`,
      tipo: `Tipo ${value}`,
    };
    return descriptions[stepId] || `Productos de ${value}`;
  };

  // Función auxiliar para obtener icono del filtro
  const getFilterIcon = (stepId) => {
    const icons = {
      categoria: "FaTag",
      aplicacion: "FaCog",
      clase: "FaLayerGroup",
      clasificacion: "FaFilter",
      grupo: "FaFolder",
      subgrupo: "FaFolderOpen",
      subgrupo2: "FaFolderOpen",
      tipo: "FaTag",
    };
    return icons[stepId] || "FaTag";
  };

  // Función auxiliar para obtener nombre de display del filtro
  const getFilterDisplayName = (filterField) => {
    const names = {
      DMA_EJE: "Eje",
      DMA_MARCA: "Marca",
      DMA_CARGA: "Carga",
      DMA_VELOCIDAD: "Velocidad",
      DMA_TIPO: "Tipo",
      DMA_MODELO: "Modelo",
      DMA_RIN: "Rin",
      DMA_ANCHO: "Ancho",
      DMA_SERIE: "Alto/Serie",
      DMA_CATEGORIA: "Categoría",
      DMA_APLICACION: "Aplicación",
      DMA_SUBGRUPO: "Subgrupo 1",
      DMA_GRUPO: "Grupo",
      DMA_SAE: "Viscosidad SAE",
      DMA_ISOVG: "Viscosidad ISOVG",
      DMA_SUBGRUPO2: "Subgrupo 2",
    };
    return names[filterField] || filterField;
  };

  // Obtener líneas de negocio disponibles basadas en los productos reales
  const availableLines = useMemo(() => {
    if (!productsToUse || productsToUse.length === 0) return [];

    // Si ya tenemos productos de empresa, usarlos directamente
    let filteredProducts = productsToUse;

    const lines = [
      ...new Set(filteredProducts.map((product) => product.lineaNegocio)),
    ];

    return lines.map((linea) => {
      const productsInLine = filteredProducts.filter(
        (product) => product.lineaNegocio === linea
      );
      const config = catalogFlowConfig[linea] || {
        name: linea,
        displayName: linea,
      };

      return {
        key: linea,
        name: config.displayName || linea,
        description: getLineDescription(linea),
        icon: getLineIcon(linea),
        count: productsInLine.length,
        config: config,
      };
    });
  }, [productsToUse, empresaName]);

  // Obtener configuración del flujo para la línea seleccionada
  const flowConfig = useMemo(() => {
    if (!selectedLinea || !catalogFlowConfig[selectedLinea]) {
      return null;
    }
    return catalogFlowConfig[selectedLinea];
  }, [selectedLinea]);

  // Obtener el paso actual
  const currentStep = useMemo(() => {
    if (!flowConfig || currentStepIndex >= flowConfig.steps.length) {
      return null;
    }
    return flowConfig.steps[currentStepIndex];
  }, [flowConfig, currentStepIndex]);

  // Generar opciones para el paso actual basado en los productos
  const currentStepOptions = useMemo(() => {
    if (!currentStep || !productsToUse || productsToUse.length === 0) {
      return [];
    }

    // Filtrar productos por línea de negocio
    let relevantProducts = productsToUse.filter(
      (product) => product.lineaNegocio === selectedLinea
    );

    // Aplicar filtros previos (excluyendo el paso actual)
    Object.entries(selectedValues).forEach(([filterKey, filterValue]) => {
      // No aplicar el filtro del paso actual para mostrar todas las opciones
      if (filterKey === currentStep.id) return;

      relevantProducts = relevantProducts.filter((product) => {
        switch (filterKey) {
          case "categoria":
            return product.specs?.categoria === filterValue;
          case "aplicacion":
            return product.specs?.aplicacion === filterValue;
          case "clase":
            return product.specs?.clase === filterValue;
          case "clasificacion":
            return product.specs?.clasificacion === filterValue;
          case "grupo":
            return product.specs?.grupo === filterValue;
          case "subgrupo":
            return product.specs?.subgrupo === filterValue;
          default:
            return true;
        }
      });
    });

    // Obtener valores únicos para el filtro actual
    const filterField = getFilterField(currentStep.id);
    const uniqueValues = [
      ...new Set(
        relevantProducts
          .map((product) => product.originalData?.[filterField])
          .filter((value) => value && String(value).trim() !== "")
      ),
    ];

    // Convertir a formato de opciones
    return uniqueValues.map((value) => ({
      value,
      label: String(value),
      description: getFilterDescription(currentStep.id, value),
      icon: getFilterIcon(currentStep.id),
      count: relevantProducts.filter(
        (product) => product.originalData?.[filterField] === value
      ).length,
    }));
  }, [currentStep, productsToUse, selectedLinea, selectedValues]);

  // Función para parsear parámetros de URL
  const parseURLParams = useCallback(() => {
    if (!urlParams) return null;

    const params = {
      selectedLinea: urlParams.get("linea") || null,
      currentStepIndex: parseInt(urlParams.get("step") || "0", 10),
      selectedValues: {},
      searchQuery: urlParams.get("search") || "",
    };

    // Parsear filtros del flujo principal (filtro_<id>)
    // URLSearchParams.get() ya decodifica automáticamente
    urlParams.forEach((value, key) => {
      if (key.startsWith("filtro_")) {
        const filterId = key.replace("filtro_", "");
        params.selectedValues[filterId] = value;
      }
    });

    // Parsear filtros adicionales (dma_<campo>)
    urlParams.forEach((value, key) => {
      if (key.startsWith("dma_")) {
        const filterId = "DMA_" + key.replace("dma_", "").toUpperCase();
        params.selectedValues[filterId] = value;
      }
    });

    return params;
  }, [urlParams]);

  // Función para actualizar la URL con el estado actual
  const syncURL = useCallback(
    (state) => {
      if (!updateURL) return;

      const params = {};

      // SIEMPRE mantener linea en URL cuando esté seleccionada
      if (state.selectedLinea) {
        params.linea = state.selectedLinea;
      }

      // Solo agregar step si es mayor a 0
      if (state.currentStepIndex > 0) {
        params.step = state.currentStepIndex.toString();
      }

      // Solo agregar search si tiene valor
      if (state.searchQuery) {
        params.search = state.searchQuery;
      }

      // Agregar filtros del flujo principal
      Object.entries(state.selectedValues || {}).forEach(([key, value]) => {
        if (!key.startsWith("DMA_")) {
          params[`filtro_${key}`] = value;
        }
      });

      // Agregar filtros adicionales
      Object.entries(state.selectedValues || {}).forEach(([key, value]) => {
        if (key.startsWith("DMA_")) {
          const dmaKey = key.replace("DMA_", "").toLowerCase();
          params[`dma_${dmaKey}`] = value;
        }
      });

      // Pasar un objeto especial para indicar que se deben eliminar los parámetros que no están en params
      // Esto se manejará en updateURL
      updateURL(params, true); // true indica que es una actualización completa
    },
    [updateURL]
  );

  // Inicializar estado desde URL o localStorage
  useEffect(() => {
    if (!isInitialized && productsToUse && productsToUse.length > 0) {
      // Priorizar URL sobre localStorage
      const urlState = parseURLParams();
      if (urlState && urlState.selectedLinea) {
        setSelectedLinea(urlState.selectedLinea);
        setCurrentStepIndex(urlState.currentStepIndex || 0);
        setSelectedValues(urlState.selectedValues || {});
        setSearchQuery(urlState.searchQuery || "");
      } else {
        // Fallback a localStorage si no hay URL
        const savedState = loadFromLocalStorage();
        if (savedState) {
          setSelectedLinea(savedState.selectedLinea);
          setCurrentStepIndex(savedState.currentStepIndex || 0);
          setSelectedValues(savedState.selectedValues || {});
          setSearchQuery(savedState.searchQuery || "");
        }
      }
      setIsInitialized(true);
    }
  }, [
    isInitialized,
    productsToUse,
    loadFromLocalStorage,
    parseURLParams,
    urlParams,
  ]);

  // Sincronizar con URL cuando cambie el estado
  useEffect(() => {
    if (isInitialized && updateURL) {
      const stateToSync = {
        selectedLinea,
        currentStepIndex,
        selectedValues,
        searchQuery,
      };
      syncURL(stateToSync);
    }
  }, [
    selectedLinea,
    currentStepIndex,
    selectedValues,
    searchQuery,
    isInitialized,
    syncURL,
    updateURL,
  ]);

  // Guardar estado completo en localStorage cuando cambie (como backup)
  useEffect(() => {
    if (isInitialized) {
      const stateToSave = {
        selectedLinea,
        currentStepIndex,
        selectedValues,
        searchQuery,
        timestamp: Date.now(),
      };
      saveToLocalStorage(stateToSave);
    }
  }, [
    selectedLinea,
    currentStepIndex,
    selectedValues,
    searchQuery,
    isInitialized,
    saveToLocalStorage,
  ]);

  // Actualizar productos filtrados cuando cambien los filtros
  useEffect(() => {
    if (!productsToUse || productsToUse.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let filtered = productsToUse.filter(
      (product) => product.lineaNegocio === selectedLinea
    );

    // Aplicar todos los filtros seleccionados
    Object.entries(selectedValues).forEach(([filterKey, filterValue]) => {
      // Primero intentar con los filtros del flujo principal
      const filterField = getFilterField(filterKey);
      if (filterField) {
        filtered = filtered.filter(
          (product) => product.originalData?.[filterField] === filterValue
        );
      } else {
        // Si no es un filtro del flujo principal, es un filtro adicional (campo DMA_*)
        if (filterKey.startsWith("DMA_")) {
          filtered = filtered.filter(
            (product) => product.originalData?.[filterKey] === filterValue
          );
        }
      }
    });

    // Aplicar búsqueda por texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        const name = (product.name || "").toLowerCase();
        const brand = (product.brand || "").toLowerCase();
        const category = (product.specs?.categoria || "").toLowerCase();
        const description = (product.description || "").toLowerCase();

        return (
          name.includes(query) ||
          brand.includes(query) ||
          category.includes(query) ||
          description.includes(query)
        );
      });
    }

    // Eliminar duplicados basándose en el ID
    const uniqueProducts = filtered.reduce((acc, current) => {
      const identifier = current.id;
      if (!acc.find((product) => product.id === identifier)) {
        acc.push(current);
      }
      return acc;
    }, []);

    setFilteredProducts(uniqueProducts);
  }, [productsToUse, selectedLinea, selectedValues, searchQuery, empresaName]);

  // Funciones de navegación
  const selectLinea = useCallback((linea) => {
    if (linea === null) {
      // Volver a la pantalla de bienvenida
      setSelectedLinea(null);
      setCurrentStepIndex(0);
      setSelectedValues({});
      setFilteredProducts([]);
      setEditingFilter(null);
    } else {
      // Seleccionar nueva línea
      setSelectedLinea(linea);
      setCurrentStepIndex(0);
      setSelectedValues({});
      setFilteredProducts([]);
      setEditingFilter(null);

      // Si la línea no tiene pasos configurados, ir directamente al catálogo
      // Esto se maneja automáticamente en isAtProductView()
    }
  }, []);

  const selectFilterValue = useCallback(
    (value) => {
      if (!currentStep || !flowConfig) return;

      const newSelectedValues = {
        ...selectedValues,
        [currentStep.id]: value,
      };

      setSelectedValues(newSelectedValues);
      setEditingFilter(null); // Limpiar el estado de edición

      // Avanzar al siguiente paso si existe
      const nextStepIndex = currentStepIndex + 1;
      if (nextStepIndex < flowConfig.steps.length) {
        setCurrentStepIndex(nextStepIndex);
      }
    },
    [currentStep, flowConfig, selectedValues, currentStepIndex]
  );

  const goToNextStep = () => {
    if (!currentStep || !currentStep.nextStep) return;

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < flowConfig.steps.length) {
      setCurrentStepIndex(nextStepIndex);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      const newStepIndex = currentStepIndex - 1;
      setCurrentStepIndex(newStepIndex);

      // Limpiar el filtro del paso actual y posteriores
      const newSelectedValues = { ...selectedValues };
      if (currentStep) {
        delete newSelectedValues[currentStep.id];
      }

      // Limpiar filtros posteriores
      if (flowConfig) {
        for (let i = newStepIndex + 1; i < flowConfig.steps.length; i++) {
          const step = flowConfig.steps[i];
          delete newSelectedValues[step.id];
        }
      }

      setSelectedValues(newSelectedValues);
    } else {
      // Si estamos en el primer paso, volver a la selección de línea
      setSelectedLinea(null);
      setCurrentStepIndex(0);
      setSelectedValues({});
    }
  };

  const goToFilterStep = useCallback(
    (filterId) => {
      if (!flowConfig) {
        return;
      }

      const stepIndex = flowConfig.steps.findIndex(
        (step) => step.id === filterId
      );

      if (stepIndex !== -1) {
        setCurrentStepIndex(stepIndex);
        setEditingFilter(filterId); // Marcar que estamos editando este filtro

        // Limpiar el filtro actual y todos los filtros posteriores del flujo principal
        const newSelectedValues = { ...selectedValues };
        for (let i = stepIndex; i < flowConfig.steps.length; i++) {
          const step = flowConfig.steps[i];
          delete newSelectedValues[step.id];
        }

        // También limpiar TODOS los filtros adicionales (campos DMA_*) cuando navegamos a un paso anterior
        Object.keys(newSelectedValues).forEach((key) => {
          if (key.startsWith("DMA_")) {
            delete newSelectedValues[key];
          }
        });

        setSelectedValues(newSelectedValues);
      }
    },
    [flowConfig, selectedValues]
  );

  const canGoNext = useCallback(() => {
    return currentStep && selectedValues[currentStep.id];
  }, [currentStep, selectedValues]);

  const isAtProductView = useCallback(() => {
    // Si no hay pasos configurados, mostrar directamente el catálogo
    if (!flowConfig || !flowConfig.steps || flowConfig.steps.length === 0) {
      return true;
    }

    // Estamos en la vista de productos cuando:
    // 1. Hay un paso actual
    // 2. El paso actual NO tiene siguiente paso (es el último)
    // 3. El paso actual YA tiene un valor seleccionado
    // 4. NO estamos editando un filtro específico
    return (
      currentStep &&
      !currentStep.nextStep &&
      selectedValues[currentStep.id] &&
      !editingFilter
    );
  }, [currentStep, selectedValues, editingFilter, flowConfig]);

  // Obtener filtros adicionales disponibles para el sidebar
  const additionalFilters = useMemo(() => {
    if (!selectedLinea || !isAtProductView()) return [];

    const filterMap = {
      LLANTAS: [
        "DMA_MARCA",
        "DMA_ANCHO",
        "DMA_SERIE",
        "DMA_RIN",
        "DMA_CATEGORIA",
        "DMA_APLICACION",
        "DMA_EJE",
        "DMA_CLASIFICACION",
      ],
      "LLANTAS MOTO": [
        "DMA_MARCA",
        "DMA_ANCHO",
        "DMA_SERIE",
        "DMA_RIN",
        "DMA_CATEGORIA",
        "DMA_APLICACION",
        "DMA_EJE",
        "DMA_CLASIFICACION",
      ],
      LUBRICANTES: [
        "DMA_MARCA",
        "DMA_SAE",
        "DMA_ISOVG",
        "DMA_APLICACION",
        "DMA_TIPO",
        "DMA_MODELO",
      ],
      HERRAMIENTAS: [
        "DMA_MARCA",
        "DMA_GRUPO",
        "DMA_SUBGRUPO",
        "DMA_SUBGRUPO2",
        "DMA_TIPO",
      ],
    };

    const filters = filterMap[selectedLinea] || [];
    const additionalFilterOptions = [];

    // Obtener productos base filtrados solo por el flujo principal (sin filtros adicionales)
    let baseFilteredProducts = productsToUse.filter(
      (product) => product.lineaNegocio === selectedLinea
    );

    // Aplicar solo los filtros del flujo principal (no los adicionales)
    Object.entries(selectedValues).forEach(([filterKey, filterValue]) => {
      const filterField = getFilterField(filterKey);
      if (filterField) {
        baseFilteredProducts = baseFilteredProducts.filter(
          (product) => product.originalData?.[filterField] === filterValue
        );
      }
    });

    // Aplicar búsqueda por texto si existe (para que los conteos sean consistentes)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      baseFilteredProducts = baseFilteredProducts.filter((product) => {
        const name = (product.name || "").toLowerCase();
        const brand = (product.brand || "").toLowerCase();
        const category = (product.specs?.categoria || "").toLowerCase();
        const description = (product.description || "").toLowerCase();

        return (
          name.includes(query) ||
          brand.includes(query) ||
          category.includes(query) ||
          description.includes(query)
        );
      });
    }

    // Eliminar duplicados (igual que en filteredProducts)
    const uniqueBaseProducts = baseFilteredProducts.reduce((acc, current) => {
      const identifier = current.id;
      if (!acc.find((product) => product.id === identifier)) {
        acc.push(current);
      }
      return acc;
    }, []);
    baseFilteredProducts = uniqueBaseProducts;

    filters.forEach((filterField) => {
      // Obtener valores únicos para este campo
      const uniqueValues = [
        ...new Set(
          baseFilteredProducts
            .map((product) => product.originalData?.[filterField])
            .filter((value) => value && String(value).trim() !== "")
        ),
      ];

      if (uniqueValues.length > 1) {
        // Solo mostrar si hay más de una opción
        const options = uniqueValues.map((value) => {
          // Crear una copia de los productos filtrados por el flujo principal
          let filteredForCount = [...baseFilteredProducts];

          // Aplicar TODOS los filtros adicionales ya seleccionados (excepto el actual)
          Object.entries(selectedValues).forEach(
            ([otherFilterKey, otherFilterValue]) => {
              if (
                otherFilterKey.startsWith("DMA_") &&
                otherFilterKey !== filterField
              ) {
                filteredForCount = filteredForCount.filter(
                  (product) =>
                    product.originalData?.[otherFilterKey] === otherFilterValue
                );
              }
            }
          );

          // Aplicar búsqueda por texto si existe (igual que en filteredProducts)
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filteredForCount = filteredForCount.filter((product) => {
              const name = (product.name || "").toLowerCase();
              const brand = (product.brand || "").toLowerCase();
              const category = (product.specs?.categoria || "").toLowerCase();
              const description = (product.description || "").toLowerCase();

              return (
                name.includes(query) ||
                brand.includes(query) ||
                category.includes(query) ||
                description.includes(query)
              );
            });
          }

          // Ahora contar cuántos productos tendrían este valor específico
          const count = filteredForCount.filter(
            (product) => product.originalData?.[filterField] === value
          ).length;

          return {
            value,
            label: String(value),
            count,
            disabled: count === 0,
          };
        });

        additionalFilterOptions.push({
          id: filterField,
          name: getFilterDisplayName(filterField),
          options,
        });
      }
    });

    return additionalFilterOptions;
  }, [selectedLinea, products, selectedValues, searchQuery, isAtProductView]);

  // Función para aplicar filtros adicionales
  const applyAdditionalFilter = useCallback(
    (filterId, value) => {
      const newSelectedValues = {
        ...selectedValues,
        [filterId]: value,
      };
      setSelectedValues(newSelectedValues);
    },
    [selectedValues]
  );

  // Función para limpiar filtro adicional
  const clearAdditionalFilter = useCallback(
    (filterId) => {
      const newSelectedValues = { ...selectedValues };
      delete newSelectedValues[filterId];
      setSelectedValues(newSelectedValues);
    },
    [selectedValues]
  );

  // Función para navegar a un filtro adicional desde el breadcrumb
  const goToAdditionalFilter = useCallback(
    (filterId) => {
      // Solo limpiar ese filtro específico, mantener los demás
      const newSelectedValues = { ...selectedValues };
      delete newSelectedValues[filterId];
      setSelectedValues(newSelectedValues);

      // No cambiar el currentStepIndex ya que seguimos en la vista de productos
      setEditingFilter(null);
    },
    [selectedValues]
  );

  // Función para manejar búsqueda
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Funciones wrapper para mantener compatibilidad
  const setSelectedValuesWrapper = useCallback((values) => {
    setSelectedValues(values);
  }, []);

  const setCurrentStepIndexWrapper = useCallback((index) => {
    setCurrentStepIndex(index);
  }, []);

  return {
    // Estado
    selectedLinea,
    currentStepIndex,
    currentStep,
    selectedValues,
    filteredProducts,
    currentStepOptions,
    loading,
    availableLines,
    additionalFilters,
    searchQuery,

    // Funciones
    selectLinea,
    selectFilterValue,
    goToNextStep,
    goToPreviousStep,
    goToFilterStep,
    canGoNext: canGoNext(),
    isAtProductView: isAtProductView(),
    applyAdditionalFilter,
    clearAdditionalFilter,
    goToAdditionalFilter,
    isInitialized,
    setSelectedValues: setSelectedValuesWrapper,
    setCurrentStepIndex: setCurrentStepIndexWrapper,
    handleSearchChange,

    // Configuración
    flowConfig,
  };
};

export default useCatalogFlow;
