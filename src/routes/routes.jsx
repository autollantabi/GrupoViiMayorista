// src/routes/routes.js
import { ROUTES } from "../constants/routes";
import { ROLES } from "../constants/roles";
import NotFound from "../pages/NotFound";
// Importaciones de páginas ecommerce
import Catalog from "../pages/catalogo/Catalog";
import DetalleProducto from "../pages/catalogo/DetalleProducto";
import Carrito from "../pages/compras/Carrito";
import MisPedidos from "../pages/compras/MisPedidos";
import DetallePedido from "../pages/compras/DetallePedido";
import Perfil from "../pages/usuario/Perfil";
import SearchResults from "../pages/busqueda/SearchResults";
import Contacto from "../pages/contacto/Contacto";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import DetallePedidoCoordinador from "../pages/coordinadora/DetallePedidoCoordinador";
import EditarPedidoCoordinador from "../pages/coordinadora/EditarPedido";
import UsersAdministration from "../pages/admin/UsersAdministration";
import ClientHomeComponent from "../pages/client/ClientHomeComponent";
import AppShell from "../pages/client/AppShell";
import CoordinadorHomeComponent from "../pages/coordinadora/CoordinadorHomeComponent";
import ForgotPassword from "../pages/auth/ForgotPassword";
import CoordinadorAdminComponent from "../pages/admin/CoordinadorAdminComponent";
import AdminDashboardComponent from "../pages/admin/AdminDashboardComponent";
// Importaciones de páginas de reencauche
import ReencaucheHome from "../pages/reencauche/ReencaucheHome";
import ClientesReencauche from "../pages/reencauche/ClientesReencauche";
import BonosActivados from "../pages/reencauche/BonosActivados";
import ActivacionBonos from "../pages/reencauche/ActivacionBonos";
import VerificarBono from "../pages/reencauche/VerificarBono";
// Importaciones de páginas de XCoin
import XCoinHome from "../pages/xcoin/XCoinHome";

// Rutas de E-commerce (accesibles para todos los usuarios autenticados)
export const ecommerceRoutes = [
  {
    path: ROUTES.ECOMMERCE.HOME,
    element: <ClientHomeComponent />,
    exact: true,
    allowedRoles: [
      ROLES.CLIENTE,
      ROLES.ADMIN,
      ROLES.COORDINADOR,
      ROLES.VISUALIZACION,
    ],
  },
  {
    path: ROUTES.ECOMMERCE.CATALOGO,
    element: <Catalog />,
    allowedRoles: [
      ROLES.CLIENTE,
      ROLES.ADMIN,
      ROLES.COORDINADOR,
      ROLES.VISUALIZACION,
    ],
  },
  {
    path: ROUTES.ECOMMERCE.DETALLE_PRODUCTO,
    element: <DetalleProducto />,
    allowedRoles: [
      ROLES.CLIENTE,
      ROLES.ADMIN,
      ROLES.COORDINADOR,
      ROLES.VISUALIZACION,
    ],
  },
  {
    path: ROUTES.ECOMMERCE.CARRITO,
    element: <Carrito />,
    allowedRoles: [ROLES.CLIENTE],
  },
  {
    path: ROUTES.ECOMMERCE.MIS_PEDIDOS,
    element: <MisPedidos />,
    allowedRoles: [ROLES.CLIENTE],
  },
  {
    path: ROUTES.ECOMMERCE.DETALLE_PEDIDO,
    element: <DetallePedido />,
    allowedRoles: [ROLES.CLIENTE],
  },
  {
    path: ROUTES.ECOMMERCE.PERFIL,
    element: <Perfil />,
    allowedRoles: [
      ROLES.CLIENTE,
      ROLES.ADMIN,
      ROLES.COORDINADOR,
      ROLES.VISUALIZACION,
    ],
  },
  {
    path: ROUTES.ECOMMERCE.SEARCH,
    element: <SearchResults />,
    allowedRoles: [
      ROLES.CLIENTE,
      ROLES.ADMIN,
      ROLES.COORDINADOR,
      ROLES.VISUALIZACION,
    ],
  },
  {
    path: ROUTES.ECOMMERCE.REENCAUCHE,
    element: <ClientesReencauche />,
    allowedRoles: [
      ROLES.CLIENTE,
      ROLES.ADMIN,
      ROLES.COORDINADOR,
      ROLES.VISUALIZACION,
    ],
  },
  {
    path: ROUTES.ECOMMERCE.APP_SHELL,
    element: <AppShell />,
    allowedRoles: [
      ROLES.CLIENTE,
      ROLES.ADMIN,
      ROLES.COORDINADOR,
      ROLES.VISUALIZACION,
    ],
  },
  {
    path: ROUTES.ECOMMERCE.XCOIN,
    element: <XCoinHome />,
    allowedRoles: [
      ROLES.CLIENTE,
      ROLES.ADMIN,
      ROLES.COORDINADOR,
      ROLES.VISUALIZACION,
    ],
  },
  {
    path: ROUTES.ECOMMERCE.CONTACTO,
    element: <Contacto />,
    allowedRoles: [
      ROLES.CLIENTE,
      ROLES.ADMIN,
      ROLES.COORDINADOR,
      ROLES.VISUALIZACION,
    ],
  },
  {
    path: ROUTES.REENCAUCHE.VERIFICAR,
    element: <VerificarBono />,
    allowedRoles: [ROLES.CLIENTE, ROLES.REENCAUCHE_USER],
  },
];

// Rutas para administradores
export const adminRoutes = [
  {
    path: ROUTES.ADMIN.DASHBOARD_ADMIN,
    element: <AdminDashboardComponent />,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: ROUTES.ADMIN.USER_ADMIN,
    element: <UsersAdministration />,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: ROUTES.ADMIN.COORDINADOR_ADMIN,
    element: <CoordinadorAdminComponent />,
    allowedRoles: [ROLES.ADMIN],
  },
  // ... otras rutas
];

// Rutas para coordinadores
export const coordinadorRoutes = [
  {
    path: ROUTES.COORDINADOR.PEDIDOS,
    element: <CoordinadorHomeComponent />, // Cambiar por el componente real
    allowedRoles: [ROLES.COORDINADOR],
  },
  {
    path: ROUTES.COORDINADOR.DETALLE_PEDIDO,
    element: <DetallePedidoCoordinador />, // Reemplazar con el componente adecuado
    allowedRoles: [ROLES.COORDINADOR],
  },
  {
    path: ROUTES.COORDINADOR.EDITAR_PEDIDO,
    element: <EditarPedidoCoordinador />, // Reemplazar con el componente adecuado
    allowedRoles: [ROLES.COORDINADOR],
  },
  // Otras rutas para coordinadora...
];

// Rutas para usuarios de reencauche
export const reencaucheRoutes = [
  {
    path: ROUTES.REENCAUCHE.HOME,
    element: <ReencaucheHome />,
    allowedRoles: [ROLES.REENCAUCHE_USER],
  },
  {
    path: ROUTES.REENCAUCHE.CLIENTES,
    element: <BonosActivados />,
    allowedRoles: [ROLES.REENCAUCHE_USER],
  },
  {
    path: ROUTES.REENCAUCHE.ACTIVACION,
    element: <ActivacionBonos />,
    allowedRoles: [ROLES.REENCAUCHE_USER],
  },
  {
    path: ROUTES.REENCAUCHE.VERIFICAR,
    element: <VerificarBono />,
    allowedRoles: [ROLES.CLIENTE, ROLES.REENCAUCHE_USER],
  },
];

// Rutas públicas (no requieren autenticación)
export const publicRoutes = [
  {
    path: ROUTES.AUTH.LOGIN,
    element: <Login />,
    exact: true,
  },
  {
    path: ROUTES.AUTH.REGISTER,
    element: <Register />,
    exact: true,
  },
  {
    path: ROUTES.AUTH.FORGOT_PASSWORD,
    element: <ForgotPassword />,
  },
  {
    path: ROUTES.PUBLIC.NOT_FOUND,
    element: <NotFound />,
  },
];
