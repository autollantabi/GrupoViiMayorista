import api from "../../constants/api";

/**
 * Obtiene un producto por su campo personalizado
 * @param {string} field - campo personalizado del producto
 * @param {string} value - valor del campo personalizado
 * @param {string} ordenamiento - ordenamiento opcional (DEFAULT, CLASIFICACION_INDICE). Si no se proporciona, se usa DEFAULT
 * @returns {Promise<Object>} - Respuesta de la API
 */
export const api_products_getProductByField = async ({
  field,
  value,
  ordenamiento,
}) => {
  try {
    // Construir la URL con ordenamiento si se proporciona
    let url = `/productos/getProductos/${field}/${value}`;
    if (ordenamiento) {
      url += `/${ordenamiento}`;
    }
    const response = await api.get(url);
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
    const response = await api.get(
      `/productos/getProductoByCodigo/${value}/${empresaId}`
    );
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
};

/**
 * Obtiene un solo producto por su ID (identificador) y empresa.
 * Ruta: GET /web/productos/getProductoById/{productId}/{empresaId}
 * empresaId es obligatorio: no existe API sin empresa.
 * @param {string} productId - ID del producto (ej. DMA_IDENTIFICADORITEM)
 * @param {string} empresaId - ID de la empresa (obligatorio)
 * @return {Promise<Object>} - Respuesta de la API con data = objeto producto
 */
export const api_products_getProductById = async (productId, empresaId) => {
  try {
    const base = "/web/productos";
    const response = await api.get(
      `${base}/getProductoById/${encodeURIComponent(productId)}/${encodeURIComponent(empresaId)}`
    );
    return {
      success: true,
      message: response.data.message || "Producto obtenido correctamente",
      data: response.data.data || response.data || {},
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
 * Obtiene productos paginados por campo con soporte de offset.
 * Requiere que el backend soporte query params: limit, offset, y filtros adicionales.
 * Cuando el backend esté listo, usar esta función en lugar de api_products_getProductByField.
 *
 * Ejemplo de URL generada:
 *   /productos/getProductos/empresa/AUTOLLANTA/DEFAULT?limit=24&offset=0&linea=LLANTAS
 *
 * @param {Object} params
 * @param {string} params.field       - Campo a filtrar (ej. "empresa")
 * @param {string} params.value       - Valor del campo (ej. "AUTOLLANTA")
 * @param {string} [params.ordenamiento]  - Ordenamiento (DEFAULT, CLASIFICACION_INDICE, RECURRENCIA)
 * @param {number} [params.limit]     - Cantidad de registros por página (ej. 24)
 * @param {number} [params.offset]    - Posición de inicio (ej. 0 para pág 1, 24 para pág 2)
 * @param {Object} [params.filters]   - Filtros adicionales como key-value (ej. { DMA_LINEANEGOCIO: "LLANTAS" })
 * @returns {Promise<{ success: boolean, data: Array, total: number }>}
 */
export const api_products_getProductsByFieldPaginated = async ({
  field,
  value,
  ordenamiento,
  limit = 24,
  offset = 0,
  filters = {},
}) => {
  try {
    let url = `/productos/getProductos/${field}/${value}`;
    if (ordenamiento) {
      url += `/${ordenamiento}`;
    }

    // Construir query params: limit, offset, y filtros adicionales
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...filters,
    });

    url += `?${queryParams.toString()}`;


    const response = await api.get(url);

    return {
      success: true,
      message: response.data.message || "Productos obtenidos correctamente",
      data: response.data.data || [],
      // El backend debe devolver el total de registros para calcular las páginas
      total: response.data.total ?? (response.data.data?.length ?? 0),
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener los productos";
    return {
      success: false,
      message,
      data: [],
      total: 0,
      error: error.response?.data || null,
    };
  }
};

/**
 * Obtiene información de productos (incluyendo cantidad)
 * @return {Promise<Object>} - Respuesta de la API
 */
export const api_products_getInfoProductos = async () => {
  try {
    const response = await api.get(`/productos/getInfoProductos`);
    return {
      success: true,
      message:
        response.data.message ||
        "Información de productos obtenida correctamente",
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
};
