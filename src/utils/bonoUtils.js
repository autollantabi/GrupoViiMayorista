import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import {
  api_bonos_sendBonusFile,
  api_bonos_generateQR,
} from "../api/bonos/apiBonos";
import { generateCompleteBonosHTML } from "./bonoHTMLGenerator";

/**
 * Parsea la especificación del producto (BRAND;SIZE;DESIGN)
 */
export const parseProductSpecification = (specification) => {
  if (!specification || specification === "") {
    return { brand: "N/A", size: "N/A", design: "N/A" };
  }
  const parts = specification.split(";");
  return {
    brand: parts[0] || "N/A",
    size: parts[1] || "N/A",
    design: parts[2] || "N/A",
  };
};

/**
 * Genera un código QR con los datos de la factura (obtiene el código del backend)
 */
const generateInvoiceQRCode = async (invoiceNumber) => {
  try {

    if (!invoiceNumber) {
      console.error("❌ Número de factura es undefined o null");
      return null;
    }

    // Llamar al backend para que genere el código QR solo con el número de factura
    const response = await api_bonos_generateQR(invoiceNumber);

    if (response.success && response.data.qrCode) {

      // Construir la URL completa de verificación
      const preUrl =
        import.meta.env.VITE_NODE_ENV === "production"
          ? import.meta.env.VITE_PRODUCTION_URL
          : import.meta.env.VITE_DEVELOPMENT_URL;
      const verificationUrl = `${preUrl}/reencauche/verificacion?code=${response.data.qrCode}`;

      // Generar el código QR visualmente usando la librería qrcode
      const qrDataURL = await QRCode.toDataURL(verificationUrl, {
        width: 120,
        margin: 1,
        errorCorrectionLevel: "L",
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return qrDataURL;
    } else {
      console.error(
        "❌ Error al obtener código QR desde backend:",
        response.message || "Respuesta sin mensaje"
      );
      console.error("📄 Respuesta completa:", response);
      return null;
    }
  } catch (error) {
    console.error("❌ Error generando QR de factura:", error);
    return null;
  }
};

/**
 * Previsualiza el HTML de los bonos en una nueva ventana para testing
 * Ahora usa componentes JSX para generar el HTML
 */
export const previewBonosHTML = async (bonos, cliente, invoiceNumber) => {
  try {
    const qrCodeDataURL = await generateInvoiceQRCode(invoiceNumber);

    // Generar el HTML completo usando el generador modular
    const finalHTML = await generateCompleteBonosHTML(
      bonos,
      cliente,
      invoiceNumber,
      qrCodeDataURL
    );

    // Crear ventana de previsualización con tamaño A4 + márgenes
    const previewWindow = window.open(
      "",
      "_blank",
      "width=900,height=1200,scrollbars=yes,resizable=yes"
    );

    if (!previewWindow) {
      throw new Error("No se pudo abrir la ventana de previsualización");
    }

    previewWindow.document.write(finalHTML);
    previewWindow.document.close();

    return { success: true, message: "Previsualización generada exitosamente" };
  } catch (error) {
    console.error("Error generando previsualización:", error);
    throw error;
  }
};

/**
 * Genera el HTML del PDF con múltiples bonos en formato de tarjetas
 * Usa el mismo generador que el preview para consistencia
 */
const generateMultipleBonosPDFHTML = async (bonos, cliente, invoiceNumber) => {
  const qrCodeDataURL = await generateInvoiceQRCode(invoiceNumber);

  // Generar el HTML completo usando el generador modular
  const htmlString = await generateCompleteBonosHTML(
    bonos,
    cliente,
    invoiceNumber,
    qrCodeDataURL
  );

  // Crear un iframe temporal oculto para parsear el HTML
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  // Escribir el HTML en el iframe
  iframe.contentDocument.open();
  iframe.contentDocument.write(htmlString);
  iframe.contentDocument.close();

  // Crear elemento temporal para html2canvas
  const tempDiv = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.top = "-9999px";
  tempDiv.style.width = "210mm";
  tempDiv.style.backgroundColor = "#ffffff";
  tempDiv.style.fontFamily = "Arial, sans-serif";

  // Clonar el contenido del body del iframe
  const iframeBody = iframe.contentDocument.body;
  tempDiv.innerHTML = iframeBody.innerHTML;

  // Copiar los estilos computados del iframe
  const iframeStyles = iframe.contentDocument.getElementsByTagName("style");
  for (let styleEl of iframeStyles) {
    const newStyle = document.createElement("style");
    newStyle.textContent = styleEl.textContent;
    tempDiv.appendChild(newStyle);
  }

  // Remover el iframe
  document.body.removeChild(iframe);

  // Agregar el div temporal al documento
  document.body.appendChild(tempDiv);

  return tempDiv;
};

/**
 * Genera un PDF del bono usando HTML2Canvas (MISMO método que PDFGenerator.jsx)
 */
export const generateBonoPDFBlob = async (bono, cliente) => {
  let tempDiv = null;
  try {
    // Crear HTML temporal
    tempDiv = await generateBonoPDFHTML(bono, cliente);

    // Generar canvas con menor escala para reducir peso
    const canvas = await html2canvas(tempDiv, {
      scale: 1.5, // Reducido de 2 a 1.5 para menor peso
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    // Usar JPEG con compresión en lugar de PNG para menor peso
    const imgData = canvas.toDataURL("image/jpeg", 0.85); // Calidad 85% (0-1)
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
    } else {
      const adjustedHeight = pageHeight;
      const adjustedWidth = (canvas.width * adjustedHeight) / canvas.height;
      pdf.addImage(imgData, "JPEG", 0, 0, adjustedWidth, adjustedHeight);
    }

    const blob = pdf.output("blob");
    const fileName = `Bono_${
      bono.INVOICENUMBER
    }_${cliente.CUSTOMER_NAME.replace(
      /\s/g,
      "_"
    )}_${cliente.CUSTOMER_LASTNAME.replace(/\s/g, "_")}.pdf`;

    return { blob, fileName };
  } catch (error) {
    console.error("Error generando PDF del bono:", error);
    throw error;
  } finally {
    // Limpiar elemento temporal
    if (tempDiv && tempDiv.parentNode) {
      document.body.removeChild(tempDiv);
    }
  }
};

/**
 * Descarga el PDF del bono directamente
 */
export const downloadBonoPDF = async (bono, cliente) => {
  try {
    const { blob, fileName } = await generateBonoPDFBlob(bono, cliente);

    // Crear URL temporal para descargar
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error descargando PDF del bono:", error);
    throw error;
  }
};

/**
 * Descarga el PDF con múltiples bonos directamente
 */
export const downloadMultipleBonosPDF = async (
  bonos,
  cliente,
  invoiceNumber
) => {
  try {
    const { blob, fileName } = await generateMultipleBonosPDFBlob(
      bonos,
      cliente,
      invoiceNumber
    );

    // Crear URL temporal para descargar
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, message: "PDF descargado exitosamente" };
  } catch (error) {
    console.error("Error descargando PDF de bonos múltiples:", error);
    throw error;
  }
};

/**
 * Genera un PDF con múltiples bonos en formato de tarjetas
 */
export const generateMultipleBonosPDFBlob = async (
  bonos,
  cliente,
  invoiceNumber
) => {
  let tempDiv = null;
  try {
    // Crear HTML temporal
    tempDiv = await generateMultipleBonosPDFHTML(bonos, cliente, invoiceNumber);

    // Generar canvas con mejor calidad
    const canvas = await html2canvas(tempDiv, {
      scale: 1.5, // Reducido para mejor rendimiento
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false, // Deshabilitar logs para mejor rendimiento
    });

    // Generar PDF con paginación mejorada
    const imgData = canvas.toDataURL("image/jpeg", 0.85);
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Calcular cuántas páginas necesitamos
    const totalPages = Math.ceil(imgHeight / pageHeight);

    // Agregar páginas una por una para mejor control
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const yPosition = -(i * pageHeight);
      const currentPageHeight = Math.min(
        pageHeight,
        imgHeight - i * pageHeight
      );

      pdf.addImage(imgData, "JPEG", 0, yPosition, imgWidth, imgHeight);
    }

    const blob = pdf.output("blob");
    const fileName = `Bonos_Factura_${invoiceNumber}_${cliente.CUSTOMER_NAME.replace(
      /\s/g,
      "_"
    )}_${cliente.CUSTOMER_LASTNAME.replace(/\s/g, "_")}.pdf`;

    return { blob, fileName };
  } catch (error) {
    console.error("Error generando PDF de bonos múltiples:", error);
    throw error;
  } finally {
    // Limpiar elemento temporal
    if (tempDiv && tempDiv.parentNode) {
      document.body.removeChild(tempDiv);
    }
  }
};

/**
 * Genera y envía el PDF del bono por email y WhatsApp
 * Ahora soporta un solo bono o múltiples bonos
 */
export const generateAndSendBonoPDF = async (bono, cliente) => {
  try {
    // Validar que el cliente tenga email o teléfono
    if (!cliente.CUSTOMER_EMAIL && !cliente.CUSTOMER_PHONE) {
      throw new Error("El cliente debe tener email o teléfono registrado");
    }

    // Generar PDF
    const { blob, fileName } = await generateBonoPDFBlob(bono, cliente);

    // Crear archivo File desde Blob
    const file = new File([blob], fileName, { type: "application/pdf" });

    // Enviar archivo
    const response = await api_bonos_sendBonusFile(
      file,
      cliente.CUSTOMER_EMAIL || "",
      cliente.CUSTOMER_PHONE || "",
      `${cliente.CUSTOMER_NAME} ${cliente.CUSTOMER_LASTNAME}`
    );

    return response;
  } catch (error) {
    console.error("Error generando y enviando PDF del bono:", error);
    throw error;
  }
};

/**
 * Genera y envía el PDF con múltiples bonos por email y WhatsApp
 */
export const generateAndSendMultipleBonosPDF = async (
  bonos,
  cliente,
  invoiceNumber
) => {
  try {
    // Validar que el cliente tenga email o teléfono
    if (!cliente.CUSTOMER_EMAIL && !cliente.CUSTOMER_PHONE) {
      throw new Error("El cliente debe tener email o teléfono registrado");
    }

    if (!bonos || bonos.length === 0) {
      throw new Error("Debe proporcionar al menos un bono");
    }

    // Generar PDF con múltiples bonos
    const { blob, fileName } = await generateMultipleBonosPDFBlob(
      bonos,
      cliente,
      invoiceNumber
    );

    // Crear archivo File desde Blob
    const file = new File([blob], fileName, { type: "application/pdf" });

    // Enviar archivo
    const response = await api_bonos_sendBonusFile(
      file,
      cliente.CUSTOMER_EMAIL || "",
      cliente.CUSTOMER_PHONE || "",
      `${cliente.CUSTOMER_NAME} ${cliente.CUSTOMER_LASTNAME}`
    );

    return response;
  } catch (error) {
    console.error("Error generando y enviando PDF de bonos múltiples:", error);
    throw error;
  }
};
