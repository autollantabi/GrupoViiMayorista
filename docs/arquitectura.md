# Arquitectura del proyecto

Arquitectura general del Portal Mayorista Vii: capas, carpetas principales, responsabilidades, módulos y patrones. Sirve para entender dónde vive cada funcionalidad y cómo añadir una nueva pantalla o módulo.

---

## Arquitectura general del sistema

- **Tipo:** SPA (Single Page Application) en React; solo frontend en este repositorio.
- **Backend:** APIs REST externas; autenticación por session ID en header `id-session`.
- **Estado global:** React Context (Auth, Cart, ProductCatalog, AppTheme). No hay Redux ni otro state manager externo.
- **Flujo de datos:** Login → session ID cifrado en localStorage → interceptor axios añade `id-session` → contextos y páginas consumen API y estado.

Capas identificables:

1. **Presentación:** páginas en `pages/`, componentes en `components/`.
2. **Estado y lógica de negocio:** contextos en `context/`, hooks en `hooks/`, utils en `utils/`.
3. **Acceso a datos:** capa `api/` sobre axios (instancia en `constants/api.js`; API Shell en `constants/apiShell.js`).
4. **Configuración y constantes:** `constants/`, `config/`.

---

## Árbol de carpetas relevante

```
PortalMayoristaVii/
├── index.html                    # Entrada HTML; #root + script /src/main.jsx
├── package.json
├── vite.config.js
├── vercel.json                   # Rewrites y headers para Vercel (SPA)
├── eslint.config.js
├── .npmrc                        # legacy-peer-deps=true
├── .gitignore                    # node_modules, .env
├── public/                       # Estáticos servidos tal cual
│   ├── favicon.webp
│   ├── og-image.jpg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── shell/ShellLogo.png
├── dist/                         # Salida de vite build (no versionado en detalle)
└── src/
    ├── main.jsx                 # Punto de entrada: providers + App
    ├── App.jsx                   # GlobalStyle, RouteHandler, Routes, ToastContainer
    ├── api/                      # Clientes HTTP por dominio
    │   ├── access/
    │   ├── accessSections/
    │   ├── auth/                 # apiLogin, apiAuth, apiPassword
    │   ├── bonos/
    │   ├── cart/
    │   ├── email/
    │   ├── optionsCatalog/
    │   ├── order/
    │   ├── products/
    │   ├── profile/
    │   ├── shell/                # Usa constants/apiShell.js (API Key)
    │   ├── users/
    │   └── xcoin/
    ├── assets/                   # Imágenes (logos empresas, ClubShell, etc.)
    ├── components/
    │   ├── catalog/              # Filtros, breadcrumb, grid de productos
    │   ├── common/               # FlexBox, etc.
    │   ├── export/               # ExportToExcel, PDF
    │   ├── layout/               # Header, Sidebar, Layouts, MainContent
    │   ├── pdf/
    │   ├── seo/                  # SEO.jsx (react-helmet-async)
    │   └── ui/                   # Button, Input, Modal, Table, ProductCard, etc.
    ├── config/
    │   └── catalogFlow.json      # Líneas de negocio y pasos del catálogo
    ├── constants/                # Rutas, roles, tema, API, impuestos, links
    ├── context/                  # Auth, Cart, ProductCatalog, AppTheme (ProductCache no usado)
    ├── hooks/                    # useCatalogFlow, usePreferredTheme, useStructuredData, useNavigateByRole
    ├── mock/                     # Datos mock (empresas, pedidos coordinadora)
    ├── pages/                    # Pantallas por dominio (auth, client, admin, coordinadora, reencauche, xcoin, etc.)
    ├── routes/                   # routes.jsx (definición), ProtectedRoutes.jsx
    ├── styles/                   # TableStyles.js, etc.
    ├── templates/                # bonoPreview.html (bonos)
    └── utils/                    # encryptToken, authUtils, bonoUtils, export, etc.
```

---

## Descripción de carpetas principales

| Carpeta | Responsabilidad |
|---------|-----------------|
| **api/** | Módulos que llaman a la API REST (y a apiShell para Shell). Cada subcarpeta es un dominio (auth, cart, order, products, bonos, shell, xcoin, etc.). Devuelven `{ success, message, data?, error? }`. |
| **assets/** | Imágenes y recursos estáticos referenciados desde código (logos por empresa, ClubShell, GrupoVii). |
| **components/** | Componentes reutilizables: layout (Header, Sidebar, Layouts), catálogo, UI (Button, Input, Modal, Table), export/PDF, SEO. |
| **config/** | Configuración en JSON (p. ej. `catalogFlow.json`: líneas de negocio y pasos del flujo de catálogo). |
| **constants/** | Rutas (`routes.js`), roles (`roles.js`), tema (`theme.js`), cliente API (`api.js`, `apiShell.js`), links (`links.js`), impuestos (`taxes.js`), estados de bonos (`bonoStates.js`), líneas de producto (`productLineConfig.js`). |
| **context/** | Estado global: Auth, Cart, ProductCatalog, AppTheme. ProductCacheContext está definido pero no conectado en `main.jsx`. |
| **hooks/** | Lógica reutilizable: flujo de catálogo (`useCatalogFlow`), tema del sistema (`usePreferredTheme`), datos estructurados SEO (`useStructuredData`), navegación por rol (`useNavigateByRole`). |
| **mock/** | Datos de prueba (empresas en `products.js`, pedidos coordinadora en `coordinadora/pedidosMock.js`). |
| **pages/** | Pantallas por flujo: auth (Login, Register, ForgotPassword), cliente (Home, Catálogo, Carrito, Pedidos, Perfil, etc.), admin, coordinadora, reencauche, xcoin, contacto, 404. |
| **routes/** | Definición de rutas (`routes.jsx`: publicRoutes, ecommerceRoutes, adminRoutes, coordinadorRoutes, reencaucheRoutes) y componente `ProtectedRoute` (ProtectedRoutes.jsx). |
| **styles/** | Objetos de estilos (ej. `TableStyles.js`) para tablas u otros componentes. |
| **templates/** | Plantillas HTML para generación de contenido (bonos). |
| **utils/** | Funciones puras o de servicio: encriptación de token (`encryptToken.js`), logout (`authUtils.js`), bonos (QR, HTML, preview), export Excel/PDF, utilidades varias. |

---

## Separación de responsabilidades

- **Rutas:** Solo definición en `routes.jsx` y protección en `ProtectedRoutes.jsx`. Redirección por rol en `Home.jsx` y en `getHomeForRole` (ProtectedRoutes).
- **API:** Solo llamadas HTTP y normalización de respuestas; sin estado React. Las instancias axios están en `constants/api.js` y `constants/apiShell.js`.
- **Contextos:** Estado y acciones de dominio (login, carrito, catálogo, tema). Los componentes y páginas consumen vía hooks (`useAuth`, `useCart`, etc.).
- **Páginas:** Orquestan UI y llamadas a contextos/hooks/api; la UI reutilizable vive en `components/`.

---

## Módulos principales y cómo añadir una nueva pantalla o funcionalidad

### Módulos principales

- **Auth:** AuthContext, `api/auth` (apiLogin, apiAuth, apiPassword), `utils/encryptToken`, `utils/authUtils`.
- **Catálogo:** ProductCatalogContext, `useCatalogFlow`, `api/products`, `constants/productLineConfig.js`, `config/catalogFlow.json`, componentes en `components/catalog/`.
- **Carrito y pedidos:** CartContext, `api/cart`, `api/order`, `constants/taxes.js`.
- **Layout y navegación:** AuthenticatedLayout, CleanLayout, Header, Sidebar, `routes/routes.jsx`, ProtectedRoute, `constants/routes.js`, `constants/roles.js`.
- **Reencauche:** `api/bonos`, `utils/bonoUtils`, `utils/bonoHTMLGenerator`, páginas en `pages/reencauche/`, `constants/bonoStates.js`.
- **Shell:** `api/shell`, `constants/apiShell.js` (API Key y URL distinta).
- **XCoin:** `api/xcoin`, página XCoinHome.
- **Tema y SEO:** AppThemeContext, `constants/theme.js`, SEO.jsx, useStructuredData.

### Añadir una nueva pantalla o funcionalidad

1. **Ruta y rol**
   - Añadir la ruta en `constants/routes.js` (ej. `ECOMMERCE.NUEVA_SECCION: "/nueva-seccion"`).
   - En `routes/routes.jsx`, añadir el objeto de ruta en el array que corresponda (ecommerceRoutes, adminRoutes, etc.) con `path`, `element` (componente) y `allowedRoles`.
   - Si la ruta es protegida, ya está envuelta por `ProtectedRoute` en `App.jsx`; si el rol no está en `allowedRoles`, el usuario será redirigido a su home.

2. **Página**
   - Crear el componente en `pages/` (por dominio: client, admin, coordinadora, reencauche, etc.) o en una carpeta nueva si es un dominio nuevo.
   - Importar el componente en `routes/routes.jsx` y usarlo en `element`.

3. **Menú**
   - Añadir el enlace en `components/layout/Sidebar.jsx` (y si aplica en Header) según `user.ROLE_NAME` o `user.EMPRESAS`. Si se usan permisos por sección, revisar `api/accessSections/apiAccessSections.js`.

4. **API (si hace falta)**
   - Si es un dominio nuevo: crear carpeta bajo `api/<dominio>/` y funciones que usen la instancia `api` de `constants/api.js`. Mantener el formato de retorno `{ success, message, data?, error? }`.
   - Si es una extensión de dominio existente: añadir funciones en el módulo correspondiente.

5. **Estado global (solo si es necesario)**
   - Si la nueva funcionalidad requiere estado compartido entre varias pantallas, valorar un nuevo Context en `context/` o extender uno existente. Registrar el Provider en `main.jsx` dentro del árbol de providers.

6. **Constantes**
   - Si hay nuevas rutas, roles o configuraciones, centralizarlas en `constants/` para evitar strings mágicos.

No es obligatorio tener tests en el repo actual; si se introducen, ubicar tests junto al módulo o en `__tests__` según la convención que se adopte (ver [docs/pendientes.md](pendientes.md)).

---

## Patrones de diseño utilizados

- **Provider (Context):** Auth, Cart, ProductCatalog, AppTheme exponen estado y acciones vía Context + hook (`useAuth`, etc.).
- **Composición:** Layouts (AuthenticatedLayout, CleanLayout) envuelven contenido con Header/Sidebar o contenedor limpio; rutas anidadas con `<Outlet />`.
- **Interceptor:** La instancia axios en `constants/api.js` usa interceptor de request para añadir el header `id-session` en cada petición.
- **Rutas protegidas:** ProtectedRoute como componente que comprueba autenticación y `allowedRoles` antes de renderizar el elemento; en caso contrario redirige a login o al home del rol.
- **Normalización de API:** Los módulos en `api/` devuelven un formato común `{ success, message, data?, error? }` para que las páginas y contextos manejen errores de forma uniforme.
- **Configuración por datos:** Rutas y roles en constantes; flujo de catálogo en `catalogFlow.json` y `productLineConfig.js` para evitar hardcodear líneas de negocio en el código.

No hay uso explícito de Factory, Observer (más allá del propio React) ni otros patrones documentados en el código analizado.

---

## Convenciones de código

- **Extensiones:** `.jsx` para componentes React con JSX; `.js` para el resto (hooks, API, utils, constants).
- **Nombres de archivos:** camelCase en general; componentes en PascalCase (ej. `DetalleProducto.jsx`).
- **Constantes:** Rutas y roles se usan desde `constants/routes.js` y `constants/roles.js` para evitar strings mágicos.
- **API:** Funciones con prefijo `api_` o `api_<módulo>_<acción>` (ej. `api_auth_login`, `api_cart_getCarrito`).
- **Contextos:** Provider + hook `useXxx` (ej. `AuthProvider` + `useAuth()`).

---

## Referencia por módulo

### Contextos (context/)

- **AuthContext:** user, loading, isAuthenticated, isClient, isVisualizacion, isReencaucheUser; login, logout, verifyIdentification, registerUser, sendVerificationCode, verifyCode, resetPassword; getHomeRouteByRole, navigateToHomeByRole. Inicialización con `api_auth_me` y sessionId desde encryptToken.
- **CartContext:** cart, cartTotal, isLoading, cartIds (por empresa); addItem, removeItem, updateQuantity, loadCartFromAPI, syncCartToAPI; totales con descuentos por producto, descuento por empresa (user.DESCUENTOS), IVA (user.IVA o TAXES.IVA_PERCENTAGE). Solo clientes (isClient) pueden modificar carrito.
- **ProductCatalogContext:** catalogByEmpresa, loadingByEmpresa, errorByEmpresa; loadProductsForEmpresa, loadProductByCodigo, loadProductsBySearchTerm, mapApiProductToAppFormat (productLineConfig y baseLinkImages).
- **AppThemeContext:** theme (light/dark), isDarkMode, toggleTheme; persistencia en localStorage y clase en documentElement.
- **ProductCacheContext:** definido pero no conectado en main.jsx (TTL 10 min; código muerto o futuro).

### Constantes (constants/)

- **routes.js, roles.js:** Rutas y nombres de roles.
- **theme.js:** breakpoints, baseTheme, lightTheme, darkTheme.
- **links.js:** baseLinkImages = VITE_API_IMAGES_URL.
- **taxes.js:** TAXES.IVA_PERCENTAGE (15), calculateIVA, calculatePriceWithIVA, calculatePriceWithoutIVA.
- **bonoStates.js:** BONO_STATES (ACTIVO, USADO, VENCIDO, PENDIENTE, RECHAZADO), BONO_STATE_CONFIG, getBonoStateConfig/Label/BackgroundColor/Color.
- **productLineConfig.js:** PRODUCT_LINE_CONFIG por línea (LLANTAS, LLANTAS MOTO, LUBRICANTES, HERRAMIENTAS, DEFAULT): specs, categories, nameTemplate, descriptionTemplate, categoryLabels, categoryOrder.

### Hooks (hooks/)

- **usePreferredTheme:** Detecta `prefers-color-scheme: dark` con matchMedia.
- **useCatalogFlow:** Flujo de catálogo: línea, pasos, filtros, búsqueda, sincronización con URL y localStorage; depende de ProductCatalogContext y catalogFlow.json.
- **useStructuredData:** useProductStructuredData, useOrganizationStructuredData, useWebsiteStructuredData (Schema.org para SEO).
- **useNavigateByRole:** navigateToHome, navigateWithFallback según rol; usa `user.ROLES` (array), el resto del código usa `user.ROLE_NAME` (string).

### Utilidades (utils/)

- **encryptToken.js:** AES (crypto-js) con VITE_SECRET_KEY_TOKEN; obtenerSessionID, guardarSessionID, eliminarTokens; clave en localStorage `sess`.
- **authUtils.js:** performLogout (eliminarTokens, limpiar user y auth de localStorage).
- **bonoUtils.js:** parseProductSpecification, generateInvoiceQRCode, previewBonosHTML; URLs de verificación según VITE_NODE_ENV, VITE_PRODUCTION_URL, VITE_DEVELOPMENT_URL.
- **bonoHTMLGenerator.js:** generateCompleteBonosHTML.
- **utils.js:** copyToClipboard (toast), getRGBA (hex a rgba).
- **exportToExcel.js, exportToPdf.js:** Exportación Excel y PDF.

### Config (config/) y mock (mock/)

- **catalogFlow.json:** Objeto por línea de negocio (LLANTAS, LLANTAS MOTO, LUBRICANTES, HERRAMIENTAS) con name, displayName y steps.
- **mock/products.js:** Empresas (AUTOLLANTA, MAXXIMUNDO, STOX, IKONIX) con id, nombre, logos light/dark, getEmpresaLogo.
- **mock/coordinadora/pedidosMock.js:** Datos mock para pedidos de coordinadora.

---

## Componentes y páginas por área

### Layout (components/layout/)

- **Layout.jsx:** Contenedor flex column, 100vh, background del tema.
- **AuthenticatedLayout.jsx:** Layout + Header + MainContent; MainContent envuelve `<Outlet />`.
- **CleanLayout.jsx:** Contenedor centrado, sin header/sidebar.
- **Header.jsx:** Logo (home por rol), menú móvil, carrito (CartContext), tema (toggle), menú usuario (perfil, logout); usa api_access_sections para permisos por sección.
- **Sidebar.jsx:** Navegación por secciones (Compras, Catálogos, Reencauche, XCoin, App Shell, Contacto, Admin/Coordinador según rol); items expandibles.
- **MainContent.jsx:** Área principal con sidebar colapsable en móvil.

### Catálogo (components/catalog/)

- AdditionalFilters.jsx, CatalogBreadcrumb.jsx, FilterCards.jsx, ProductGridView.jsx; integrados con useCatalogFlow y ProductCatalogContext.

### UI (components/ui/)

- Button, Input, Select, Modal, ContactModal, Table (estilos en styles/TableStyles.js), ProductCard, SearchBar, FilterSidebar, RenderIcon, RenderLoader.

### Otras (components/)

- **SEO.jsx:** react-helmet-async; título, description, keywords, og, twitter, canonical, structuredData (JSON-LD).
- ExportToExcel.jsx, PDFGenerator.jsx; FlexBox.jsx (common).

### Páginas principales

- **Home.jsx:** Redirige según ROLE_NAME (ADMIN → dashboard, COORDINADOR → coordinadora, REENCAUCHE_USER → reencauche/home, resto → ClientHomeComponent). Si no hay user, muestra "Cargando…".
- **Auth:** Login, Register, ForgotPassword (CleanLayout).
- **Cliente/E-commerce:** ClientHomeComponent, Catalog, DetalleProducto, Carrito, MisPedidos, DetallePedido, Perfil (información, direcciones, teléfonos, preferencias, seguridad), SearchResults, Contacto, AppShell, XCoinHome.
- **Admin:** AdminDashboardComponent, UsersAdministration, CoordinadorAdminComponent.
- **Coordinador:** CoordinadorHomeComponent, DetallePedidoCoordinador, EditarPedido.
- **Reencauche:** ReencaucheHome, ClientesReencauche, BonosActivados, ActivacionBonos, VerificarBono, FormularioNuevoBonoLista, FormularioNuevoCliente.
- **NotFound (404), Unauthorized:** Páginas de error.

---

## Manejo de errores

- **API:** try/catch en cada función; retorno `{ success: false, message, error }`; en algunos casos `throw` (ej. api_auth_me) para que el llamador (AuthContext) reaccione.
- **Contextos:** AuthContext y CartContext capturan errores de API, muestran toast.error y actualizan estado.
- **UI:** Errores con react-toastify (toast.error, toast.success); no hay página de error global además de 404/Unauthorized.
- **Logs:** console.error en api, contextos y utils; console.warn en apiShell si falta VITE_API_KEY_APP_SHELL. No hay logging remoto.
- **Casos no controlados:** Si VITE_API_URL o VITE_SECRET_KEY_TOKEN no están definidos, la app puede fallar en runtime. No hay Error Boundary global; un error no capturado en un componente puede dejar la SPA en blanco.

---

## Punto de entrada y árbol de providers

1. **index.html** carga y ejecuta `/src/main.jsx`.
2. **main.jsx** monta en `#root`: StrictMode → Root.
3. **Root** renderiza, en orden: HelmetProvider → BrowserRouter → AuthProvider → CartProvider → ProductCatalogProvider → AppThemeProvider → ThemeWrapper (ThemeProvider de styled-components con `theme`) → App.
4. **AuthProvider** en su useEffect llama a `obtenerSessionID()`; si hay valor, llama a `api_auth_me()`; si la respuesta incluye user, setea user e isAuthenticated; si no, performLogout. Mientras loading es true, no renderiza children; al terminar, renderiza App.
5. **App.jsx** aplica GlobalStyle, RouteHandler (limpia catalogState y selectedProduct de localStorage al salir de /catalogo y /busqueda), define todas las Routes y el ToastContainer.
6. **Routes:** Públicas (CleanLayout); protegidas (ProtectedRoute + AuthenticatedLayout con Header, Sidebar y Outlet). Catch-all a 404 o login según isAuthenticated.
7. **Home ("/"):** Si hay user, según ROLE_NAME redirige a dashboard, coordinadora, reencauche/home o ClientHomeComponent; si no hay user, muestra "Cargando…" hasta que AuthProvider termine.

El orden de los providers importa: Auth debe estar dentro de Router para usar `useNavigate`; Cart y ProductCatalog pueden depender de Auth; AppTheme debe estar antes del ThemeProvider de styled-components para inyectar el tema.

---

Para flujos concretos (login, pedidos, reencauche) ver [flujo-funcional.md](flujo-funcional.md). Para APIs y clientes HTTP ver [apis.md](apis.md).
