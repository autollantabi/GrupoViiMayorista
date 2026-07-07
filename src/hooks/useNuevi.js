import { useCallback, useEffect, useRef } from "react"

export const useNuvei = ({ onSuccess, onError, onClose }) => {

    const checkoutRef = useRef(null);

    useEffect(() => {
        if (window.PaymentCheckout) {
            checkoutRef.current = new window.PaymentCheckout.modal({
                env_mode: "stg", // cambiar a "prod" en producción
                onOpen: () => {
                    
                },
                onClose: () => {
                    onClose?.();
                },
                onResponse: (response) => {
                    if (response.error) {
                        onError?.(response.error);
                        return;
                    }

                    if (response.transaction) {
                        if (response.transaction.status === "success") {
                            onSuccess?.(response.transaction);
                        } else {
                            onError?.(response.transaction);
                        }
                    }
                },
            });
        }
        // Cerrar modal al navegar hacia atrás
        const handlePopState = () => checkoutRef.current?.close();
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [onSuccess, onError, onClose])

    const openCheckout = useCallback((reference) => {
        if (!checkoutRef.current) {
            console.error("Nuvei SDK no está cargado");
            return;
        }
        checkoutRef.current.open({ reference });
    }, []);

    const closeCheckout = useCallback(() => {
        checkoutRef.current?.close();
    }, []);

    return { openCheckout, closeCheckout };
}