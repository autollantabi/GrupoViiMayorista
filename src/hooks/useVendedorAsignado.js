import { useEffect, useState } from "react";
import { api_get_vendedores_por_cliente } from "../api/vendedores/apiVendedoresClientes";

export function useVendedorAsignado(empresaName, selectedLinea) {
    const [vendedores, setVendedores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!empresaName || typeof empresaName !== "string" || empresaName.trim() === "") {
            setVendedores([]);
            return;
        }
        if (!selectedLinea || typeof selectedLinea !== "string" || selectedLinea.trim() === "") {
            setVendedores([]);
            return;
        }

        let cancelled = false; // evitar setState si el efecto se limpia antes de que responda la API

        const fetchVendedores = async () => {
            setLoading(true);
            setError(null);
            const { success, data, message } = await api_get_vendedores_por_cliente({
                empresa: empresaName,
                linea: selectedLinea
            });

            if (cancelled) return;

            if (!success) {
                console.error("Error al obtener vendedores asignados:", message);
                setError(message);
                setVendedores([]);
                setLoading(false);
                return;
            }
            setVendedores(Array.isArray(data) ? data : []);
            setLoading(false);
        };

        fetchVendedores();

        return () => {
            cancelled = true;
        };
    }, [empresaName, selectedLinea]);

    return { vendedores, loading, error };
}