import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import { ROUTES } from "../constants/routes";
import UsersAdministration from "./admin/UsersAdministration";
import CoordinadorHomeComponent from "./coordinadora/CoordinadorHomeComponent";
import ClientHomeComponent from "./client/ClientHomeComponent";
import ReencaucheHome from "./reencauche/ReencaucheHome";
import SEO from "../components/seo/SEO";
import {
  useOrganizationStructuredData,
  useWebsiteStructuredData,
} from "../hooks/useStructuredData";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const organizationData = useOrganizationStructuredData();
  const websiteData = useWebsiteStructuredData();

  useEffect(() => {
    // Redirección automática en el Home según el rol
    if (user) {
      if (user.ROLE_NAME === ROLES.ADMIN) {
        navigate(ROUTES.ADMIN.DASHBOARD_ADMIN, { replace: true });
      } else if (user.ROLE_NAME === ROLES.COORDINADOR) {
        navigate(ROUTES.COORDINADOR.PEDIDOS, { replace: true });
      } else if (user.ROLE_NAME === ROLES.REENCAUCHE_USER) {
        navigate(ROUTES.REENCAUCHE.HOME, { replace: true });
      } else {
        navigate(ROUTES.ECOMMERCE.HOME, { replace: true });
      }
    }
  }, [user, navigate]);

  // Mientras se procesa la redirección, mostrar un componente según el rol
  if (!user) {
    return (
      <>
        <SEO
          title="ViiCommerce - Mayorista de Neumáticos, Lubricantes y Herramientas en Cuenca, Ecuador"
          description="ViiCommerce es tu mayorista de confianza en Cuenca, Ecuador para neumáticos, lubricantes y herramientas. Amplio catálogo, precios mayoristas y envío a todo el Ecuador."
          keywords="neumáticos, llantas, lubricantes, herramientas, distribuidora, mayorista, autopartes, accesorios, Cuenca, Ecuador, ViiCommerce"
          structuredData={[organizationData, websiteData]}
        />
        <div>Cargando...</div>
      </>
    );
  }

  switch (user.ROLE_NAME) {
    case ROLES.ADMIN:
      return <UsersAdministration />;
    case ROLES.COORDINADOR:
      return <CoordinadorHomeComponent />;
    case ROLES.REENCAUCHE_USER:
      return <ReencaucheHome />;
    default:
      return <ClientHomeComponent />;
  }
};

export default Home;
