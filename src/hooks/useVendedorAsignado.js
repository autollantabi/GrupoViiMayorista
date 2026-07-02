import { useEffect, useRef, useState } from "react";
import { api_get_vendedores_por_cliente } from "../api/vendedores/apiVendedoresClientes";

export function useVendedorAsignado(empresaName) {
    const [vendedores, setVendedores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (hasFetchedRef.current) return;
        if (!empresaName || typeof empresaName !== "string" || empresaName.trim() === "") {
            return;
        }

        const fetchVendedores = async () => {
            setLoading(true);
            setError(null);

            const { success, data, message } = await api_get_vendedores_por_cliente({
                empresa: empresaName,
            });

            if (!success) {
                console.error("Error al obtener vendedores asignados:", message);
                setError(message);
                setVendedores([]);
                setLoading(false);
                return;
            }

            // `data` es un array de vendedores (DVE_*)
            setVendedores(Array.isArray(data) ? data : []);
            setLoading(false);
        };

        hasFetchedRef.current = true;
        fetchVendedores();
    }, [empresaName]);

    return { vendedores, loading, error };
}