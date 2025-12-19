import React, { useState, useEffect, useMemo, useCallback } from "react";
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

  // Refs para acceder a los valores actuales sin incluirlos como dependencias
  const selectedLineaRef = React.useRef(selectedLinea);
  const currentStepIndexRef = React.useRef(currentStepIndex);
  const selectedValuesRef = React.useRef(selectedValues);
  const searchQueryRef = React.useRef(searchQuery);

  // Mantener los refs actualizados
  React.useEffect(() => {
    selectedLineaRef.current = selectedLinea;
  }, [selectedLinea]);

  React.useEffect(() => {
    currentStepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  React.useEffect(() => {
    selectedValuesRef.current = selectedValues;
  }, [selectedValues]);

  React.useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

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
      LLANTAS: "Liviano y Pesado",
      "LLANTAS MOTO": "Moto | UTV/ATV",
      LUBRICANTES: "Aceites y refrigerantes",
      HERRAMIENTAS: "Herramientas profesionales",
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

  // Función para parsear parámetros de URL - DEBE estar antes de flowConfig y currentStep
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

  // Obtener configuración del flujo para la línea seleccionada desde la URL
  const flowConfig = useMemo(() => {
    if (!urlParams) return null;
    const urlState = parseURLParams();
    const urlSelectedLinea = urlState?.selectedLinea;
    if (!urlSelectedLinea || !catalogFlowConfig[urlSelectedLinea]) {
      return null;
    }
    return catalogFlowConfig[urlSelectedLinea];
  }, [urlParams, parseURLParams]);

  // Obtener el paso actual desde la URL
  const currentStep = useMemo(() => {
    if (!flowConfig) return null;
    const urlState = parseURLParams();
    const urlCurrentStepIndex = urlState?.currentStepIndex || 0;
    if (urlCurrentStepIndex >= flowConfig.steps.length) {
      return null;
    }
    return flowConfig.steps[urlCurrentStepIndex];
  }, [flowConfig, urlParams, parseURLParams]);

  // Generar opciones para el paso actual basado en los productos desde la URL
  const currentStepOptions = useMemo(() => {
    if (
      !currentStep ||
      !productsToUse ||
      !Array.isArray(productsToUse) ||
      productsToUse.length === 0 ||
      !urlParams
    ) {
      return [];
    }

    // Leer TODO desde la URL
    const urlState = parseURLParams();
    if (!urlState || !urlState.selectedLinea) {
      return [];
    }

    const urlSelectedLinea = urlState.selectedLinea;
    const urlSelectedValues = urlState.selectedValues || {};

    // Filtrar productos por línea de negocio desde la URL
    let relevantProducts = productsToUse.filter(
      (product) => product.lineaNegocio === urlSelectedLinea
    );

    // Aplicar filtros previos desde la URL (excluyendo el paso actual)
    Object.entries(urlSelectedValues).forEach(([filterKey, filterValue]) => {
      // No aplicar el filtro del paso actual para mostrar todas las opciones
      if (filterKey === currentStep.id) return;

      const filterField = getFilterField(filterKey);
      if (filterField) {
        relevantProducts = relevantProducts.filter(
          (product) => product.originalData?.[filterField] === filterValue
        );
      }
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
  }, [currentStep, productsToUse, urlParams, parseURLParams, getFilterField]);

  // Función para actualizar la URL con el estado actual
  const syncURL = useCallback(
    (state) => {
      if (!updateURL) {
        return;
      }

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

  // Ref para rastrear la URL anterior y evitar loops
  const prevURLString = React.useRef("");

  // Inicializar estado desde URL o localStorage
  // IMPORTANTE: La URL es la fuente de verdad, el localStorage es solo un fallback
  useEffect(() => {
    if (!isInitialized && productsToUse && productsToUse.length > 0) {
      // SIEMPRE priorizar URL sobre localStorage
      const urlState = parseURLParams();

      if (urlState) {
        // Si hay estado en la URL, usarlo
        setSelectedLinea(urlState.selectedLinea || null);
        setCurrentStepIndex(urlState.currentStepIndex || 0);
        setSelectedValues(urlState.selectedValues || {});
        setSearchQuery(urlState.searchQuery || "");
      } else {
        // Solo usar localStorage si NO hay nada en la URL
        const savedState = loadFromLocalStorage();
        if (savedState) {
          setSelectedLinea(savedState.selectedLinea || null);
          setCurrentStepIndex(savedState.currentStepIndex || 0);
          setSelectedValues(savedState.selectedValues || {});
          setSearchQuery(savedState.searchQuery || "");
        }
      }

      setIsInitialized(true);
      // Guardar el estado inicial de la URL
      if (urlParams) {
        prevURLString.current = urlParams.toString();
      } else {
        // Si no hay URL params, inicializar como string vacío
        prevURLString.current = "";
      }
    }
  }, [
    isInitialized,
    productsToUse,
    loadFromLocalStorage,
    parseURLParams,
    urlParams,
  ]);

  // Sincronizar URL una vez después de la inicialización si hay estado pero no hay URL
  const hasSyncedInitialState = React.useRef(false);
  useEffect(() => {
    if (
      isInitialized &&
      updateURL &&
      selectedLinea &&
      !hasSyncedInitialState.current &&
      !isUpdatingFromSelectLinea.current
    ) {
      // Verificar si la URL tiene la línea actual
      const urlState = parseURLParams();
      if (
        !urlState ||
        !urlState.selectedLinea ||
        urlState.selectedLinea !== selectedLinea
      ) {
        // Pre-calcular cómo se verá la URL después de la sincronización
        const expectedParams = new URLSearchParams();
        expectedParams.set("linea", selectedLinea);
        if (currentStepIndex > 0) {
          expectedParams.set("step", currentStepIndex.toString());
        }
        if (searchQuery) {
          expectedParams.set("search", searchQuery);
        }
        // Agregar filtros
        Object.entries(selectedValues || {}).forEach(([key, value]) => {
          if (!key.startsWith("DMA_")) {
            expectedParams.set(`filtro_${key}`, value);
          } else {
            const dmaKey = key.replace("DMA_", "").toLowerCase();
            expectedParams.set(`dma_${dmaKey}`, value);
          }
        });
        // Preservar page, sort, limit, stock si existen
        if (urlParams) {
          const page = urlParams.get("page");
          const sort = urlParams.get("sort");
          const limit = urlParams.get("limit");
          const stock = urlParams.get("stock");
          if (page) expectedParams.set("page", page);
          if (sort) expectedParams.set("sort", sort);
          if (limit) expectedParams.set("limit", limit);
          if (stock) expectedParams.set("stock", stock);
        }
        prevURLString.current = expectedParams.toString();

        // Si la URL no coincide con el estado, sincronizar una sola vez
        syncURL({
          selectedLinea,
          currentStepIndex,
          selectedValues,
          searchQuery,
        });

        hasSyncedInitialState.current = true;
      } else {
        // La URL ya está sincronizada, actualizar prevURLString
        if (urlParams) {
          prevURLString.current = urlParams.toString();
        }
        hasSyncedInitialState.current = true;
      }
    }
  }, [
    isInitialized,
    selectedLinea,
    currentStepIndex,
    selectedValues,
    searchQuery,
    updateURL,
    urlParams,
    parseURLParams,
    syncURL,
  ]);

  // Ref para evitar actualizaciones duplicadas cuando selectLinea ya actualizó la URL
  const isUpdatingFromSelectLinea = React.useRef(false);

  // Leer desde URL cuando cambie externamente (navegación del navegador, etc.)
  // Solo si no estamos actualizando desde selectLinea
  // IMPORTANTE: Este efecto solo debe depender de la URL, no del estado
  useEffect(() => {
    // NO hacer nada si estamos actualizando desde selectLinea
    if (isUpdatingFromSelectLinea.current) {
      return;
    }

    if (!isInitialized || !urlParams) {
      return;
    }

    const currentURLString = urlParams.toString();

    // Solo actualizar si la URL realmente cambió Y no es una actualización que acabamos de hacer
    if (currentURLString === prevURLString.current) {
      return;
    }

    const urlState = parseURLParams();
    if (!urlState) {
      return;
    }

    // IMPORTANTE: La URL es la fuente de verdad
    // Actualizar el estado para que coincida con la URL
    // Usar refs para acceder a los valores actuales sin causar loops

    const currentSelectedLinea = selectedLineaRef.current;
    const currentStepIndex = currentStepIndexRef.current;
    const currentSelectedValues = selectedValuesRef.current;
    const currentSearchQuery = searchQueryRef.current;

    if (urlState.selectedLinea) {
      // La URL tiene línea - actualizar el estado para que coincida
      if (urlState.selectedLinea !== currentSelectedLinea) {
        setSelectedLinea(urlState.selectedLinea);
      }
    } else if (currentSelectedLinea) {
      // La URL no tiene línea pero el estado sí - NO actualizar (actualización atómica en progreso)
      // Esperar a que la actualización se complete
      return;
    }
    // Si ni la URL ni el estado tienen línea, está bien, no hacer nada

    // Actualizar otros valores solo si son diferentes
    if (urlState.currentStepIndex !== currentStepIndex) {
      setCurrentStepIndex(urlState.currentStepIndex);
    }

    const urlValuesString = JSON.stringify(urlState.selectedValues || {});
    const currentValuesString = JSON.stringify(currentSelectedValues || {});
    if (urlValuesString !== currentValuesString) {
      setSelectedValues(urlState.selectedValues || {});
    }

    if (urlState.searchQuery !== currentSearchQuery) {
      setSearchQuery(urlState.searchQuery || "");
    }

    // Actualizar prevURLString después de leer
    prevURLString.current = currentURLString;
  }, [
    isInitialized,
    urlParams?.toString(),
    parseURLParams,
    // NO incluir selectedLinea, currentStepIndex, selectedValues, searchQuery como dependencias
    // porque eso causaría loops infinitos. Usamos refs en su lugar.
  ]);

  // NO sincronizar automáticamente el estado con la URL
  // Solo actualizar la URL cuando el usuario hace una acción explícita
  // (selectLinea, selectFilterValue, applyAdditionalFilter, etc.)

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

  // Actualizar productos filtrados cuando cambie la URL
  // IMPORTANTE: Calcular directamente en el useEffect para evitar loops infinitos
  // Usar solo dependencias estables (urlParams?.toString() y productsToUse)
  useEffect(() => {
    // Validar que productsToUse existe y es un array
    if (
      !productsToUse ||
      !Array.isArray(productsToUse) ||
      productsToUse.length === 0
    ) {
      setFilteredProducts([]);
      return;
    }

    if (!urlParams) {
      setFilteredProducts([]);
      return;
    }

    // Leer TODO desde la URL, no del estado
    // parseURLParams es estable porque depende solo de urlParams
    const urlState = parseURLParams();
    if (!urlState || !urlState.selectedLinea) {
      setFilteredProducts([]);
      return;
    }

    const urlSelectedLinea = urlState.selectedLinea;
    const urlSelectedValues = urlState.selectedValues || {};
    const urlSearchQuery = urlState.searchQuery || "";

    let filtered = productsToUse.filter(
      (product) => product.lineaNegocio === urlSelectedLinea
    );

    // Aplicar todos los filtros desde la URL
    // getFilterField es una función pura, no necesita estar en dependencias
    Object.entries(urlSelectedValues).forEach(([filterKey, filterValue]) => {
      // Normalizar el valor del filtro para comparación
      const normalizedFilterValue = String(filterValue || "").trim();

      // Primero intentar con los filtros del flujo principal
      const filterField = getFilterField(filterKey);
      if (filterField) {
        filtered = filtered.filter((product) => {
          const productValue = product.originalData?.[filterField];
          if (productValue === null || productValue === undefined) return false;
          // Normalizar y comparar
          const normalizedProductValue = String(productValue).trim();
          return normalizedProductValue === normalizedFilterValue;
        });
      } else {
        // Si no es un filtro del flujo principal, es un filtro adicional (campo DMA_*)
        if (filterKey.startsWith("DMA_")) {
          filtered = filtered.filter((product) => {
            const productValue = product.originalData?.[filterKey];
            if (productValue === null || productValue === undefined)
              return false;
            // Normalizar y comparar
            const normalizedProductValue = String(productValue).trim();
            return normalizedProductValue === normalizedFilterValue;
          });
        }
      }
    });

    // Aplicar búsqueda por texto desde la URL
    if (urlSearchQuery.trim()) {
      const query = urlSearchQuery.toLowerCase().trim();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsToUse, urlParams?.toString()]);

  // Funciones de navegación
  const selectLinea = useCallback(
    (linea) => {
      // Marcar que estamos actualizando desde selectLinea para evitar que el useEffect de lectura interfiera
      isUpdatingFromSelectLinea.current = true;

      // Pre-calcular cómo se verá la URL después de la actualización
      // Esto es crítico para evitar que el useEffect interfiera
      const expectedParams = new URLSearchParams();
      if (linea !== null) {
        expectedParams.set("linea", linea);
      }
      const currentSearchQuery = searchQueryRef.current;
      if (currentSearchQuery) {
        expectedParams.set("search", currentSearchQuery);
      }
      // Preservar page, sort, limit, stock si existen
      if (urlParams) {
        const page = urlParams.get("page");
        const sort = urlParams.get("sort");
        const limit = urlParams.get("limit");
        const stock = urlParams.get("stock");
        if (page) expectedParams.set("page", page);
        if (sort) expectedParams.set("sort", sort);
        if (limit) expectedParams.set("limit", limit);
        if (stock) expectedParams.set("stock", stock);
      }

      // Actualizar prevURLString INMEDIATAMENTE con la URL esperada
      // Esto previene que el useEffect lea la URL anterior y sobrescriba el nuevo estado
      prevURLString.current = expectedParams.toString();

      // Actualizar el estado inmediatamente
      if (linea === null) {
        // Volver a la pantalla de bienvenida
        setSelectedLinea(null);
        setCurrentStepIndex(0);
        setSelectedValues({});
        setFilteredProducts([]);
        setEditingFilter(null);

        // Actualizar URL inmediatamente
        if (updateURL && isInitialized) {
          syncURL({
            selectedLinea: null,
            currentStepIndex: 0,
            selectedValues: {},
            searchQuery: currentSearchQuery,
          });

          // Resetear el flag después de un delay para permitir que la URL se actualice
          setTimeout(() => {
            // Verificar que la URL se actualizó correctamente
            const currentSearch = window.location.search;
            if (currentSearch) {
              const currentParams = new URLSearchParams(currentSearch);
              const currentLinea = currentParams.get("linea");
              if (!currentLinea) {
                prevURLString.current = currentParams.toString();
              }
            }
            isUpdatingFromSelectLinea.current = false;
          }, 200);
        } else {
          // Si no hay updateURL o no está inicializado, resetear el flag inmediatamente
          setTimeout(() => {
            isUpdatingFromSelectLinea.current = false;
          }, 100);
        }
      } else {
        // Seleccionar nueva línea
        setSelectedLinea(linea);
        setCurrentStepIndex(0);
        setSelectedValues({});
        setFilteredProducts([]);
        setEditingFilter(null);

        // Actualizar URL inmediatamente
        if (updateURL && isInitialized) {
          // Llamar a syncURL de forma síncrona
          syncURL({
            selectedLinea: linea,
            currentStepIndex: 0,
            selectedValues: {},
            searchQuery: currentSearchQuery,
          });

          // Resetear el flag después de un delay para permitir que la URL se actualice
          setTimeout(() => {
            // Verificar que la URL se actualizó correctamente
            const currentSearch = window.location.search;
            if (currentSearch) {
              const currentParams = new URLSearchParams(currentSearch);
              const currentLinea = currentParams.get("linea");
              if (currentLinea === linea) {
                prevURLString.current = currentParams.toString();
              }
            }
            isUpdatingFromSelectLinea.current = false;
          }, 200);
        } else {
          // Si no hay updateURL o no está inicializado, resetear el flag inmediatamente
          setTimeout(() => {
            isUpdatingFromSelectLinea.current = false;
          }, 100);
        }

        // Si la línea no tiene pasos configurados, ir directamente al catálogo
        // Esto se maneja automáticamente en isAtProductView()
      }
    },
    [updateURL, isInitialized, syncURL, urlParams]
  );

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

      // Actualizar URL después de cambiar el filtro
      if (updateURL && isInitialized) {
        syncURL({
          selectedLinea,
          currentStepIndex:
            nextStepIndex < flowConfig.steps.length
              ? nextStepIndex
              : currentStepIndex,
          selectedValues: newSelectedValues,
          searchQuery,
        });
      }
    },
    [
      currentStep,
      flowConfig,
      selectedValues,
      currentStepIndex,
      selectedLinea,
      searchQuery,
      updateURL,
      isInitialized,
      syncURL,
    ]
  );

  const goToNextStep = () => {
    if (!currentStep || !currentStep.nextStep) return;

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < flowConfig.steps.length) {
      setCurrentStepIndex(nextStepIndex);

      // Actualizar URL después de cambiar el paso
      if (updateURL && isInitialized) {
        syncURL({
          selectedLinea,
          currentStepIndex: nextStepIndex,
          selectedValues,
          searchQuery,
        });
      }
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

      // Actualizar URL después de retroceder
      if (updateURL && isInitialized) {
        syncURL({
          selectedLinea,
          currentStepIndex: newStepIndex,
          selectedValues: newSelectedValues,
          searchQuery,
        });
      }
    } else {
      // Si estamos en el primer paso, volver a la selección de línea
      setSelectedLinea(null);
      setCurrentStepIndex(0);
      setSelectedValues({});

      // Actualizar URL después de volver a la selección de línea
      if (updateURL && isInitialized) {
        syncURL({
          selectedLinea: null,
          currentStepIndex: 0,
          selectedValues: {},
          searchQuery,
        });
      }
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

        // Actualizar URL después de navegar a un paso
        if (updateURL && isInitialized) {
          syncURL({
            selectedLinea,
            currentStepIndex: stepIndex,
            selectedValues: newSelectedValues,
            searchQuery,
          });
        }
      }
    },
    [
      flowConfig,
      selectedValues,
      selectedLinea,
      currentStepIndex,
      searchQuery,
      updateURL,
      isInitialized,
      syncURL,
    ]
  );

  const canGoNext = useCallback(() => {
    if (!currentStep || !urlParams) return false;
    const urlState = parseURLParams();
    return urlState?.selectedValues?.[currentStep.id] ? true : false;
  }, [currentStep, urlParams, parseURLParams]);

  const isAtProductView = useCallback(() => {
    // Si no hay pasos configurados, mostrar directamente el catálogo
    if (!flowConfig || !flowConfig.steps || flowConfig.steps.length === 0) {
      return true;
    }

    if (!urlParams || !currentStep) {
      return false;
    }

    // Leer desde la URL
    const urlState = parseURLParams();
    if (!urlState || !urlState.selectedValues) {
      return false;
    }

    // Estamos en la vista de productos cuando:
    // 1. Hay un paso actual
    // 2. El paso actual NO tiene siguiente paso (es el último)
    // 3. El paso actual YA tiene un valor seleccionado (desde la URL)
    // 4. NO estamos editando un filtro específico
    return (
      currentStep &&
      !currentStep.nextStep &&
      urlState.selectedValues[currentStep.id] &&
      !editingFilter
    );
  }, [currentStep, urlParams, parseURLParams, editingFilter, flowConfig]);

  // Obtener filtros adicionales disponibles para el sidebar desde la URL
  const additionalFilters = useMemo(() => {
    if (!urlParams || !isAtProductView()) return [];

    // Validar que productsToUse existe y es un array
    if (
      !productsToUse ||
      !Array.isArray(productsToUse) ||
      productsToUse.length === 0
    ) {
      return [];
    }

    // Leer TODO desde la URL
    const urlState = parseURLParams();
    if (!urlState || !urlState.selectedLinea) return [];

    const urlSelectedLinea = urlState.selectedLinea;
    const urlSelectedValues = urlState.selectedValues || {};
    const urlSearchQuery = urlState.searchQuery || "";

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

    const filters = filterMap[urlSelectedLinea] || [];
    const additionalFilterOptions = [];

    // Obtener productos base filtrados solo por el flujo principal (sin filtros adicionales) desde la URL
    let baseFilteredProducts = productsToUse.filter(
      (product) => product.lineaNegocio === urlSelectedLinea
    );

    // Aplicar solo los filtros del flujo principal (no los adicionales) desde la URL
    Object.entries(urlSelectedValues).forEach(([filterKey, filterValue]) => {
      // Solo aplicar filtros del flujo principal, no los adicionales (DMA_*)
      if (filterKey.startsWith("DMA_")) return;

      const filterField = getFilterField(filterKey);
      if (filterField) {
        // Normalizar el valor del filtro para comparación
        const normalizedFilterValue = String(filterValue || "").trim();
        baseFilteredProducts = baseFilteredProducts.filter((product) => {
          const productValue = product.originalData?.[filterField];
          if (productValue === null || productValue === undefined) return false;
          // Normalizar y comparar
          const normalizedProductValue = String(productValue).trim();
          return normalizedProductValue === normalizedFilterValue;
        });
      }
    });

    // Aplicar búsqueda por texto desde la URL si existe (para que los conteos sean consistentes)
    if (urlSearchQuery.trim()) {
      const query = urlSearchQuery.toLowerCase().trim();
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

          // Aplicar TODOS los filtros adicionales ya seleccionados desde la URL (excepto el actual)
          Object.entries(urlSelectedValues).forEach(
            ([otherFilterKey, otherFilterValue]) => {
              if (
                otherFilterKey.startsWith("DMA_") &&
                otherFilterKey !== filterField
              ) {
                // Normalizar el valor del filtro para comparación
                const normalizedOtherValue = String(
                  otherFilterValue || ""
                ).trim();
                filteredForCount = filteredForCount.filter((product) => {
                  const productValue = product.originalData?.[otherFilterKey];
                  if (productValue === null || productValue === undefined)
                    return false;
                  // Normalizar y comparar
                  const normalizedProductValue = String(productValue).trim();
                  return normalizedProductValue === normalizedOtherValue;
                });
              }
            }
          );

          // Aplicar búsqueda por texto desde la URL si existe (igual que en filteredProducts)
          if (urlSearchQuery.trim()) {
            const query = urlSearchQuery.toLowerCase().trim();
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
          // Normalizar el valor para comparación
          const normalizedValue = String(value || "").trim();
          const count = filteredForCount.filter((product) => {
            const productValue = product.originalData?.[filterField];
            if (productValue === null || productValue === undefined)
              return false;
            // Normalizar y comparar
            const normalizedProductValue = String(productValue).trim();
            return normalizedProductValue === normalizedValue;
          }).length;

          return {
            value,
            label: String(value),
            count,
            disabled: count === 0,
          };
        });

        // Ordenar las opciones: números de menor a mayor, texto alfabéticamente
        options.sort((a, b) => {
          const valueA = String(a.value || "").trim();
          const valueB = String(b.value || "").trim();

          // Intentar convertir a números
          const numA = parseFloat(valueA);
          const numB = parseFloat(valueB);

          // Si ambos son números válidos, ordenar numéricamente
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }

          // Si solo uno es número, los números van primero
          if (!isNaN(numA) && isNaN(numB)) {
            return -1;
          }
          if (isNaN(numA) && !isNaN(numB)) {
            return 1;
          }

          // Si ambos son texto, ordenar alfabéticamente (case-insensitive)
          return valueA.localeCompare(valueB, "es", {
            sensitivity: "base",
            numeric: true, // Esto ayuda con números dentro de texto (ej: "R13" vs "R14")
          });
        });

        additionalFilterOptions.push({
          id: filterField,
          name: getFilterDisplayName(filterField),
          options,
        });
      }
    });

    return additionalFilterOptions;
  }, [
    urlParams,
    productsToUse,
    parseURLParams,
    isAtProductView,
    getFilterField,
  ]);

  // Función para aplicar filtros adicionales
  const applyAdditionalFilter = useCallback(
    (filterId, value) => {
      const newSelectedValues = {
        ...selectedValues,
        [filterId]: value,
      };
      setSelectedValues(newSelectedValues);

      // Actualizar URL después de aplicar filtro adicional
      if (updateURL && isInitialized) {
        syncURL({
          selectedLinea,
          currentStepIndex,
          selectedValues: newSelectedValues,
          searchQuery,
        });
      }
    },
    [
      selectedValues,
      selectedLinea,
      currentStepIndex,
      searchQuery,
      updateURL,
      isInitialized,
      syncURL,
    ]
  );

  // Función para limpiar filtro adicional
  const clearAdditionalFilter = useCallback(
    (filterId) => {
      const newSelectedValues = { ...selectedValues };
      delete newSelectedValues[filterId];
      setSelectedValues(newSelectedValues);

      // Actualizar URL después de limpiar filtro adicional
      if (updateURL && isInitialized) {
        syncURL({
          selectedLinea,
          currentStepIndex,
          selectedValues: newSelectedValues,
          searchQuery,
        });
      }
    },
    [
      selectedValues,
      selectedLinea,
      currentStepIndex,
      searchQuery,
      updateURL,
      isInitialized,
      syncURL,
    ]
  );

  // Función para limpiar todos los filtros adicionales de una vez
  const clearAllAdditionalFilters = useCallback(() => {
    const newSelectedValues = { ...selectedValues };

    // Eliminar todos los filtros que empiezan con DMA_
    Object.keys(newSelectedValues).forEach((key) => {
      if (key.startsWith("DMA_")) {
        delete newSelectedValues[key];
      }
    });

    setSelectedValues(newSelectedValues);

    // Actualizar URL después de limpiar todos los filtros adicionales
    if (updateURL && isInitialized) {
      syncURL({
        selectedLinea,
        currentStepIndex,
        selectedValues: newSelectedValues,
        searchQuery,
      });
    }
  }, [
    selectedValues,
    selectedLinea,
    currentStepIndex,
    searchQuery,
    updateURL,
    isInitialized,
    syncURL,
  ]);

  // Función para navegar a un filtro adicional desde el breadcrumb
  const goToAdditionalFilter = useCallback(
    (filterId) => {
      // Solo limpiar ese filtro específico, mantener los demás
      const newSelectedValues = { ...selectedValues };
      delete newSelectedValues[filterId];
      setSelectedValues(newSelectedValues);

      // No cambiar el currentStepIndex ya que seguimos en la vista de productos
      setEditingFilter(null);

      // Actualizar URL después de limpiar filtro adicional
      if (updateURL && isInitialized) {
        syncURL({
          selectedLinea,
          currentStepIndex,
          selectedValues: newSelectedValues,
          searchQuery,
        });
      }
    },
    [
      selectedValues,
      selectedLinea,
      currentStepIndex,
      searchQuery,
      updateURL,
      isInitialized,
      syncURL,
    ]
  );

  // Ref para debounce de búsqueda
  const searchTimeoutRef = React.useRef(null);

  // Función para manejar búsqueda
  const handleSearchChange = useCallback(
    (query) => {
      setSearchQuery(query);

      // Actualizar URL después de un delay (debounce) para evitar actualizaciones excesivas
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (updateURL && isInitialized) {
          syncURL({
            selectedLinea,
            currentStepIndex,
            selectedValues,
            searchQuery: query,
          });
        }
      }, 500); // 500ms de debounce
    },
    [
      selectedLinea,
      currentStepIndex,
      selectedValues,
      updateURL,
      isInitialized,
      syncURL,
    ]
  );

  // Funciones wrapper para mantener compatibilidad
  const setSelectedValuesWrapper = useCallback((values) => {
    setSelectedValues(values);
  }, []);

  const setCurrentStepIndexWrapper = useCallback((index) => {
    setCurrentStepIndex(index);
  }, []);

  // Valores derivados desde la URL para mantener compatibilidad
  // Estos valores se calculan desde la URL pero se devuelven como si fueran estado
  const urlDerivedState = useMemo(() => {
    if (!urlParams) {
      return {
        selectedLinea: null,
        currentStepIndex: 0,
        selectedValues: {},
        searchQuery: "",
      };
    }
    const urlState = parseURLParams();
    return {
      selectedLinea: urlState?.selectedLinea || null,
      currentStepIndex: urlState?.currentStepIndex || 0,
      selectedValues: urlState?.selectedValues || {},
      searchQuery: urlState?.searchQuery || "",
    };
  }, [urlParams, parseURLParams]);

  return {
    // Estado derivado desde la URL (la URL es la fuente de verdad)
    selectedLinea: urlDerivedState.selectedLinea,
    currentStepIndex: urlDerivedState.currentStepIndex,
    currentStep,
    selectedValues: urlDerivedState.selectedValues,
    filteredProducts,
    currentStepOptions,
    loading,
    availableLines,
    additionalFilters,
    searchQuery: urlDerivedState.searchQuery,

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
    clearAllAdditionalFilters,
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
