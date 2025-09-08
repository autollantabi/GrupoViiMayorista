// src/routes/routes.js
import { ROUTES } from "../constants/routes";
import { ROLES } from "../constants/roles";
import NotFound from "../pages/NotFound";
// Importaciones de páginas ecommerce
import Catalogo from "../pages/catalogo/Catalogo";
import DetalleProducto from "../pages/catalogo/DetalleProducto";
import Carrito from "../pages/compras/Carrito";
import MisPedidos from "../pages/compras/MisPedidos";
import DetallePedido from "../pages/compras/DetallePedido";
import Perfil from "../pages/usuario/Perfil";
import SearchResults from "../pages/busqueda/SearchResults";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import DetallePedidoCoordinador from "../pages/coordinadora/DetallePedidoCoordinador";
import EditarPedidoCoordinador from "../pages/coordinadora/EditarPedido";
import UsersAdministration from "../pages/admin/UsersAdministration";
import ClientHomeComponent from "../pages/client/ClientHomeComponent";
import CoordinadorHomeComponent from "../pages/coordinadora/CoordinadorHomeComponent";
import ForgotPassword from "../pages/auth/ForgotPassword";
import CoordinadorAdminComponent from "../pages/admin/CoordinadorAdminComponent";
import AdminDashboardComponent from "../pages/admin/AdminDashboardComponent";

// Rutas de E-commerce (accesibles para todos los usuarios autenticados)
export const ecommerceRoutes = [
  {
    path: ROUTES.ECOMMERCE.HOME,
    element: <ClientHomeComponent />,
    exact: true,
    allowedRoles: [ROLES.CLIENTE, ROLES.ADMIN, ROLES.COORDINADOR, ROLES.VISUALIZACION],
  },
  {
    path: ROUTES.ECOMMERCE.CATALOGO,
    element: <Catalogo />,
    allowedRoles: [ROLES.CLIENTE, ROLES.ADMIN, ROLES.COORDINADOR, ROLES.VISUALIZACION],
  },
  {
    path: ROUTES.ECOMMERCE.DETALLE_PRODUCTO,
    element: <DetalleProducto />,
    allowedRoles: [ROLES.CLIENTE, ROLES.ADMIN, ROLES.COORDINADOR, ROLES.VISUALIZACION],
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
    allowedRoles: [ROLES.CLIENTE, ROLES.ADMIN, ROLES.COORDINADOR, ROLES.VISUALIZACION],
  },
  {
    path: ROUTES.ECOMMERCE.SEARCH,
    element: <SearchResults />,
    allowedRoles: [ROLES.CLIENTE, ROLES.ADMIN, ROLES.COORDINADOR, ROLES.VISUALIZACION],
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
// Rutas para coordinadora
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
