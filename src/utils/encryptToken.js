// tokenService.js
import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY_TOKEN;

export const obtenerSessionID = () => {
  const sessionId = localStorage.getItem("sess");
  if (!sessionId) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(sessionId, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
};

export const guardarSessionID = (sessionId) => {
  const encrypted = CryptoJS.AES.encrypt(sessionId, SECRET_KEY).toString();
  localStorage.setItem("sess", encrypted);
};

// export const guardarToken = (token) => {
//   const encrypted = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
//   localStorage.setItem("accessToken", encrypted);
// };

// export const obtenerToken = () => {
//   const encrypted = localStorage.getItem("accessToken");
//   if (!encrypted) return null;
//   try {
//     const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
//     return bytes.toString(CryptoJS.enc.Utf8);
//   } catch {
//     return null;
//   }
// };

// export const guardarRefreshToken = (token) => {
//   const encrypted = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
//   localStorage.setItem("refreshToken", encrypted);
// };

// export const obtenerRefreshToken = () => {
//   const encrypted = localStorage.getItem("refreshToken");
//   if (!encrypted) return null;
//   try {
//     const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
//     return bytes.toString(CryptoJS.enc.Utf8);
//   } catch {
//     return null;
//   }
// };

export const eliminarTokens = () => {
  localStorage.removeItem("sess");
};
