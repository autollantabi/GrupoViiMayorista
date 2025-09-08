import { format } from "date-fns";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

// Función auxiliar para formatear un objeto para el PDF
function formatObjectForPdf(obj, column, idx = 0) {
  // Formato especial para listas con checkbox (realizado/no realizado)
  if (column.type === "list" && column.listConfig) {
    const { textField, checkedField } = column.listConfig;
    
    // Si existe la configuración de formato para listas
    if (column.listItemFormatter && typeof column.listItemFormatter === 'object') {
      const formatter = column.listItemFormatter;
      
      // Determinar qué campos usar
      const textField = formatter.textField || column.listConfig.textField;
      const checkedField = formatter.checkedField || column.listConfig.checkedField;
      
      // Determinar el índice o número a mostrar
      let displayIndex;
      if (!formatter.index) {
        // Si no se especifica, usar numeración automática
        displayIndex = idx + 1;
      } else {
        // Si se especifica un campo, usar ese valor
        displayIndex = obj[formatter.index] || idx + 1;
      }
      
      const text = obj[textField];
      const isChecked = obj[checkedField];
      
      // Formato para el prefijo
      const prefix = `${displayIndex}: `;
      
      // Formato según si está completado o no
      if (isChecked) {
        return `${prefix} [OK] ${text}`;
      } else {
        return `${prefix} [  ] ${text}`;
      }
    }
    
    // Si existe el formateador como función (compatibilidad con versiones anteriores)
    if (column.listItemFormatter && typeof column.listItemFormatter === 'function') {
      try {
        return column.listItemFormatter(obj, idx);
      } catch (error) {
        console.warn("Error al usar listItemFormatter:", error);
      }
    }
    
    // Formato predeterminado si no hay configuración específica
    if (checkedField in obj && textField in obj) {
      const text = obj[textField];
      const isChecked = obj[checkedField];
      const itemNumber = idx + 1;
      
      if (isChecked) {
        return `${itemNumber}: [OK] ${text}`;
      } else {
        return `${itemNumber}: [  ] ${text}`;
      }
    }
  }

  // Resto del código para otros tipos de objetos...
  if (column.objectDisplayFields) {
    return column.objectDisplayFields
      .map((field) => {
        const fieldValue = obj[field];
        if (fieldValue === undefined || fieldValue === null) return "";
        return `${field}: ${fieldValue}`;
      })
      .filter((text) => text !== "")
      .join(", ");
  }

  // Intentar usar campos comunes si existen
  if (obj.texto || obj.name || obj.label || obj.description) {
    return obj.texto || obj.name || obj.label || obj.description;
  }

  // Si tiene campos id y texto/name/descripcion
  if (obj.id && (obj.texto || obj.name || obj.descripcion)) {
    return `${obj.id} - ${obj.texto || obj.name || obj.descripcion}`;
  }

  // Mostrar todos los pares clave-valor
  try {
    return Object.entries(obj)
      .map(([key, val]) => {
        const valStr = typeof val === "object" && val !== null 
          ? "[objeto]" 
          : String(val);
        return `${key}: ${valStr}`;
      })
      .join(", ");
  } catch (e) {
    return "[objeto complejo]";
  }
}

export const exportToPdf = async ({
  columnsConfig,
  rowData,
  fileName,
  title,
}) => {
  const doc = new jsPDF();

  // Verificar si rowData es un arreglo o un objeto
  const dataArray = Array.isArray(rowData) ? rowData : [rowData];

  dataArray.forEach((data, index) => {
    // Título del PDF
    doc.setFontSize(16);
    doc.text(
      `${title || "Detalles"} ${dataArray.length > 1 ? `(${index + 1})` : ""}`,
      14,
      20
    );

    // Filtrar columnas exportables
    const exportableColumns = columnsConfig.filter((col) => col.exportable);

    // Crear encabezados y datos
    const headers = ["Campo", "Valor"];
    const rows = exportableColumns.map((col) => {
      let value = data[col.field];

      // Si el valor es null o undefined, usa el valor por defecto
      if (value === null || value === undefined) {
        value = col.defaultValue || ""; // Usa defaultValue o un string vacío
      }

      // Si la columna tiene opciones, busca el label correspondiente
      if (col.options) {
        const option = col.options.find(
          (opt) => String(opt.value) === String(value)
        );
        value = option ? option.label : value; // Usa el label si existe
      }

      // Si el valor es booleano, transforma a "Sí" o "No"
      if (typeof value === "boolean") {
        value = value ? "Sí" : "No";
      }

      // Si la columna es de tipo "date", aplica el formato definido en dateFormat
      if (col.type === "date" && value) {
        try {
          value = format(new Date(value), col.dateFormat || "yyyy-MM-dd");
        } catch (error) {
          console.warn(`Error formateando la fecha: ${value}`, error);
        }
      }

      // Manejo especial para objetos y arrays
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          // Si es un array y es del tipo lista con checked
          if (col.type === "list" && col.listConfig) {
            // Usamos un formateador directo sin añadir viñetas adicionales
            value = value
              .map((item, idx) => formatObjectForPdf(item, col, idx))
              .join("\n");
          } else {
            // Formato estándar para arrays (con viñetas)
            value = value
              .map((item) => "• " + formatObjectForPdf(item, col))
              .join("\n");
          }
        } else {
          // Si es un objeto individual
          value = formatObjectForPdf(value, col);
        }
      }

      return [col.customHeaderPdf || col.headerName, value];
    });

    // Agregar tabla al PDF
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 30,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: {
        fillColor: [96, 96, 96],
        textColor: 255,
        fontStyle: "bold",
      }, // Fondo gris oscuro y texto blanco
      alternateRowStyles: { fillColor: [240, 240, 240] }, // Filas alternas en gris claro
      columnStyles: {
        0: { cellWidth: 50 }, // Ancho de la columna "Campo"
        1: { cellWidth: "auto" }, // Ancho automático para la columna "Valor"
      },
    });

    // Agregar una nueva página si no es el último elemento
    if (index < dataArray.length - 1) {
      doc.addPage();
    }
  });

  // Guardar el PDF
  doc.save(`${fileName || "detalles"}.pdf`);
};
