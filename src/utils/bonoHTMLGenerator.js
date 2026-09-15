import { parseProductSpecification } from "./bonoUtils";

/**
 * Genera el HTML de una tarjeta de bono, con aspecto de ticket/voucher: un
 * encabezado con la marca del sistema y el número de bono, y un cuerpo con
 * solo los 4 datos que identifican la activación (Marca, Aro/Rin, Master,
 * Item) -- ni Diseño ni Cantidad se muestran en el detalle.
 */
export const generateBonoCard = (bono) => {
  const productoAplicable = parseProductSpecification(
    bono.PRODUCT_SPECIFICATION
  );

  return `
    <div class="bono-card">
      <div class="bono-card-header">
        <div class="bono-brand">
          <div class="bono-title">BONO DE REENCAUCHE</div>
          <div class="bono-subtitle">MISTOX</div>
        </div>
        <div class="bono-id-badge">
          <span class="bono-id-label">Bono</span>
          <span class="bono-id-number">#${bono.ID_BONUS}</span>
        </div>
      </div>

      <div class="bono-divider"></div>

      <div class="bono-info-grid">
        <div class="info-cell">
          <span class="info-label">Marca</span>
          <span class="info-value brand">${productoAplicable.brand}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Aro/Rin</span>
          <span class="info-value size">${productoAplicable.size}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Master</span>
          <span class="info-value master">${bono.MASTER || "N/A"}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Item</span>
          <span class="info-value item">${bono.ITEM || "N/A"}</span>
        </div>
      </div>
    </div>
  `;
};

/**
 * Genera el HTML del header de una página
 */
export const generatePageHeader = (
  invoiceNumber,
  bonos,
  cliente,
  qrCodeDataURL,
  formatDate
) => {
  const fechaEmision = formatDate(bonos[0]?.createdAt || new Date());

  return `
    <div class="header">
      <div class="header-content">
        <div class="header-info" style="width: 100%;">
          <div class="invoice-title">FACTURA: ${invoiceNumber}</div>
          <div style="display: flex; gap: 3mm; align-items: center; margin-bottom: 3mm;">
            <div class="bono-count">🎫 ${bonos.length} BONOS</div>
            <div class="emission-date">📅 Emisión: ${fechaEmision}</div>
          </div>
          ${
            cliente
              ? `
          <div class="client-info">
            <div class="client-row">
              <span class="client-label" style="color: #fd4703;">Cliente:</span>
              <span class="client-value">${cliente.CUSTOMER_NAME} ${
                  cliente.CUSTOMER_LASTNAME
                }</span>
            </div>
            <div class="client-row">
              <span class="client-label" style="color: #fd4703;">CI/RUC:</span>
              <span class="client-value">${
                cliente.CUSTOMER_IDENTIFICATION
              }</span>
            </div>
            <div class="client-row">
              <span class="client-label" style="color: #fd4703;">Email:</span>
              <span class="client-value">${
                cliente.CUSTOMER_EMAIL || "No registrado"
              }</span>
            </div>
            <div class="client-row">
              <span class="client-label" style="color: #fd4703;">Teléfono:</span>
              <span class="client-value">${
                cliente.CUSTOMER_PHONE || "No registrado"
              }</span>
            </div>
          </div>
          `
              : ""
          }
        </div>
      </div>
    </div>
  `;
};

/**
 * Genera el HTML del footer de una página
 */
export const generatePageFooter = (pageIndex, totalPages) => {
  return `
    <div class="footer">
      <div class="footer-content">
        <div class="footer-text">
          🏢 <strong>Sistema MISTOX - Página ${
            pageIndex + 1
          } de ${totalPages}</strong>
        </div>
        <div class="footer-date">
          🕒 ${new Date().toLocaleString("es-ES")}
        </div>
      </div>
    </div>
  `;
};

/**
 * Genera el HTML de una página completa con bonos
 */
export const generateBonoPage = (
  bonosPage,
  pageIndex,
  totalPages,
  invoiceNumber,
  bonos,
  cliente,
  qrCodeDataURL,
  formatDate
) => {
  // Una tarjeta por fila: al agrandar el diseño tipo ticket, ya no entran
  // dos tarjetas una junto a otra sin verse apretadas.
  const bonosInRows = bonosPage.map((bono) => [bono]);

  const bonosRowsHTML = bonosInRows
    .map(
      (row) => `
    <div class="bono-row">
      ${row.map((bono) => generateBonoCard(bono)).join("")}
    </div>
  `
    )
    .join("");

  // Solo aplicar page-break-after si no es la última página
  const pageBreakStyle =
    pageIndex < totalPages - 1 ? "page-break-after: always;" : "";

  return `
    <div class="page-container" style="${pageBreakStyle}">
      ${generatePageHeader(
        invoiceNumber,
        bonos,
        cliente,
        qrCodeDataURL,
        formatDate
      )}
      
      <div class="content">
        ${bonosRowsHTML}
      </div>
      
      ${generatePageFooter(pageIndex, totalPages)}
    </div>
  `;
};

/**
 * Genera el HTML completo para visualización (con estilos embebidos)
 */
export const generateCompleteBonosHTML = async (
  bonos,
  cliente,
  invoiceNumber,
  qrCodeDataURL
) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Tarjetas más grandes (tipo ticket) => menos bonos entran por página A4.
  const bonosPerPage = 3;

  // Dividir bonos en páginas
  const bonosPages = [];
  for (let i = 0; i < bonos.length; i += bonosPerPage) {
    bonosPages.push(bonos.slice(i, i + bonosPerPage));
  }

  // Generar todas las páginas
  const pagesHTML = bonosPages
    .map((bonosPage, index) =>
      generateBonoPage(
        bonosPage,
        index,
        bonosPages.length,
        invoiceNumber,
        bonos,
        cliente,
        qrCodeDataURL,
        formatDate
      )
    )
    .join("");

  // Usar la plantilla directamente como string para evitar problemas de fetch en producción con rutas de /src
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bonos - Factura ${invoiceNumber}</title>
          <meta charset="UTF-8" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #f1f5f9; font-family: Arial, sans-serif; padding: 10px; margin: 0; }
            @page { size: A4; margin: 8mm 15mm 15mm 15mm; }
            .page-container { width: 210mm; height: 297mm; background: white; margin: 10px auto; padding: 8mm 15mm 15mm 15mm; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; box-sizing: border-box; }
            .header { background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 4mm; border-bottom: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); position: relative; overflow: hidden; flex-shrink: 0; }
            .header-content { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; }
            .header-info { flex: 1; }
            .invoice-title { font-size: 14px; color: #1e293b; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; margin: 0 0 3mm 0; }
            .bono-count { background: linear-gradient(135deg, #fd4703 0%, #c93602 100%); color: white; padding: 1.5mm 3mm; border-radius: 6px; font-size: 8px; font-weight: 700; text-align: center; box-shadow: 0 2px 8px rgba(253, 71, 3, 0.3); display: inline-block; }
            .client-info { font-size: 7px; line-height: 1.3; background: rgba(248, 250, 252, 0.8); padding: 2mm; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 2mm; }
            .client-row { margin-bottom: 1mm; display: flex; align-items: center; }
            .client-row:last-child { margin-bottom: 0; }
            .client-icon { width: 4mm; height: 4mm; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 2mm; font-size: 6px; color: white; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2); }
            .client-label { font-weight: 700; margin-right: 2mm; font-size: 7px; }
            .client-value { font-weight: 600; color: #1e293b; font-size: 7px; }
            .emission-date { background: linear-gradient(135deg, #fd4703 0%, #c93602 100%); color: white; padding: 1.5mm 3mm; border-radius: 6px; font-size: 8px; font-weight: 700; text-align: center; box-shadow: 0 2px 8px rgba(253, 71, 3, 0.3); display: inline-block; }
            .content { padding: 4mm; flex: 1; display: flex; flex-direction: column; gap: 6mm; overflow: hidden; }
            .bono-row { display: flex; justify-content: center; align-items: flex-start; width: 100%; }
            .bono-card { width: 100%; max-width: 175mm; min-height: 55mm; margin: 0 auto; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 1px solid #e2e8f0; border-radius: 14px; box-sizing: border-box; position: relative; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04); border-left: 6mm solid #fd4703; flex-shrink: 0; overflow: hidden; }
            .bono-card-header { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 5mm 6mm; }
            .bono-title { margin: 0; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
            .bono-subtitle { margin: 1mm 0 0 0; font-size: 10px; color: #94a3b8; font-weight: 500; letter-spacing: 1px; }
            .bono-id-badge { text-align: right; }
            .bono-id-label { display: block; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #cbd5e1; }
            .bono-id-number { display: block; font-size: 26px; font-weight: 800; color: #fd7e33; letter-spacing: 0.5px; }
            .bono-divider { border-top: 2px dashed #e2e8f0; margin: 0 6mm; }
            .bono-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm 8mm; padding: 6mm; }
            .info-cell { display: flex; flex-direction: column; gap: 1.5mm; }
            .info-label { color: #64748b; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-value { color: #1e293b; font-weight: 700; padding: 2mm 3mm; border-radius: 6px; font-size: 18px; }
            .info-value.brand { background: rgba(253, 71, 3, 0.12); }
            .info-value.size { background: rgba(253, 71, 3, 0.08); }
            .info-value.master { background: rgba(248, 249, 250, 0.9); }
            .info-value.item { background: rgba(253, 71, 3, 0.06); }
            .footer { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 2.5mm; border-top: 1px solid #cbd5e1; box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05); position: relative; overflow: hidden; flex-shrink: 0; }
            .footer-content { text-align: center; font-size: 7px; color: #64748b; position: relative; z-index: 1; }
            .footer-text { margin: 0; display: flex; align-items: center; justify-content: center; gap: 2mm; font-weight: 600; }
            .footer-date { margin: 1mm 0 0 0; display: flex; align-items: center; justify-content: center; gap: 2mm; font-weight: 500; }
            @media print { body { background: white; padding: 0; } .page-container { margin: 0; box-shadow: none; border-radius: 0; } }
          </style>
        </head>
        <body>
          ${pagesHTML}
        </body>
      </html>
    `;
};
