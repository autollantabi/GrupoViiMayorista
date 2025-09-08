import api from "../../constants/api";

/**
 * Verifica el token actual y obtiene información del usuario
 * @returns {Promise<Object>} Respuesta con los datos del usuario
 */
export const api_auth_me = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    throw error; // Re-lanzar el error para manejarlo en el contexto de autenticación
  }
};
