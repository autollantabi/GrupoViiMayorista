import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import { ROUTES } from "../constants/routes";
import UsersAdministration from "./admin/UsersAdministration";
import CoordinadorHomeComponent from "./coordinadora/CoordinadorHomeComponent";
import ClientHomeComponent from "./client/ClientHomeComponent";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirección automática en el Home según el rol
    if (user) {
      if (user.ROLE_NAME === ROLES.ADMIN) {
        navigate(ROUTES.ADMIN.DASHBOARD_ADMIN, { replace: true });
      } else if (user.ROLE_NAME === ROLES.COORDINADOR) {
        navigate(ROUTES.COORDINADOR.PEDIDOS, { replace: true });
      } else {
        navigate(ROUTES.ECOMMERCE.HOME, { replace: true });
      }
    }
  }, [user, navigate]);

  // Mientras se procesa la redirección, mostrar un componente según el rol
  if (!user) return <div>Cargando...</div>;
  
  switch (user.ROLE_NAME) {
    case ROLES.ADMIN:
      return <UsersAdministration />;
    case ROLES.COORDINADOR:
      return <CoordinadorHomeComponent />;
    default:
      return <ClientHomeComponent />;
  }
};

export default Home;
