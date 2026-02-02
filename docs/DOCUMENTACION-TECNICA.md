# Documentación técnica — Portal Mayorista Vii (ViiCommerce)

Documento generado para nuevos desarrolladores, equipo técnico y mantenimiento futuro.  
Todo el contenido se basa en el análisis del código; las incógnitas se indican explícitamente.

---

## 1. Visión general del proyecto

### 1.1 ¿Qué hace el proyecto?

**Portal Mayorista Vii** (nombre interno: `portal-mayorista`, marca: **ViiCommerce**) es una aplicación web B2B que permite:

- **E-commerce mayorista:** catálogo de productos por empresa (neumáticos, lubricantes, herramientas), carrito, pedidos, perfil de usuario.
- **Multi-empresa:** acceso por empresa (MAXXIMUNDO, STOX, AUTOLLANTA, IKONIX, AUTOMAX); catálogo y carrito segregados por empresa.
- **Multi-rol:** cliente, administrador, coordinador, visualización, usuario de reencauche; rutas y permisos por rol.
- **Coordinación de pedidos:** vista coordinador para gestionar pedidos y editar pedidos.
- **Administración:** dashboard admin, gestión de usuarios y coordinadores.
- **Reencauche:** activación/verificación de bonos, clientes reencauche, generación de PDF/QR para bonos.
- **App Shell:** integración con aplicación externa “Lider Shell” (API propia con API Key).
- **XCoin:** balance de puntos, catálogo de canje, historial de canjes.
- **Contacto y SEO:** formulario de contacto, meta tags y datos estructurados (Schema.org).

### 1.2 ¿Qué problema resuelve?

- Centraliza el acceso al catálogo mayorista, pedidos y perfiles para múltiples empresas y roles.
- Unifica autenticación, carrito y pedidos en un solo frontend.
- Da soporte a flujos específicos: reencauche (bonos), coordinación, programa Shell y puntos XCoin.

### 1.3 Tipo de aplicación

- **SPA (Single Page Application)** web, cliente React.
- Consume APIs REST (backend externo); no hay backend en este repositorio.
- Despliegue: estático (Vite build); hosting configurado para Vercel (rewrites a `index.html`).

### 1.4 Público objetivo

- **Usuarios finales:** clientes mayoristas (compras, catálogo, pedidos, perfil, reencauche, XCoin).
- **Internos:** administradores (usuarios/coordinadores), coordinadores (pedidos), usuarios de reencauche.
- **Contexto:** negocio en Cuenca, Ecuador (ViiCommerce); productos automotrices (neumáticos, lubricantes, herramientas).

---

## 2. Stack tecnológico

### 2.1 Lenguajes

- **JavaScript** (ES módulos, ecmaVersion 2020+ en ESLint).
- **JSX** para componentes React.

### 2.2 Frameworks y librerías principales

| Dependencia | Versión (package.json) | Uso |
|-------------|------------------------|-----|
| react | ^19.0.0 | UI y componentes |
| react-dom | ^19.0.0 | Render en DOM |
| react-router-dom | ^7.4.1 | Rutas y navegación |
| styled-components | ^6.1.16 | Estilos y temas |
| axios | ^1.8.4 | Cliente HTTP para API |
| react-helmet-async | ^2.0.5 | Meta tags y SEO |
| react-toastify | ^11.0.5 | Notificaciones toast |
| crypto-js | ^4.2.0 | Cifrado AES del session ID en localStorage |
| react-icons | ^5.5.0 | Iconos (Fa, Fi, Lu, etc.) |

### 2.3 Otras dependencias

- **Fechas:** date-fns ^4.1.0, dayjs ^1.11.13, @date-io/date-fns ^3.2.1.
- **Exportación:** exceljs ^4.4.0, file-saver ^2.0.5; jspdf ^3.0.3, jspdf-autotable ^5.0.2; html2canvas ^1.4.1.
- **QR:** qrcode ^1.5.4.
- **Emotion:** @emotion/react, @emotion/styled (versión ^11; no se ve uso directo en el código analizado; posible dependencia de styled-components o futura migración).

### 2.4 Herramientas de desarrollo

- **Vite** ^6.2.0 — bundler y servidor de desarrollo.
- **@vitejs/plugin-react-swc** ^3.8.0 — compilación JSX con SWC.
- **ESLint** ^9.21.0 — lint; plugins: react-hooks, react-refresh; ignora `dist`.
- **TypeScript:** solo tipos en dev (@types/react, @types/react-dom); el proyecto es JavaScript/JSX.

### 2.5 Versiones relevantes

- Node: no fijada en el repo; se asume Node 18+ por uso de `import.meta.env` y Vite 6.
- npm: `.npmrc` con `legacy-peer-deps=true`; existe script `install:legacy` para instalación con dependencias legacy.

---

## 3. Estructura del proyecto

### 3.1 Árbol de carpetas (src y raíz)

```
PortalMayoristaVii/
├── index.html                 # Entrada HTML; #root + script /src/main.jsx
├── package.json
├── vite.config.js
├── vercel.json
├── eslint.config.js
├── .npmrc
├── .gitignore                 # node_modules, .env
├── public/                    # Estáticos servidos tal cual
│   ├── favicon.webp
│   ├── og-image.jpg
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── vite.svg
│   └── shell/ShellLogo.png
├── dist/                      # Salida de vite build (no versionado en detalle)
└── src/
    ├── main.jsx               # Punto de entrada React; providers y <App />
    ├── App.jsx                # Rutas, GlobalStyle, ToastContainer, RouteHandler
    ├── api/                   # Clientes HTTP por dominio
    │   ├── access/
    │   ├── accessSections/
    │   ├── auth/
    │   ├── bonos/
    │   ├── cart/
    │   ├── email/
    │   ├── optionsCatalog/
    │   ├── order/
    │   ├── products/
    │   ├── profile/
    │   ├── shell/
    │   ├── users/
    │   └── xcoin/
    ├── assets/                # Imágenes e ilustraciones (logos empresas, ClubShell, etc.)
    ├── components/            # Componentes reutilizables
    │   ├── catalog/
    │   ├── common/
    │   ├── export/
    │   ├── layout/
    │   ├── pdf/
    │   ├── seo/
    │   └── ui/
    ├── config/                # JSON de configuración (flujo catálogo)
    │   └── catalogFlow.json
    ├── constants/             # Rutas, roles, tema, API, impuestos, etc.
    ├── context/               # React Context (Auth, Cart, ProductCatalog, AppTheme, ProductCache)
    ├── hooks/                 # Hooks personalizados (catálogo, tema, SEO, navegación)
    ├── mock/                  # Datos mock (empresas, pedidos coordinadora)
    ├── pages/                 # Páginas por dominio (auth, client, admin, coordinadora, reencauche, xcoin, etc.)
    ├── routes/                # Definición de rutas y ProtectedRoute
    ├── styles/                # Estilos JS (ej. TableStyles.js)
    ├── templates/             # Plantillas HTML (bonoPreview.html)
    └── utils/                 # Helpers (auth, token, bonos, export, etc.)
```

### 3.2 Rol y responsabilidad de cada carpeta

| Carpeta | Responsabilidad |
|---------|-----------------|
| **api/** | Módulos que llaman a la API REST (y a apiShell para Shell). Cada subcarpeta corresponde a un dominio (auth, cart, order, products, etc.). |
| **assets/** | Imágenes y recursos estáticos referenciados desde código (logos por empresa, ClubShell, GrupoVii). |
| **components/** | Componentes reutilizables: layout (Header, Sidebar, Layouts), catálogo, UI (Button, Input, Modal, Table, etc.), export/PDF, SEO. |
| **config/** | Configuración en JSON (p. ej. líneas de negocio y pasos del flujo de catálogo). |
| **constants/** | Constantes de la app: rutas, roles, tema (light/dark), cliente API, enlaces, impuestos, estados de bonos, configuración de líneas de producto. |
| **context/** | Estado global: Auth, Cart, ProductCatalog, AppTheme. ProductCacheContext está definido pero no se usa en el árbol de providers (véase sección 13). |
| **hooks/** | Lógica reutilizable: flujo de catálogo (useCatalogFlow), tema del sistema (usePreferredTheme), datos estructurados SEO (useStructuredData), navegación por rol (useNavigateByRole). |
| **mock/** | Datos de prueba: empresas (products.js), pedidos coordinadora (coordinadora/pedidosMock.js). |
| **pages/** | Pantallas por flujo: auth, cliente (home, catálogo, carrito, pedidos, perfil), admin, coordinadora, reencauche, xcoin, contacto, 404. |
| **routes/** | Definición de rutas (routes.jsx) y componente ProtectedRoute (ProtectedRoutes.jsx). |
| **styles/** | Objetos de estilos (ej. TableStyles.js) para tablas u otros componentes. |
| **templates/** | Plantillas HTML para generación de contenido (bonos). |
| **utils/** | Funciones puras o de servicio: encriptación de token, logout, bonos (QR, HTML, preview), export Excel/PDF, utilidades varias. |

### 3.3 Convenciones observadas

- **Extensiones:** `.jsx` para componentes React con JSX; `.js` para resto (hooks, API, utils, constants).
- **Nombres de archivos:** camelCase en general; componentes en PascalCase (ej. `DetalleProducto.jsx`).
- **Constantes de rutas/roles:** se usan desde `constants/routes.js` y `constants/roles.js` para evitar strings mágicos.
- **API:** funciones con prefijo `api_` o `api_<módulo>_<acción>` (ej. `api_auth_login`, `api_cart_getCarrito`).
- **Contextos:** Provider + hook `useXxx` (ej. `AuthProvider` + `useAuth()`).

---

## 4. Arquitectura general

### 4.1 Patrón arquitectónico

- **Frontend SPA** con capas claras:
  - **Presentación:** páginas y componentes en `pages/` y `components/`.
  - **Estado global:** React Context (Auth, Cart, ProductCatalog, AppTheme).
  - **Lógica de negocio:** repartida entre contextos, hooks (useCatalogFlow, etc.) y utils.
  - **Acceso a datos:** capa `api/` sobre axios (y apiShell para Shell); constants/api.js como cliente base.

No hay uso de Redux ni de un state manager externo; todo el estado compartido pasa por Context.

### 4.2 Flujo de datos

1. **Sesión:** Login → API auth → `guardarSessionID(idSession)` (AES en localStorage) → interceptor axios añade header `id-session` en cada petición.
2. **Usuario:** AuthContext valida sesión con `api_auth_me` al montar; deriva `user`, `isClient`, `isVisualizacion`, `isReencaucheUser` y rutas “home” por rol.
3. **Catálogo:** ProductCatalogContext carga productos por empresa (api/products), mapea con productLineConfig; uso de useCatalogFlow para filtros y URL.
4. **Carrito:** CartContext carga/actualiza carrito vía api/cart; múltiples `cartIds` por empresa; totales con IVA y descuentos (TAXES, user.DESCUENTOS).
5. **Tema:** AppThemeContext lee/escribe `localStorage.darkMode` y preferencia del sistema (usePreferredTheme); inyecta tema en styled-components vía ThemeWrapper.

### 4.3 Separación de responsabilidades

- **Rutas:** solo definición y protección (routes.jsx, ProtectedRoutes.jsx); redirección por rol en Home.jsx y en ProtectedRoute.
- **API:** solo llamadas HTTP y normalización de respuestas; sin estado React.
- **Contextos:** estado y acciones de dominio (login, carrito, catálogo, tema).
- **Páginas:** orquestación de UI y llamadas a contextos/hooks/api; componentes presentacionales en `components/`.

### 4.4 Módulos principales

- **Auth:** AuthContext, api/auth, api/users, api/auth/apiPassword, encryptToken, authUtils.
- **Catálogo:** ProductCatalogContext, useCatalogFlow, api/products, productLineConfig, catalogFlow.json, componentes catalog/.
- **Carrito y pedidos:** CartContext, api/cart, api/order, api/products (por código), constants/taxes.
- **Layout y navegación:** AuthenticatedLayout, CleanLayout, Header, Sidebar, routes, ProtectedRoute.
- **Reencauche:** api/bonos, utils/bonoUtils, bonoHTMLGenerator, páginas reencauche, BONO_STATES.
- **Shell:** api/shell, constants/apiShell (API Key y URL distinta).
- **XCoin:** api/xcoin, página XCoinHome.
- **Tema y SEO:** AppThemeContext, theme.js, SEO.jsx, useStructuredData.

---

## 5. Análisis detallado por módulos

### 5.1 Entrada y aplicación (main.jsx, App.jsx)

- **main.jsx:** Monta React en `#root` con StrictMode. Orden de providers: HelmetProvider → BrowserRouter → AuthProvider → CartProvider → ProductCatalogProvider → AppThemeProvider → ThemeWrapper (ThemeProvider de styled-components) → App.
- **App.jsx:** Renderiza GlobalStyle (styled-components), RouteHandler (limpia `catalogState` y `selectedProduct` de localStorage al salir de catálogo/búsqueda), árbol de Routes y ToastContainer. Rutas: públicas (CleanLayout), protegidas (ProtectedRoute + AuthenticatedLayout), catch-all a 404 o login.

### 5.2 Rutas (routes/, constants/routes.js)

- **routes.jsx:** Exporta `publicRoutes`, `ecommerceRoutes`, `adminRoutes`, `coordinadorRoutes`, `reencaucheRoutes`. Cada ruta tiene `path`, `element`, y donde aplica `allowedRoles`.
- **ProtectedRoutes.jsx:** Recibe `element`, `allowedRoles`, `isPublicRoute`. Si no autenticado → Navigate a login; si autenticado pero rol no permitido → Navigate a “home” del rol (`getHomeForRole`). Para REENCAUCHE_USER no hay caso explícito en `getHomeForRole`, por lo que se usa el default (ECOMMERCE.HOME); si el backend redirige a reencauche/home, puede haber una ruta específica que sí lleve ahí (p. ej. desde Home.jsx).
- **constants/routes.js:** Objeto ROUTES con AUTH, ADMIN, COORDINADOR, ECOMMERCE, REENCAUCHE, PUBLIC.

### 5.3 Contextos (context/)

- **AuthContext:** user, loading, isAuthenticated, isClient, isVisualizacion, isReencaucheUser; login, logout, verifyIdentification, registerUser, sendVerificationCode, verifyCode, resetPassword; getHomeRouteByRole, navigateToHomeByRole. Inicialización con `api_auth_me` y sessionId desde encryptToken.
- **CartContext:** cart, cartTotal, isLoading, cartIds (por empresa); addItem, removeItem, updateQuantity, loadCartFromAPI, syncCartToAPI, etc. Cálculo de total con descuentos por producto, descuento por empresa (user.DESCUENTOS), IVA (user.IVA o TAXES.IVA_PERCENTAGE). Solo clientes (isClient) pueden tener carrito activo; visualización no modifica carrito.
- **ProductCatalogContext:** catalogByEmpresa, loadingByEmpresa, errorByEmpresa; loadProductsForEmpresa, reloadProductsForEmpresa, loadProductByCodigo, loadProductsBySearchTerm, mapApiProductToAppFormat (usa productLineConfig y baseLinkImages).
- **AppThemeContext:** theme (light/dark), isDarkMode, toggleTheme; persistencia en localStorage y clase en documentElement.
- **ProductCacheContext:** isCacheValid, cacheProducts, getCachedProducts, invalidateCache, clearAllCache; TTL 10 min. No está conectado en main.jsx (código muerto o preparado para uso futuro).

### 5.4 API (api/, constants/api.js, constants/apiShell.js)

- **constants/api.js:** Instancia axios con `baseURL: import.meta.env.VITE_API_URL`, timeout 45000, interceptor que añade `id-session` desde `obtenerSessionID()`.
- **constants/apiShell.js:** Instancia axios separada para App Shell: `VITE_API_APP_SHELL` / `VITE_API_APP_SHELL_DESARROLLO` según `import.meta.env.DEV`, header `X-Portal-API-Key` con `VITE_API_KEY_APP_SHELL`, timeout 300000.
- **auth:** apiLogin (login, logout), apiAuth (me), apiPassword (request reset, verify OTP, set new password).
- **users:** apiUsers (getAll, create, update, updateRole, getByAccount, etc.), apiRoles, apiAddresses.
- **products:** getProductByField, searchProducts, getProductByCodigo, getInfoProductos.
- **cart:** getCarrito, updateCarrito, deleteProductsFromCart (deleteDetail).
- **order:** getOrdersByAccount, createOrder, getOrderById, y otras relacionadas con pedidos.
- **bonos:** múltiples endpoints (clientes por mayorista, bonos por cliente, productos elegibles, envío de archivo, generación QR, etc.).
- **shell:** searchManager (por código SAP), createUser (usuarios Lider Shell).
- **xcoin:** balance, products, redemption history, redeem, etc.
- **profile, email, optionsCatalog, access, accessSections:** módulos específicos de perfil, correo, opciones de catálogo y permisos.

Todas las funciones de api devuelven objetos tipo `{ success, message, data?, error? }` o lanzan en casos concretos (ej. api_auth_me hace throw para que AuthContext maneje).

### 5.5 Constantes (constants/)

- **routes.js, roles.js:** Rutas y nombres de roles (ADMIN, CLIENTE, COORDINADOR, VISUALIZACION, REENCAUCHE_USER).
- **theme.js:** breakpoints, baseTheme (tipografía, spacing, borders, shadows, zIndex), lightTheme, darkTheme (colores por modo).
- **api.js, apiShell.js:** Clientes HTTP (ya descritos).
- **links.js:** baseLinkImages = VITE_API_IMAGES_URL.
- **taxes.js:** TAXES.IVA_PERCENTAGE (15), calculateIVA, calculatePriceWithIVA, calculatePriceWithoutIVA.
- **bonoStates.js:** BONO_STATES (ACTIVO, USADO, VENCIDO, PENDIENTE, RECHAZADO), BONO_STATE_CONFIG (label, colores), getBonoStateConfig/Label/BackgroundColor/Color.
- **productLineConfig.js:** PRODUCT_LINE_CONFIG por línea (LLANTAS, LLANTAS MOTO, LUBRICANTES, HERRAMIENTAS, DEFAULT): specs, categories, nameTemplate, descriptionTemplate, categoryLabels, categoryOrder.

### 5.6 Hooks (hooks/)

- **usePreferredTheme:** Detecta `prefers-color-scheme: dark` con matchMedia y suscribe cambios.
- **useCatalogFlow:** Hook largo que maneja flujo de catálogo: línea seleccionada, pasos, filtros, búsqueda, sincronización con URL (searchParams) y localStorage; filtros adicionales por línea; depende de ProductCatalogContext y catalogFlow.json.
- **useStructuredData:** useProductStructuredData, useOrganizationStructuredData, useWebsiteStructuredData (Schema.org para SEO).
- **useNavigateByRole:** navigateToHome, navigateWithFallback según rol. **Nota:** usa `user.ROLES` (array); en AuthContext el usuario tiene `ROLE_NAME` (string). Si el backend no devuelve `ROLES`, este hook puede fallar o no coincidir con el comportamiento esperado.

### 5.7 Utilidades (utils/)

- **encryptToken.js:** AES (crypto-js) con VITE_SECRET_KEY_TOKEN; obtenerSessionID, guardarSessionID, eliminarTokens; clave en localStorage `sess`.
- **authUtils.js:** performLogout (eliminarTokens, limpiar user y auth de localStorage).
- **bonoUtils.js:** parseProductSpecification, generateInvoiceQRCode (llama api bonos generateQR), previewBonosHTML, y lógica de generación/descarga de bonos; usa VITE_NODE_ENV, VITE_PRODUCTION_URL, VITE_DEVELOPMENT_URL para URLs de verificación.
- **bonoHTMLGenerator.js:** generateCompleteBonosHTML (generación HTML de bonos).
- **utils.js:** copyToClipboard (toast), getRGBA (color hex a rgba).
- **exportToExcel.js, exportToPdf.js:** Exportación a Excel y PDF (file-saver, exceljs, jspdf, etc.).

### 5.8 Configuración (config/)

- **catalogFlow.json:** Objeto por línea de negocio (LLANTAS, LLANTAS MOTO, LUBRICANTES, HERRAMIENTAS) con name, displayName y steps (array; en el JSON actual steps está vacío).

### 5.9 Mock (mock/)

- **products.js:** Lista de empresas (AUTOLLANTA, MAXXIMUNDO, STOX, IKONIX) con id, nombre, descripción, logos light/dark, color, marcas, products count; getEmpresaLogo(empresa, isDarkMode).
- **coordinadora/pedidosMock.js:** Datos mock para pedidos de coordinadora.

---

## 6. Componentes / Pages / Vistas

### 6.1 Layout (components/layout/)

- **Layout.jsx:** Contenedor flex column, altura 100vh, background del tema.
- **AuthenticatedLayout.jsx:** Layout + Header + MainContent; MainContent envuelve `<Outlet />`.
- **CleanLayout.jsx:** Contenedor centrado a pantalla completa, sin header/sidebar; solo `<Outlet />`.
- **Header.jsx:** Logo (navegación a home por rol), menú móvil, carrito (con contador desde CartContext), tema (toggle), menú usuario (perfil, logout); usa api_access_sections para permisos por sección.
- **Sidebar.jsx:** Navegación por secciones (Compras, Catálogos por empresa, Reencauche, XCoin, App Shell, Contacto, Admin/Coordinador según rol); items expandibles; logout y toggle tema.
- **MainContent.jsx:** Área principal con sidebar colapsable en móvil y contenido.
- **Footer.jsx, PageContainer.jsx:** Contenedores de pie y de página.

### 6.2 Catálogo (components/catalog/)

- **AdditionalFilters.jsx, CatalogBreadcrumb.jsx, FilterCards.jsx, ProductGridView.jsx:** Filtros adicionales, migas de pan, tarjetas de filtro y grid de productos; integrados con useCatalogFlow y ProductCatalogContext.

### 6.3 UI (components/ui/)

- **Button, Input, Select, Modal, ContactModal:** Controles y modales.
- **Table:** Tabla reutilizable (estilos en styles/TableStyles.js).
- **ProductCard, SearchBar, FilterSidebar:** Tarjeta de producto, barra de búsqueda, sidebar de filtros.
- **RenderIcon, RenderLoader:** Renderizado de iconos (react-icons) y estados de carga.

### 6.4 Otras (components/)

- **SEO.jsx:** Envuelve react-helmet-async; título, description, keywords, og, twitter, canonical, structuredData (JSON-LD).
- **ExportToExcel.jsx, PDFGenerator.jsx:** Exportación Excel y generación PDF.
- **FlexBox.jsx (common):** Contenedor flex reutilizable.

### 6.5 Páginas principales y flujo de navegación

- **Home.jsx:** Si no hay user muestra “Cargando…” y redirige cuando llega user. Según user.ROLE_NAME redirige: ADMIN → dashboard, COORDINADOR → coordinadora, REENCAUCHE_USER → reencauche/home; resto → ClientHomeComponent. También renderiza SEO.
- **Auth:** Login, Register, ForgotPassword (formularios con CleanLayout).
- **Cliente/E-commerce:** ClientHomeComponent (inicio), Catalog (catálogo por empresa con useCatalogFlow), DetalleProducto, Carrito, MisPedidos, DetallePedido, Perfil (pestañas: información, direcciones, teléfonos, preferencias, seguridad), SearchResults, Contacto, AppShell (integración Shell), XCoinHome.
- **Admin:** AdminDashboardComponent, UsersAdministration, CoordinadorAdminComponent.
- **Coordinador:** CoordinadorHomeComponent, DetallePedidoCoordinador, EditarPedido.
- **Reencauche:** ReencaucheHome, ClientesReencauche, BonosActivados, ActivacionBonos, VerificarBono, FormularioNuevoBonoLista, FormularioNuevoCliente.
- **NotFound (404), Unauthorized:** Páginas de error.

La navegación se controla por rutas en App.jsx y por ProtectedRoute (rol); el Sidebar y el Header enlazan a las rutas definidas en constants/routes.js.

---

## 7. Lógica de negocio

### 7.1 Reglas importantes

- **Roles:** Un usuario tiene un único rol (ROLE_NAME) que determina acceso a rutas y “home” (admin → dashboard, coordinador → pedidos, resto → e-commerce home; reencauche no tiene entrada explícita en getHomeForRole, se asume redirección desde backend o Home.jsx).
- **Carrito:** Solo rol CLIENTE puede usar carrito; VISUALIZACION no modifica carrito. Carrito se agrupa por empresa; múltiples cartIds (uno por empresa).
- **Catálogo:** Productos por empresa; mapeo de API a formato app vía productLineConfig por DMA_LINEANEGOCIO; imágenes con baseLinkImages.
- **IVA y descuentos:** IVA 15% (TAXES o user.IVA); descuentos por producto (promocional), por empresa (user.DESCUENTOS).
- **Empresas fijas en registro:** ALL_COMPANIES en AuthContext (MAXXIMUNDO, STOX, AUTOLLANTA, IKONIX, AUTOMAX); verifyIdentification devuelve empresas disponibles para la cuenta.
- **Bonos:** Estados ACTIVO, USADO, VENCIDO, PENDIENTE, RECHAZADO; generación QR vía API y URL de verificación según entorno (VITE_PRODUCTION_URL / VITE_DEVELOPMENT_URL).

### 7.2 Validaciones

- Login/registro: validación en formularios (email, contraseña, identificación, etc.); mensajes de error vía toast y estado local.
- Recuperación de contraseña: token en localStorage (resetToken); verifyCode y setNewPassword lo consumen.
- ProtectedRoute: comprueba isAuthenticated y allowedRoles antes de renderizar la ruta.

No se ha encontrado una capa centralizada de validación (p. ej. esquemas Yup/Zod) documentada en el código; las validaciones están en los propios componentes/contextos.

### 7.3 Casos especiales

- **getHomeForRole(REENCAUCHE_USER):** No está en el switch de ProtectedRoutes.jsx; devuelve ROUTES.ECOMMERCE.HOME. La redirección a reencauche/home se hace en Home.jsx según user.ROLE_NAME.
- **Ruta /reencauche/verificacion:** allowedRoles CLIENTE y REENCAUCHE_USER; compartida entre cliente y reencauche.
- **App Shell:** Usa API y API Key propios; timeout 300 s; no usa id-session del portal.
- **ProductCacheContext:** Definido pero no usado en el árbol de providers.

### 7.4 Suposiciones del sistema

- El backend devuelve user con ROLE_NAME (string) y, en algunos flujos, posiblemente ROLES (array); useNavigateByRole asume ROLES.
- La API espera header `id-session` para autenticación en la mayoría de endpoints.
- Respuestas de API en formato `{ data: { message?, data? } }`; los módulos api normalizan a `{ success, message, data?, error? }`.
- Las empresas y líneas de negocio están alineadas con productLineConfig y catalogFlow.json; si el backend añade una línea nueva, puede requerir cambios en configuración y en productLineConfig.

---

## 8. Configuración y entornos

### 8.1 Variables de entorno

Usadas en el código (todas con prefijo `VITE_` para exponerse en el cliente):

| Variable | Uso |
|----------|-----|
| VITE_API_URL | baseURL del axios principal (constants/api.js). |
| VITE_API_IMAGES_URL | baseLinkImages para URLs de imágenes (constants/links.js). |
| VITE_SECRET_KEY_TOKEN | Clave AES para cifrar/descifrar session ID (utils/encryptToken.js). |
| VITE_API_APP_SHELL | URL API App Shell (producción). |
| VITE_API_APP_SHELL_DESARROLLO | URL API App Shell (desarrollo). |
| VITE_API_KEY_APP_SHELL | API Key para header X-Portal-API-Key (apiShell). |
| VITE_NODE_ENV | Comparación con "production" para elegir URL en bonos/reencauche. |
| VITE_PRODUCTION_URL | URL base producción (verificación bonos, etc.). |
| VITE_DEVELOPMENT_URL | URL base desarrollo. |

El archivo `.env` está en `.gitignore`; no se documentan valores reales. Debe existir un `.env.example` o documentación interna con las claves necesarias (sin valores).

### 8.2 Configuraciones importantes

- **vite.config.js:** base "/", server host true, port 4200, headers de seguridad (X-Content-Type-Options, X-Frame-Options, etc.).
- **vercel.json:** rewrites `/(.*)` → `/index.html` (SPA); mismos headers de seguridad que en Vite.
- **eslint.config.js:** archivos `**/*.{js,jsx}`, ignora dist; reglas recommended, react-hooks, react-refresh; no-unused-vars con excepción para variables que empiezan por mayúscula/guion bajo.

### 8.3 Diferencias dev / prod

- **API:** baseURL e imágenes vía env; no hay sustituto por defecto documentado si faltan variables (la app puede fallar al cargar).
- **App Shell:** `import.meta.env.DEV` elige entre VITE_API_APP_SHELL_DESARROLLO y VITE_API_APP_SHELL.
- **Bonos/Reencauche:** URLs de verificación según VITE_NODE_ENV === "production" (VITE_PRODUCTION_URL vs VITE_DEVELOPMENT_URL).
- **Build:** `vite build` genera `dist/`; Vercel sirve ese contenido con rewrites a index.html.

---

## 9. Manejo de errores y logs

### 9.1 Cómo se manejan errores

- **API:** try/catch en cada función; se devuelve `{ success: false, message, error }`; en algunos casos se hace `throw` (ej. api_auth_me) para que el llamador (AuthContext) reaccione.
- **Contextos:** AuthContext y CartContext capturan errores de API, muestran toast.error y actualizan estado (p. ej. limpiar usuario en fallo de validación de sesión).
- **UI:** Errores mostrados con react-toastify (toast.error, toast.success); no hay componente global de “página de error” además de 404/Unauthorized.

### 9.2 Dónde se registran

- **console.error:** En api (apiAuth, apiLogin, apiShell), contextos (Auth, Cart), utils (bonoUtils, utils, encryptToken), y varias páginas/hooks para fallos de red o lógica. No hay servicio de logging remoto; todo es consola del navegador.
- **console.warn:** En apiShell cuando falta VITE_API_KEY_APP_SHELL; en useCatalogFlow para localStorage; en ProductCatalogContext (comentarios “Intentionally ignore”) no se registra.

### 9.3 Casos no controlados

- Si VITE_API_URL o VITE_SECRET_KEY_TOKEN no están definidos, la app puede fallar en tiempo de ejecución (axios con baseURL undefined, decrypt fallido).
- Errores de red no siempre muestran mensaje amigable; en algunos flujos solo console.error.
- No hay boundary global de React (Error Boundary) documentado en el código analizado; un error no capturado en un componente puede tumbar toda la SPA.

---

## 10. Seguridad

### 10.1 Autenticación

- Login por email y contraseña; el backend devuelve `idSession`; se guarda cifrado en localStorage (clave `sess`) con AES (crypto-js) usando VITE_SECRET_KEY_TOKEN.
- Cada petición HTTP (salvo Shell) lleva header `id-session` con el valor descifrado.
- Validación de sesión al cargar la app vía GET /auth/me; si falla o no hay sesión, se limpia estado y se redirige a login.
- Logout: llamada a POST /auth/logout y limpieza local (eliminarTokens, user, auth).

### 10.2 Autorización

- **Rutas:** ProtectedRoute comprueba isAuthenticated y allowedRoles; si el rol no está permitido, redirige al “home” del rol.
- **Sidebar/Header:** Enlaces visibles según user.EMPRESAS y user.ROLE_NAME; api_access_sections para permisos por sección (Header).
- **Carrito:** Solo CLIENTE puede añadir/modificar; VISUALIZACION no modifica.

No se ha visto autorización a nivel de campo o recurso individual más allá de rutas y menús.

### 10.3 Datos sensibles

- **Session ID:** Almacenado cifrado en localStorage; clave de cifrado en variable de entorno (VITE_SECRET_KEY_TOKEN). Si alguien tiene acceso al código compilado y al .env, la clave es conocida; el riesgo se mitiga si el backend invalida sesiones y el token tiene vida limitada.
- **Reset token:** Guardado en localStorage sin cifrado (resetToken) hasta completar el flujo de recuperación de contraseña.
- **API Key Shell:** En header; expuesta en el cliente (Vite incluye env en el bundle). Cualquier usuario que abra la app puede ver la key en el código del frontend; se asume que la API Shell restringe por otros medios o que la key es de bajo riesgo en el cliente.

### 10.4 Riesgos detectados

- Clave AES y API Key en el cliente: cualquier usuario puede extraerlas del bundle.
- Sin Error Boundary global: errores no capturados pueden dejar la app en blanco o inconsistente.
- useNavigateByRole usa user.ROLES (array); si el backend solo envía ROLE_NAME, la comprobación `user.ROLES.includes(...)` puede fallar o ser undefined.

---

## 11. Flujo de ejecución

### 11.1 Arranque de la aplicación

1. **index.html** carga y ejecuta `/src/main.jsx`.
2. **main.jsx** crea la raíz React en `#root` y renderiza StrictMode → Root.
3. **Root** monta, en orden: HelmetProvider → BrowserRouter → AuthProvider → CartProvider → ProductCatalogProvider → AppThemeProvider → ThemeWrapper (ThemeProvider con theme) → App.
4. **AuthProvider** en su useEffect llama a `obtenerSessionID()`; si hay valor, llama a `api_auth_me()`; si la respuesta incluye user, setea user y isAuthenticated; si no, hace performLogout. Mientras loading es true, no renderiza children; al terminar, renderiza App.
5. **App** renderiza GlobalStyle, RouteHandler y Routes. RouteHandler limpia localStorage de catálogo al salir de /catalogo y /busqueda.
6. **Routes:** Si la URL es pública (login, register, forgot-password, 404), se usa CleanLayout y el element correspondiente. Si es ruta protegida, ProtectedRoute comprueba autenticación y rol; si todo es correcto, renderiza AuthenticatedLayout con Header, Sidebar y Outlet (página actual).
7. **Home (path "/"):** Si hay user, según ROLE_NAME redirige a dashboard, coordinadora, reencauche/home o ClientHomeComponent; si no hay user, muestra “Cargando…” hasta que AuthProvider termine.

### 11.2 Flujo principal del usuario (cliente)

1. Usuario entra en /auth/login → CleanLayout + Login.
2. Login exitoso → guardarSessionID, setUser, navigate al home del rol (cliente → "/" que redirige a ClientHomeComponent).
3. AuthenticatedLayout muestra Header y Sidebar; el usuario navega a Catálogo (por empresa), Producto, Carrito, Mis Pedidos, Perfil, etc.
4. Catálogo: ProductCatalogContext carga productos por empresa; useCatalogFlow gestiona línea, pasos y filtros; estado reflejado en URL y localStorage.
5. Añadir al carrito: CartContext addItem; si hay cartId para esa empresa, se actualiza vía API; si no, se puede crear o sincronizar en la siguiente operación.
6. Checkout (flujo implícito en Carrito): syncCartToAPI; creación de pedido vía api/order; tras éxito, limpieza o redirección según implementación de la página Carrito/DetallePedido.

---

## 12. Dependencias críticas

### 12.1 Si fallan

- **Backend (VITE_API_URL):** Sin API operativa, login, carrito, catálogo, pedidos y la mayoría de flujos no funcionan. No hay modo offline ni caché persistente de sesión más allá de revalidar con /auth/me.
- **VITE_SECRET_KEY_TOKEN:** Si falta o cambia, obtenerSessionID() devuelve null y el usuario queda deslogueado; el backend puede seguir aceptando el mismo idSession si no se ha invalidado.
- **react-router-dom:** Toda la navegación depende de él; si falla, la SPA no enruta.
- **AuthContext:** Casi todas las pantallas dependen de user/isAuthenticated; si el contexto no está disponible o falla la validación inicial, la app puede quedarse en “Cargando…” o redirigir siempre a login.

### 12.2 Impacto en el sistema

- **axios:** Todas las llamadas API pasan por la instancia de api.js (o apiShell.js); un interceptor roto afecta a todas las peticiones autenticadas.
- **styled-components / ThemeProvider:** Si el tema no se inyecta, los componentes que usan `theme` pueden verse rotos o con estilos por defecto.
- **CartContext y ProductCatalogContext:** Páginas de carrito, catálogo y detalle de producto dependen de ellos; fallos de estado o de API afectan directamente a la experiencia de compra.

---

## 13. Deuda técnica y mejoras

### 13.1 Código duplicado

- Lógica de “home por rol” está en ProtectedRoutes.jsx (getHomeForRole) y en AuthContext (getHomeRouteByRole, navigateToHomeByRole); convendría un único lugar (p. ej. constantes o AuthContext) y que ProtectedRoute lo use.
- Construcción de URLs de verificación de bonos (VITE_NODE_ENV, VITE_PRODUCTION_URL, VITE_DEVELOPMENT_URL) repetida en VerificarBono, BonosActivados, ClientesReencauche, bonoUtils; extraer a un helper (ej. getBaseUrl()).

### 13.2 Acoplamientos fuertes

- Páginas grandes (ej. XCoinHome.jsx, AppShell.jsx) con mucha lógica y UI; difícil de testear y mantener. Recomendación: extraer hooks y subcomponentes.
- useCatalogFlow es muy largo y hace mucho (URL, localStorage, filtros, pasos); podría dividirse en hooks más pequeños (ej. useCatalogUrl, useCatalogFilters).

### 13.3 Falta de tests

- No hay carpetas `__tests__` ni archivos `*.test.js` / `*.spec.js` en el análisis; no hay configuración de Jest/Vitest en package.json. No hay tests unitarios ni e2e documentados en el repo.

### 13.4 ProductCacheContext no usado

- ProductCacheContext está implementado pero ProductCacheProvider no se usa en main.jsx. O bien se integra en el árbol de providers y se usa desde catálogo/páginas, o se elimina para no mantener código muerto.

### 13.5 useNavigateByRole y user.ROLES

- useNavigateByRole usa `user.ROLES` (array); el resto del código usa `user.ROLE_NAME` (string). Unificar: o el backend envía ROLES y se usa en todos lados, o se cambia el hook a ROLE_NAME.

### 13.6 getHomeForRole y REENCAUCHE_USER

- En ProtectedRoutes.jsx, getHomeForRole no tiene case para REENCAUCHE_USER; devuelve ECOMMERCE.HOME. Si un usuario REENCAUCHE_USER intenta acceder a una ruta solo de cliente, sería redirigido a "/" y luego Home.jsx lo redirige a reencauche/home; funciona pero es redundante. Añadir case REENCAUCHE_USER → ROUTES.REENCAUCHE.HOME haría el comportamiento explícito.

### 13.7 Recomendaciones claras

- Añadir Error Boundary a nivel de App o de rutas para capturar errores de render y mostrar una vista de error en lugar de pantalla en blanco.
- Centralizar variables de entorno en un módulo (ej. `config/env.js`) y validar las obligatorias al arranque.
- Introducir tests (Vitest/Jest + React Testing Library) para contextos, hooks críticos y flujos de auth/carrito.
- Documentar o añadir `.env.example` con todas las variables VITE_ necesarias (sin valores sensibles).
- Reducir tamaño de componentes muy grandes (XCoinHome, AppShell, useCatalogFlow) extrayendo hooks y componentes.
- Unificar manejo de “home por rol” y de URLs de entorno (bonos) en helpers/constants.
- Decidir si ProductCacheContext se usa o se elimina.

---

## 14. Guía rápida para desarrolladores

### 14.1 Requisitos previos

- **Node.js:** 18 o superior (recomendado 20 LTS).
- **npm:** Versión compatible con package.json (npm 9+ recomendado).
- **Backend:** Disponible y accesible; variables de entorno configuradas (ver sección 8).

### 14.2 Cómo correr el proyecto

```bash
# Clonar e instalar
git clone <repo>
cd PortalMayoristaVii
npm install
# Si hay conflictos de peer dependencies:
npm run install:legacy

# Copiar y configurar variables de entorno
# Crear .env con VITE_API_URL, VITE_API_IMAGES_URL, VITE_SECRET_KEY_TOKEN, etc.

# Desarrollo (puerto 4200, host 0.0.0.0)
npm run dev

# Build de producción
npm run build

# Con PM2 (opcional)
npm run pm2Dev
```

### 14.3 Comandos importantes

| Comando | Descripción |
|---------|-------------|
| npm run dev | Servidor de desarrollo Vite en http://localhost:4200 |
| npm run build | Genera dist/ para producción |
| npm run install:legacy | npm install --legacy-peer-deps |
| npm run pm2Dev | PM2: borra proceso anterior, inicia dev y muestra logs |

### 14.4 Puntos de cuidado

- **.env:** No commitear; incluir en .gitignore (ya está). Usar .env.example como plantilla.
- **Rutas y roles:** Cualquier cambio en rutas o roles debe reflejarse en constants/routes.js, constants/roles.js y en ProtectedRoutes (getHomeForRole) y Home.jsx para evitar bucles o accesos incorrectos.
- **API:** Si el backend cambia contrato (paths, formato de user), actualizar api/ y AuthContext/CartContext según corresponda.
- **Tema:** Los componentes que usan `theme` deben estar dentro de ThemeProvider (ThemeWrapper en main.jsx); no usar styled-components con theme fuera de ese árbol.
- **Idioma:** La documentación y la UI están en español; mensajes de error y toasts también; mantener coherencia en nuevas pantallas.

---

*Documentación generada a partir del análisis del código del proyecto. Para dudas sobre comportamiento del backend o de variables de entorno en distintos entornos, consultar al equipo que mantiene el backend y los despliegues.*
