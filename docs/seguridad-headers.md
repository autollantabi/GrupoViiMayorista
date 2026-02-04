# Headers de seguridad y privacidad

Resumen de los headers HTTP configurados en el proyecto para seguridad y privacidad, y cómo ajustarlos si hace falta.

---

## Dónde se configuran

- **Desarrollo (Vite):** `vite.config.js` → `server.headers`
- **Producción (Vercel):** `vercel.json` → `headers`
- **Otros hosts:** Replicar los mismos headers en nginx, Apache o el panel del proveedor.

---

## Headers actuales

| Header | Valor | Propósito |
|--------|--------|-----------|
| **X-Content-Type-Options** | `nosniff` | Evita que el navegador interprete respuestas como MIME tipo distinto al declarado (mitiga algunos XSS y fugas de contenido). |
| **X-Frame-Options** | `SAMEORIGIN` | Impide que la página se cargue en un iframe de otro origen (evita clickjacking). |
| **X-XSS-Protection** | `1; mode=block` | Activa el filtro XSS del navegador (legacy; navegadores modernos priorizan CSP). |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | En navegación cross-origin solo envía origen como referrer (HTTPS→HTTPS envía origen completo; reduce fugas de URLs completas). |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()` | Desactiva APIs que no usa la app (cámara, micrófono, geolocalización, FLoC, pago, USB). Mejora privacidad y superficie de ataque. |
| **Strict-Transport-Security** | `max-age=31536000; includeSubDomains; preload` | Fuerza HTTPS en futuras visitas (HSTS). Solo aplica en producción con HTTPS. |
| **Content-Security-Policy** | Ver abajo | Restringe orígenes desde los que se cargan scripts, estilos, fuentes, imágenes y conexiones (mitiga XSS y carga de recursos no deseados). |
| **Cache-Control** | `no-store, no-cache, must-revalidate` (solo en `index.html` en Vercel; en Vite en todas las respuestas del dev server) | Reduce que el HTML principal se cachee en proxies/navegador (útil para login y contenido sensible). |

---

## Content-Security-Policy (CSP)

Política configurada (resumida):

- **default-src 'self'** — Por defecto solo recursos del mismo origen.
- **script-src 'self'** — Scripts solo desde el mismo origen (bundle de Vite).
- **style-src 'self' 'unsafe-inline' https://fonts.googleapis.com** — Estilos propios, inline (styled-components) y Google Fonts.
- **font-src 'self' https://fonts.gstatic.com** — Fuentes propias y Google.
- **img-src 'self' data: https:** — Imágenes propias, data URL e imágenes HTTPS (API, ui-avatars.com, etc.).
- **connect-src 'self' https:** — En producción: XHR/fetch solo a mismo origen y cualquier HTTPS. En desarrollo (Vite) se añaden `http://localhost:4200`, `http://localhost:5000`, `http://localhost:3000` y equivalentes en `127.0.0.1` para que el front pueda llamar al API en otro puerto.
- **frame-ancestors 'self'** — Solo tu origen puede embeber la página en iframe (refuerza X-Frame-Options).
- **base-uri 'self'** — Evita inyección de `<base>` que redirija recursos a otro dominio.
- **form-action 'self'** — Los formularios solo pueden enviarse al mismo origen.

### Si algo deja de funcionar

- **API en otro dominio:** Añadir ese origen a `connect-src`. En Vercel editar el valor de `Content-Security-Policy` en `vercel.json` y añadir por ejemplo `https://api.tudominio.com`. En Vite, añadir la URL (y puerto si es dev) en `connect-src` en `vite.config.js`.
- **Recursos de un nuevo CDN o dominio:** Añadirlos a la directiva que corresponda (`img-src`, `font-src`, `script-src`, etc.).
- **Modo solo reporte:** Puedes usar `Content-Security-Policy-Report-Only` con la misma política y un `report-uri` para ver violaciones sin bloquear; cuando esté estable, cambiar a `Content-Security-Policy`.

---

## Cabeceras que envía el cliente (axios)

El único header personalizado que añade el frontend en las peticiones al API es:

- **id-session:** Valor del session ID (descifrado) para autenticación. Se envía solo en peticiones que usan la instancia `api` de `src/constants/api.js`.

No se envían cabeceras que fuercen referrer ni otras que expongan datos sensibles más allá de lo necesario para la sesión. El resto de headers (Content-Type, etc.) los gestiona axios/navegador según el tipo de petición.

---

## Resumen de privacidad

- **Referrer:** Limitado a origen en cross-origin con `Referrer-Policy`.
- **Seguimiento:** `interest-cohort=()` desactiva FLoC (Privacy Sandbox).
- **APIs sensibles:** Desactivadas vía Permissions-Policy.
- **Contenido:** CSP limita de dónde se cargan scripts y recursos.
- **Session ID:** Se envía solo al backend configurado (VITE_API_URL); con proxy, la API Key de App Shell no sale del servidor.

Si despliegas en un host distinto a Vercel, replica estos headers para mantener el mismo nivel de seguridad y privacidad.
