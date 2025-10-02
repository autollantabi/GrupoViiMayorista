import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import {
  api_bonos_sendBonusFile,
  api_bonos_generateQR,
} from "../api/bonos/apiBonos";

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
 * Genera un código QR para el bono (obtiene el código del backend y genera QR visualmente)
 */
const generateQRCode = async (bonoId) => {
  try {
    console.log("Solicitando código QR al backend para bono ID:", bonoId);

    if (!bonoId) {
      console.error("ID del bono es undefined o null");
      return null;
    }

    // Llamar al backend para que genere el QR de forma segura
    const response = await api_bonos_generateQR(bonoId);

    if (response.success && response.data.qrCode) {
      console.log("Código QR obtenido exitosamente desde el backend");

      // Construir la URL completa de verificación
      const preUrl =
        import.meta.env.VITE_NODE_ENV === "production"
          ? import.meta.env.VITE_PRODUCTION_URL
          : import.meta.env.VITE_DEVELOPMENT_URL;
      const verificationUrl = `${preUrl}/reencauche/verificacion?codigo=${response.data.qrCode}`;

      // Generar el código QR visualmente usando la librería qrcode
      const qrDataURL = await QRCode.toDataURL(verificationUrl, {
        width: 150,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      console.log("QR generado visualmente");
      return qrDataURL;
    } else {
      console.error(
        "Error al obtener código QR desde backend:",
        response.message
      );
      return null;
    }
  } catch (error) {
    console.error("Error generando QR:", error);
    return null;
  }
};

/**
 * Genera el HTML del PDF (mismo formato que PDFGenerator.jsx)
 */
const generateBonoPDFHTML = async (bono, cliente) => {
  const productoAplicable = parseProductSpecification(
    bono.PRODUCT_SPECIFICATION
  );

  const qrCodeDataURL = await generateQRCode(bono.ID_BONUS);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getEstadoLabel = (estado) => {
    const estados = {
      ACTIVO: "Activo",
      USADO: "Usado",
      VENCIDO: "Vencido",
    };
    return estados[estado] || estado;
  };

  // Crear elemento temporal
  const tempDiv = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.top = "-9999px";
  tempDiv.style.width = "210mm";
  tempDiv.style.minHeight = "297mm";
  tempDiv.style.padding = "20mm";
  tempDiv.style.backgroundColor = "#ffffff";
  tempDiv.style.fontFamily = "Arial, sans-serif";
  tempDiv.style.fontSize = "12px";
  tempDiv.style.lineHeight = "1.4";

  tempDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
      <h1 style="margin: 0 0 10px 0; font-size: 24px; color: #333; font-weight: bold;">
        BONO DE REENCAUCHE
      </h1>
      <p style="margin: 0; font-size: 14px; color: #666;">MISTOX</p>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 18px; margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
        Información del Bono
      </h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div><strong>Número de Factura:</strong><br/>${bono.INVOICENUMBER}</div>
        <div><strong>Estado:</strong><br/>${getEstadoLabel(bono.STATUS)}</div>
        <div><strong>Marca:</strong><br/>${productoAplicable.brand}</div>
        <div><strong>Tamaño:</strong><br/>${productoAplicable.size}</div>
        <div><strong>Diseño:</strong><br/>${productoAplicable.design}</div>
        <div><strong>Fecha de Emisión:</strong><br/>${formatDate(
          bono.createdAt
        )}</div>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 18px; margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
        Información del Cliente
      </h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div><strong>Nombre Completo:</strong><br/>${cliente.CUSTOMER_NAME} ${
    cliente.CUSTOMER_LASTNAME
  }</div>
        <div><strong>CI/RUC:</strong><br/>${
          cliente.CUSTOMER_IDENTIFICATION
        }</div>
        <div><strong>Correo Electrónico:</strong><br/>${
          cliente.CUSTOMER_EMAIL || "No registrado"
        }</div>
        <div><strong>Teléfono:</strong><br/>${
          cliente.CUSTOMER_PHONE || "No registrado"
        }</div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 40px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">Código QR de Verificación</h3>
      ${
        qrCodeDataURL
          ? `<img src="${qrCodeDataURL}" alt="Código QR del Bono" style="max-width: 150px; height: auto; border: 1px solid #ccc; border-radius: 4px;"/>`
          : ""
      }
      <p style="margin: 10px 0 0 0; font-size: 10px; color: #666;">
        Escanee este código para verificar la autenticidad del bono
      </p>
    </div>

    <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 15px;">
      <p style="margin: 0;">Este documento es generado automáticamente por el sistema de MISTOX</p>
      <p style="margin: 5px 0 0 0;">Fecha de generación: ${new Date().toLocaleString(
        "es-ES"
      )}</p>
    </div>
  `;

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
 * Genera y envía el PDF del bono por email y WhatsApp
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
