import api from "../../constants/api";

/**
 * Obtiene la lista de clientes (SOCIOS) del vendedor autenticado.
 * @returns {Promise<Object>} { success, data: { ...vendedor, SOCIOS: [] }, message }
 */
export const api_vendedores_getClientes = async () => {
    try {
        const response = await api.get("/vendedores/clientes");
        if (response.status === 200 || response.status === 201) {
            return {
                success: true,
                message: response.data.message || "Clientes obtenidos exitosamente",
                data: response.data.data,
            };
        }
        return {
            success: false,
            message: response.data.message || "Error al obtener los clientes",
            data: null,
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
 * Obtiene todos los productos del catálogo del vendedor autenticado.
 * No requiere especificar empresa — el backend la resuelve por sesión.
 *
 * @param {Object}  params
 * @param {string}  [params.ordenamiento]  - "DEFAULT" | "CLASIFICACION_INDICE" | "" (vacío = sin ordenamiento)
 * @returns {Promise<{ success: boolean, data: Array, total: number, message: string }>}
 */
export const api_vendedores_getProductos = async ({
    ordenamiento = "DEFAULT",
} = {}) => {
    try {
        // Si el ordenamiento es vacío, no incluirlo en la URL
        const path = ordenamiento
            ? `/vendedores/productos/${ordenamiento}`
            : "/vendedores/productos";

        const response = await api.get(path);


        if (response.status === 200 || response.status === 201) {
            const innerData = response.data.data || {};

            // Búsqueda robusta del listado de productos
            let productos = [];
            let total = 0;

            if (Array.isArray(innerData)) {
                productos = innerData;
            } else if (innerData.productos && Array.isArray(innerData.productos)) {
                productos = innerData.productos;
            } else if (innerData.PRODUCTOS && Array.isArray(innerData.PRODUCTOS)) {
                productos = innerData.PRODUCTOS;
            } else if (response.data.productos && Array.isArray(response.data.productos)) {
                productos = response.data.productos;
            } else if (innerData.items && Array.isArray(innerData.items)) {
                productos = innerData.items;
            }

            total = response.data.total ?? innerData.total ?? innerData.pagination?.total ?? productos.length;
            return {
                success: true,
                message: response.data.message || "Productos obtenidos exitosamente",
                data: productos,
                total: total,
            };
        }

        return {
            success: false,
            message: response.data.message || "Error al obtener los productos",
            data: [],
            total: 0,
        };
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "Ocurrió un error al obtener los productos del vendedor";
        return {
            success: false,
            message,
            data: [],
            total: 0,
            error: error.response?.data || null,
        };
    }
};
/**
 * Obtiene las direcciones de un cliente para un vendedor.
 * @param {string} account - Cuenta del cliente
 * @param {string} empresa - Nombre de la empresa
 * @returns {Promise<Object>} { success, data: [], message }
 */
export const api_vendedores_getDirecciones = async (account, empresa) => {
    try {
        const response = await api.get(`/vendedores/direcciones/${"C" + account}/${empresa}`);
        if (response.status === 200 || response.status === 201) {
            return {
                success: true,
                message: response.data.message || "Direcciones obtenidas exitosamente",
                data: (response.data.data || []).map((addr) => ({
                    ...addr,
                    LATITUDE: addr.LATITUDE || addr.latitude || null,
                    LONGITUDE: addr.LONGITUDE || addr.longitude || null,
                })),
            };
        }
        return {
            success: false,
            message: response.data.message || "Error al obtener las direcciones",
            data: [],
        };
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "Ocurrió un error al obtener las direcciones del cliente";
        return {
            success: false,
            message,
            data: [],
            error: error.response?.data || null,
        };
    }
};
/**
 * Obtiene la previsualización de descuentos para un cliente y empresa.
 * @param {Object} data - { ENTERPRISE, ACCOUNT_USER, PRODUCTS: [] }
 * @returns {Promise<Object>} { success, data, message }
 */
export const api_vendedores_previsualizarDescuentos = async (data) => {
    try {
        const response = await api.post("/vendedores/previsualizarDescuentos", data);
        if (response.status === 200 || response.status === 201) {
            return {
                success: true,
                message: response.data.message || "Descuentos obtenidos exitosamente",
                data: response.data.data,
            };
        }
        return {
            success: false,
            message: response.data.message || "Error al obtener los descuentos",
            data: null,
        };
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "Ocurrió un error al obtener la previsualización de descuentos";
        return {
            success: false,
            message,
            error: error.response?.data || null,
        };
    }
};

/**
 * Crea una proforma para una empresa y línea de negocio.
 * @param {Object} data - Datos de la proforma
 * @returns {Promise<Object>} { success, message, data }
 */
export const api_vendedores_createProforma = async (data) => {
    try {
        const response = await api.post("/proforma/createProforma", data);
        if (response.status === 200 || response.status === 201) {
            return {
                success: true,
                message: response.data.message || "Proforma creada exitosamente",
                data: response.data.data,
            };
        }
        return {
            success: false,
            message: response.data.message || "Error al crear la proforma",
            data: null,
        };
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "Ocurrió un error al crear la proforma";
        return {
            success: false,
            message,
            error: error.response?.data || null,
        };
    }
};

/**
 * Obtiene el carrito unificado para vendedores B2B de Autollanta.
 * @param {string} accountUser - Cuenta del cliente (se enviará desde el segundo carácter)
 * @returns {Promise<Object>} { success, data: { header, details: [] }, message }
 */
export const api_vendedores_getCarritoUnificado = async (accountUser) => {
    try {
        if (!accountUser || accountUser.length < 2) {
            return { success: false, message: "Cuenta de cliente inválida para unificación", data: null };
        }

        const response = await api.post("/vendedores/carrito-autollanta-unificado", {
            ACCOUNT_USER: accountUser
        });

        if (response.status === 200 || response.status === 201) {
            return {
                success: true,
                message: response.data.message || "Carrito unificado obtenido correctamente",
                data: response.data.data,
            };
        }
        return {
            success: false,
            message: response.data.message || "Error al obtener el carrito unificado",
            data: null,
        };
    } catch (error) {
        const message = error.response?.data?.message || "Ocurrió un error al obtener el carrito unificado";
        return {
            success: false,
            message,
            error: error.response?.data || null,
        };
    }
};
