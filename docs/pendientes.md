# Pendientes, deuda técnica y supuestos

Mejoras técnicas sugeridas, deuda técnica detectada en el análisis del código y partes no claras o supuestas. Sirve para priorizar trabajo y para que un desarrollador nuevo sepa qué está incierto o pendiente.

---

## Mejoras técnicas sugeridas

### Tests

- **Estado:** No hay tests unitarios ni e2e en el repositorio (no hay Jest/Vitest, ni carpetas `__tests__` ni `*.test.js`).
- **Sugerencia:** Introducir Vitest + React Testing Library para:
  - Contextos críticos (AuthContext, CartContext): validación de sesión, login, logout, carrito.
  - Hooks (useCatalogFlow, useNavigateByRole): filtros, redirección por rol.
  - Componentes clave (ProtectedRoute, formularios de login/registro).
- **Prioridad:** Alta para reducir riesgo en refactors y cambios de API.

### Error Boundary global

- **Estado:** No hay Error Boundary a nivel de App o de rutas documentado en el código.
- **Sugerencia:** Añadir un Error Boundary que capture errores de render y muestre una vista de error (y opcionalmente reporte a un servicio) en lugar de pantalla en blanco.
- **Prioridad:** Alta para producción.

### Variables de entorno

- **Estado:** No hay `.env.example` en el repo; las variables se documentan en docs pero no hay plantilla versionada.
- **Sugerencia:** Crear `.env.example` con todas las claves `VITE_*` necesarias (sin valores sensibles) y referenciarlo en [docs/setup.md](setup.md). Valorar un módulo `config/env.js` que valide variables obligatorias al arranque y muestre un mensaje claro si faltan.
- **Prioridad:** Media.

### Unificación de “home por rol”

- **Estado:** La lógica de “ruta principal según rol” está en dos sitios: `getHomeForRole` en ProtectedRoutes.jsx y `getHomeRouteByRole` / `navigateToHomeByRole` en AuthContext. Además, REENCAUCHE_USER no tiene case en `getHomeForRole` (devuelve ECOMMERCE.HOME) y la redirección real a reencauche/home se hace en Home.jsx.
- **Sugerencia:** Centralizar en un solo lugar (p. ej. constantes o AuthContext) y que ProtectedRoute y Home.jsx lo usen. Añadir case REENCAUCHE_USER en `getHomeForRole` → ROUTES.REENCAUCHE.HOME para que el comportamiento sea explícito y evite dar la vuelta por Home.
- **Prioridad:** Media.

### URLs de verificación de bonos

- **Estado:** La construcción de URLs base (VITE_NODE_ENV, VITE_PRODUCTION_URL, VITE_DEVELOPMENT_URL) se repite en VerificarBono, BonosActivados, ClientesReencauche y bonoUtils.
- **Sugerencia:** Extraer a un helper (ej. `getBaseUrl()` en utils o constants) y usarlo en todos los puntos.
- **Prioridad:** Baja (mantenibilidad).

### Componentes y hooks muy grandes

- **Estado:** Páginas como XCoinHome.jsx y AppShell.jsx concentran mucha lógica y UI; useCatalogFlow es un hook largo que maneja URL, localStorage, filtros y pasos.
- **Sugerencia:** Extraer subcomponentes y hooks más pequeños (ej. useCatalogUrl, useCatalogFilters) para facilitar pruebas y mantenimiento.
- **Prioridad:** Media a largo plazo.

---

## Deuda técnica detectada

### ProductCacheContext no usado

- **Estado:** ProductCacheContext está implementado en `context/ProductCacheContext.jsx` pero ProductCacheProvider **no** está en el árbol de providers de `main.jsx`. No se usa en ninguna parte del árbol de componentes.
- **Acción:** Decidir: (a) integrar ProductCacheProvider en main.jsx y usar el contexto desde catálogo/páginas donde aporte valor, o (b) eliminar el contexto para no mantener código muerto.
- **Prioridad:** Media.

### useNavigateByRole y user.ROLES

- **Estado:** useNavigateByRole usa `user.ROLES` (array); el resto del código (ProtectedRoute, Home.jsx, AuthContext) usa `user.ROLE_NAME` (string). Si el backend no devuelve `ROLES`, el hook puede fallar o no coincidir con el comportamiento esperado.
- **Acción:** Unificar: o el backend envía ROLES y se usa en todos lados, o se cambia el hook para usar ROLE_NAME y se mantiene coherencia con ProtectedRoute y Home.
- **Prioridad:** Media (evitar bugs sutiles por rol).

### getHomeForRole sin case REENCAUCHE_USER

- **Estado:** En ProtectedRoutes.jsx, getHomeForRole no tiene case para REENCAUCHE_USER; devuelve ROUTES.ECOMMERCE.HOME. Un usuario REENCAUCHE_USER que intente acceder a una ruta solo de cliente es redirigido a "/" y luego Home.jsx lo redirige a reencauche/home. Funciona pero es redundante.
- **Acción:** Añadir `case ROLES.REENCAUCHE_USER: return ROUTES.REENCAUCHE.HOME;` en getHomeForRole.
- **Prioridad:** Baja (mejora de claridad).

### Duplicación de librerías de fechas

- **Estado:** date-fns, dayjs y @date-io/date-fns están en dependencias. No hay convención documentada de cuándo usar cada una.
- **Acción:** Estandarizar en una (p. ej. date-fns o dayjs) y eliminar la otra y @date-io si no se usa en ningún componente. Revisar si @date-io era por Material-UI u otra librería ya no usada.
- **Prioridad:** Baja.

### Emotion en dependencias sin uso directo

- **Estado:** @emotion/react y @emotion/styled están en package.json; el proyecto usa sobre todo styled-components. No se ha visto uso directo de Emotion en el código analizado.
- **Acción:** Confirmar si son peer de styled-components o de otra librería; si no son necesarias, valorar eliminarlas para reducir dependencias.
- **Prioridad:** Baja.

---

## Suposiciones o partes no claras

### Backend y contrato de API

- **Suposición:** El backend devuelve user con `ROLE_NAME` (string); en algunos flujos podría devolver también `ROLES` (array). No hay documentación del contrato en este repo.
- **Recomendación:** Confirmar con el equipo del backend la estructura de user (ROLE_NAME vs ROLES) y documentarla en este repo o en un contrato compartido.

### Formato de respuestas del API

- **Suposición:** Las respuestas siguen un formato tipo `{ data: { message?, data? } }` y los módulos api normalizan a `{ success, message, data?, error? }`. No hay contrato formal ni tipos.
- **Recomendación:** Documentar o tipar (si se migra a TypeScript) los contratos de los endpoints más usados.

### Permisos por sección (accessSections)

- **Suposición:** El Header usa api_access_sections para mostrar u ocultar enlaces según permisos. La estructura exacta de la respuesta y cómo se mapea a secciones no está documentada en el código.
- **Recomendación:** Documentar en este repo o en APIs cómo se obtienen y usan las secciones permitidas.

### Empresas y líneas de negocio

- **Suposición:** Las empresas (MAXXIMUNDO, STOX, AUTOLLANTA, IKONIX, AUTOMAX) y las líneas de negocio están alineadas con productLineConfig y catalogFlow.json. Si el backend añade una empresa o línea nueva, puede requerir cambios en configuración y en productLineConfig.
- **Recomendación:** Tener un único lugar de verdad (backend o config) y documentar el proceso para añadir una empresa o línea.

### Validación de formularios

- **Estado:** No se ha encontrado una capa centralizada de validación (Yup, Zod, etc.); las validaciones están en los propios componentes/contextos.
- **Suposición:** Es una decisión consciente para no añadir dependencias; puede haber validaciones duplicadas o inconsistentes.
- **Recomendación:** Valorar un esquema compartido para login, registro y recuperación de contraseña si se detectan inconsistencias.

### Contacto o responsable del proyecto

- **Estado:** No hay sección de contacto o autor en el repositorio.
- **Recomendación:** Añadir en README o en [docs/guia-proyecto.md](guia-proyecto.md) un apartado de contacto o responsable (sin datos sensibles) para dudas de negocio, backend o despliegue.

---

## Resumen por prioridad

| Prioridad | Tema |
|-----------|------|
| Alta | Tests (Vitest + RTL), Error Boundary global |
| Media | .env.example y validación de env, unificación home por rol, ProductCacheContext (usar o eliminar), useNavigateByRole vs ROLE_NAME, extracción de componentes/hooks grandes |
| Baja | Helper URLs bonos, case REENCAUCHE_USER en getHomeForRole, estandarizar fechas, revisar Emotion, documentar contratos API y permisos por sección |

Este documento debe actualizarse cuando se resuelvan puntos o se detecte nueva deuda. Para el índice completo de documentación ver [docs/indice.md](indice.md).
