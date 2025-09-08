import api from "../../constants/api";
import { guardarSessionID } from "../../utils/encryptToken";

export const api_auth_login = async ({ email, password }) => {
  try {
    const response = await api.post("/auth/login", { email, password });

    if (response.status === 200 || response.status === 201) {
      const sessionId = response.data.idSession || null;

      // Guardar tokens si existen
      if (sessionId) {
        guardarSessionID(sessionId);
      }

      return {
        success: true,
        data: response.data,
        message: "Login exitoso",
      };
    }
    return {
      success: false,
      message: response.data.message || "Error en la autenticación",
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message || "Ocurrió un error al iniciar sesión";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Realiza el logout del usuario y limpia los datos de sesión.
 * @return {Promise<void>} Promesa que se resuelve al completar el logout.
 */
export const api_auth_logout = async () => {
  try {
    // Realizar la petición de logout
    await api.post("/auth/logout");

    return {
      success: true,
      message: "Logout exitoso",
    };
  } catch (error) {
    console.error("Error al realizar logout:", error);
    return {
      success: false,
      message: "Error al realizar logout",
      error: error.response?.data || null,
    };
  }
};
