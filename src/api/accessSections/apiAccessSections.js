import api from "../../constants/api";

/**
 * Obtiene todas las secciones de acceso
 * @returns {Promise<Object>} Objeto con información de éxito/error
 */
export const api_access_sections_get_all = async () => {
  try {
    const response = await api.get("usuarios-permitidos/get");
    return {
      success: true,
      message: "Secciones de acceso obtenidas exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener las secciones de acceso";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Crear una nueva sección de acceso
 * @param {String} email - Email del usuario
 * @param {String} section - Sección de acceso
 * @returns {Promise<Object>} Objeto con información de éxito/error
 */
export const api_access_sections_create = async (email, section) => {
  try {
    const response = await api.post("usuarios-permitidos/save", {
      EMAIL_PERMITTED_USER: email,
      SECTION_PERMITTED_USER: section,
    });
    return {
      success: true,
      message: "Sección de acceso creada exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al crear la sección de acceso";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Obtener permiso seccion por usuario y seccion
 * @param {String} email - Email del usuario
 * @param {String} section - Sección de acceso
 * @returns {Promise<Object>} Objeto con información de éxito/error
 */
export const api_access_sections_get_permission_by_email_and_section = async (email, section) => {
  try {
    const response = await api.get(`usuarios-permitidos/getByEmailAndSection/${email}/${section}`, {
    });
    return {
      success: true,
      message: "Permiso de sección obtenido exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener el permiso de sección";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};