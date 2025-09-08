import api from "../../constants/api";

// OBTENER ROLES
export const api_roles_getAll = async () => {
  try {
    const response = await api.get("/roles/getRoles");
    return {
      success: true,
      message: "Roles obtenidos exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message || "Ocurrió un error al obtener roles";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
