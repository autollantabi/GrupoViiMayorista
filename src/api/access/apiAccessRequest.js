import api from "../../constants/api";

/**
 * Envía una solicitud de acceso a una empresa
 * @param {Object} requestData - Datos de la solicitud
 * @param {string} requestData.empresa - Nombre de la empresa
 * @param {string} requestData.email - Email del solicitante
 * @param {string} requestData.fullName - Nombre completo del solicitante
 * @param {string} requestData.reason - Razón de la solicitud
 * @returns {Promise<Object>} Objeto con información de éxito/error
 */
export const api_access_requestAccess = async (requestData) => {
  try {
    const response = await api.post("/api/access/request", requestData);
    return {
      success: true,
      message: "Solicitud de acceso enviada exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al enviar la solicitud de acceso";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
