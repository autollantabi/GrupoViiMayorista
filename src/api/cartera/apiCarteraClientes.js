import api from "../../constants/api";

/**
 * Obtiene el resumen de cartera (cupo disponible, condición de pago, etc.)
 * de un cliente según la empresa seleccionada.
 * @param {string} empresa - Nombre de la empresa (ej. "MAXXIMUNDO", "AUTOLLANTA")
 */
export const api_cartera_getResumenCarteraClienteByEmpresa = async (empresa) => {
  try {
    const response = await api.get(
      `/cartera/clientes/resumen-cartera-cliente-by-empresa/${empresa}`
    );
    return {
      success: response.data?.status === "Ok!",
      data: response.data?.data || null,
      message: response.data?.message || "",
    };
    
  } catch (error) {
    return {
      success: false,
      data: null,
      message:
        error.response?.data?.message ||
        error.message ||
        "Error al obtener el resumen de cartera del cliente",
    };
  }
};