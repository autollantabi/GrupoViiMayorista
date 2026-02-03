# Guía del proyecto (onboarding)

Resumen para incorporarse al proyecto: qué es, cómo empezar, dónde está cada cosa, APIs e integraciones, flujo típico para añadir una pantalla o funcionalidad, y decisiones históricas o código legado relevante.

---

## Qué es el proyecto

**Portal Mayorista Vii (ViiCommerce)** es una SPA en React para e-commerce B2B del grupo ViiCommerce (Cuenca, Ecuador). Ofrece:

- Catálogo de productos por empresa (MAXXIMUNDO, STOX, AUTOLLANTA, IKONIX, AUTOMAX).
- Carrito y pedidos para clientes.
- Múltiples roles: cliente, administrador, coordinador, visualización, usuario de reencauche.
- Flujos específicos: reencauche (bonos, verificación, PDF/QR), coordinación de pedidos, integración con App Shell (Lider Shell), programa de puntos XCoin.
- Perfil de usuario, contacto y SEO (meta tags, datos estructurados).

No hay backend en este repositorio; todo el negocio se consume vía APIs REST externas.

---

## Cómo empezar

1. **Leer** [README.md](../README.md) y [docs/setup.md](setup.md) para requisitos, variables de entorno y ejecución local.
2. **Configurar** `.env` con al menos `VITE_API_URL`, `VITE_API_IMAGES_URL`, `VITE_SECRET_KEY_TOKEN`.
3. **Ejecutar** `npm install` (o `npm run install:legacy` si hay conflictos) y `npm run dev`. Abrir http://localhost:4200.
4. **Revisar** [docs/arquitectura.md](arquitectura.md) para estructura de carpetas y [docs/indice.md](indice.md) para el orden de lectura recomendado.

Si el backend no está disponible, login y la mayoría de pantallas fallarán al hacer peticiones; la app cargará pero no será usable sin API.

---

## Dónde está cada cosa

| Necesito... | Dónde está |
|-------------|-------------|
| Rutas y permisos por rol | `src/constants/routes.js`, `src/constants/roles.js`, `src/routes/routes.jsx`, `src/routes/ProtectedRoutes.jsx` |
| Login, sesión, usuario | `src/context/AuthContext.jsx`, `src/api/auth/`, `src/utils/encryptToken.js`, `src/utils/authUtils.js` |
| Carrito y totales | `src/context/CartContext.jsx`, `src/api/cart/`, `src/constants/taxes.js` |
| Catálogo y productos | `src/context/ProductCatalogContext.jsx`, `src/api/products/`, `src/hooks/useCatalogFlow.js`, `src/config/catalogFlow.json`, `src/constants/productLineConfig.js`, `src/components/catalog/` |
| Pedidos | `src/api/order/`, páginas en `src/pages/compras/` y `src/pages/coordinadora/` |
| Bonos / reencauche | `src/api/bonos/`, `src/utils/bonoUtils.js`, `src/utils/bonoHTMLGenerator.js`, `src/pages/reencauche/`, `src/constants/bonoStates.js` |
| App Shell (Lider Shell) | `src/constants/apiShell.js`, `src/api/shell/`, `src/pages/client/AppShell.jsx` |
| XCoin | `src/api/xcoin/`, `src/pages/xcoin/XCoinHome.jsx` |
| Tema (claro/oscuro) | `src/context/AppThemeContext.jsx`, `src/constants/theme.js` |
| Layout, Header, Sidebar | `src/components/layout/` |
| Cliente HTTP principal | `src/constants/api.js` (axios con interceptor id-session) |
| Cliente HTTP Shell | `src/constants/apiShell.js` (axios con X-Portal-API-Key) |
| Definición de rutas y páginas | `src/App.jsx`, `src/routes/routes.jsx` |
| Redirección por rol al entrar en "/" | `src/pages/Home.jsx` |

---

## APIs e integraciones (resumen)

- **API principal:** Base URL en `VITE_API_URL`. Autenticación por header `id-session` (session ID descifrado). Usada por auth, users, cart, order, products, bonos, profile, email, access, accessSections, optionsCatalog, xcoin. Ver [docs/apis.md](apis.md).
- **API App Shell:** Base URL en `VITE_API_APP_SHELL` / `VITE_API_APP_SHELL_DESARROLLO`. Autenticación por header `X-Portal-API-Key` (`VITE_API_KEY_APP_SHELL`). Usada solo por `api/shell` (búsqueda por código SAP, creación de usuario Lider Shell).
- **Imágenes:** Base URL en `VITE_API_IMAGES_URL` (`constants/links.js`). Las URLs de imágenes de productos se construyen con esta base + path.

No hay otras integraciones de terceros documentadas en el código (ej. analytics, chat) más allá de las APIs anteriores.

---

## Flujo típico para añadir una pantalla o funcionalidad

1. **Ruta:** Añadir path en `constants/routes.js`. En `routes/routes.jsx`, añadir objeto con `path`, `element` (componente) y `allowedRoles` en el array que corresponda (ecommerceRoutes, adminRoutes, etc.).
2. **Página:** Crear componente en `pages/` (por dominio: client, admin, coordinadora, reencauche, etc.) e importarlo en `routes/routes.jsx`.
3. **Menú:** Añadir enlace en `Sidebar.jsx` (y si aplica en Header) según `user.ROLE_NAME` o permisos por sección (`api_access_sections`).
4. **API:** Si hace falta nuevo dominio, crear carpeta en `api/<dominio>/` y usar la instancia `api` de `constants/api.js`. Mantener retorno `{ success, message, data?, error? }`. Si es extensión de dominio existente, añadir funciones en el módulo correspondiente.
5. **Estado global:** Solo si varias pantallas comparten estado, valorar nuevo Context en `context/` o extender uno existente, y registrar Provider en `main.jsx`.
6. **Constantes:** Centralizar rutas, roles o configuraciones nuevas en `constants/` para evitar strings mágicos.

Detalle en [docs/arquitectura.md](arquitectura.md) (sección “Cómo añadir una nueva pantalla o funcionalidad”).

---

## Decisiones históricas o código legado relevante

- **ProductCacheContext:** Definido en `context/ProductCacheContext.jsx` pero **no** está en el árbol de providers de `main.jsx`. Código muerto o preparado para uso futuro; ver [docs/pendientes.md](pendientes.md).
- **useNavigateByRole:** Usa `user.ROLES` (array). El resto del código usa `user.ROLE_NAME` (string). Si el backend no envía `ROLES`, el hook puede fallar o no coincidir con el comportamiento esperado.
- **getHomeForRole (ProtectedRoutes):** No tiene case para REENCAUCHE_USER; devuelve ECOMMERCE.HOME. La redirección a reencauche/home se hace en Home.jsx. Comportamiento correcto pero redundante; se podría añadir case REENCAUCHE_USER en ProtectedRoutes.
- **Dos librerías de fechas:** date-fns y dayjs (y @date-io/date-fns). Posible herencia de distintas pantallas o de Material-UI; no hay migración unificada documentada.
- **Emotion (@emotion/react, @emotion/styled):** En dependencias pero el proyecto usa sobre todo styled-components. Posible dependencia transitiva o migración incompleta.
- **.npmrc legacy-peer-deps:** Proyecto usa `legacy-peer-deps=true` para evitar fallos de instalación por peer dependencies (React 19, etc.).
- **Session ID cifrado en cliente:** La clave AES (`VITE_SECRET_KEY_TOKEN`) está en el cliente; cualquier persona con acceso al bundle puede intentar descifrar. La seguridad depende de que el backend invalide sesiones y de la vida útil del session ID.
- **API Key Shell en el cliente:** Expuesta en el frontend; se asume que la API Shell restringe por otros medios o que la key es de bajo riesgo.

---

## Contacto o autor

No hay sección de contacto o autor en el repositorio. Para dudas sobre backend, variables de entorno en distintos entornos o decisiones de negocio, consultar al equipo que mantiene el backend y los despliegues.

---

## Siguientes pasos

- Leer [docs/flujo-funcional.md](flujo-funcional.md) para entender login, pedidos, reencauche y permisos.
- Revisar [docs/decisiones-tecnicas.md](decisiones-tecnicas.md) y [docs/pendientes.md](pendientes.md) para contexto técnico y deuda conocida.
- Para desplegar: [docs/despliegue.md](despliegue.md).
