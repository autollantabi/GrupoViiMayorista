# Índice de documentación técnica

Índice de todos los documentos del proyecto, propósito de cada uno, cuándo usarlo, orden de lectura recomendado para un desarrollador nuevo y breve guía para replicar esta estructura en otro repositorio.

---

## Tabla de documentos

| Documento | Propósito | Cuándo usarlo |
|-----------|-----------|----------------|
| [README.md](../README.md) | Descripción general del proyecto, problema que resuelve, tipo de app, stack, casos de uso, guía rápida de ejecución y enlaces a la documentación. | Primera lectura; compartir el proyecto con alguien externo; recordar qué es el proyecto y cómo arrancarlo. |
| [setup.md](setup.md) | Requisitos del sistema, variables de entorno necesarias, pasos para ejecutar el proyecto localmente, errores comunes y cómo resolverlos. | Configurar el entorno por primera vez; resolver fallos de instalación o de variables; onboarding técnico. |
| [arquitectura.md](arquitectura.md) | Arquitectura general, árbol de carpetas relevante, descripción de carpetas principales, separación de responsabilidades, módulos principales y cómo añadir una nueva pantalla o funcionalidad, patrones de diseño. | Entender la estructura del código; saber dónde vive cada funcionalidad; añadir una pantalla o módulo nuevo. |
| [apis.md](apis.md) | Instancia HTTP (api principal), URLs y variables de entorno, cabeceras, proxy Shell, servicios que usan cada API, endpoints representativos, riesgos o dependencias. | Integrar o modificar llamadas al backend; depurar problemas de autenticación o de API; documentar nuevos endpoints. |
| [flujo-funcional.md](flujo-funcional.md) | Flujos principales: login, validación de sesión, logout, recuperación de contraseña, registro, compra (catálogo → carrito → pedido), coordinador, reencauche, XCoin, App Shell. Auth, autorización y permisos por rol. | Entender qué ocurre en cada flujo; depurar redirecciones o permisos; diseñar cambios en flujos. |
| [guia-proyecto.md](guia-proyecto.md) | Onboarding: qué es el proyecto, cómo empezar, dónde está cada cosa, resumen de APIs e integraciones, flujo típico para añadir pantalla o funcionalidad, decisiones históricas o código legado, contacto. | Incorporarse al proyecto; localizar rápidamente archivos y responsabilidades; contexto de decisiones pasadas. |
| [decisiones-tecnicas.md](decisiones-tecnicas.md) | Justificación de tecnologías elegidas (React, Vite, styled-components, Context, axios, etc.), alternativas consideradas (inferidas), trade-offs importantes. | Entender por qué está hecho así; evaluar cambios de stack o de enfoque. |
| [despliegue.md](despliegue.md) | Proceso de build (Vite), configuración de ambientes (dev/prod), consideraciones para producción (SPA, headers, CORS, variables sensibles, caché, HTTPS). | Hacer build de producción; configurar CI/CD o hosting; desplegar en un nuevo entorno. |
| [pendientes.md](pendientes.md) | Mejoras técnicas sugeridas, deuda técnica detectada, suposiciones o partes no claras del proyecto. | Priorizar trabajo técnico; saber qué está pendiente o incierto; evitar repetir supuestos erróneos. |

---

## Orden de lectura recomendado (desarrollador nuevo)

1. **README.md** — Visión general y guía rápida.
2. **setup.md** — Poner el proyecto en marcha en local.
3. **guia-proyecto.md** — Dónde está cada cosa y flujo para añadir funcionalidad.
4. **arquitectura.md** — Estructura de carpetas y módulos.
5. **flujo-funcional.md** — Cómo funcionan login, pedidos, reencauche y permisos.
6. **apis.md** — Clientes HTTP y endpoints (cuando vaya a tocar integraciones).
7. **decisiones-tecnicas.md** — Contexto de tecnologías y trade-offs (opcional pero útil).
8. **despliegue.md** — Cuando vaya a hacer build o desplegar.
9. **pendientes.md** — Para conocer deuda y mejoras sugeridas.

Quien solo vaya a ejecutar el proyecto puede quedarse en README + setup. Quien vaya a mantener o ampliar el código debería leer al menos 1–6 y 9.

---

## Uso como plantilla en otro repositorio

Esta estructura de documentación se puede replicar en otro proyecto para que cualquier persona que reemplace al desarrollador actual pueda entender, ejecutar y mantener el proyecto.

### Documentos mínimos sugeridos

| Archivo | Contenido tipo |
|---------|----------------|
| **README.md** (raíz) | Descripción, problema, tipo de app, stack, casos de uso, guía rápida, enlace al índice de docs. |
| **docs/indice.md** | Tabla: documento, propósito, cuándo usarlo; orden de lectura recomendado; sección “Uso como plantilla”. |
| **docs/setup.md** | Requisitos, variables de entorno, pasos de ejecución local, errores comunes. |
| **docs/arquitectura.md** | Arquitectura general, árbol de carpetas, responsabilidades, cómo añadir pantalla o funcionalidad, patrones si aplican. |
| **docs/guia-proyecto.md** | Onboarding: qué es, cómo empezar, dónde está cada cosa, flujo para añadir funcionalidad, decisiones históricas, contacto si aplica. |

### Documentos opcionales según el proyecto

- **docs/apis.md** — Si el proyecto consume APIs externas (clientes HTTP, cabeceras, endpoints, riesgos).
- **docs/flujo-funcional.md** — Si hay flujos complejos (auth, permisos, flujos de negocio) que convenga describir paso a paso.
- **docs/decisiones-tecnicas.md** — Si se quiere dejar constancia de tecnologías elegidas y trade-offs.
- **docs/despliegue.md** — Si hay build y despliegue (CI/CD, hosting, producción).
- **docs/pendientes.md** — Si se quiere centralizar mejoras, deuda técnica y supuestos.

### Reglas útiles

- Escribir en español neutro y técnico (o el idioma acordado del equipo).
- No asumir cosas que no estén en el código; marcar explícitamente “pendiente” o “suposición” cuando algo no esté claro.
- Evitar duplicar información entre documentos; usar enlaces entre docs.
- Actualizar el índice (indice.md) y pendientes.md cuando se añadan documentos o se resuelva deuda.
- No crear README.md dentro de docs si el índice ya cumple la función de “entrada” a la documentación (evitar redundancia).

Con esto, un desarrollador nuevo puede hacerse cargo del proyecto apoyándose principalmente en la documentación, sin depender del autor original.
