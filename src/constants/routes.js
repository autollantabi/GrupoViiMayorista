export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    // Invitación a Club Shell Maxx. Cuelga de /auth/ a propósito: robots.txt ya trae
    // "Disallow: /auth/", así que la pantalla queda fuera del rastreo sin tocar nada más.
    REGISTRO_SHELL: "/auth/registro-shell/:token",
  },
  ADMIN: {
    DASHBOARD_ADMIN: "/admin/dashboard",
    USER_ADMIN: "/admin/usuarios",
    COORDINADOR_ADMIN: "/admin/coordinadores",
    // Otras rutas de admin...
  },
  COORDINADOR: {
    PEDIDOS: "/coordinadora",
    DETALLE_PEDIDO: "/coordinadora/pedidos/:orderId",
    EDITAR_PEDIDO: "/coordinadora/pedidos/:orderId/editar",
    PRODUCTOS: "/coordinadora/productos",
    DETALLE_PRODUCTO: "/coordinadora/productos/:id",
  },
  ECOMMERCE: {
    HOME: "/",
    CATALOGO: "/catalogo/:empresaName?",
    DETALLE_PRODUCTO: "/productos/:empresaId/:id",
    CARRITO: "/carrito",
    MIS_PEDIDOS: "/mis-pedidos",
    DETALLE_PEDIDO: "/mis-pedidos/:orderId",
    PERFIL: "/perfil",
    SELECCION_EMPRESA: "/seleccion-empresa",
    SEARCH: "/busqueda",
    REENCAUCHE: "/reencauche",
    APP_SHELL: "/app-shell",
    XCOIN: "/xcoin",
    CONTACTO: "/contacto",
  },
  REENCAUCHE: {
    HOME: "/reencauche/home",
    CLIENTES: "/reencauchador/bonos",
    ACTIVACION: "/reencauche/activacion",
    VERIFICAR: "/reencauche/verificacion",
  },
  PUBLIC: {
    NOT_FOUND: "/404",
  },
  VENDEDOR: {
    CATALOGO: "/vendedor/:lineaID?",
    OFERTA: "/vendedor/oferta"
  }
};
