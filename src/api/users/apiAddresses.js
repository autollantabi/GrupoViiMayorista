import api from "../../constants/api";

/**
 * Crear dirección de usuario
 * @param {Object} addressData - Datos de la dirección a crear
 * @returns {Promise<Object>} Objeto con información de éxito/error y datos
 */
export const api_addresses_createAddress = async (addressData) => {
  try {
    const response = await api.post("/usuarios/createDireccion", addressData);

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: "Error en la respuesta del servidor" };
    }
  } catch (error) {
    console.error("Error al crear dirección:", error);
    return {
      success: false,
      error: error.response?.data?.mensaje || "Error al procesar la solicitud",
    };
  }
};

/**
 * Actualizar dirección de usuario
 * @param {string|number} id - ID de la dirección a actualizar
 * @param {Object} addressData - Datos de la dirección a actualizar
 * @returns {Promise<Object>} Objeto con información de éxito/error y datos
 */
export const api_addresses_updateAddress = async (id, addressData) => {
  try {
    const response = await api.post(
      `/usuarios/updateDireccion/${id}`,
      addressData
    );

    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: "Error en la respuesta del servidor" };
    }
  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    return {
      success: false,
      error: error.response?.data?.mensaje || "Error al procesar la solicitud",
    };
  }
};
