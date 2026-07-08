import api from "../../constants/api";

/**
 * Obtiene la lista de clientes (SOCIOS) del vendedor autenticado.
 * @returns {Promise<Object>} { success, data: { ...vendedor, SOCIOS: [] }, message }
 */
export const api_get_vendedores_por_cliente = async ({ empresa, linea }) => {
    try {
        const response = await api.get(
            `/vendedores/clientes/get-activos-by-empresa/${encodeURIComponent(empresa)}/${encodeURIComponent(linea)}`
        );

        return {
            success: true,
            message: response.data?.message || "Vendedores obtenidos correctamente",
            data: response.data?.data,
        };
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "Ocurrió un error al obtener los vendedores asignados";

        return {
            success: false,
            message,
            data: null,
            error: error.response?.data || null,
        };
    }
};