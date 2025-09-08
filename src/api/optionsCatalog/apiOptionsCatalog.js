import api from "../../constants/api";

/**
 * Obtiene un catálogo de opciones para los estados de un pedido.
 * @returns {Promise<Object>} Respuesta de la API con el catálogo de estados.
 */
export const api_optionsCatalog_getStates = async () => {
  try {
    const response = await api.get("/catalogo/getEstadosPedido");
    return {
      success: true,
      message:
        response.data.message || "Catálogo de estados obtenido correctamente",
      data: response.data.data || [],
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener el catálogo de estados";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
