import api from "../../constants/api";

export const api_users_getAll = async () => {
  try {
    const response = await api.get("/usuarios/getUsers");
    return {
      success: true,
      message: "Usuarios obtenidos exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message || "Ocurrió un error al obtener usuarios";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

// CREAR USUARIO
export const api_users_create = async (userData) => {
  try {
    const response = await api.post("/usuarios/createUser", userData);
    return {
      success: true,
      message: "Usuario creado exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message || "Ocurrió un error al crear el usuario";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

// ACTUALIZAR USUARIO
export const api_users_update = async (userData) => {
  try {
    const response = await api.patch(
      `/usuarios/updateUser/${userData.id}`,
      userData
    );
    return {
      success: true,
      message: "Usuario actualizado exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al actualizar el usuario";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

// Actualizar SOLO el rol del usuario
export const api_users_updateRole = async (userId, roleId) => {
  try {
    const response = await api.patch(`/usuarios/updateRole/${userId}`, {
      role: parseInt(roleId),
    });

    return {
      success: true,
      message: "Rol actualizado exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al actualizar el rol";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

// Actualizar SOLO la contraseña del usuario
export const api_users_updatePassword = async (userId, password) => {
  try {
    const response = await api.patch(`/usuarios/updatePass/${userId}`, {
      password,
    });

    return {
      success: true,
      message: "Contraseña actualizada exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al actualizar la contraseña";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Acualizar el estado del usuario
 * @param {string|number} userId - ID del usuario a actualizar
 * @param {boolean} status - Nuevo estado del usuario (true/false)
 */
export const api_users_updateStatus = async (userId, status) => {
  try {
    const response = await api.patch(`/usuarios/updateStatus/${userId}`, {
      status,
    });

    return {
      success: true,
      message: "Estado del usuario actualizado exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al actualizar el estado del usuario";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Obtiene usuarios asociados a una cuenta específica
 * @param {string|number} codigoSocio - ID de la cuenta a consultar
 * @returns {Promise<Object>} Objeto con información de éxito/error y datos
 */
export const api_users_getByAccount = async (codigoSocio) => {
  try {
    const response = await api.get(`/usuarios/getInfoAccount/${codigoSocio}`);

    return {
      success: true,
      message: "Usuarios de la cuenta obtenidos exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener los usuarios de la cuenta";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Obtiene usuarios asociados a una cuenta específica
 * @param {string|number} email - correo de la cuenta a consultar
 * @returns {Promise<Object>} Objeto con información de éxito/error y datos
 */
export const api_users_getByEmail = async (email) => {
  try {
    const response = await api.get(`/usuarios/getUser/email/${email}`);

    return {
      success: true,
      message: "Usuarios de la cuenta obtenidos exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener los usuarios de la cuenta";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
