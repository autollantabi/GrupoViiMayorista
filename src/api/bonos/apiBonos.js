import api from "../../constants/api";

/**
 * Obtener clientes del Cliente Mayorista
 * @param {string} idMayorista - ID del mayorista
 * @return {Promise<Object>} Respuesta de la API
 *
 */
export const api_bonos_getClientesByMayorista = async (idMayorista) => {
  try {
    const response = await api.get(
      `/bonos/getCustomersByMayoristaID/${idMayorista}`
    );
    return {
      success: true,
      message: response.data.message || "Clientes obtenidos correctamente",
      data: response.data.data || [],
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener los clientes";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Obtener bonos de un cliente
 * @param {string} idCliente - ID del cliente
 * @return {Promise<Object>} Respuesta de la API
 *
 */
export const api_bonos_getBonosByCustomer = async (idCliente) => {
  try {
    const response = await api.get(`/bonos/getBonusByCustomer/${idCliente}`);
    return {
      success: true,
      message: response.data.message || "Bonos obtenidos correctamente",
      data: response.data.data || [],
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al obtener los bonos";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Obtener opciones de productos
 * @return {Promise<Object>} Respuesta de la API
 */
export const api_bonos_getEligibleProducts = async () => {
  try {
    const response = await api.get("/bonos/getEligibleProducts");
    return {
      success: true,
      message:
        response.data.message ||
        "Opciones de productos obtenidas correctamente",
      data: response.data.data || [],
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener las opciones de productos";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Crear un cliente
 * @param {Object} customerData - Datos del cliente
 * @return {Promise<Object>} Respuesta de la API
 */
export const api_bonos_createCustomer = async (customerData) => {
  try {
    const response = await api.post("/bonos/createCustomer", customerData);
    return {
      success: true,
      message: response.data.message || "Cliente creado correctamente",
      data: response.data.data || {},
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al crear el cliente";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Crear un bono
 * @param {Object} bonusData - Datos del bono
 * @return {Promise<Object>} Respuesta de la API
 */
export const api_bonos_createBonus = async (bonusData) => {
  try {
    const response = await api.post("/bonos/createBonus", bonusData);
    return {
      success: true,
      message: response.data.message || "Bono creado correctamente",
      data: response.data.data || {},
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al crear el bono";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Obtener datos de un bono por ID
 * @param {string} bonoId - ID del bono
 * @returns {Promise<Object>} Respuesta de la API
 */
export const api_bonos_getBonoById = async (bonoId) => {
  try {
    const response = await api.get(`/bonos/getBonusById/${bonoId}`);
    return {
      success: true,
      data: response.data.data,
      message: "Bono obtenido exitosamente",
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al obtener el bono";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Usar un bono
 * @param {string} bonoId - ID del bono
 * @param {string} idUser - ID del usuario Reencauchador
 * @returns {Promise<Object>} Respuesta de la API
 */
export const api_bonos_useBonus = async (bonoId, idUser) => {
  try {
    const response = await api.patch(`/bonos/useBonus/${bonoId}`, {
      ID_USER: idUser,
    });
    return {
      success: true,
      message: response.data.message || "Bono usado correctamente",
      data: response.data.data || {},
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al usar el bono";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Verificar un bono por código QR encriptado (el backend desencripta)
 * @param {string} encryptedCode - Código encriptado del QR
 * @returns {Promise<Object>} Respuesta de la API con los datos del bono
 */
export const api_bonos_verifyQRCode = async (encryptedCode) => {
  try {
    const response = await api.post("/bonos/verifyQRCode", {
      qrCode: encryptedCode,
    });
    return {
      success: true,
      message: response.data.message || "Código QR verificado correctamente",
      data: response.data.data || {},
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al verificar el código QR";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Obtener bonos de usuario reencauchador
 * @param {string} idUser - ID del usuario Reencauchador
 * @returns {Promise<Object>} Respuesta de la API
 */
export const api_bonos_getBonosByReencaucheUser = async (idUser) => {
  try {
    const response = await api.get(`/bonos/getUsedBonusByUser/${idUser}`);
    return {
      success: true,
      message: response.data.message || "Bonos obtenidos correctamente",
      data: response.data.data || [],
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al obtener los bonos";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Generar código QR para un bono (el backend encripta)
 * @param {number|Object} bonoIdOrData - ID del bono O objeto con {invoiceNumber, customerIdentification}
 * @returns {Promise<Object>} Respuesta con el QR code
 */
export const api_bonos_generateQR = async (bonoIdOrData) => {
  try {
    let requestData;

    // Verificar si es un objeto (para múltiples bonos) o un ID simple (para un solo bono)
    if (typeof bonoIdOrData === "object") {
      requestData = {
        invoiceNumber: bonoIdOrData.invoiceNumber,
        customerIdentification: bonoIdOrData.customerIdentification,
      };
    } else {
      requestData = {
        bonusId: bonoIdOrData,
      };
    }

    const response = await api.post(`/bonos/generateQR`, requestData);
    return {
      success: true,
      message: response.data.message || "QR generado correctamente",
      data: response.data.data || {},
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al generar el QR";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Enviar el archivo de bonos por email(archivo) y WhatsApp(notificacion)
 * @param {File|Blob} file - Archivo PDF del bono
 * @param {string} email - Correo electrónico
 * @param {string} phone - Número de teléfono
 * @param {string} customerName - Nombre del cliente
 * @returns {Promise<Object>} Respuesta de la API
 */
export const api_bonos_sendBonusFile = async (
  file,
  email,
  phone,
  customerName
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("customerName", customerName);
    // formData.append("whatsappMode", 'notification');

    const response = await api.post("/files/send", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: true,
      message:
        response.data.message || "Archivo de bonos enviado correctamente",
      data: response.data.data || {},
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al enviar el archivo de bonos";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
