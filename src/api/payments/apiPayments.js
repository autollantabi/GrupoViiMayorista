import api from "../../constants/api"

export const api_generate_payment_reference = async ({ order, user }) => {
    try {
        const response = await api.post("payments/generate-paymente-reference", {
            order, user
        });
        return { success: true, data: response.data.data };
    } catch (error) {
        return {
            success: false,
            error: error?.response?.data?.message || error.message,
        };
    }
}

export const api_verify_transaction = async (transaction_id) => {
    try {
        const response = await api.get(`payments/verify-transaction?transaction_id=${transaction_id}`)
        return { success: true, data: response.data.data };
    } catch (error) {
        return {
            success: false,
            error: error?.response?.data?.message || error.message,
        };
    }
}