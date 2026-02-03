# Configuración y ejecución local

Guía para poner en marcha el proyecto en una máquina de desarrollo. Requisitos, variables de entorno, pasos de ejecución y errores frecuentes.

---

## Requisitos del sistema

| Requisito | Versión / Notas |
|-----------|------------------|
| **Node.js** | 18 o superior (recomendado 20 LTS). Necesario por `import.meta.env` y Vite 6. |
| **npm** | Compatible con package.json (recomendado npm 9+). |
| **Backend** | API REST del portal debe estar disponible y accesible desde la máquina (misma red o URL pública). |
| **Sistema** | Cualquier SO donde Node/npm funcionen (Windows, macOS, Linux). |

No hay versión de Node fijada en el repositorio (no hay `.nvmrc` ni `engines` en package.json). Se recomienda usar Node 20 LTS en desarrollo.

---

## Variables de entorno

Todas las variables usadas en el código tienen prefijo **`VITE_`** para que Vite las exponga al cliente. El archivo **`.env`** está en `.gitignore`; no se versionan valores reales.

### Variables necesarias (mínimo para desarrollo)

| Variable | Uso | Obligatoria |
|----------|-----|-------------|
| `VITE_API_URL` | Base URL del API principal (ej. `https://api.ejemplo.com`). Usada en `src/constants/api.js`. | Sí |
| `VITE_API_IMAGES_URL` | Base URL para imágenes de productos. Usada en `src/constants/links.js`. | Sí (si el catálogo muestra imágenes) |
| `VITE_SECRET_KEY_TOKEN` | Clave AES para cifrar/descifrar el session ID en localStorage. Usada en `src/utils/encryptToken.js`. | Sí |

### Variables opcionales o por flujo

| Variable | Uso | Cuándo |
|----------|-----|--------|
| `VITE_API_APP_SHELL` | URL del API App Shell (producción). `src/constants/apiShell.js`. | Si se usa integración App Shell / Lider Shell |
| `VITE_API_APP_SHELL_DESARROLLO` | URL del API App Shell en desarrollo. | Mismo caso, entorno dev |
| `VITE_API_KEY_APP_SHELL` | API Key para el header `X-Portal-API-Key`. | Mismo caso |
| `VITE_NODE_ENV` | Comparación con `"production"` para elegir URLs (ej. bonos). | Opcional; Vite define `MODE` |
| `VITE_PRODUCTION_URL` | URL base del front en producción (verificación de bonos, etc.). | Flujo reencauche/bonos |
| `VITE_DEVELOPMENT_URL` | URL base del front en desarrollo. | Mismo flujo en dev |

### Ejemplo de `.env` (sin valores reales)

```env
VITE_API_URL=https://api.tudominio.com
VITE_API_IMAGES_URL=https://cdn.tudominio.com/imagenes
VITE_SECRET_KEY_TOKEN=tu_clave_secreta_aqui

# Opcional: App Shell
# VITE_API_APP_SHELL=https://api-shell.tudominio.com
# VITE_API_APP_SHELL_DESARROLLO=http://localhost:3001
# VITE_API_KEY_APP_SHELL=tu_api_key_shell

# Opcional: URLs para bonos/reencauche
# VITE_PRODUCTION_URL=https://viicommerce.com
# VITE_DEVELOPMENT_URL=http://localhost:4200
```

**Importante:** No commitear `.env`. Crear un `.env.example` con las claves sin valores sensibles si el equipo lo usa como plantilla (no existe por defecto en el repo).

---

## Pasos para ejecutar el proyecto localmente

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repositorio>
cd PortalMayoristaVii
npm install
```

Si aparecen errores de peer dependencies:

```bash
npm run install:legacy
```

El proyecto usa `.npmrc` con `legacy-peer-deps=true`, por lo que en muchos entornos `npm install` ya aplica esa opción.

### 2. Configurar variables de entorno

Crear en la raíz del proyecto un archivo `.env` con al menos:

- `VITE_API_URL`
- `VITE_API_IMAGES_URL`
- `VITE_SECRET_KEY_TOKEN`

Los valores deben coincidir con el backend que vaya a usarse (solicitar al equipo que mantiene el backend o revisar documentación del API).

### 3. Comprobar que el backend está accesible

Login, catálogo, carrito y pedidos dependen del API. Si `VITE_API_URL` no es alcanzable (red, CORS, etc.), la app cargará pero las pantallas fallarán al hacer peticiones.

### 4. Arrancar el servidor de desarrollo

```bash
npm run dev
```

- Servidor: **Vite**.
- URL: **http://localhost:4200** (puerto definido en `vite.config.js` y en `package.json`).
- `host: true` en Vite permite acceso desde la red local (ej. otro dispositivo en la misma LAN).

### 5. Build de producción (opcional)

```bash
npm run build
```

La salida queda en la carpeta **`dist/`**. Para servirla localmente:

```bash
npx serve dist
```

o usar cualquier servidor estático que sirva `index.html` para todas las rutas (SPA).

---

## Errores comunes y cómo resolverlos

### "Cannot read properties of undefined (reading 'VITE_API_URL')" o baseURL undefined

- **Causa:** Falta `.env` o la variable `VITE_API_URL` no está definida.
- **Solución:** Crear `.env` en la raíz con `VITE_API_URL=<url-del-api>`. Reiniciar `npm run dev` después de cambiar `.env`.

### Login falla o "Datos de usuario o sesión inválidos"

- **Causa:** Backend no devuelve `idSession`/user, URL del API incorrecta, CORS o red.
- **Solución:** Comprobar `VITE_API_URL`, que el backend esté en marcha y que permita el origen del front (puerto 4200 en dev). Revisar en DevTools (Network) la respuesta de `POST /auth/login` y de `GET /auth/me`.

### Pantalla en blanco o "Cargando..." sin avanzar

- **Causa:** Falla `api_auth_me` (no hay sesión o backend no responde). AuthContext deja `loading` activo o redirige.
- **Solución:** Abrir consola (F12). Si hay error de red, revisar URL y CORS. Si el backend responde 401/403, hacer login de nuevo; si `VITE_SECRET_KEY_TOKEN` cambió, el session ID guardado no se descifra y hay que volver a iniciar sesión.

### "decrypt" / CryptoJS o session null

- **Causa:** `VITE_SECRET_KEY_TOKEN` no definida o distinta a la usada cuando se guardó el session ID.
- **Solución:** Definir `VITE_SECRET_KEY_TOKEN` en `.env` y reiniciar. Para “empezar de cero”, en DevTools → Application → Local Storage, borrar la clave `sess` y hacer login de nuevo.

### Conflictos de dependencias (peer dependencies) en `npm install`

- **Causa:** Versiones de React u otras librerías que npm considera incompatibles.
- **Solución:** Usar `npm run install:legacy` o asegurarse de que `.npmrc` contiene `legacy-peer-deps=true`.

### Puerto 4200 ya en uso

- **Causa:** Otro proceso (otra instancia del proyecto, otro servicio) usando el puerto.
- **Solución:** Cerrar el otro proceso o cambiar el puerto en `vite.config.js` (y en `package.json` en el script `dev` si se desea mantener consistencia).

### App Shell: "APP_SHELL_API_KEY no está definido"

- **Causa:** Se entra a flujos que usan la API Shell (ej. App Shell / Lider Shell) sin tener `VITE_API_KEY_APP_SHELL` en `.env`.
- **Solución:** Añadir `VITE_API_KEY_APP_SHELL` (y las URLs de App Shell si aplica) o no usar esas pantallas hasta tener configuración.

### Imágenes de productos no cargan

- **Causa:** `VITE_API_IMAGES_URL` incorrecta o recursos no accesibles (red, CORS, 404).
- **Solución:** Verificar `VITE_API_IMAGES_URL` y que las URLs generadas (base + path) sean válidas y accesibles desde el navegador.

### Cambios en `.env` no se aplican

- **Causa:** Vite inyecta las variables en tiempo de build; el servidor de desarrollo debe reiniciarse.
- **Solución:** Detener `npm run dev` (Ctrl+C) y volver a ejecutar `npm run dev`.

---

## Resumen de comandos

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instala dependencias (usa legacy-peer-deps si está en .npmrc). |
| `npm run install:legacy` | `npm install --legacy-peer-deps`. |
| `npm run dev` | Servidor de desarrollo en http://localhost:4200. |
| `npm run build` | Genera `dist/` para producción. |
| `npm run pm2Dev` | Elimina proceso PM2 anterior (si existe), inicia dev con PM2 y muestra logs. |

---

## Dependencias críticas (qué falla si no están)

- **Backend (VITE_API_URL):** Sin API operativa, login, carrito, catálogo, pedidos y la mayoría de flujos no funcionan. No hay modo offline ni caché persistente de sesión más allá de revalidar con /auth/me.
- **VITE_SECRET_KEY_TOKEN:** Si falta o cambia, obtenerSessionID() devuelve null y el usuario queda deslogueado; el backend puede seguir aceptando el mismo idSession si no se ha invalidado.
- **react-router-dom:** Toda la navegación depende de él; si falla, la SPA no enruta.
- **AuthContext:** Casi todas las pantallas dependen de user/isAuthenticated; si el contexto no está disponible o falla la validación inicial, la app puede quedarse en "Cargando…" o redirigir siempre a login.
- **axios:** Todas las llamadas API pasan por la instancia de api.js (o apiShell.js); un interceptor roto afecta a todas las peticiones autenticadas.
- **styled-components / ThemeProvider:** Si el tema no se inyecta, los componentes que usan `theme` pueden verse rotos o con estilos por defecto.

---

Si tras seguir esta guía algo no funciona, revisar [arquitectura.md](arquitectura.md) y [apis.md](apis.md) para entender cómo se usan las variables y el API, y [pendientes.md](pendientes.md) por supuestos y limitaciones conocidas.
