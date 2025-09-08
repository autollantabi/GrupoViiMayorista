import api from "../../constants/api";

/**
 * Obtener pedidos por usuario
 * @param {string} account - account del usuario
 * @return {Promise<Object>} Respuesta de la API
 *
 */
export const api_order_getOrdersByAccount = async (account) => {
  try {
    const response = await api.get(`/pedidos/getPedidos/${account}`);
    return {
      success: true,
      message: response.data.message || "Pedidos obtenidos correctamente",
      data: response.data.data || [],
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener los pedidos";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Crear un pedido
 * @param {Object} orderData - Datos del pedido
 * @return {Promise<Object>} Respuesta de la API
 */
export const api_order_createOrder = async (orderData) => {
  try {
    const response = await api.post("/pedidos/createPedido", orderData);
    return {
      success: true,
      message: response.data.message || "Pedido creado correctamente",
      data: response.data.data || {},
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al crear el pedido";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Obtener un pedido por ID
 * @param {string} orderId - ID del pedido
 * @return {Promise<Object>} Respuesta de la API
 */
export const api_order_getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/pedidos/getPedidosByOrder/${orderId}`);
    return {
      success: true,
      message: response.data.message || "Pedido obtenido correctamente",
      data: response.data.data || {},
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al obtener el pedido";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Obtner pedidos por empresas
 * @param {Array} enterprises - arreglo de empresas
 * @return {Promise<Object>} Respuesta de la API
 */
export const api_order_getOrdersByEnterprises = async (enterprises) => {
  try {
    const response = await api.post(`/pedidos/getPedidosByEnterprise`, {
      empresas: enterprises,
    });
    return {
      success: true,
      message: response.data.message || "Pedidos obtenidos correctamente",
      data: response.data.data || [],
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener los pedidos por empresa";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Actualizar un pedido
 * @param {string} orderId - ID del pedido
 * @param {Object} orderData - Datos del pedido a actualizar
 * @return {Promise<Object>} Respuesta de la API
 */
export const api_order_updateOrder = async (orderId, orderData) => {
  try {
    const response = await api.patch(
      `/pedidos/updateOrder/${orderId}`,
      orderData
    );
    return {
      success: true,
      message: response.data.message || "Pedido actualizado correctamente",
      data: response.data.data || {},
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al actualizar el pedido";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
