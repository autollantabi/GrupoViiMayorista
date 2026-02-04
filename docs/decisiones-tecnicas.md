# Decisiones técnicas

Justificación de las tecnologías elegidas, alternativas que se infieren del contexto y trade-offs importantes. Basado en el análisis del código; donde no hay documentación explícita en el repo se indica como inferencia o suposición.

---

## Stack principal

### React 19

- **Uso:** UI y componentes; punto de entrada en `main.jsx`, árbol de providers, páginas y componentes en `src/`.
- **Justificación (inferida):** Estándar para SPA; ecosistema amplio, equipo familiarizado.
- **Alternativas:** Vue, Svelte, Angular. No hay evidencia en el repo de que se hayan valorado explícitamente.
- **Trade-off:** React 19 es reciente; algunas librerías pueden no estar aún adaptadas, de ahí el uso de `legacy-peer-deps` en npm.

### Vite 6

- **Uso:** Bundler y servidor de desarrollo (`npm run dev`, `npm run build`).
- **Justificación (inferida):** Rápido, soporte nativo para ES modules, configuración sencilla, integración con React vía plugin.
- **Alternativas:** Create React App (CRA), Webpack directo, Parcel. CRA está en mantenimiento; Vite es la opción habitual en proyectos nuevos con React.
- **Trade-off:** Variables de entorno deben tener prefijo `VITE_` para exponerse al cliente; no hay sustituto por defecto si faltan.

### styled-components

- **Uso:** Estilos por componente, temas (light/dark) inyectados vía ThemeProvider en `main.jsx`, GlobalStyle en `App.jsx`.
- **Justificación (inferida):** Estilos en JS, uso de tema (theme) en componentes, coherencia con diseño por componentes.
- **Alternativas:** CSS Modules, Tailwind, Emotion (presente como dependencia pero sin uso directo documentado en el código analizado).
- **Trade-off:** Runtime de estilos; bundle algo mayor que con CSS estático. Emotion está en dependencias (posible peer de styled-components o migración futura).

### React Router v7

- **Uso:** Rutas en `App.jsx` y `routes/routes.jsx`, navegación por rol, rutas protegidas con `ProtectedRoute`.
- **Justificación (inferida):** Estándar para enrutado en React, soporte de rutas anidadas y layout (Outlet).
- **Alternativas:** TanStack Router, Reach Router (deprecado). No hay evidencia en el repo de evaluación explícita.
- **Trade-off:** Ninguno crítico; la lógica de “home por rol” está repartida entre ProtectedRoutes y Home.jsx (ver [docs/pendientes.md](pendientes.md)).

### Axios

- **Uso:** Cliente HTTP en `constants/api.js`; interceptor para `id-session` en la API principal. Shell usa la misma instancia (proxy en backend).
- **Justificación (inferida):** Interceptores, manejo de errores, API sencilla. El proyecto no usa fetch directamente para las APIs de negocio.
- **Alternativas:** fetch nativo, ky, got. fetch no tiene interceptores nativos; axios permite centralizar cabeceras y manejo de errores.
- **Trade-off:** Dependencia adicional; en entornos modernos fetch podría ser suficiente si se encapsula en una capa propia.

### React Context (estado global)

- **Uso:** AuthContext, CartContext, ProductCatalogContext, AppThemeContext. No hay Redux ni Zustand ni otro state manager.
- **Justificación (inferida):** Menos dependencias, suficiente para dominios acotados (auth, carrito, catálogo, tema). Evitar complejidad de Redux para un equipo pequeño.
- **Alternativas:** Redux, Zustand, Jotai. Redux añade boilerplate; Context puede provocar re-renders amplios si no se estructura bien (el proyecto no usa selectores finos documentados).
- **Trade-off:** Si el estado crece o se necesita caché más sofisticada, ProductCacheContext (actualmente no usado) o un state manager externo podrían ser necesarios.

### react-helmet-async

- **Uso:** SEO.jsx y hooks useStructuredData; título, description, keywords, Open Graph, Twitter, canonical, JSON-LD.
- **Justificación (inferida):** SPA con necesidad de meta tags y datos estructurados por ruta o página.
- **Alternativas:** react-helmet (sin async), soluciones SSR. Helmet-async evita warnings en React 18+ con StrictMode.
- **Trade-off:** Solo afecta al DOM del cliente; crawlers que no ejecutan JS pueden no ver meta actualizados (habitual en SPA sin prerender/SSR).

### crypto-js (AES para session ID)

- **Uso:** Cifrado/descifrado del session ID en localStorage en `utils/encryptToken.js`. Clave en `VITE_SECRET_KEY_TOKEN`.
- **Justificación (inferida):** No guardar el session ID en claro en localStorage para dificultar robo por XSS o inspección.
- **Alternativas:** No cifrar (menos seguro), httpOnly cookies (requiere backend y misma configuración CORS/dominio). Las cookies httpOnly no son accesibles desde JS; el backend actual parece diseñado para enviar idSession y leerlo desde el cliente, por lo que el cifrado en localStorage es una capa adicional.
- **Trade-off:** La clave AES está en el bundle del cliente; quien tenga acceso al código y al .env puede descifrar. La seguridad real depende del backend (invalidación de sesiones, vida útil del token).

### JavaScript (no TypeScript)

- **Uso:** Todo el código en .js y .jsx; solo @types/react y @types/react-dom en devDependencies para ayuda del IDE.
- **Justificación (inferida):** Menor curva de aprendizaje, menos configuración, equipo que prioriza velocidad de desarrollo.
- **Alternativas:** TypeScript en todo el proyecto. No hay tsconfig ni archivos .ts en el repo.
- **Trade-off:** Sin tipos estáticos, refactors y contratos de API son más propensos a errores; la documentación y tests cobran más importancia.

---

## Herramientas de desarrollo

### ESLint 9 (flat config)

- **Uso:** eslint.config.js; reglas para React (hooks, refresh), no-unused-vars con excepciones. Ignora `dist`.
- **Justificación (inferida):** Mantener estilo y detectar errores comunes. Configuración flat (nueva forma recomendada).
- **Trade-off:** Ninguno crítico.

### Sin tests automatizados

- **Estado:** No hay carpetas `__tests__` ni archivos `*.test.js` / `*.spec.js`; no hay Jest ni Vitest en package.json.
- **Justificación (inferida):** No documentada en el repo; posible priorización de entrega frente a cobertura.
- **Trade-off:** Refactors y cambios de API son más arriesgados; se recomienda introducir tests (p. ej. Vitest + React Testing Library) para contextos y flujos críticos (ver [docs/pendientes.md](pendientes.md)).

---

## Infraestructura y despliegue

### Build estático (Vite)

- **Uso:** `npm run build` genera `dist/`; no hay SSR ni backend en este repo.
- **Justificación (inferida):** SPA clásica; hosting estático barato y simple (Vercel, Netlify, etc.).
- **Trade-off:** SEO y primera carga dependen de que el crawler ejecute JS o de prerender; no hay SSR documentado.

### Vercel (inferido por vercel.json)

- **Uso:** vercel.json con rewrites `/(.*)` → `/index.html` y headers de seguridad.
- **Justificación (inferida):** Despliegue sencillo para SPA, CDN, HTTPS.
- **Alternativas:** Netlify, Cloudflare Pages, servidor propio con nginx.
- **Trade-off:** Ninguno crítico; el proyecto es agnóstico al host siempre que se sirva index.html para todas las rutas.

---

## Resumen de trade-offs importantes

| Área | Decisión | Trade-off |
|------|----------|-----------|
| Estado global | Solo React Context | Escalabilidad y re-renders si no se estructura bien; ProductCacheContext no usado. |
| Lenguaje | JavaScript | Sin tipos estáticos; más riesgo en refactors y contratos de API. |
| Session ID | Cifrado AES en localStorage | Clave en el cliente; seguridad ligada a backend (invalidación, TTL). |
| API Key Shell | En el frontend | Expuesta en el bundle; se asume restricción por otros medios en la API. |
| Tests | Sin suite | Mayor riesgo al cambiar código; se recomienda añadir tests. |
| Build | Solo estático | SEO y primera carga dependen de JS o prerender. |

---

## Stack detallado (referencia)

### Lenguajes

- **JavaScript** (ES módulos; ecmaVersion 2020+ en ESLint). **JSX** para componentes React. TypeScript solo en dev (@types/react, @types/react-dom); el proyecto es JavaScript/JSX.

### Dependencias principales (package.json)

| Dependencia | Uso |
|-------------|-----|
| react ^19.0.0, react-dom ^19.0.0 | UI y render |
| react-router-dom ^7.4.1 | Rutas y navegación |
| styled-components ^6.1.16 | Estilos y temas |
| axios ^1.8.4 | Cliente HTTP para API |
| react-helmet-async ^2.0.5 | Meta tags y SEO |
| react-toastify ^11.0.5 | Notificaciones toast |
| crypto-js ^4.2.0 | Cifrado AES del session ID en localStorage |
| react-icons ^5.5.0 | Iconos (Fa, Fi, Lu, etc.) |

### Otras dependencias

- **Fechas:** date-fns ^4.1.0, dayjs ^1.11.13, @date-io/date-fns ^3.2.1.
- **Exportación:** exceljs ^4.4.0, file-saver ^2.0.5; jspdf ^3.0.3, jspdf-autotable ^5.0.2; html2canvas ^1.4.1.
- **QR:** qrcode ^1.5.4.
- **Emotion:** @emotion/react, @emotion/styled ^11; no se ve uso directo en el código; posible dependencia de styled-components o futura migración.

### Herramientas de desarrollo

- **Vite** ^6.2.0 — bundler y servidor de desarrollo.
- **@vitejs/plugin-react-swc** ^3.8.0 — compilación JSX con SWC.
- **ESLint** ^9.21.0 — lint; plugins react-hooks, react-refresh; ignora `dist`.

### Versiones relevantes

- **Node:** No fijada en el repo; se asume Node 18+ por `import.meta.env` y Vite 6 (recomendado 20 LTS).
- **npm:** `.npmrc` con `legacy-peer-deps=true`; script `install:legacy` para instalación con dependencias legacy.

---

Para mejoras sugeridas y deuda técnica ver [pendientes.md](pendientes.md).
