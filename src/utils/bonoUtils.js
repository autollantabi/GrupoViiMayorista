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
 * Genera un código QR con los datos de la factura (obtiene el código del backend)
 */
const generateInvoiceQRCode = async (invoiceNumber, customerIdentification) => {
  try {
    console.log("🔍 Generando código QR para factura y cliente");
    console.log("📋 Invoice:", invoiceNumber);
    console.log("🆔 Customer ID:", customerIdentification);

    if (!invoiceNumber || !customerIdentification) {
      console.error("❌ Número de factura o cédula es undefined o null");
      return null;
    }

    // Llamar al backend para que genere el código QR con factura y cédula
    const response = await api_bonos_generateQR({
      invoiceNumber,
      customerIdentification,
    });

    console.log("📡 Respuesta del backend:", response);

    if (response.success && response.data.qrCode) {
      console.log("✅ Código QR obtenido exitosamente desde el backend");
      console.log("🔑 QR Code data:", response.data.qrCode);

      // Construir la URL completa de verificación
      const preUrl =
        import.meta.env.VITE_NODE_ENV === "production"
          ? import.meta.env.VITE_PRODUCTION_URL
          : import.meta.env.VITE_DEVELOPMENT_URL;
      const verificationUrl = `${preUrl}/reencauche/verificacion?data=${response.data.qrCode}`;

      console.log("🌐 URL de verificación:", verificationUrl);

      // Generar el código QR visualmente usando la librería qrcode
      const qrDataURL = await QRCode.toDataURL(verificationUrl, {
        width: 120,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      console.log("✅ QR de factura generado visualmente");
      console.log("📏 QR Data URL length:", qrDataURL.length);
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
 * Genera el HTML del PDF con múltiples bonos en formato de tarjetas
 */
const generateMultipleBonosPDFHTML = async (bonos, cliente, invoiceNumber) => {
  console.log("🔄 Iniciando generación de HTML para PDF múltiple");
  const qrCodeDataURL = await generateInvoiceQRCode(
    invoiceNumber,
    cliente.CUSTOMER_IDENTIFICATION
  );

  console.log(
    "📊 QR Code Data URL resultado:",
    qrCodeDataURL ? "✅ Generado" : "❌ Null/undefined"
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Generar HTML de tarjetas de bonos
  const bonosHTML = bonos
    .map((bono) => {
      const productoAplicable = parseProductSpecification(
        bono.PRODUCT_SPECIFICATION
      );

      return `
      <div style="
        width: 85mm;
        height: 45mm;
        border: 2px solid #1a1a1a;
        border-radius: 8px;
        padding: 3mm;
        background: #ffffff;
        box-sizing: border-box;
        page-break-inside: avoid;
        display: inline-block;
        margin: 2mm;
        vertical-align: top;
        position: relative;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      ">
        <!-- Encabezado del bono -->
        <div style="
          text-align: center; 
          background: #1a1a1a;
          color: white;
          padding: 2mm;
          margin: -3mm -3mm 2mm -3mm;
          border-radius: 6px 6px 0 0;
        ">
          <h3 style="margin: 0; font-size: 12px; font-weight: bold; letter-spacing: 0.5px;">BONO DE REENCAUCHE</h3>
          <p style="margin: 0; font-size: 8px; color: #FF6B35;">MISTOX</p>
        </div>
        
        <!-- ID del Bono -->
        <div style="
          text-align: center; 
          background: #FF6B35;
          color: white;
          padding: 1mm;
          margin-bottom: 2mm; 
          border-radius: 4px;
        ">
          <p style="margin: 0; font-size: 11px; font-weight: bold;">BONO #${
            bono.ID_BONUS
          }</p>
        </div>
        
        <!-- Información del producto -->
        <div style="margin-bottom: 1.5mm; font-size: 8px; line-height: 1.2;">
          <div style="margin-bottom: 1mm; display: flex; justify-content: space-between;">
            <span style="color: #1a1a1a; font-weight: bold;">Marca:</span>
            <span style="color: #333333;">${productoAplicable.brand}</span>
          </div>
          <div style="margin-bottom: 1mm; display: flex; justify-content: space-between;">
            <span style="color: #1a1a1a; font-weight: bold;">Tamaño:</span>
            <span style="color: #333333;">${productoAplicable.size}</span>
          </div>
          <div style="margin-bottom: 1mm; display: flex; justify-content: space-between;">
            <span style="color: #1a1a1a; font-weight: bold;">Diseño:</span>
            <span style="color: #333333;">${productoAplicable.design}</span>
          </div>
          ${
            bono.QUANTITY
              ? `<div style="margin-bottom: 1mm; display: flex; justify-content: space-between;"><span style="color: #1a1a1a; font-weight: bold;">Cantidad:</span><span style="color: #333333;">${bono.QUANTITY}</span></div>`
              : ""
          }
          ${
            bono.MASTER
              ? `<div style="margin-bottom: 1mm; display: flex; justify-content: space-between;"><span style="color: #1a1a1a; font-weight: bold;">Master:</span><span style="color: #333333;">${bono.MASTER}</span></div>`
              : ""
          }
          ${
            bono.ITEM
              ? `<div style="margin-bottom: 1mm; display: flex; justify-content: space-between;"><span style="color: #1a1a1a; font-weight: bold;">Item:</span><span style="color: #333333;">${bono.ITEM}</span></div>`
              : ""
          }
        </div>
        
        <!-- Fecha -->
        <div style="
          text-align: center; 
          font-size: 7px; 
          color: #666666;
          background: #F5F5F5;
          padding: 1mm;
          border-radius: 4px;
          border: 1px solid #DDDDDD;
        ">
          <p style="margin: 0;">Emisión: ${formatDate(bono.createdAt)}</p>
        </div>
      </div>
    `;
    })
    .join("");

  // Crear elemento temporal
  const tempDiv = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.top = "-9999px";
  tempDiv.style.width = "210mm";
  tempDiv.style.backgroundColor = "#ffffff";
  tempDiv.style.fontFamily = "Arial, sans-serif";
  tempDiv.style.padding = "10mm";

  tempDiv.innerHTML = `
    <!-- Cabecera compacta con datos del cliente y QR -->
    <div style="
      background: #ffffff;
      padding: 4mm;
      margin-bottom: 6mm;
      border-radius: 8px;
      border: 2px solid #FF6B35;
      page-break-after: avoid;
      box-shadow: 0 4px 15px rgba(44, 62, 80, 0.2);
    ">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1; color: white;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3mm;">
            <h2 style="
              margin: 0; 
              font-size: 16px; 
              color: #FF6B35;
              font-weight: bold;
              letter-spacing: 0.5px;
            ">
              📄 FACTURA: ${invoiceNumber}
            </h2>
            <div style="
              background: #FF6B35;
              color: white;
              padding: 2mm 4mm;
              border-radius: 6px;
              font-size: 10px;
              font-weight: bold;
              text-align: center;
            ">
              🎫 ${bonos.length} BONOS
            </div>
          </div>
          <div style="
            font-size: 9px; 
            line-height: 1.4;
            background: rgba(255, 107, 53, 0.1);
            padding: 3mm;
            border-radius: 6px;
            border: 1px solid rgba(255, 107, 53, 0.3);
          ">
            <div style="margin-bottom: 1.5mm; display: flex; align-items: center;">
              <span style="background: #FF6B35; border-radius: 50%; width: 4mm; height: 4mm; display: inline-flex; align-items: center; justify-content: center; margin-right: 2mm; font-size: 6px; color: white;">👤</span>
              <strong style="color: #FF6B35; padding-right: 2mm;">Cliente:</strong> <span style="color: #1a1a1a;">${
                cliente.CUSTOMER_NAME
              } ${cliente.CUSTOMER_LASTNAME}</span>
            </div>
            <div style="margin-bottom: 1.5mm; display: flex; align-items: center;">
              <span style="background: #FF6B35; border-radius: 50%; width: 4mm; height: 4mm; display: inline-flex; align-items: center; justify-content: center; margin-right: 2mm; font-size: 6px; color: white;">🆔</span>
              <strong style="color: #FF6B35; padding-right: 2mm;">CI/RUC:</strong> <span style="color: #1a1a1a;">${
                cliente.CUSTOMER_IDENTIFICATION
              }</span>
            </div>
            <div style="margin-bottom: 1.5mm; display: flex; align-items: center;">
              <span style="background: #FF6B35; border-radius: 50%; width: 4mm; height: 4mm; display: inline-flex; align-items: center; justify-content: center; margin-right: 2mm; font-size: 6px; color: white;">📧</span>
              <strong style="color: #FF6B35; padding-right: 2mm;">Email:</strong> <span style="color: #1a1a1a;">${
                cliente.CUSTOMER_EMAIL || "No registrado"
              }</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="background: #FF6B35; border-radius: 50%; width: 4mm; height: 4mm; display: inline-flex; align-items: center; justify-content: center; margin-right: 2mm; font-size: 6px; color: white;">📱</span>
              <strong style="color: #FF6B35; padding-right: 2mm;">Teléfono:</strong> <span style="color: #1a1a1a;">${
                cliente.CUSTOMER_PHONE || "No registrado"
              }</span>
            </div>
          </div>
        </div>
        <div style="text-align: center; margin-left: 8mm;">
          ${
            qrCodeDataURL
              ? `
            <div style="background: white; padding: 2mm; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid #FF6B35;">
              <img src="${qrCodeDataURL}" alt="Código QR" style="width: 30mm; height: 30mm; border-radius: 4px;"/>
              <p style="margin: 1mm 0 0 0; font-size: 7px; color: #000; font-weight: bold;">QR VERIFICACIÓN</p>
            </div>
          `
              : `
            <div style="
              width: 30mm; 
              height: 30mm; 
              border: 2px dashed #FF6B35; 
              border-radius: 8px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              background: rgba(255, 107, 53, 0.1);
            ">
              <p style="margin: 0; font-size: 7px; color: #FF6B35; text-align: center; font-weight: bold;">QR<br/>No disponible</p>
            </div>
            <p style="margin: 1mm 0 0 0; font-size: 7px; color: #FF6B35; font-weight: bold;">QR VERIFICACIÓN</p>
          `
          }
        </div>
      </div>
    </div>

    <!-- Grid de bonos -->
    <div style="text-align: center;">
      ${bonosHTML}
    </div>


    <!-- Footer -->
    <div style="
      margin-top: 8mm; 
      text-align: center; 
      font-size: 9px; 
      color: #4A5568;
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      border-radius: 12px;
      padding: 6mm;
      border: 1px solid #e2e8f0;
      page-break-inside: avoid;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    ">
      <p style="margin: 0; display: flex; align-items: center; justify-content: center; gap: 2mm;">
        🏢 <strong>Este documento es generado automáticamente por el sistema de MISTOX</strong>
      </p>
      <p style="margin: 2mm 0 0 0; display: flex; align-items: center; justify-content: center; gap: 2mm;">
        🕒 Fecha de generación: ${new Date().toLocaleString("es-ES")}
      </p>
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

    // Generar canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    // Generar PDF
    const imgData = canvas.toDataURL("image/jpeg", 0.9);
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Agregar primera página
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Agregar páginas adicionales si es necesario
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
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
