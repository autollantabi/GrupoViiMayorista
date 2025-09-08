import { eliminarTokens } from "./encryptToken";

// Función para llamar al logout desde cualquier parte de la aplicación
export const performLogout = async () => {
  // Limpiar datos locales y tokens
  eliminarTokens();
  localStorage.removeItem("user");
  localStorage.removeItem("auth");
  localStorage.removeItem("cart");

  return { success: true };
};
