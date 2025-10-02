import { eliminarTokens } from "./encryptToken";

// Función para llamar al logout desde cualquier parte de la aplicación
export const performLogout = async () => {
  // Limpiar datos locales y tokens
  eliminarTokens();
  localStorage.removeItem("user");
  localStorage.removeItem("auth");
  // Ya no se usa localStorage para el carrito, se maneja desde la API

  return { success: true };
};
