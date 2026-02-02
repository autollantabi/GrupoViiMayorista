import api from "../../constants/api";

/**
 * Obtiene el balance de puntos X-Coin del usuario (portal mayorista)
 * @param {string} accountUser - Código de cuenta (ACCOUNT_USER)
 * @returns {Promise<Object>} { success, message, data?: { ID_BALANCE, ID_USER, ACCOUNT_USER, TOTAL_POINTS, AVAILABLE_POINTS, USED_POINTS } }
 */
export const api_xcoin_getBalance = async (accountUser) => {
  try {
    const response = await api.get(
      `x-coin/balance/${encodeURIComponent(accountUser)}`
    );
    return {
      success: true,
      message: response.data.message || "Balance obtenido",
      data: response.data.data || response.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener el balance de X-Coin";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Obtiene el catálogo de productos canjeables con X-Coin (portal mayorista)
 * @returns {Promise<Object>} { success, message, data?: Array }
 */
export const api_xcoin_getProducts = async () => {
  try {
    const response = await api.get("x-coin/products");
    return {
      success: true,
      message: response.data.message || "Productos obtenidos",
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener los productos X-Coin";
    return {
      success: false,
      message,
      data: [],
      error: error.response?.data || null,
    };
  }
};

/**
 * Obtiene el historial de canjes del usuario (portal mayorista)
 * @param {string} idUser - UUID del usuario (ID_USER)
 * @returns {Promise<Object>} { success, message, data?: Array }
 */
export const api_xcoin_getRedemptionHistory = async (idUser) => {
  try {
    const response = await api.get(
      `x-coin/redemption-history/${encodeURIComponent(idUser)}`
    );
    return {
      success: true,
      message: response.data.message || "Historial obtenido",
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener el historial de canjes";
    return {
      success: false,
      message,
      data: [],
      error: error.response?.data || null,
    };
  }
};

/**
 * Crea un canje de X-Coin (portal mayorista)
 * @param {Object} payload
 * @param {string} payload.idUser - UUID del usuario (ID_USER)
 * @param {number} payload.idProduct - ID del producto (ID_PRODUCT)
 * @param {number} payload.quantity - Cantidad a canjear
 * @returns {Promise<Object>} { success, message, data?: object }
 */
export const api_xcoin_createRedemption = async ({
  idUser,
  idProduct,
  quantity,
}) => {
  try {
    const response = await api.post("x-coin/create-redemption", {
      idUser,
      idProduct,
      quantity,
    });
    return {
      success: true,
      message: response.data.message || "Canje realizado correctamente",
      data: response.data.data || response.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al realizar el canje";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
