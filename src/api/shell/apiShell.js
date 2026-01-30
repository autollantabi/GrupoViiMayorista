import apiShell from "../../constants/apiShell";

/**
 * Busca si un usuario ya está registrado en la app Shell por código SAP
 * @param {string} sapCode - Código SAP del usuario (ACCOUNT_USER)
 * @returns {Promise<Object>} { success: boolean, message: string, data?: object, error?: object }
 */
export const api_shell_searchManager = async (sapCode) => {
  try {
    const response = await apiShell.get(`/usuarios/search-manager/${sapCode}`);
    return {
      success: true,
      message: response.data.message || "Usuario encontrado exitosamente",
      data: response.data.data || response.data,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        success: false,
        message: "Usuario no encontrado en la app",
        data: null,
        error: error.response?.data || null,
      };
    }
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al buscar el usuario en la app";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Crea un usuario en la aplicación Lider Shell
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.name - Nombre del usuario
 * @param {string} userData.lastname - Apellido del usuario
 * @param {string} userData.card_id - Cédula del usuario
 * @param {string} userData.email - Correo electrónico del usuario
 * @param {string} userData.phone - Teléfono del usuario
 * @param {number} userData.roleId - ID del rol (debe ser 1)
 * @param {string} userData.birth_date - Fecha de nacimiento (formato YYYY-MM-DD)
 * @param {string} userData.sap_code - Código SAP del usuario (ACCOUNT_USER)
 * @param {Array} userData.direcciones - Array de direcciones del usuario
 * @returns {Promise<Object>} Objeto con información de éxito/error
 */
export const api_shell_createUser = async (userData) => {
  try {
    const response = await apiShell.post("/usuarios", {
      name: userData.name,
      lastname: userData.lastname,
      card_id: userData.card_id,
      email: userData.email,
      phone: userData.phone,
      roleId: userData.roleId,
      birth_date: userData.birth_date,
      sap_code: userData.sap_code,
      direcciones: userData.direcciones,
    });

    return {
      success: true,
      message: response.data.message || "Usuario creado exitosamente",
      data: response.data.data || response.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al crear el usuario";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
