import { format } from "date-fns";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportToExcel = async ({
  columns,
  filteredData,
  fileName,
  sheetName,
}) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName || "Sheet1");

  // Filtrar columnas exportables
  const exportableColumns = columns.filter((col) => col.exportable);

  // Transformar datos para exportar
  const transformedData = filteredData.map((row) => {
    return exportableColumns.reduce((acc, col) => {
      let value = row[col.field];

      // Si el valor es null o undefined, usa el valor por defecto
      if (value === null || value === undefined) {
        value = col.defaultValue || ""; // Usa defaultValue o un string vacío
      }

      // Si la columna tiene opciones, busca el label correspondiente
      if (col.options) {
        const option = col.options.find(
          (opt) => String(opt.value) === String(value)
        );
        value = option ? option.label : value; // Usa el label si existe, de lo contrario usa el valor original
      }

      if (typeof value === "boolean") {
        value = value ? "Si" : "No"; // Cambia el valor booleano a "Si" o "No"
      }

      // Si la columna es de tipo "date", aplica el formato definido en dateFormat
      if (col.type === "date" && value) {
        try {
          value = format(new Date(value), col.dateFormat || "yyyy-MM-dd");
        } catch (error) {
          console.warn(`Error formateando la fecha: ${value}`, error);
        }
      }

      acc[col.field] = value; // Asigna el valor transformado al objeto acumulador

      return acc;
    }, {});
  });

  // Ajustar el ancho de las columnas al contenido
  worksheet.columns = exportableColumns.map((col) => {
    const columnData = [
      col.customHeaderExcel || col.headerName,
      ...filteredData.map((row) => row[col.field] || ""),
    ];
    const maxLength = columnData.reduce(
      (max, value) => Math.max(max, String(value).length),
      10
    ); // Longitud mínima de 10
    return {
      header: col.customHeaderExcel || col.headerName,
      key: col.field,
      width: maxLength + 5, // Agrega un pequeño margen
    };
  });

  // Agregar estilos a los encabezados
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; // Texto blanco
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFBFBFBF" }, // Fondo azul
    };
    cell.alignment = { vertical: "middle", horizontal: "center" }; // Centrado
  });

  // Agregar datos transformados al worksheet
  transformedData.forEach((row, index) => {
    const excelRow = worksheet.addRow(row);

    // Estilizar filas alternas
    if (index % 2 === 0) {
      excelRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF2F2F2" }, // Fondo gris claro
        };
        cell.alignment = { vertical: "middle", horizontal: "left" }; // Centrado
      });
    } else {
      excelRow.eachCell((cell) => {
        cell.alignment = { vertical: "middle", horizontal: "left" }; // Centrado
      });
    }
  });

  // Generar archivo Excel
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${fileName}.xlsx`);
};
