import api from "../../constants/api";

/**
 * Obtiene un producto por su campo personalizado
 * @param {string} field - campo personalizado del producto
 * @param {string} value - valor del campo personalizado
 * @returns {Promise<Object>} - Respuesta de la API
 */
export const api_products_getProductByField = async ({ field, value }) => {
  try {
    const response = await api.get(`/productos/getProductos/${field}/${value}`);
    return {
      success: true,
      message: response.data.message || "Producto obtenido correctamente",
      data: response.data.data || {},
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener el producto";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Obtiene los productos por cadena de búsqueda
 * @param {string} search - Cadena de búsqueda
 * @return {Promise<Object>} - Respuesta de la API
 */
export const api_products_searchProducts = async (search) => {
  try {
    const response = await api.get(`/productos/search/${search}`);
    return {
      success: true,
      message: response.data.message || "Productos obtenidos correctamente",
      data: response.data.data || [],
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al buscar los productos";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};


/**
 * Obtiene producto por Código
 * @param {string} value - Código del producto
 * @param {string} empresaId - ID de la empresa 
 * @return {Promise<Object>} - Respuesta de la API
 */
export const api_products_getProductByCodigo = async (value, empresaId) => {
  try {
    const response = await api.get(`/productos/getProductoByCodigo/${value}/${empresaId}`);    
    return {
      success: true,
      message: response.data.message || "Producto obtenido correctamente",
      data: response.data.data || {},
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener el producto por código";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
}

/**
 * Obtiene información de productos (incluyendo cantidad)
 * @return {Promise<Object>} - Respuesta de la API
 */
export const api_products_getInfoProductos = async () => {
  try {
    const response = await api.get(`/productos/getInfoProductos`);
    return {
      success: true,
      message: response.data.message || "Información de productos obtenida correctamente",
      data: response.data.data || {},
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener la información de productos";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
}