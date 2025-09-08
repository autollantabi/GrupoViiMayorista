// routes/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";
import { ROLES } from "../constants/roles";

const ProtectedRoute = ({
  element,
  allowedRoles = [],
  isPublicRoute = false, // Nuevo parámetro para identificar rutas públicas como login
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation(); // Añadir useLocation para obtener la ruta actual
  
  // 1. Ruta pública y usuario autenticado → redirigir a su página principal
  if (isPublicRoute && isAuthenticated) {
    return <Navigate to={getHomeForRole(user?.ROLE_NAME)} replace />;
  }

  // 2. Ruta protegida y usuario no autenticado → login
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <Navigate
        to={ROUTES.AUTH.LOGIN}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // 3. Usuario autenticado sin permisos para esta ruta → su página principal
  if (
    isAuthenticated &&
    allowedRoles.length > 0 &&
    user?.ROLE_NAME &&
    !allowedRoles.includes(user.ROLE_NAME)
  ) {
    const homePath = getHomeForRole(user.ROLE_NAME);

    // Evitar bucle si ya estamos en la página principal del usuario
    if (location.pathname !== homePath) {
      return <Navigate to={homePath} replace />;
    }
  }

  // 4. Si todo está bien, mostrar el componente solicitado
  return element;
};

// Función auxiliar para determinar la ruta principal según el rol
const getHomeForRole = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return ROUTES.ADMIN.DASHBOARD_ADMIN;
    case ROLES.COORDINADOR:
      return ROUTES.COORDINADOR.PEDIDOS;
    default:
      return ROUTES.ECOMMERCE.HOME;
  }
};

export default ProtectedRoute;
