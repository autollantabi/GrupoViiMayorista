# APIs consumidas por el proyecto

El proyecto consume APIs REST externas. En este documento se describen los clientes HTTP utilizados, las cabeceras, los servicios que los usan, endpoints representativos y riesgos o dependencias.

---

## Instancias HTTP o clientes utilizados

Hay **un único cliente axios** en el frontend:

1. **API principal del portal** — `src/constants/api.js` (exportado como `api`). Usado por todos los módulos en `src/api/` (auth, users, cart, order, products, bonos, profile, email, access, accessSections, optionsCatalog, xcoin, **shell**). Las llamadas a App Shell (Lider Shell) se hacen a rutas del mismo backend (ej. `/club-shell-maxx/...`), que actúa como proxy y añade la cabecera `X-Portal-API-Key` al reenviar a la API App Shell.

---

## API principal del portal

### URL y entorno

- **Base URL:** `import.meta.env.VITE_API_URL`.
- **Origen:** Variable de entorno; no hay valor por defecto en el código. Si no está definida, `baseURL` será `undefined` y las peticiones fallarán.
- **Timeout:** 45 000 ms (45 s).

### Cabeceras

- **id-session:** Añadida en **todas** las peticiones por un interceptor de request en `src/constants/api.js`. El valor se obtiene de `obtenerSessionID()` (session ID descifrado desde localStorage, clave `sess`). Si no hay sesión, no se añade la cabecera.
- **Content-Type:** Por defecto la que axios asigna según el cuerpo (ej. `application/json` para objetos). Para multipart (ej. envío de archivos en bonos) se usa `Content-Type: multipart/form-data` en la llamada correspondiente.

### Servicios que la usan (módulos en `src/api/`)

| Módulo | Archivo(s) | Uso |
|--------|------------|-----|
| Auth | apiLogin.js, apiAuth.js, apiPassword.js | Login, logout, /auth/me, recuperación de contraseña |
| Users | apiUsers.js, apiRoles.js, apiAddresses.js | CRUD usuarios, roles, direcciones |
| Cart | apiCart.js | Obtener, actualizar, eliminar detalle del carrito |
| Order | apiOrder.js | Pedidos por cuenta, crear pedido, pedido por ID, por empresa |
| Products | apiProducts.js | Productos por campo, búsqueda, por código, info productos |
| Bonos | apiBonos.js | Clientes por mayorista, bonos por cliente, productos elegibles, crear cliente/bono, verificar QR, generar QR, Excel, archivos, rechazar/actualizar bonos |
| Profile | apiProfile.js | Información de perfil |
| Email | apiEmail.js | Solicitud de empresa (contacto) |
| Access | apiAccessRequest.js | Solicitud de acceso |
| AccessSections | apiAccessSections.js | Permisos por sección (usuarios permitidos) |
| OptionsCatalog | apiOptionsCatalog.js | Estados de pedido para catálogo |
| XCoin | apiXcoin.js | Balance, productos, historial de canjes, crear canje |

### Endpoints representativos

Los paths son relativos a `VITE_API_URL`. Formato típico de respuesta del backend asumido: `{ data: { message?, data? } }`; los módulos api normalizan a `{ success, message, data?, error? }`.

| Dominio | Método | Path (ejemplo) | Uso |
|---------|--------|----------------|-----|
| Auth | POST | /auth/login | Login (email, password) |
| Auth | POST | /auth/logout | Cerrar sesión |
| Auth | GET | /auth/me | Usuario actual (validación de sesión) |
| Auth | POST | /reset-password/request | Solicitar recuperación de contraseña |
| Auth | POST | /reset-password/verify-otp | Verificar OTP |
| Auth | POST | /reset-password/resPss | Establecer nueva contraseña |
| Users | GET | /usuarios/getUsers | Listado de usuarios |
| Users | POST | /usuarios/createUser | Crear usuario |
| Users | PATCH | /usuarios/updateUser/... | Actualizar usuario |
| Users | GET | /usuarios/getInfoAccount/:codigoSocio | Info por cuenta |
| Users | GET | /usuarios/getUser/email/:email | Usuario por email |
| Cart | GET | /carrito/getCarrito/:account | Obtener carrito |
| Cart | PATCH | /carrito/updateCarrito/:id | Actualizar carrito |
| Cart | DELETE | /carrito/deleteDetail | Eliminar detalle |
| Order | GET | /pedidos/getPedidos/:account | Pedidos por cuenta |
| Order | POST | /pedidos/createPedido | Crear pedido |
| Order | GET | /pedidos/getPedidosByOrder/:orderId | Pedido por ID |
| Products | GET | /productos/getProductos/:field/:value/... | Productos por campo |
| Products | GET | /productos/search/:search | Búsqueda |
| Products | GET | /productos/getProductoByCodigo/:value/:empresaId | Producto por código |
| Products | GET | /productos/getInfoProductos | Info productos |
| Bonos | GET | /bonos/getCustomersByMayoristaID/:id | Clientes por mayorista |
| Bonos | GET | /bonos/getBonusByCustomer/:id | Bonos por cliente |
| Bonos | POST | /bonos/createBonus | Crear bono |
| Bonos | POST | /bonos/verifyQRCode | Verificar QR |
| Bonos | POST | /bonos/generateQR | Generar QR |
| XCoin | GET | x-coin/balance/:accountUser | Balance de puntos |
| XCoin | GET | x-coin/products | Catálogo canje |
| XCoin | POST | x-coin/create-redemption | Crear canje |

La lista no es exhaustiva; para el listado completo de endpoints hay que revisar cada archivo en `src/api/`.

### Riesgos o dependencias

- **Backend obligatorio:** Sin API operativa, login, carrito, catálogo, pedidos y la mayoría de flujos no funcionan.
- **Session ID:** Si `VITE_SECRET_KEY_TOKEN` falta o cambia, el session ID guardado no se descifra y el usuario queda deslogueado (el backend puede seguir aceptando el mismo idSession si no lo invalida).
- **CORS:** El backend debe permitir el origen del front (ej. `http://localhost:4200` en dev y el dominio de producción).
- **Formato de respuesta:** Los módulos api asumen cierta estructura de respuesta; cambios en el contrato del backend pueden requerir ajustes en los módulos correspondientes.

---

## App Shell (Lider Shell) vía proxy

Las funciones de App Shell (búsqueda por código SAP, creación de usuario Lider Shell) están en `src/api/shell/apiShell.js` y usan la **misma instancia** `api` de `src/constants/api.js`. Las rutas son relativas a `VITE_API_URL` (ej. `/club-shell-maxx/usuarios/search-manager/:sapCode`, `/club-shell-maxx/usuarios`). El backend es quien reenvía esas peticiones a la API App Shell y añade la cabecera `X-Portal-API-Key`; el frontend no expone ni usa esa clave. Ver [docs/seguridad-headers.md](seguridad-headers.md) si aplica.

---

## Resumen

| Cliente | Archivo | Base URL (env) | Cabecera de autenticación |
|---------|---------|----------------|----------------------------|
| API principal (incl. proxy Shell) | `src/constants/api.js` | VITE_API_URL | id-session (session ID descifrado) |

Para variables de entorno necesarias ver [docs/setup.md](setup.md). Para flujos que usan estas APIs ver [docs/flujo-funcional.md](flujo-funcional.md).
