import api from "../../constants/api";

/**
 * Obtener las direcciondes del usuario por cuenta y por empresa
 * @param {string} account - Cuenta del usuario
 * @param {string} company - Empresa del usuario
 * @return {Promise<Object>} - Respuesta de la API con las direcciones del usuario
 *
 */
export const api_profile_getAddresses = async ({ account, company }) => {
  try {
    const response = await api.get(
      `/usuarios/getDirecciones/${account}/${company}`
    );
    return {
      success: true,
      message: "Direcciones obtenidas correctamente",
      data: response.data.data || [],
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener direcciones";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
