import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";
import { ROLES } from "../constants/roles";

/**
 * Hook personalizado para navegar según el rol del usuario
 * @returns {Object} Objeto con métodos para navegación basada en roles
 */
export const useNavigateByRole = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  /**
   * Navega a la página principal según el rol del usuario
   */
  const navigateToHome = () => {
    if (!user) {
      navigate(ROUTES.AUTH.LOGIN);
      return;
    }

    if (user.ROLES.includes(ROLES.COORDINADOR)) {
      navigate(ROUTES.COORDINADOR.PEDIDOS);
    } else if (user.ROLES.includes(ROLES.ADMIN)) {
      navigate(ROUTES.ADMIN.DASHBOARD_ADMIN);
    } else if (user.ROLES.includes(ROLES.CLIENTE)) {
      // Si hay una ruta específica para vendedores, agregar aquí
      navigate(ROUTES.ECOMMERCE.HOME);
    } else {
      // Usuario regular (cliente)
      navigate(ROUTES.ECOMMERCE.HOME);
    }
  };

  /**
   * Navega a una ruta específica si está disponible, de lo contrario a la página principal según rol
   * @param {string} route - Ruta específica a la que navegar si está disponible
   */
  const navigateWithFallback = (route) => {
    if (route) {
      navigate(route);
    } else {
      navigateToHome();
    }
  };

  return {
    navigateToHome,
    navigateWithFallback,
    navigate, // Exportamos también el navigate normal por si se necesita
  };
};
