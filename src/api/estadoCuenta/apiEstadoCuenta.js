import api from "../../constants/api";

/**
 * Obtiene el estado de cuenta por empresa y código de socio.
 * @param {string} empresa - Nombre de la empresa
 * @param {string} id - Código de socio (ACCOUNT_USER)
 * @returns {Promise<Object>} { success, data: [], message }
 */
export const api_get_estado_cuenta = async (empresa, id) => {
  try {
    const response = await api.get(
      `/estado-cuenta/${encodeURIComponent(empresa)}/${encodeURIComponent(id)}`
    );
    return {
      success: true,
      message: response.data?.message || "Estado de cuenta obtenido correctamente.",
      data: response.data?.data || [],
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener el estado de cuenta";
    return {
      success: false,
      message,
      data: [],
      error: error.response?.data || null,
    };
  }
};
