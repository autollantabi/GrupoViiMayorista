# Portal Mayorista Vii (ViiCommerce)

Aplicación web B2B para el e-commerce mayorista del grupo ViiCommerce (Cuenca, Ecuador). Centraliza catálogo, pedidos, perfil de usuario y flujos específicos (reencauche, coordinación, App Shell, XCoin) para múltiples empresas y roles.

---

## Descripción general

**Portal Mayorista Vii** (nombre interno: `portal-mayorista`, marca: **ViiCommerce**) es una **SPA (Single Page Application)** en React que consume APIs REST externas. No incluye backend en este repositorio.

Permite a clientes mayoristas consultar catálogos por empresa (MAXXIMUNDO, STOX, AUTOLLANTA, IKONIX, AUTOMAX), gestionar carrito y pedidos, administrar perfil, y a usuarios internos (admin, coordinador, reencauche) ejecutar sus flujos específicos.

---

## Problema que resuelve

- **Centralización:** Un solo frontend para catálogo mayorista, pedidos y perfiles de múltiples empresas.
- **Multi-empresa y multi-rol:** Acceso segregado por empresa y por rol (cliente, administrador, coordinador, visualización, reencauche).
- **Flujos especializados:** Reencauche (bonos, verificación, PDF/QR), coordinación de pedidos, integración con App Shell (Lider Shell) y programa de puntos XCoin.

---

## Tipo de aplicación

- **Web:** SPA cliente (React).
- **Backend:** Externo; todas las operaciones de negocio se realizan contra APIs REST (no incluidas en este repo).
- **Despliegue:** Build estático (Vite); hosting configurado para Vercel con rewrites a `index.html`.

---

## Stack tecnológico

| Área | Tecnología |
|------|------------|
| UI | React 19, JSX |
| Estilos | styled-components, Emotion (peer) |
| Rutas | react-router-dom v7 |
| HTTP | axios |
| Estado global | React Context (Auth, Cart, ProductCatalog, AppTheme) |
| SEO / meta | react-helmet-async |
| Notificaciones | react-toastify |
| Build / dev | Vite 6, @vitejs/plugin-react-swc |
| Linting | ESLint 9 |

Ver [docs/decisiones-tecnicas.md](docs/decisiones-tecnicas.md) para justificación y alternativas.

---

## Casos de uso principales

- **Cliente:** Login, catálogo por empresa, detalle de producto, carrito, pedidos, perfil, contacto, reencauche (verificación de bonos), XCoin, App Shell.
- **Administrador:** Dashboard, gestión de usuarios y coordinadores.
- **Coordinador:** Listado y detalle de pedidos, edición de pedidos.
- **Usuario reencauche:** Home reencauche, bonos activados, activación de bonos, verificación de bonos, clientes y formularios asociados.

---

## Guía rápida de ejecución

1. **Requisitos:** Node.js 18+ (recomendado 20 LTS), npm. Backend disponible y variables de entorno configuradas.
2. **Instalación:**
   ```bash
   git clone <url-repositorio>
   cd PortalMayoristaVii
   npm install
   # Si hay conflictos de peer dependencies:
   npm run install:legacy
   ```
3. **Variables de entorno:** Crear `.env` en la raíz con las variables `VITE_*` necesarias (ver [docs/setup.md](docs/setup.md)).
4. **Desarrollo:** `npm run dev` — servidor en `http://localhost:4200`.
5. **Build:** `npm run build` — salida en `dist/`.

Detalle de requisitos, variables, pasos y errores comunes: **[docs/setup.md](docs/setup.md)**.

---

## Documentación

Índice completo de la documentación técnica, orden de lectura recomendado y uso como plantilla: **[docs/indice.md](docs/indice.md)**.

| Documento | Propósito |
|-----------|-----------|
| [docs/setup.md](docs/setup.md) | Requisitos, entorno, ejecución local, errores comunes |
| [docs/arquitectura.md](docs/arquitectura.md) | Estructura del proyecto, carpetas, módulos, patrones |
| [docs/apis.md](docs/apis.md) | APIs consumidas, clientes HTTP, endpoints, cabeceras |
| [docs/flujo-funcional.md](docs/flujo-funcional.md) | Flujos (login, pedidos, reencauche, etc.) y permisos |
| [docs/guia-proyecto.md](docs/guia-proyecto.md) | Onboarding, dónde está cada cosa, flujo para añadir pantallas |
| [docs/decisiones-tecnicas.md](docs/decisiones-tecnicas.md) | Tecnologías elegidas, alternativas, trade-offs |
| [docs/despliegue.md](docs/despliegue.md) | Build, ambientes, producción |
| [docs/pendientes.md](docs/pendientes.md) | Mejoras, deuda técnica, supuestos |

---

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (puerto 4200) |
| `npm run build` | Build de producción en `dist/` |
| `npm run install:legacy` | `npm install --legacy-peer-deps` |
| `npm run pm2Dev` | Inicia dev con PM2 y muestra logs |

---

*Documentación generada para que cualquier persona que reemplace al desarrollador actual pueda entender, ejecutar, mantener y ampliar el proyecto sin depender del autor original.*
