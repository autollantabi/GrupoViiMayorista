# Flujos funcionales principales

Descripción paso a paso de los flujos más importantes del sistema: autenticación, autorización, pedidos, catálogo, carrito y reencauche. Sirve para entender qué ocurre en cada flujo y cómo se aplican permisos.

---

## Autenticación y autorización

### Roles

Definidos en `src/constants/roles.js`:

| Rol | Valor | Uso |
|-----|--------|-----|
| ADMIN | "ADMIN" | Dashboard admin, gestión de usuarios y coordinadores |
| CLIENTE | "CLIENTE" | E-commerce: carrito, pedidos, catálogo, perfil, contacto, reencauche (verificación), XCoin, App Shell |
| COORDINADOR | "COORDINADOR" | Listado y detalle de pedidos, edición de pedidos |
| VISUALIZACION | "VISUALIZACION" | Catálogo y vistas de e-commerce sin modificar carrito |
| REENCAUCHE_USER | "REENCAUCHE_USER" | Home reencauche, bonos activados, activación, verificación, clientes reencauche |

El usuario que devuelve el backend tiene **ROLE_NAME** (string). En el código se usa `user.ROLE_NAME` para rutas y redirecciones; el hook `useNavigateByRole` usa `user.ROLES` (array), lo que puede generar inconsistencias si el backend no envía `ROLES` (ver [docs/pendientes.md](pendientes.md)).

### Cómo se protegen las rutas

1. **Rutas públicas:** Login, Register, Forgot Password, 404. No requieren autenticación. Si el usuario ya está autenticado y entra en una ruta pública, `ProtectedRoute` con `isPublicRoute` no se usa para esas rutas en el código actual; las rutas públicas están en un `<Route element={<CleanLayout />}>` sin ProtectedRoute. Quien controla “si ya estoy logueado no ver login” es la lógica de redirección desde Home o desde el menú.
2. **Rutas protegidas:** El resto. En `App.jsx` están bajo un `<Route element={<ProtectedRoute element={<AuthenticatedLayout />} allowedRoles={[...]} />}>`. Para cada ruta hija se puede añadir un segundo `ProtectedRoute` con `allowedRoles` más restrictivos (ej. carrito solo CLIENTE).
3. **ProtectedRoute** (`src/routes/ProtectedRoutes.jsx`):
   - Si no autenticado → redirige a `ROUTES.AUTH.LOGIN`.
   - Si autenticado pero el rol no está en `allowedRoles` → redirige al “home” del rol con `getHomeForRole(user.ROLE_NAME)`.
   - `getHomeForRole`: ADMIN → dashboard, COORDINADOR → coordinadora, resto (incl. REENCAUCHE_USER) → ECOMMERCE.HOME. Es decir, REENCAUCHE_USER no tiene case explícito y cae en ECOMMERCE.HOME; la redirección a reencauche/home se hace en **Home.jsx** según `user.ROLE_NAME`.
4. **Home ("/"):** Según `user.ROLE_NAME` redirige a: ADMIN → dashboard, COORDINADOR → coordinadora, REENCAUCHE_USER → reencauche/home, resto → ClientHomeComponent (e-commerce home).

### Permisos por sección

El Header usa `api_access_sections` (usuarios permitidos por sección) para mostrar u ocultar enlaces. No hay documentación en código de la estructura exacta de la respuesta; si el backend devuelve secciones permitidas por usuario, el Header las usa para el menú.

### Carrito

Solo el rol **CLIENTE** puede usar carrito (añadir, modificar, eliminar). **VISUALIZACION** puede ver catálogo y páginas de e-commerce pero no modifica carrito. La lógica está en CartContext y en las rutas (carrito, mis pedidos, detalle pedido con `allowedRoles: [ROLES.CLIENTE]`).

---

## Flujo de login

1. Usuario entra en `/auth/login` (ruta pública, CleanLayout).
2. Introduce email y contraseña; el formulario llama a `login(email, password)` del AuthContext.
3. AuthContext llama a `api_auth_login({ email, password })` → `POST /auth/login`.
4. Si la respuesta es correcta, el backend devuelve `idSession` y datos de usuario. Se llama a `guardarSessionID(idSession)` (cifrado AES en localStorage, clave `sess`) y se actualiza estado: `setUser`, `setIsAuthenticated`, derivados (`isClient`, `isVisualizacion`, `isReencaucheUser`).
5. AuthContext redirige al “home” del rol con `navigateToHomeByRole(user)` (o equivalente). Así, ADMIN va a dashboard, COORDINADOR a coordinadora, REENCAUCHE_USER a reencauche/home, resto a "/" que Home.jsx resuelve a ClientHomeComponent.
6. En las siguientes peticiones, el interceptor de `constants/api.js` añade el header `id-session` con el valor descifrado de `obtenerSessionID()`.

Si el login falla, se muestra mensaje (toast) y no se guarda sesión.

---

## Flujo de validación de sesión al cargar la app

1. Al montar la app, AuthProvider en su `useEffect` llama a `obtenerSessionID()`. Si no hay valor (o falla el descifrado), se hace `performLogout` (limpieza de tokens y estado) y no se llama al API.
2. Si hay session ID, se llama a `api_auth_me()` → `GET /auth/me` con header `id-session`.
3. Si la respuesta incluye usuario, se actualiza estado (user, isAuthenticated, etc.) y la app muestra rutas según rol.
4. Si `api_auth_me` falla (throw), AuthContext captura, hace performLogout y el usuario queda deslogueado; al intentar acceder a rutas protegidas se redirige a login.

---

## Flujo de logout

1. Usuario hace logout (ej. desde Header). Se llama a `logout()` del AuthContext.
2. AuthContext llama a `api_auth_logout()` → `POST /auth/logout` (con `id-session`).
3. Se ejecuta `performLogout`: `eliminarTokens()` (borra `sess` de localStorage), limpieza de estado (user, isAuthenticated, etc.).
4. Redirección a login (según implementación del AuthContext, p. ej. `navigate(ROUTES.AUTH.LOGIN)`).

---

## Flujo de recuperación de contraseña

1. Usuario entra en `/auth/forgot-password`, introduce email. Se llama a `api_resetPassword_requestPasswordReset` → `POST /reset-password/request`.
2. Usuario recibe código OTP (por canal externo, no documentado en front). Introduce OTP y posiblemente nuevo password en la misma pantalla o siguiente. Se llama a `api_resetPassword_verifyResetCode` y/o `api_resetPassword_setNewPassword` (verify-otp y resPss). En el código se usa un token en localStorage (`resetToken`) para el flujo de “establecer nueva contraseña”.
3. Tras éxito, se puede redirigir a login. Los detalles de pantallas y estados intermedios están en las páginas de auth (ForgotPassword, etc.).

---

## Flujo de registro

1. Usuario entra en `/auth/register`. Formulario de registro (identificación, email, etc.). Se usa `verifyIdentification` (AuthContext) para comprobar identificación y obtener empresas disponibles; luego `registerUser` con los datos del formulario.
2. Las llamadas API concretas están en AuthContext y en `api/users` (crear usuario). Tras registro exitoso, normalmente se redirige a login o se inicia sesión automáticamente según implementación.

---

## Flujo de compra (cliente): catálogo → carrito → pedido

1. **Catálogo:** Usuario (CLIENTE o VISUALIZACION) entra en catálogo por empresa (ej. `/catalogo/:empresaName`). ProductCatalogContext carga productos vía `api/products` (getProductos por campo, búsqueda, etc.). useCatalogFlow gestiona línea de negocio, pasos y filtros; estado se refleja en URL y localStorage.
2. **Detalle de producto:** Usuario abre un producto. Se carga con ProductCatalogContext (getProductByCodigo o similar) y se muestra detalle. Solo CLIENTE puede añadir al carrito.
3. **Añadir al carrito:** CartContext `addItem`. Si ya existe carrito para esa empresa (cartId), se actualiza vía `api_cart_updateCarrito`; si no, se puede crear o sincronizar en la siguiente operación (loadCartFromAPI, syncCartToAPI).
4. **Carrito:** Página Carrito muestra ítems; usuario puede modificar cantidades o eliminar. CartContext usa api/cart (getCarrito, updateCarrito, deleteDetail). Totales con IVA y descuentos (constants/taxes, user.DESCUENTOS).
5. **Crear pedido:** Desde Carrito (o flujo de checkout), se sincroniza carrito con API si aplica y se llama a `api_order_createOrder` con los datos del pedido. Tras éxito, se limpia o actualiza carrito y se redirige a detalle de pedido o listado (Mis Pedidos).

---

## Flujo coordinador: pedidos

1. Usuario con rol COORDINADOR entra (redirigido desde Home a `/coordinadora`). CoordinadorHomeComponent lista pedidos (api_order: getPedidosByEnterprise o similar).
2. Al abrir un pedido, navega a `/coordinadora/pedidos/:orderId` (DetallePedidoCoordinador). Puede editar con EditarPedido (`/coordinadora/pedidos/:orderId/editar`). Las llamadas de actualización están en api/order (y en las páginas que las invocan).

---

## Flujo reencauche (bonos)

1. **Usuario reencauche:** Home reencauche (`/reencauche/home`), Bonos activados, Activación de bonos, Clientes reencauche, Verificación de bono. Rutas con `allowedRoles` que incluyen REENCAUCHE_USER (y en verificación también CLIENTE).
2. **Clientes y bonos:** Se usan api/bonos: getClientesByMayorista, getBonosByCustomer, createCustomer, createBonus, getEligibleProducts, etc.
3. **Verificación de bono:** VerificarBono (y similares) usan verifyQRCode / verifyQRCodeMaster y generación de QR (generateQR, generateQRMaster). URLs de verificación dependen de VITE_PRODUCTION_URL / VITE_DEVELOPMENT_URL (bonoUtils y páginas).
4. **Generación PDF/QR:** utils/bonoUtils y bonoHTMLGenerator; generación de QR vía API y plantillas HTML (templates/bonoPreview.html). Envío de archivos con api bonos (files/send, processBonusExcel, etc.).

---

## Flujo XCoin

1. Usuario accede a `/xcoin` (XCoinHome). Se usa api/xcoin: getBalance, getProducts, getRedemptionHistory, createRedemption.
2. Se muestra balance de puntos, catálogo de canje y historial; el usuario puede canjear productos (createRedemption).

---

## Flujo App Shell (Lider Shell)

1. Usuario accede a `/app-shell` (AppShell). Se busca usuario por código SAP con api_shell_searchManager; se puede crear usuario en la app Lider Shell con api_shell_createUser. Todas las llamadas usan la instancia apiShell (API Key, sin id-session).

---

## Resumen de auth y permisos

- **Autenticación:** Session ID en localStorage (cifrado AES), enviado en header `id-session`. Validación con GET /auth/me al cargar.
- **Autorización:** Por rol (ROLE_NAME). ProtectedRoute comprueba `allowedRoles`; si el rol no está permitido, redirige al home del rol. Home.jsx redirige según rol a dashboard, coordinadora, reencauche/home o e-commerce home.
- **Carrito:** Solo rol CLIENTE puede modificar carrito; VISUALIZACION solo consulta.
- **Rutas sensibles:** Admin solo ADMIN; coordinadora solo COORDINADOR; reencauche solo REENCAUCHE_USER (y CLIENTE en verificación de bono). E-commerce compartido entre CLIENTE, ADMIN, COORDINADOR, VISUALIZACION según allowedRoles de cada ruta.

---

## Reglas de negocio

- **Roles:** Un usuario tiene un único rol (ROLE_NAME) que determina acceso a rutas y "home" (admin → dashboard, coordinador → pedidos, resto → e-commerce home; reencauche se redirige desde Home.jsx).
- **Carrito:** Solo rol CLIENTE puede usar carrito; VISUALIZACION no modifica. Carrito se agrupa por empresa; múltiples cartIds (uno por empresa).
- **Catálogo:** Productos por empresa; mapeo de API a formato app vía productLineConfig por DMA_LINEANEGOCIO; imágenes con baseLinkImages.
- **IVA y descuentos:** IVA 15% (TAXES o user.IVA); descuentos por producto (promocional), por empresa (user.DESCUENTOS).
- **Empresas en registro:** ALL_COMPANIES en AuthContext (MAXXIMUNDO, STOX, AUTOLLANTA, IKONIX, AUTOMAX); verifyIdentification devuelve empresas disponibles para la cuenta.
- **Bonos:** Estados ACTIVO, USADO, VENCIDO, PENDIENTE, RECHAZADO; generación QR vía API y URL de verificación según entorno (VITE_PRODUCTION_URL / VITE_DEVELOPMENT_URL).
- **Validaciones:** Login/registro y recuperación de contraseña se validan en formularios; mensajes vía toast y estado local. No hay capa centralizada (Yup/Zod) documentada; ProtectedRoute comprueba isAuthenticated y allowedRoles.

---

## Seguridad y datos sensibles

- **Session ID:** Almacenado cifrado en localStorage (clave `sess`); clave de cifrado en VITE_SECRET_KEY_TOKEN. Quien tenga acceso al bundle y al .env puede descifrar; el riesgo se mitiga si el backend invalida sesiones y el token tiene vida limitada.
- **Reset token:** Guardado en localStorage sin cifrado (resetToken) hasta completar el flujo de recuperación de contraseña.
- **API Key Shell:** En header X-Portal-API-Key; expuesta en el cliente (Vite incluye env en el bundle). Se asume que la API Shell restringe por otros medios o que la key es de bajo riesgo.
- **Riesgos detectados:** Clave AES y API Key en el cliente; sin Error Boundary global; useNavigateByRole usa user.ROLES (array) mientras el resto usa ROLE_NAME (string). No hay autorización a nivel de campo o recurso individual más allá de rutas y menús.

---

Para detalles de endpoints y clientes HTTP ver [apis.md](apis.md). Para onboarding y dónde está cada flujo en el código ver [guia-proyecto.md](guia-proyecto.md).
