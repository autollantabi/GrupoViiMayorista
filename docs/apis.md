# APIs consumidas por el proyecto

El proyecto consume APIs REST externas. En este documento se describen los clientes HTTP utilizados, las cabeceras, los servicios que los usan, endpoints representativos y riesgos o dependencias.

---

## Instancias HTTP o clientes utilizados

Hay **dos clientes axios** distintos:

1. **API principal del portal** — `src/constants/api.js` (exportado como `api`). Usado por la mayoría de los módulos en `src/api/` (auth, users, cart, order, products, bonos, profile, email, access, accessSections, optionsCatalog, xcoin).
2. **API App Shell (Lider Shell)** — `src/constants/apiShell.js` (exportado como `apiShell`). Usado solo por `src/api/shell/apiShell.js`.

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

## API App Shell (Lider Shell)

### URL y entorno

- **Base URL:** En desarrollo `import.meta.env.VITE_API_APP_SHELL_DESARROLLO`, en producción `import.meta.env.VITE_API_APP_SHELL` (según `import.meta.env.DEV`).
- **Timeout:** 300 000 ms (300 s).

### Cabeceras

- **X-Portal-API-Key:** Valor de `import.meta.env.VITE_API_KEY_APP_SHELL`. Se asigna a `apiShell.defaults.headers.common` solo si la variable está definida; si no, se muestra un `console.warn` y las peticiones van sin esta cabecera (la API puede rechazarlas).
- **Content-Type:** `application/json` por defecto en la instancia.

### Servicios que la usan

- **Shell:** `src/api/shell/apiShell.js` — búsqueda de usuario por código SAP y creación de usuario en la app Lider Shell.

### Endpoints representativos

| Método | Path (ejemplo) | Uso |
|--------|----------------|-----|
| GET | /usuarios/search-manager/:sapCode | Buscar usuario por código SAP |
| POST | /usuarios | Crear usuario (name, lastname, card_id, email, phone, roleId, birth_date, sap_code, direcciones) |

### Riesgos o dependencias

- **API Key en el cliente:** `VITE_API_KEY_APP_SHELL` se incluye en el bundle del frontend; cualquier usuario puede inspeccionarla. Se asume que la API Shell restringe por otros medios o que la key es de bajo riesgo en el cliente.
- **Timeout largo:** 300 s; operaciones muy lentas pueden bloquear la UI si no se manejan con cancelación o feedback adecuado.
- **Independencia del session del portal:** Esta API no usa el header `id-session`; la autenticación es solo por API Key.

---

## Resumen

| Cliente | Archivo | Base URL (env) | Cabecera de autenticación |
|---------|---------|----------------|----------------------------|
| API principal | `src/constants/api.js` | VITE_API_URL | id-session (session ID descifrado) |
| API App Shell | `src/constants/apiShell.js` | VITE_API_APP_SHELL / VITE_API_APP_SHELL_DESARROLLO | X-Portal-API-Key (VITE_API_KEY_APP_SHELL) |

Para variables de entorno necesarias ver [docs/setup.md](setup.md). Para flujos que usan estas APIs ver [docs/flujo-funcional.md](flujo-funcional.md).
