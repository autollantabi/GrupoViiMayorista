# Despliegue

Proceso de build, configuración de ambientes y consideraciones para producción. El proyecto se despliega como SPA estática; en el repositorio está configurado para Vercel.

---

## Proceso de build

### Comando

```bash
npm run build
```

### Qué hace

- **Herramienta:** Vite (`vite build` según package.json).
- **Entrada:** Código en `src/`, `index.html` en la raíz, recursos en `public/`.
- **Salida:** Carpeta **`dist/`** con:
  - `index.html` (punto de entrada).
  - `assets/` (JS y CSS con hash en el nombre, ej. `index-9vKo6kaQ.js`, `index-GNLSjkBZ.css`).
  - Recursos copiados de `public/` (favicon, og-image, robots.txt, sitemap.xml, shell/ShellLogo.png, etc.).

### Variables de entorno en build

Vite sustituye `import.meta.env.VITE_*` en tiempo de build. Las variables que use la aplicación deben estar definidas **en el momento del build** en el entorno donde se ejecute `npm run build` (máquina local, CI/CD, panel de Vercel, etc.).

Variables críticas para producción (ver [docs/setup.md](setup.md)):

- `VITE_API_URL` — API principal.
- `VITE_API_IMAGES_URL` — Imágenes de productos.
- `VITE_SECRET_KEY_TOKEN` — Cifrado del session ID.
- Si se usan: `VITE_PRODUCTION_URL`, `VITE_DEVELOPMENT_URL`, etc.

Si alguna variable obligatoria falta, el código puede tener `undefined` en runtime (ej. baseURL del axios) y las peticiones fallarán.

### Comprobación local del build

```bash
npm run build
npx serve dist
```

Abrir la URL que indique `serve` (ej. http://localhost:3000). Comprobar que login, catálogo y rutas protegidas funcionan con el backend al que apunte `VITE_API_URL` en el build.

---

## Configuración de ambientes

### Desarrollo

- **Comando:** `npm run dev` (Vite en modo desarrollo, puerto 4200).
- **Variables:** Usar `.env` con `VITE_API_URL` apuntando al backend de desarrollo (o local). Para bonos/reencauche, `VITE_DEVELOPMENT_URL` si aplica.
- **API:** El backend debe permitir CORS desde `http://localhost:4200` (y opcionalmente desde la IP de la red local si se usa `host: true`).

### Producción (build)

- **Comando:** `npm run build` en un entorno con variables de producción definidas.
- **Variables:** `VITE_API_URL` y `VITE_API_IMAGES_URL` con las URLs de producción. `VITE_SECRET_KEY_TOKEN` debe ser la misma que use el front para descifrar sesiones (y coherente con lo que el backend espera). Para bonos: `VITE_PRODUCTION_URL` (y `VITE_NODE_ENV` si el código lo usa).
- **Salida:** `dist/` listo para servir en cualquier host estático o CDN.

No hay archivos `.env.production` o `.env.development` en el repositorio; la separación de entornos se hace definiendo variables distintas en cada sistema (local, CI, Vercel, etc.).

---

## Consideraciones para producción

### Hosting y SPA

- **Reescrituras:** Todas las rutas deben devolver `index.html` para que React Router funcione. En **Vercel** esto se configura en `vercel.json` con `"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]`. En nginx se suele usar `try_files $uri $uri/ /index.html;`.
- **Base path:** En `vite.config.js` está `base: "/"`. Si el front se sirve en un subpath (ej. `/app/`), hay que cambiar `base` y volver a construir; las rutas de la app y los assets se generarán con ese prefijo.

### Headers de seguridad

En `vercel.json` están definidos headers para todas las rutas:

- X-Content-Type-Options: nosniff  
- X-Frame-Options: SAMEORIGIN  
- X-XSS-Protection: 1; mode=block  
- Referrer-Policy: strict-origin-when-cross-origin  
- Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()  
- Strict-Transport-Security: max-age=31536000; includeSubDomains; preload  

En otro host (nginx, Apache, etc.) conviene replicar estos headers para mantener el mismo nivel de seguridad.

### CORS

El backend debe permitir el origen del front en producción (ej. `https://viicommerce.com`). Si el front se despliega en otro dominio, añadir ese origen en la configuración CORS del API.

### Variables sensibles

- **VITE_*** se incluyen en el bundle del cliente. No poner secretos de backend ni claves que no deban ser públicas. `VITE_SECRET_KEY_TOKEN` es conocida por quien inspeccione el bundle; la seguridad depende del diseño del backend (ver [docs/decisiones-tecnicas.md](decisiones-tecnicas.md) y [docs/apis.md](apis.md)).

### Caché y assets

Vite genera nombres de archivos con hash (`index-9vKo6kaQ.js`); se puede cachear agresivamente los assets. `index.html` no tiene hash; conviene no cachearlo mucho o invalidar cuando haya un nuevo despliegue para que los usuarios carguen el nuevo JS/CSS.

### HTTPS

En producción el sitio debe servirse por HTTPS. Vercel lo proporciona por defecto; en servidor propio hay que configurar certificado (Let’s Encrypt, etc.) y redirigir HTTP a HTTPS.

### Monitoreo y errores

No hay integración de logging remoto ni Error Boundary global documentada en el código. Para producción se recomienda:

- Añadir un Error Boundary a nivel de App o de rutas para capturar errores de render y mostrar una vista de error en lugar de pantalla en blanco.
- Valorar un servicio de monitoreo (Sentry, LogRocket, etc.) para errores de JavaScript y rendimiento.

---

## Resumen

| Paso | Acción |
|------|--------|
| 1 | Definir variables `VITE_*` en el entorno de build (producción). |
| 2 | Ejecutar `npm run build`. |
| 3 | Servir el contenido de `dist/` con reescrituras a `index.html` para todas las rutas. |
| 4 | Configurar headers de seguridad y HTTPS. |
| 5 | Asegurar CORS en el backend para el origen del front. |

Para requisitos del sistema y variables detalladas ver [docs/setup.md](setup.md). Para la lista de documentos y orden de lectura ver [docs/indice.md](indice.md).
