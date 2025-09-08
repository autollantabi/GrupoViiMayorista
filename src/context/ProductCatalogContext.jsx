import React, { createContext, useContext, useState } from "react";
import {
  api_products_getProductByCodigo,
  api_products_getProductByField,
  api_products_searchProducts,
} from "../api/products/apiProducts";
import { PRODUCT_LINE_CONFIG } from "../constants/productLineConfig";

const ProductCatalogContext = createContext();
export const useProductCatalog = () => useContext(ProductCatalogContext);

export const ProductCatalogProvider = ({ children }) => {
  const [catalogByEmpresa, setCatalogByEmpresa] = useState({});
  const [loadingByEmpresa, setLoadingByEmpresa] = useState({});
  const [errorByEmpresa, setErrorByEmpresa] = useState({});

  // --- Mapeo de producto API a formato de app ---
  const mapApiProductToAppFormat = (item) => {
    try {
      if (!item) return null;
      if (!item.DMA_IDENTIFICADORITEM) return null;
      const lineConfig =
        PRODUCT_LINE_CONFIG[item.DMA_LINEANEGOCIO] ||
        PRODUCT_LINE_CONFIG.DEFAULT;
      const categoriesByType = {};
      lineConfig.categories.forEach((cat) => {
        if (item[cat.field]) {
          const originalValue = item[cat.field];
          const fieldType = cat.field.replace("DMA_", "").toLowerCase();
          if (!categoriesByType[fieldType]) categoriesByType[fieldType] = [];
          categoriesByType[fieldType].push(originalValue);
        }
      });
      const specs = {};
      lineConfig.specs.forEach((spec) => {
        try {
          const transformedValue = spec.transform(item);
          specs[spec.field] =
            transformedValue == null ? spec.defaultValue : transformedValue;
        } catch (e) {
          specs[spec.field] = spec.defaultValue;
        }
      });
      let imageUrl = "https://via.placeholder.com/300x300?text=Sin+Imagen";
      if (item.DMA_RUTAIMAGEN) {
        try {
          imageUrl = `${import.meta.env.VITE_API_IMAGES_URL}${
            item.DMA_RUTAIMAGEN
          }`;
        } catch (e) {
          // Intentionally ignore image URL errors
        }
      }
      let name = "Producto sin nombre";
      let description = "Sin descripción";
      try {
        name = lineConfig.nameTemplate(item);
      } catch (e) {
        // Intentionally ignore errors in name template
      }
      try {
        description = lineConfig.descriptionTemplate(item);
      } catch (e) {
        // Intentionally ignore errors in description template
      }
      const price = !isNaN(parseFloat(item.DMA_COSTO))
        ? parseFloat(item.DMA_COSTO)
        : 0;
      const stock = !isNaN(parseInt(item.DMA_STOCK))
        ? parseInt(item.DMA_STOCK)
        : 0;
      return {
        id: item.DMA_IDENTIFICADORITEM,
        name,
        description,
        price,
        discount: item.DMA_DESCUENTO_PROMOCIONAL,
        image: imageUrl,
        filtersByType: categoriesByType,
        brand: item.DMA_MARCA || "Sin marca",
        rating: 0,
        stock,
        destacado: item.DMA_ACTIVO === "SI",
        empresaId: item.DMA_EMPRESA,
        specs,
        rutaImagen: item.DMA_RUTAIMAGEN,
        codigoBarras: item.DMA_CODIGOBARRAS,
        lineaNegocio: item.DMA_LINEANEGOCIO,
        originalData: item,
      };
    } catch (error) {
      return null;
    }
  };

  // Cargar productos solo si no están en el contexto
  const loadProductsForEmpresa = async (empresaName) => {
    if (catalogByEmpresa[empresaName]) {
      return catalogByEmpresa[empresaName];
    }
    setLoadingByEmpresa((prev) => ({ ...prev, [empresaName]: true }));
    setErrorByEmpresa((prev) => ({ ...prev, [empresaName]: null }));
    try {
      const resp = await api_products_getProductByField({
        field: "empresa",
        value: empresaName,
      });

      if (resp.success) {
        const productos = (resp.data || [])
          .map(mapApiProductToAppFormat)
          .filter(Boolean);
        setCatalogByEmpresa((prev) => ({ ...prev, [empresaName]: productos }));
        return productos;
      } else {
        setErrorByEmpresa((prev) => ({
          ...prev,
          [empresaName]: resp.message || "Error",
        }));
        return [];
      }
    } catch (error) {
      setErrorByEmpresa((prev) => ({ ...prev, [empresaName]: error.message }));
      return [];
    } finally {
      setLoadingByEmpresa((prev) => ({ ...prev, [empresaName]: false }));
    }
  };

  const loadProductByCodigo = async (codigo, empresaId) => {
    try {
      const resp = await api_products_getProductByCodigo(codigo, empresaId);
      if (resp.success && resp.data) {
        return mapApiProductToAppFormat(resp.data);
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Forzar recarga desde la API
  const reloadProductsForEmpresa = async (empresaName) => {
    setLoadingByEmpresa((prev) => ({ ...prev, [empresaName]: true }));
    setErrorByEmpresa((prev) => ({ ...prev, [empresaName]: null }));
    try {
      const resp = await api_products_getProductByField({
        field: "empresa",
        value: empresaName,
      });
      if (resp.success) {
        const productos = (resp.data || [])
          .map(mapApiProductToAppFormat)
          .filter(Boolean);
        setCatalogByEmpresa((prev) => ({ ...prev, [empresaName]: productos }));
        return productos;
      } else {
        setErrorByEmpresa((prev) => ({
          ...prev,
          [empresaName]: resp.message || "Error",
        }));
        return [];
      }
    } catch (error) {
      setErrorByEmpresa((prev) => ({ ...prev, [empresaName]: error.message }));
      return [];
    } finally {
      setLoadingByEmpresa((prev) => ({ ...prev, [empresaName]: false }));
    }
  };

  // Buscar productos por término de búsqueda (search term)
  const loadProductsBySearchTerm = async (searchTerm) => {
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
  };

  // Comparar productos (por ejemplo, por ID)
  const compareProducts = (empresaName, newProducts) => {
    const current = catalogByEmpresa[empresaName] || [];
    const currentIds = new Set(current.map((p) => p.id));
    const newIds = new Set(newProducts.map((p) => p.id));
    return {
      added: newProducts.filter((p) => !currentIds.has(p.id)),
      removed: current.filter((p) => !newIds.has(p.id)),
      unchanged: newProducts.filter((p) => currentIds.has(p.id)),
    };
  };

  return (
    <ProductCatalogContext.Provider
      value={{
        catalogByEmpresa,
        loadingByEmpresa,
        errorByEmpresa,
        loadProductsForEmpresa,
        reloadProductsForEmpresa,
        compareProducts,
        mapApiProductToAppFormat, // Exportar el mapeo para uso externo si se requiere
        loadProductsBySearchTerm, // Nueva función para búsqueda
        loadProductByCodigo,
      }}
    >
      {children}
    </ProductCatalogContext.Provider>
  );
};
