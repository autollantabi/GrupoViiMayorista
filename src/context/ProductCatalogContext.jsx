import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from "react";
import {
  api_products_getProductByCodigo,
  api_products_getProductByField,
  api_products_getProductById,
  api_products_getProductsByFieldPaginated,
  api_products_searchProducts,
} from "../api/products/apiProducts";
import { api_vendedores_getProductos } from "../api/vendedores/apiVendedores";
import { PRODUCT_LINE_CONFIG } from "../constants/productLineConfig";
import { baseLinkImages } from "../constants/links";

const ProductCatalogContext = createContext();
export const useProductCatalog = () => useContext(ProductCatalogContext);

export const ProductCatalogProvider = ({ children }) => {
  const [catalogByEmpresa, setCatalogByEmpresa] = useState({});
  const [loadingByEmpresa, setLoadingByEmpresa] = useState({});
  const [errorByEmpresa, setErrorByEmpresa] = useState({});

  // Estado exclusivo para el catálogo del vendedor (endpoint sin empresa)
  const [sellerCatalog, setSellerCatalog] = useState([]);
  const [sellerCatalogTotal, setSellerCatalogTotal] = useState(0);
  const [loadingSellerCatalog, setLoadingSellerCatalog] = useState(false);

  // Ref para rastrear peticiones en curso y evitar duplicidad
  const activeRequests = useRef({});

  // --- Mapeo de producto API a formato de app ---
  const mapApiProductToAppFormat = useCallback((item) => {
    try {
      if (!item) return null;

      // 1. Normalización AGRESIVA del objeto original para que sea compatible con los filtros
      // que buscan campos con prefijo DMA_
      const normalizedItem = { ...item };

      // ID - Muy flexible
      const id =
        item.DMA_IDENTIFICADORITEM ||
        item.ID_PRODUCT ||
        item.id ||
        item.codigo ||
        item.id_articulo;
      if (id) normalizedItem.DMA_IDENTIFICADORITEM = id;
      if (!id) return null;

      // Línea de Negocio - Muy flexible
      const lineaNegocioRaw =
        item.DMA_LINEANEGOCIO ||
        item.BUSINESS_LINE ||
        item.linea ||
        item.linea_negocio ||
        item.linea_negocion ||
        item.TIPO_NEGOCIO;

      // Intento de inferir línea si falta pero hay grupo o campos específicos (común en B2B)
      let lineToUse = (lineaNegocioRaw || "").toString().toUpperCase();

      if (!lineToUse) {
        // Si no hay línea, intentar inferir por otros campos
        if (item.DMA_SAE || item.SAE || item.sae) lineToUse = "LUBRICANTES";
        else if (item.DMA_ANCHO || item.DMA_RIN) lineToUse = "LLANTAS";
        else if (item.GRUPO_PRODUCTO === "aceiteparamotoresdieselautomotrices")
          lineToUse = "LUBRICANTES";
      }

      if (!lineToUse) {
        return null; // Aún requerimos que un producto pertenezca a una línea
      }

      normalizedItem.DMA_LINEANEGOCIO = lineToUse;

      // Empresa / Distribuidor
      const empresaRaw =
        item.DMA_EMPRESA ||
        item.ENTERPRISE ||
        item.empresa ||
        item.distribuidor ||
        item.DISTRIBUIDOR ||
        item.distribuidora;
      if (empresaRaw) normalizedItem.DMA_EMPRESA = empresaRaw.toUpperCase();

      // Marca
      const marcaRaw = item.DMA_MARCA || item.BRAND || item.marca || item.MARCA;
      if (marcaRaw) normalizedItem.DMA_MARCA = marcaRaw;

      // Otros campos comunes (para Lubricantes y Herramientas)
      if (item.APLICACION || item.aplicacion)
        normalizedItem.DMA_APLICACION = item.APLICACION || item.aplicacion;
      if (item.CLASE || item.clase)
        normalizedItem.DMA_CLASE = item.CLASE || item.clase;

      const grupoRaw =
        item.DMA_GRUPO ||
        item.grupo ||
        item.GRUPO_PRODUCTO ||
        item.grupo_producto;
      if (grupoRaw) normalizedItem.DMA_GRUPO = grupoRaw;

      if (item.SUBGRUPO || item.subgrupo)
        normalizedItem.DMA_SUBGRUPO = item.SUBGRUPO || item.subgrupo;
      if (item.TIPO || item.tipo)
        normalizedItem.DMA_TIPO = item.TIPO || item.tipo;
      if (item.SAE || item.sae) normalizedItem.DMA_SAE = item.SAE || item.sae;

      const stockRaw =
        item.DMA_STOCK ||
        item.stock ||
        item.QUANTITY ||
        item.cantidad ||
        item.STOCK;
      if (stockRaw !== undefined) normalizedItem.DMA_STOCK = stockRaw;

      const costoRaw =
        item.DMA_COSTO ||
        item.costo ||
        item.PRICE ||
        item.precio ||
        item.COSTO;
      if (costoRaw !== undefined) normalizedItem.DMA_COSTO = costoRaw;

      // 2. Aplicar configuración de línea
      const lineConfig =
        PRODUCT_LINE_CONFIG[normalizedItem.DMA_LINEANEGOCIO] ||
        PRODUCT_LINE_CONFIG.DEFAULT;

      const categoriesByType = {};
      lineConfig.categories.forEach((cat) => {
        if (normalizedItem[cat.field]) {
          const originalValue = normalizedItem[cat.field];
          const fieldType = cat.field.replace("DMA_", "").toLowerCase();
          if (!categoriesByType[fieldType]) categoriesByType[fieldType] = [];
          categoriesByType[fieldType].push(originalValue);
        }
      });

      const specs = {};
      lineConfig.specs.forEach((spec) => {
        try {
          const transformedValue = spec.transform(normalizedItem);
          specs[spec.field] =
            transformedValue == null ? spec.defaultValue : transformedValue;
        } catch (e) {
          specs[spec.field] = spec.defaultValue;
        }
      });

      let imageUrl = "https://via.placeholder.com/300x300?text=Sin+Imagen";
      const imagePath =
        normalizedItem.DMA_RUTAIMAGEN ||
        item.IMAGE_URL ||
        item.imagen ||
        item.ruta_imagen;
      if (imagePath) {
        try {
          imageUrl = `${baseLinkImages}${imagePath}`;
        } catch (e) {
          // Intentionally ignore image URL errors
        }
      }

      let name =
        normalizedItem.DMA_NOMBREITEM ||
        item.NAME ||
        item.nombre ||
        item.NOMBRE ||
        item.descripcion ||
        "Producto sin nombre";
      let description = "Sin descripción";
      try {
        name = lineConfig.nameTemplate(normalizedItem);
      } catch (e) {
        // Intentionally ignore errors in name template
      }
      try {
        description = lineConfig.descriptionTemplate(normalizedItem);
      } catch (e) {
        // Intentionally ignore errors in description template
      }

      const price = !isNaN(parseFloat(normalizedItem.DMA_COSTO))
        ? parseFloat(normalizedItem.DMA_COSTO)
        : 0;
      const stock = !isNaN(parseInt(normalizedItem.DMA_STOCK))
        ? parseInt(normalizedItem.DMA_STOCK)
        : 0;

      return {
        id: normalizedItem.DMA_IDENTIFICADORITEM,
        name,
        description,
        price,
        discount:
          normalizedItem.DMA_DESCUENTO_PROMOCIONAL ?? item.descuento ?? 0,
        image: imageUrl,
        filtersByType: categoriesByType,
        brand: normalizedItem.DMA_MARCA || "Sin marca",
        rating: 0,
        stock,
        destacado: normalizedItem.DMA_ACTIVO === "SI",
        empresaId: normalizedItem.DMA_EMPRESA,
        specs,
        rutaImagen: normalizedItem.DMA_RUTAIMAGEN || imagePath,
        codigoBarras: normalizedItem.DMA_CODIGOBARRAS || item.barcode,
        lineaNegocio: normalizedItem.DMA_LINEANEGOCIO,
        originalData: normalizedItem,
      };
    } catch (error) {
      console.error("Error mapping product:", error, item);
      return null;
    }
  }, []);

  // Cargar productos solo si no están en el contexto
  const loadProductsForEmpresa = useCallback(async (empresaName, ordenamiento) => {
    // Si ya existe una petición en curso para esta empresa, retornar la promesa existente
    if (activeRequests.current[empresaName] && !ordenamiento) {
      return activeRequests.current[empresaName];
    }

    // Si ya están los productos cargados y no se requiere ordenamiento específico, no hacer nada
    if (catalogByEmpresa[empresaName] && !ordenamiento) {
      return catalogByEmpresa[empresaName];
    }

    const fetchPromise = (async () => {
      setLoadingByEmpresa((prev) => ({ ...prev, [empresaName]: true }));
      setErrorByEmpresa((prev) => ({ ...prev, [empresaName]: null }));
      try {
        let allProducts = [];
        let total = 0;
        let offset = 0;
        const CHUNK_SIZE = 1000;

        // Realizar la primera llamada para obtener el total y el primer lote
        const firstResp = await api_products_getProductsByFieldPaginated({
          field: "empresa",
          value: empresaName,
          ordenamiento: ordenamiento || "DEFAULT",
          limit: CHUNK_SIZE,
          offset: 0,
        });

        if (firstResp.success) {
          allProducts = (firstResp.data || [])
            .map(mapApiProductToAppFormat)
            .filter(Boolean);

          total = firstResp.total || allProducts.length;

          // Cargar lotes restantes si es necesario
          while (allProducts.length < total) {
            offset += CHUNK_SIZE;
            const nextResp = await api_products_getProductsByFieldPaginated({
              field: "empresa",
              value: empresaName,
              ordenamiento: ordenamiento || "DEFAULT",
              limit: CHUNK_SIZE,
              offset: offset,
            });

            if (nextResp.success && nextResp.data && nextResp.data.length > 0) {
              const nextBatch = nextResp.data
                .map(mapApiProductToAppFormat)
                .filter(Boolean);
              allProducts = [...allProducts, ...nextBatch];
            } else {
              // Detener si hay un error o no vienen más datos
              break;
            }
          }

          setCatalogByEmpresa((prev) => ({ ...prev, [empresaName]: allProducts }));
          return allProducts;
        } else {
          setErrorByEmpresa((prev) => ({
            ...prev,
            [empresaName]: firstResp.message || "Error al cargar productos",
          }));
          return [];
        }
      } catch (error) {
        setErrorByEmpresa((prev) => ({ ...prev, [empresaName]: error.message }));
        return [];
      } finally {
        setLoadingByEmpresa((prev) => ({ ...prev, [empresaName]: false }));
        // Limpiar la referencia de la petición activa al finalizar
        delete activeRequests.current[empresaName];
      }
    })();

    activeRequests.current[empresaName] = fetchPromise;
    return fetchPromise;
  }, [catalogByEmpresa, mapApiProductToAppFormat]);

  const loadProductByCodigo = useCallback(async (codigo, empresaId) => {
    try {
      const resp = await api_products_getProductByCodigo(codigo, empresaId);

      if (resp.success && resp.data) {
        return mapApiProductToAppFormat(resp.data);
      }
      return null;
    } catch (error) {
      return null;
    }
  }, [mapApiProductToAppFormat]);

  /** Carga un solo producto por ID y empresa. La API siempre requiere empresaId. Ruta: /productos/:empresaId/:id */
  const loadProductById = useCallback(async (productId, empresaId) => {
    try {
      const resp = await api_products_getProductById(productId, empresaId);

      if (resp.success && resp.data) {
        return mapApiProductToAppFormat(resp.data);
      }
      return null;
    } catch (error) {
      return null;
    }
  }, [mapApiProductToAppFormat]);

  // Forzar recarga desde la API con carga por lotes
  const reloadProductsForEmpresa = useCallback(async (empresaName, ordenamiento) => {
    setLoadingByEmpresa((prev) => ({ ...prev, [empresaName]: true }));
    setErrorByEmpresa((prev) => ({ ...prev, [empresaName]: null }));
    try {
      let allProducts = [];
      let total = 0;
      let offset = 0;
      const CHUNK_SIZE = 1000;

      const firstResp = await api_products_getProductsByFieldPaginated({
        field: "empresa",
        value: empresaName,
        ordenamiento: ordenamiento || "DEFAULT",
        limit: CHUNK_SIZE,
        offset: 0,
      });

      if (firstResp.success) {
        allProducts = (firstResp.data || [])
          .map(mapApiProductToAppFormat)
          .filter(Boolean);

        total = firstResp.total || allProducts.length;

        while (allProducts.length < total) {
          offset += CHUNK_SIZE;
          const nextResp = await api_products_getProductsByFieldPaginated({
            field: "empresa",
            value: empresaName,
            ordenamiento: ordenamiento || "DEFAULT",
            limit: CHUNK_SIZE,
            offset: offset,
          });

          if (nextResp.success && nextResp.data && nextResp.data.length > 0) {
            const nextBatch = nextResp.data
              .map(mapApiProductToAppFormat)
              .filter(Boolean);
            allProducts = [...allProducts, ...nextBatch];
          } else {
            break;
          }
        }

        setCatalogByEmpresa((prev) => {
          const updated = { ...prev };
          updated[empresaName] = allProducts;
          return updated;
        });
        return allProducts;
      } else {
        setErrorByEmpresa((prev) => ({
          ...prev,
          [empresaName]: firstResp.message || "Error al recargar productos",
        }));
        return [];
      }
    } catch (error) {
      setErrorByEmpresa((prev) => ({ ...prev, [empresaName]: error.message }));
      return [];
    } finally {
      setLoadingByEmpresa((prev) => ({ ...prev, [empresaName]: false }));
    }
  }, [mapApiProductToAppFormat]);

  // Buscar productos por término de búsqueda (search term)
  const loadProductsBySearchTerm = useCallback(async (searchTerm) => {
    try {
      const resp = await api_products_searchProducts(searchTerm);
      if (resp.success) {
        // Mapear los productos al formato de la app
        const productos = (resp.data || [])
          .map(mapApiProductToAppFormat)
          .filter(Boolean);
        return { success: true, data: productos };
      } else {
        return { success: false, message: resp.message || "Error", data: [] };
      }
    } catch (error) {
      return { success: false, message: error.message, data: [] };
    }
  }, [mapApiProductToAppFormat]);

  /**
   * Carga TODOS los productos del vendedor (sin paginación).
   * GET /vendedores/productos/{ordenamiento}
   *
   * @param {Object}  params
   * @param {string}  [params.ordenamiento]  - "DEFAULT" | "CLASIFICACION_INDICE" | ""
   * @returns {Promise<{ products: Array, total: number }>}
   */
  const loadProductsForSeller = useCallback(async ({
    ordenamiento = "DEFAULT",
  } = {}) => {
    setLoadingSellerCatalog(true);
    try {
      const resp = await api_vendedores_getProductos({
        ordenamiento,
      });

      if (resp.success) {
        const products = (resp.data || [])
          .map(mapApiProductToAppFormat)
          .filter(Boolean);
        const total = resp.total ?? products.length;

        setSellerCatalog(products);
        setSellerCatalogTotal(total);
        return { products, total };
      } else {
        setSellerCatalog([]);
        setSellerCatalogTotal(0);
        return { products: [], total: 0 };
      }
    } catch (error) {
      console.error("Error loading seller products:", error);
      setSellerCatalog([]);
      setSellerCatalogTotal(0);
      return { products: [], total: 0 };
    } finally {
      setLoadingSellerCatalog(false);
    }
  }, [mapApiProductToAppFormat]);

  // Comparar productos (por ejemplo, por ID)
  const compareProducts = useCallback((empresaName, newProducts) => {
    const current = catalogByEmpresa[empresaName] || [];
    const currentIds = new Set(current.map((p) => p.id));
    const newIds = new Set(newProducts.map((p) => p.id));
    return {
      added: newProducts.filter((p) => !currentIds.has(p.id)),
      removed: current.filter((p) => !newIds.has(p.id)),
      unchanged: newProducts.filter((p) => currentIds.has(p.id)),
    };
  }, [catalogByEmpresa]);

  /**
   * Carga una página de productos con soporte de offset (server-side pagination).
   * Usa api_products_getProductsByFieldPaginated.
   * Requiere que el backend soporte query params: limit, offset, y filtros.
   *
   * @param {string} empresaName   - Nombre de la empresa (ej. "AUTOLLANTA")
   * @param {number} page          - Número de página (empieza en 1)
   * @param {number} limit         - Productos por página (ej. 24)
   * @param {Object} filters       - Filtros adicionales (ej. { DMA_LINEANEGOCIO: "LLANTAS" })
   * @param {string} ordenamiento  - Ordenamiento (DEFAULT, CLASIFICACION_INDICE, RECURRENCIA)
   * @returns {Promise<{ products: Array, total: number, page: number, totalPages: number }>}
   */
  const loadProductsPage = useCallback(async (
    empresaName,
    page = 1,
    limit = 24,
    filters = {},
    ordenamiento = "DEFAULT"
  ) => {
    const offset = (page - 1) * limit;
    setLoadingByEmpresa((prev) => ({ ...prev, [empresaName]: true }));
    try {
      const resp = await api_products_getProductsByFieldPaginated({
        field: "empresa",
        value: empresaName,
        ordenamiento,
        limit,
        offset,
        filters,
      });

      if (resp.success) {
        const productos = (resp.data || [])
          .map(mapApiProductToAppFormat)
          .filter(Boolean);
        const total = resp.total ?? productos.length;
        const totalPages = Math.ceil(total / limit);
        return { products: productos, total, page, totalPages };
      } else {
        return { products: [], total: 0, page, totalPages: 0 };
      }
    } catch (error) {
      return { products: [], total: 0, page, totalPages: 0 };
    } finally {
      setLoadingByEmpresa((prev) => ({ ...prev, [empresaName]: false }));
    }
  }, [mapApiProductToAppFormat]);

  /** Carga productos para múltiples empresas en paralelo */
  const loadProductsForMultipleCompanies = useCallback(async (companiesArr) => {
    if (!Array.isArray(companiesArr)) return [];
    const promises = companiesArr.map(empresa => loadProductsForEmpresa(empresa));
    return await Promise.all(promises);
  }, [loadProductsForEmpresa]);

  /** Obtiene un array plano con todos los productos de las empresas indicadas */
  const getProductsForCompanies = useCallback((companiesArr) => {
    if (!Array.isArray(companiesArr)) return [];
    return companiesArr.reduce((acc, empresa) => {
      const products = catalogByEmpresa[empresa] || [];
      return [...acc, ...products];
    }, []);
  }, [catalogByEmpresa]);

  const value = useMemo(() => ({
    catalogByEmpresa,
    loadingByEmpresa,
    errorByEmpresa,
    loadProductsForEmpresa,
    reloadProductsForEmpresa,
    compareProducts,
    loadProductsPage,
    mapApiProductToAppFormat,
    loadProductsBySearchTerm,
    loadProductByCodigo,
    loadProductById,
    // Catálogo del vendedor (endpoint sin empresa)
    sellerCatalog,
    sellerCatalogTotal,
    loadingSellerCatalog,
    loadProductsForSeller,
    loadProductsForMultipleCompanies,
    getProductsForCompanies,
  }), [
    catalogByEmpresa,
    loadingByEmpresa,
    errorByEmpresa,
    loadProductsForEmpresa,
    reloadProductsForEmpresa,
    compareProducts,
    loadProductsPage,
    mapApiProductToAppFormat,
    loadProductsBySearchTerm,
    loadProductByCodigo,
    loadProductById,
    sellerCatalog,
    sellerCatalogTotal,
    loadingSellerCatalog,
    loadProductsForSeller,
    loadProductsForMultipleCompanies,
    getProductsForCompanies,
  ]);

  return (
    <ProductCatalogContext.Provider value={value}>
      {children}
    </ProductCatalogContext.Provider>
  );
};
