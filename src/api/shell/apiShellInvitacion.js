import apiAppShell from "../../constants/apiAppShell";

/**
 * Flujo público de invitación a Club Shell Maxx.
 *
 * Igual que el resto de `src/api/**`: nunca lanzan, siempre devuelven
 * `{ success, message, data?, error? }`. Aquí además se conserva el `status` HTTP, porque la
 * pantalla necesita distinguir un código incorrecto (400) de uno expirado (410) o de haber
 * agotado los intentos (429) para decidir si ofrece reenviar.
 */

const buildError = (error, fallback) => ({
  success: false,
  message: error.response?.data?.message || fallback,
  status: error.response?.status ?? null,
  error: error.response?.data || null,
});

/** Datos mínimos de la invitación, para pintar la pantalla antes de pedir el código. */
export const api_shell_invitation_get = async (token) => {
  try {
    const response = await apiAppShell.get(`/manager-vendedor/invitation/${token}`);
    return {
      success: true,
      message: response.data.message || "Invitación válida",
      data: response.data.data || response.data,
      status: response.status,
    };
  } catch (error) {
    return buildError(error, "No pudimos validar el enlace de invitación");
  }
};

/** Genera y envía el código por WhatsApp al celular registrado del cliente. */
export const api_shell_invitation_sendOtp = async (token) => {
  try {
    const response = await apiAppShell.post(`/manager-vendedor/invitation/${token}/otp`);
    return {
      success: true,
      message: response.data.message || "Código enviado por WhatsApp",
      data: response.data.data || response.data,
      status: response.status,
    };
  } catch (error) {
    return buildError(error, "No pudimos enviar el código por WhatsApp");
  }
};

/** Verifica el código y devuelve la llave de registro más los datos de precarga. */
export const api_shell_invitation_verifyOtp = async (token, otp) => {
  try {
    const response = await apiAppShell.post(`/manager-vendedor/invitation/${token}/otp/verify`, {
      otp,
    });
    return {
      success: true,
      message: response.data.message || "Código verificado",
      data: response.data.data || response.data,
      status: response.status,
    };
  } catch (error) {
    return buildError(error, "No pudimos verificar el código");
  }
};

/** Crea el usuario del app. Requiere la llave emitida al verificar el código. */
export const api_shell_invitation_register = async (registrationKey, userData) => {
  try {
    const response = await apiAppShell.post("/manager-vendedor/invitation/register", {
      registrationKey,
      name: userData.name,
      lastname: userData.lastname,
      card_id: userData.card_id,
      email: userData.email,
      phone: userData.phone,
      birth_date: userData.birth_date,
    });
    return {
      success: true,
      message: response.data.message || "Usuario creado exitosamente",
      data: response.data.data || response.data,
      status: response.status,
    };
  } catch (error) {
    return buildError(error, "No pudimos crear tu usuario");
  }
};
