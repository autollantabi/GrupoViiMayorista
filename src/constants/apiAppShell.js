import axios from "axios";

/**
 * Cliente para el backend de Club Shell Maxx.
 *
 * Es una instancia aparte de `constants/api.js` por dos motivos:
 *
 * 1. Apunta a otro backend. El de siempre va al Portal Mayorista; este va directo a Club Shell,
 *    cuyo CORS ya tiene a viicommerce.com en la lista blanca. Se evita así pasar por el proxy
 *    /club-shell-maxx del Portal Mayorista, que exige sesión y por tanto no sirve para un
 *    invitado que todavía no tiene usuario.
 * 2. No inyecta la cabecera `id-session`. Estos endpoints son públicos y la credencial real es
 *    el token del enlace más el código que llega por WhatsApp.
 */
const baseURL =
  import.meta.env.VITE_API_URL_APP_SHELL || "https://api.maxximundo.com/api/app-shell";

const apiAppShell = axios.create({
  baseURL,
  timeout: 45000,
  withCredentials: false,
});

export default apiAppShell;
