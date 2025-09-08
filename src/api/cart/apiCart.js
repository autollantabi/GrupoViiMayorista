import api from "../../constants/api";

/**
 * Obtiene el carrito de un usuario
 * @param {string} account - ID de la cuenta
 * @returns {Promise<Object>} Objeto con información de éxito/error y datos
 */
export const api_cart_getCarrito = async (account) => {
  try {
    const response = await api.get(`/carrito/getCarrito/${account}`);

    return {
      success: true,
      message: response.data.message || "Carrito obtenido correctamente",
      data: response.data.data || [],
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al obtener el carrito";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Actualiza el carrito de un usuario
 * @param {string} id_shopping_cart - ID del carrito
 * @param {Object} carritoData - Datos del carrito a actualizar
 * @returns {Promise<Object>} Objeto con información de éxito/error y datos
 */
export const api_cart_updateCarrito = async (id_shopping_cart, carritoData) => {
  try {
    const response = await api.patch(
      `/carrito/updateCarrito/${id_shopping_cart}`,
      carritoData
    );

    return {
      success: true,
      message: response.data.message || "Carrito actualizado correctamente",
      data: response.data.data || {},
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al actualizar el carrito";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
