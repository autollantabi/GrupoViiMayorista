# Componente ExportToExcel

Componente reutilizable para exportar datos de bonos a archivos Excel (.xlsx) con formato profesional.

## Características

✅ Exportación a formato Excel (.xlsx)  
✅ Formato profesional con encabezados personalizados  
✅ Colores alternados en filas para mejor legibilidad  
✅ Bordes y alineación automática  
✅ Nombre de archivo con timestamp  
✅ Botón con estado de carga  
✅ Completamente reutilizable  
✅ **Modal de selección de rango de fechas**  
✅ **Filtrado automático por período (última semana, último mes, últimos 3 meses)**

## Instalación de Dependencias

El componente requiere las siguientes dependencias:

```bash
npm install exceljs file-saver
```

## Uso Básico

```jsx
import ExportToExcel from "../../components/export/ExportToExcel";

function MiComponente() {
  const [datos, setDatos] = useState([]);

  return (
    <ExportToExcel
      data={datos}
      fileName="mi_reporte"
      buttonText="Exportar a Excel"
    />
  );
}
```

## Props

| Prop              | Tipo     | Requerido | Default              | Descripción                             |
| ----------------- | -------- | --------- | -------------------- | --------------------------------------- |
| `data`            | `Array`  | ✅ Sí     | `[]`                 | Array de facturas con bonos             |
| `fileName`        | `string` | ❌ No     | `"bonos_reencauche"` | Nombre base del archivo (sin extensión) |
| `buttonText`      | `string` | ❌ No     | `"Exportar a Excel"` | Texto del botón                         |
| `buttonIcon`      | `string` | ❌ No     | `"FaFileExcel"`      | Icono del botón (React Icons)           |
| `variant`         | `string` | ❌ No     | `"solid"`            | Variante del botón (solid, outlined)    |
| `size`            | `string` | ❌ No     | `"medium"`           | Tamaño del botón (small, medium, large) |
| `backgroundColor` | `string` | ❌ No     | `undefined`          | Color de fondo personalizado del botón  |

## Estructura de Datos Esperada

El componente espera un array de objetos con la siguiente estructura:

```javascript
[
  {
    invoiceNumber: "001-001-0000123",
    customer: {
      CUSTOMER_NAME: "Juan",
      CUSTOMER_LASTNAME: "Pérez",
      CUSTOMER_IDENTIFICATION: "0912345678",
      CUSTOMER_EMAIL: "juan@example.com",
      CUSTOMER_PHONE: "0991234567",
    },
    businessPartner: {
      NAME_USER: "Distribuidora XYZ",
      ACCOUNT_USER: "0912345678001",
      EMAIL: "xyz@example.com",
    },
    totalBonuses: 5,
    bonuses: [
      {
        ID_BONUS: 123,
        STATUS: "ACTIVO",
        parsedProduct: {
          BRAND: "HAOHUA",
          SIZE: "11R22.5",
          DESIGN: "HH301",
        },
        MASTER: "M001",
        ITEM: "I001",
        QUANTITY: 1,
        RETREADINVOICE: "001-001-0000456",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
    ],
  },
];
```

## Columnas del Excel

El archivo Excel generado incluye las siguientes columnas:

1. N° Factura
2. N° Bono
3. Estado
4. Marca
5. Tamaño
6. Diseño
7. Master
8. Item
9. Cantidad
10. Factura Reencauche
11. Cliente
12. CI/RUC Cliente
13. Email Cliente
14. Teléfono Cliente
15. Mayorista
16. RUC Mayorista
17. Email Mayorista
18. Fecha Creación
19. Fecha Actualización

## Ejemplos de Uso

### Ejemplo 1: Uso Básico

```jsx
<ExportToExcel data={bonosActivados} fileName="historial_bonos" />
```

### Ejemplo 2: Botón Personalizado

```jsx
<ExportToExcel
  data={bonosActivados}
  fileName="reporte_bonos_mensual"
  buttonText="Descargar Reporte"
  buttonIcon="FaDownload"
  backgroundColor="#10b981"
  size="large"
/>
```

### Ejemplo 3: Botón Responsivo

```jsx
<ExportToExcel
  data={bonosActivados}
  fileName="bonos_export"
  buttonText={isMobile ? "Excel" : "Exportar a Excel"}
  size={isMobile ? "small" : "medium"}
/>
```

### Ejemplo 4: Integrado en Header

```jsx
<Header>
  <Title>Historial de Bonos</Title>
  <SearchContainer>
    <SearchInput ... />
    <ExportToExcel
      data={bonosActivados}
      fileName="historial_bonos_reencauche"
      buttonText="Exportar"
      backgroundColor="#10b981"
    />
  </SearchContainer>
</Header>
```

## Flujo de Exportación

1. Usuario hace clic en el botón "Exportar a Excel"
2. Se muestra un modal con 3 opciones de rango de fechas:
   - **Última Semana**: Últimos 7 días
   - **Último Mes**: Últimos 30 días
   - **Últimos 3 Meses**: Últimos 90 días
3. Al seleccionar una opción, se filtran los bonos por fecha de actualización
4. Se genera y descarga el archivo Excel automáticamente

## Formato del Archivo

- **Nombre del archivo:** `{fileName}_{rangoFecha}_{timestamp}.xlsx`
  - Ejemplo: `historial_bonos_reencauche_ultimo_mes_2024-10-20T15-30-00.xlsx`
- **Timestamp:** Formato ISO sin caracteres especiales (ej: `2024-01-15T10-30-00`)
- **Rango de fecha:** `ultima_semana`, `ultimo_mes`, o `ultimos_3_meses`
- **Hoja:** "Bonos Reencauche"
- **Encabezado:** Fondo azul (#1e40af), texto blanco, negritas
- **Filas:** Colores alternados (blanco / gris claro #F9FAFB)
- **Bordes:** Líneas delgadas en todas las celdas
- **Primera fila:** Congelada para navegación

## Notas Importantes

- ✅ **Modal de selección**: Al hacer clic en el botón, se abre un modal para elegir el rango de fechas
- ✅ **Filtrado por fecha**: Los bonos se filtran por su fecha de actualización (`updatedAt` o `createdAt`)
- ✅ **Nombre descriptivo**: El archivo incluye el rango seleccionado en su nombre
- ⚠️ Si no hay datos en el rango seleccionado, la exportación se cancela
- ✅ El botón se deshabilitará automáticamente si no hay datos
- ✅ El formato de fecha se ajusta automáticamente a "es-ES"
- ✅ Los valores nulos o undefined se convierten en "N/A"
- ✅ El modal se cierra automáticamente al iniciar la exportación o al hacer clic fuera

## Integración con otras páginas

Este componente es completamente reutilizable. Para usarlo en otra página:

1. Importa el componente:

```jsx
import ExportToExcel from "../../components/export/ExportToExcel";
```

2. Asegúrate de que tus datos tengan la estructura esperada

3. Úsalo en tu JSX:

```jsx
<ExportToExcel data={tusDatos} fileName="tu_archivo" />
```

## Personalización Adicional

Si necesitas personalizar las columnas o el formato, puedes crear una copia del componente y modificar:

- `worksheet.columns` - Para cambiar las columnas
- Estilos de encabezado (líneas 87-97)
- Lógica de datos (líneas 100-128)
- Formato de celdas (líneas 131-145)
