import api from "../../constants/api";

/**
 * Enviar solicitud de acceso a empresa
 * @param {Object} solicitudData - Datos de la solicitud
 * @param {string} solicitudData.cuenta - RUC o cuenta de la empresa
 * @param {string} solicitudData.nombre - Nombre del solicitante
 * @param {string} solicitudData.correo - Email del solicitante
 * @param {string} solicitudData.telefono - Teléfono del solicitante
 * @param {string} solicitudData.empresa - Nombre de la empresa
 * @return {Promise<Object>} Respuesta de la API
 */
export const api_email_solicitudEmpresa = async (solicitudData) => {
  try {
    const response = await api.post("email/solicitudEmpresa", {
      cuenta: solicitudData.cuenta,
      nombre: solicitudData.nombre,
      correo: solicitudData.correo,
      telefono: solicitudData.telefono,
      empresa: solicitudData.empresa,
    });

    return {
      success: true,
      message: response.data.message || "Solicitud enviada correctamente",
      data: response.data.data || {},
    };
  } catch (error) {
    console.error("Error enviando solicitud de empresa:", error);
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al enviar la solicitud";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
