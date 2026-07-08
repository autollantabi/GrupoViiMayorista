import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { useAppTheme } from "../../context/AppThemeContext";
import PageContainer from "../../components/layout/PageContainer";
import DataTable from "../../components/ui/Table";
import DatePicker from "../../components/ui/DatePicker";
import Button from "../../components/ui/Button";
import RenderIcon from "../../components/ui/RenderIcon";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Importar los logos para las empresas (logo light como fue solicitado)
import MaxximundoLight from "../../assets/enterprises/MaxximundoLight.png";
import StoxLight from "../../assets/enterprises/StoxLight.png";
import IkonixLight from "../../assets/enterprises/IkonixLight.png";
import AutollantaLight from "../../assets/enterprises/AutollantaLight.png";

const COMPANY_LOGOS = {
  MAXXIMUNDO: MaxximundoLight,
  STOX: StoxLight,
  IKONIX: IkonixLight,
  AUTOLLANTA: AutollantaLight,
};

// Estilos premium
const Container = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
    gap: 1.5rem;
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PageTitle = styled.h1`
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.text} 0%, ${({ theme }) => theme.colors.primary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const PageSubtitle = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const ClientInfoBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  background: ${({ theme }) => theme.mode === "dark" ? `${theme.colors.surface}80` : theme.colors.white};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}20`};
  box-shadow: ${({ theme }) => theme.shadows.md};
  align-items: center;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  .icon-wrapper {
    background: ${({ theme }) => `${theme.colors.primary}15`};
    padding: 0.5rem;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .content {
    display: flex;
    flex-direction: column;
    span.label {
      font-size: 0.75rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    span.value {
      font-size: 0.95rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.text};
    }
  }
`;

const FiltersSection = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
  
  .filter-item-wrapper {
    width: 260px;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .select-label {
    text-align: left;
    font-size: clamp(0.85rem, 2vw, 0.95rem);
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }

  .select-input {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}20`};
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
    outline: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: ${({ theme }) => theme.mode === "dark" ? "0 2px 8px rgba(0, 0, 0, 0.1)" : "0 2px 8px rgba(0, 0, 0, 0.04)"};

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
    }
  }

  .button-group {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    .filter-item-wrapper {
      width: 100%;
    }
    .button-group {
      width: 100%;
      justify-content: flex-end;
    }
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
`;

const KPICard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  border: 1px solid ${({ theme }) => theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}20`};
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ $color, theme }) => $color || theme.colors.primary};
  }

  .icon-box {
    background: ${({ $bgColor }) => $bgColor || 'rgba(0, 0, 0, 0.05)'};
    padding: 0.75rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;

    .card-label {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-value {
      font-size: 1.35rem;
      font-weight: 800;
      color: ${({ theme }) => theme.colors.text};
    }
  }
`;

const TableCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}20`};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow-x: auto;

  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
  }
`;

const OwedFooterCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.primary}dd 100%);
  color: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 1.25rem 2rem;
  box-shadow: 0 8px 24px ${({ theme }) => `${theme.colors.primary}25`};
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1rem;

  .text-side {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    h3 {
      font-size: 1.25rem;
      font-weight: 800;
      margin: 0;
      color: #ffffff;
    }
    p {
      font-size: 0.9rem;
      opacity: 0.9;
      margin: 0;
      color: #f5f5f5;
    }
  }

  .amount-side {
    font-size: 2.25rem;
    font-weight: 900;
    color: #ffffff;
  }

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem;
    
    .amount-side {
      font-size: 1.85rem;
      align-self: flex-end;
    }
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}20`};
  box-shadow: ${({ theme }) => theme.shadows.md};
  text-align: center;
  gap: 1.25rem;
  animation: fadeIn 0.5s ease;
  
  h3 {
    font-size: 1.35rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }
  
  p {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 0;
    max-width: 400px;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Helper de formato de moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

// Helper de formato de fecha
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

// Datos simulados (mock data) organizados por empresa para evitar cruces
const mockInvoices = [
  {
    numero: "FAC-10045",
    empresa: "MAXXIMUNDO",
    fechaCreacion: "2026-05-10",
    fechaVencimiento: "2026-06-10",
    cuota: "1 de 1",
    valorCuota: 1500.00,
    abono: 1500.00,
    saldoCuota: 0.00,
    saldoFactura: 0.00,
    totalFactura: 1500.00,
    protesto: 0.00
  },
  {
    numero: "FAC-10082",
    empresa: "MAXXIMUNDO",
    fechaCreacion: "2026-06-01",
    fechaVencimiento: "2026-07-01",
    cuota: "1 de 2",
    valorCuota: 600.00,
    abono: 200.00,
    saldoCuota: 400.00,
    saldoFactura: 1000.00,
    totalFactura: 1200.00,
    protesto: 0.00
  },
  {
    numero: "FAC-10082",
    empresa: "MAXXIMUNDO",
    fechaCreacion: "2026-06-01",
    fechaVencimiento: "2026-08-01",
    cuota: "2 de 2",
    valorCuota: 600.00,
    abono: 0.00,
    saldoCuota: 600.00,
    saldoFactura: 1000.00,
    totalFactura: 1200.00,
    protesto: 0.00
  },
  {
    numero: "FAC-10115",
    empresa: "MAXXIMUNDO",
    fechaCreacion: "2026-06-12",
    fechaVencimiento: "2026-07-05",
    cuota: "1 de 1",
    valorCuota: 850.50,
    abono: 0.00,
    saldoCuota: 850.50,
    saldoFactura: 850.50,
    totalFactura: 850.50,
    protesto: 45.00
  },
  {
    numero: "FAC-20190",
    empresa: "STOX",
    fechaCreacion: "2026-07-01",
    fechaVencimiento: "2026-08-01",
    cuota: "1 de 1",
    valorCuota: 2100.00,
    abono: 500.00,
    saldoCuota: 1600.00,
    saldoFactura: 1600.00,
    totalFactura: 2100.00,
    protesto: 0.00
  },
  {
    numero: "FAC-30204",
    empresa: "IKONIX",
    fechaCreacion: "2026-07-05",
    fechaVencimiento: "2026-08-05",
    cuota: "1 de 2",
    valorCuota: 900.00,
    abono: 0.00,
    saldoCuota: 900.00,
    saldoFactura: 1800.00,
    totalFactura: 1800.00,
    protesto: 0.00
  },
  {
    numero: "FAC-30204",
    empresa: "IKONIX",
    fechaCreacion: "2026-07-05",
    fechaVencimiento: "2026-09-05",
    cuota: "2 de 2",
    valorCuota: 900.00,
    abono: 0.00,
    saldoCuota: 900.00,
    saldoFactura: 1800.00,
    totalFactura: 1800.00,
    protesto: 0.00
  },
  {
    numero: "FAC-40010",
    empresa: "AUTOLLANTA",
    fechaCreacion: "2026-06-20",
    fechaVencimiento: "2026-07-20",
    cuota: "1 de 1",
    valorCuota: 1250.00,
    abono: 250.00,
    saldoCuota: 1000.00,
    saldoFactura: 1000.00,
    totalFactura: 1250.00,
    protesto: 0.00
  }
];

export default function EstadoCuenta() {
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const navigate = useNavigate();

  // Establecer la fecha de corte por defecto como la fecha actual local
  const todayStr = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [cutoffDate, setCutoffDate] = useState(todayStr);
  const [selectedCompany, setSelectedCompany] = useState("");

  // Meta-información del informe (vendedor, fecha/hora) simulando llegada desde el endpoint
  const [reportMeta, setReportMeta] = useState({
    vendedorAsignado: "JOHANNA MARULANDA",
    fechaHoraInforme: new Date().toLocaleString("es-EC")
  });

  // Manejador para recargar la información (simulando petición al endpoint con la fecha de corte)
  const handleReload = () => {
    return new Promise((resolve) => {
      // Simular retraso de red
      setTimeout(() => {
        setReportMeta({
          vendedorAsignado: "JOHANNA MARULANDA",
          fechaHoraInforme: new Date().toLocaleString("es-EC")
        });
        resolve();
      }, 800);
    });
  };

  // Cargar imagen de forma asíncrona para jsPDF
  const loadImg = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  };

  // Generar y descargar el PDF según el template exacto
  const handleDownloadPdf = async () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");

      // 1. Cargar el logo de la empresa seleccionada en la esquina superior izquierda
      const logoUrl = COMPANY_LOGOS[selectedCompany];
      if (logoUrl) {
        const img = await loadImg(logoUrl);
        // Ajustar tamaño del logo
        doc.addImage(img, "PNG", 14, 10, 42, 12);
      }

      // 2. Título "Estado de cuenta por documentar para ventas" con línea divisoria
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);

      // Dibujar línea divisoria vertical naranja (color principal)
      doc.setDrawColor(253, 71, 3); // Orange
      doc.setLineWidth(1.5);
      doc.line(90, 10, 90, 22);

      doc.text("Estado de cuenta por documentar para ventas", 95, 18);

      // 3. Subcabecera con fechas
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Fecha de corte:", 14, 32);

      doc.setFont("helvetica", "normal");
      const formattedCorte = formatDate(cutoffDate);
      doc.text(formattedCorte, 42, 32);
      // Dibujar línea debajo del valor de fecha de corte
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.line(42, 33, 70, 33);

      doc.setFont("helvetica", "bold");
      doc.text("Fecha de Informe:", 135, 32);
      doc.setFont("helvetica", "normal");
      doc.text(reportMeta.fechaHoraInforme.split(" ")[0] || formattedCorte, 168, 32);

      doc.setFont("helvetica", "bold");
      doc.text("Hora de Informe:", 135, 38);
      doc.setFont("helvetica", "normal");
      doc.text(reportMeta.fechaHoraInforme.split(" ")[1] || "10:11:23", 168, 38);

      // 4. Panel de Información del Cliente
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("ZONA: L1", 14, 48);

      doc.setFontSize(11);
      doc.text(`${user?.ACCOUNT_USER || "C2101109292001"} - ${user?.NAME_USER || "ANGULO BONILLA VIVIANA CAROLINA"}`, 14, 55);

      // Obtener dirección y ciudad dinámicas del usuario (clasificación PRINCIPAL)
      const addresses = user?.DIRECCIONES?.[selectedCompany] || [];
      const principalAddr = addresses.find(
        (addr) => addr.CLASIFICATION?.trim().toUpperCase() === "PRINCIPAL"
      );
      const targetAddr = principalAddr || addresses[0] || null;
      const directionStr = targetAddr?.STREET || "No disponible";
      const cityStr = targetAddr?.CITY || "No disponible";

      // Obtener teléfono dinámico del usuario
      const phones = user?.TELEFONOS?.[selectedCompany] || [];
      const predetPhone = phones.find(
        (p) => p.PREDETERMINED || p.PHONE_TYPE?.trim().toUpperCase() === "PRINCIPAL"
      );
      const targetPhone = predetPhone || phones[0];
      const phoneStr = targetPhone?.PHONE_NUMBER || "No disponible";

      doc.setFontSize(9);
      doc.text("Teléfono:", 14, 63);
      doc.setFont("helvetica", "normal");
      doc.text(phoneStr, 32, 63);

      doc.setFont("helvetica", "bold");
      doc.text("Dirección:", 14, 69);
      doc.setFont("helvetica", "normal");
      doc.text(directionStr, 32, 69);

      doc.setFont("helvetica", "bold");
      doc.text("Vendedor:", 115, 63);
      doc.setFont("helvetica", "normal");
      doc.text(reportMeta.vendedorAsignado, 135, 63);

      doc.setFont("helvetica", "bold");
      doc.text("Ciudad:", 115, 69);
      doc.setFont("helvetica", "normal");
      doc.text(cityStr, 135, 69);

      // Subtítulo
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(253, 71, 3); // orange
      doc.text("DETALLE DE FACTURA", 14, 78);

      // 5. Tabla de contenido
      const headers = [
        ["Número", "Creación", "Vencimiento", "Días Ven.", "Cuota", "Valor cuota", "Abono", "Saldo Cuota", "Saldo Factura", "Total Factura", "Protesto"]
      ];

      const body = processedData.map(item => [
        item.numero,
        formatDate(item.fechaCreacion),
        formatDate(item.fechaVencimiento),
        item.diasVencidos,
        item.cuota.replace(" de ", "/").split("/")[0] || item.cuota, // Mostrar cuota de forma corta "1"
        formatCurrency(item.valorCuota).replace("US$", ""),
        formatCurrency(item.abono).replace("US$", ""),
        formatCurrency(item.saldoCuota).replace("US$", ""),
        formatCurrency(item.saldoFactura).replace("US$", ""),
        formatCurrency(item.totalFactura).replace("US$", ""),
        formatCurrency(item.protesto).replace("US$", "")
      ]);

      // Añadir filas de totales
      const totalValorCuota = processedData.reduce((sum, item) => sum + item.valorCuota, 0);
      const totalAbono = processedData.reduce((sum, item) => sum + item.abono, 0);
      const totalSaldoCuota = processedData.reduce((sum, item) => sum + item.saldoCuota, 0);

      body.push([
        "TOTAL FACTURA", "", "", "", "",
        formatCurrency(totalValorCuota).replace("US$", ""),
        formatCurrency(totalAbono).replace("US$", ""),
        formatCurrency(totalSaldoCuota).replace("US$", ""),
        "", "", ""
      ]);

      body.push([
        `TOTAL ${user?.NAME_USER || "ANGULO BONILLA VIVIANA CAROLINA"}`, "", "", "", "",
        formatCurrency(totalValorCuota).replace("US$", ""),
        formatCurrency(totalAbono).replace("US$", ""),
        formatCurrency(totalSaldoCuota).replace("US$", ""),
        "", "", ""
      ]);

      body.push([
        "TOTAL L1", "", "", "", "",
        formatCurrency(totalValorCuota).replace("US$", ""),
        formatCurrency(totalAbono).replace("US$", ""),
        formatCurrency(totalSaldoCuota).replace("US$", ""),
        "", "", ""
      ]);

      autoTable(doc, {
        startY: 82,
        head: headers,
        body: body,
        theme: "striped",
        alternateRowStyles: { fillColor: [220, 220, 220] },
        styles: { fontSize: 7.5, cellPadding: 1.5, font: "helvetica" },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 26 }, // Número
          1: { cellWidth: 16 }, // Creación
          2: { cellWidth: 16 }, // Vencimiento
          3: { cellWidth: 12, halign: "center" }, // Días Ven.
          4: { cellWidth: 10, halign: "center" }, // Cuota
          5: { cellWidth: 18, halign: "right" }, // Valor cuota
          6: { cellWidth: 16, halign: "right" }, // Abono
          7: { cellWidth: 18, halign: "right" }, // Saldo Cuota
          8: { cellWidth: 18, halign: "right" }, // Saldo Factura
          9: { cellWidth: 18, halign: "right" }, // Total Factura
          10: { cellWidth: 15, halign: "right" } // Protesto
        },
        didParseCell: function (data) {
          if (data.row.section === 'body') {
            const rawVal = data.row.cells[0]?.raw;
            const cellString = typeof rawVal === "string" ? rawVal : String(rawVal || "");

            if (cellString.startsWith("TOTAL")) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.textColor = [0, 0, 0];
              data.cell.styles.border = { top: { width: 0.5, color: [0, 86, 179] } };
              data.cell.styles.fillColor = [255, 255, 255];
            } else {
              data.cell.styles.textColor = [220, 53, 69];
            }
          }
        }
      });

      // Footer con número de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Impreso por SAP Business One", 14, 287);
        doc.text(`Página ${i} de ${pageCount}`, 180, 287);
      }

      doc.save(`Estado_de_Cuenta_${selectedCompany}_${formattedCorte}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
    }
  };

  // Filtrar y calcular la información según la fecha de corte y la empresa seleccionada
  const processedData = useMemo(() => {
    if (!cutoffDate || !selectedCompany) return [];

    const targetDate = new Date(cutoffDate);
    targetDate.setHours(23, 59, 59, 999);

    return mockInvoices
      .filter((item) => {
        const itemDate = new Date(item.fechaCreacion);
        return item.empresa === selectedCompany && itemDate <= targetDate;
      })
      .map((item) => {
        // Calcular días vencidos con respecto a la fecha de corte (firmados, según template)
        const dueDate = new Date(item.fechaVencimiento);
        const cutDate = new Date(cutoffDate);
        const timeDiff = cutDate.getTime() - dueDate.getTime();
        const diasVencidos = Math.floor(timeDiff / (1000 * 3600 * 24));

        return {
          ...item,
          diasVencidos
        };
      });
  }, [cutoffDate, selectedCompany]);

  // Cálculos de totales consolidados para las tarjetas KPI
  const kpiTotals = useMemo(() => {
    return processedData.reduce(
      (acc, item) => {
        acc.totalValorCuota += item.valorCuota;
        acc.totalAbono += item.abono;
        acc.totalSaldoCuota += item.saldoCuota;
        acc.totalProtesto += item.protesto;
        if (item.diasVencidos > 0 && item.saldoCuota > 0) {
          acc.documentosVencidos += 1;
        }
        return acc;
      },
      {
        totalValorCuota: 0,
        totalAbono: 0,
        totalSaldoCuota: 0,
        totalProtesto: 0,
        documentosVencidos: 0,
      }
    );
  }, [processedData]);

  // Columnas para DataTable (Visualización estándar de la página, sin alteración de colores de fila)
  const columns = useMemo(() => [
    {
      header: "Número",
      field: "numero",
      sortable: true
    },
    {
      header: "Creación",
      field: "fechaCreacion",
      sortable: true,
      dataType: "date",
      render: (row) => formatDate(row.fechaCreacion)
    },
    {
      header: "Vencimiento",
      field: "fechaVencimiento",
      sortable: true,
      dataType: "date",
      render: (row) => formatDate(row.fechaVencimiento)
    },
    {
      header: "Días Ven.",
      field: "diasVencidos",
      sortable: true,
      dataType: "number",
      align: "center",
      render: (row) => (
        <span style={{
          color: row.diasVencidos > 0 ? (theme.mode === "dark" ? "#ff5722" : "#dc3545") : "inherit",
          fontWeight: row.diasVencidos > 0 ? "700" : "500"
        }}>
          {row.diasVencidos}
        </span>
      )
    },
    {
      header: "Cuota",
      field: "cuota",
      sortable: false
    },
    {
      header: "Valor cuota",
      field: "valorCuota",
      sortable: true,
      dataType: "number",
      align: "right",
      render: (row) => formatCurrency(row.valorCuota)
    },
    {
      header: "Abono",
      field: "abono",
      sortable: true,
      dataType: "number",
      align: "right",
      render: (row) => formatCurrency(row.abono)
    },
    {
      header: "Saldo Cuota",
      field: "saldoCuota",
      sortable: true,
      dataType: "number",
      align: "right",
      render: (row) => (
        <span style={{
          fontWeight: row.saldoCuota > 0 ? "700" : "400",
          color: row.saldoCuota > 0 ? (theme.mode === "dark" ? "#ff5722" : "#fd4703") : "inherit"
        }}>
          {formatCurrency(row.saldoCuota)}
        </span>
      )
    },
    {
      header: "Saldo Factura",
      field: "saldoFactura",
      sortable: true,
      dataType: "number",
      align: "right",
      render: (row) => formatCurrency(row.saldoFactura)
    },
    {
      header: "Total Factura",
      field: "totalFactura",
      sortable: true,
      dataType: "number",
      align: "right",
      render: (row) => formatCurrency(row.totalFactura)
    },
    {
      header: "Protesto",
      field: "protesto",
      sortable: true,
      dataType: "number",
      align: "right",
      render: (row) => (
        <span style={{
          color: row.protesto > 0 ? (theme.mode === "dark" ? "#ff5722" : "#dc3545") : "inherit",
          fontWeight: row.protesto > 0 ? "700" : "400"
        }}>
          {formatCurrency(row.protesto)}
        </span>
      )
    }
  ], [theme.mode]);

  return (
    <PageContainer
      backButtonText="Volver al Inicio"
      backButtonOnClick={() => navigate("/")}
    >
      <Container>
        <TitleSection>
          <PageTitle>Estado de Cuenta</PageTitle>
          <PageSubtitle>Visualiza detalladamente el estado financiero y las facturas pendientes de tu cuenta.</PageSubtitle>
        </TitleSection>

        <ClientInfoBar>
          <InfoItem>
            <div className="icon-wrapper">
              <RenderIcon name="FaUser" size={18} color={theme.colors.primary} />
            </div>
            <div className="content">
              <span className="label">Cliente</span>
              <span className="value">{user?.NAME_USER || user?.EMAIL || "Consumidor Final"}</span>
            </div>
          </InfoItem>
          <InfoItem>
            <div className="icon-wrapper">
              <RenderIcon name="FaIdCard" size={18} color={theme.colors.primary} />
            </div>
            <div className="content">
              <span className="label">Código de Socio</span>
              <span className="value">{user?.ACCOUNT_USER || "No disponible"}</span>
            </div>
          </InfoItem>
          <InfoItem>
            <div className="icon-wrapper">
              <RenderIcon name="FaUserTie" size={18} color={theme.colors.primary} />
            </div>
            <div className="content">
              <span className="label">Vendedor Asignado</span>
              <span className="value">{reportMeta.vendedorAsignado}</span>
            </div>
          </InfoItem>
          <InfoItem>
            <div className="icon-wrapper">
              <RenderIcon name="FaClock" size={18} color={theme.colors.primary} />
            </div>
            <div className="content">
              <span className="label">Fecha y Hora de Informe</span>
              <span className="value">{reportMeta.fechaHoraInforme}</span>
            </div>
          </InfoItem>
        </ClientInfoBar>

        <FiltersSection>
          <div className="filter-item-wrapper">
            <DatePicker
              label="Fecha de Corte"
              value={cutoffDate}
              onChange={(e) => setCutoffDate(e.target.value)}
              fullWidth
            />
          </div>

          <div className="filter-item-wrapper">
            <label className="select-label">Empresa</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="select-input"
            >
              <option value="">Seleccione una empresa...</option>
              {user?.EMPRESAS?.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              )) || (
                  <>
                    <option value="MAXXIMUNDO">MAXXIMUNDO</option>
                    <option value="STOX">STOX</option>
                    <option value="IKONIX">IKONIX</option>
                    <option value="AUTOLLANTA">AUTOLLANTA</option>
                  </>
                )}
            </select>
          </div>

          <div className="button-group">
            <Button
              text="Recargar"
              onClick={handleReload}
              variant="outlined"
              leftIconName="FaRotate"
              iconSize={16}
              disabled={!selectedCompany}
            />
            <Button
              text="Descargar PDF"
              onClick={handleDownloadPdf}
              variant="solid"
              leftIconName="FaFilePdf"
              iconSize={16}
              disabled={!selectedCompany || processedData.length === 0}
            />
          </div>
        </FiltersSection>

        {!selectedCompany ? (
          <EmptyStateContainer>
            <RenderIcon name="FaBuilding" size={48} color={theme.colors.primary} />
            <h3>Selecciona una Empresa</h3>
            <p>Por favor selecciona una empresa de la lista para cargar su estado de cuenta correspondiente.</p>
          </EmptyStateContainer>
        ) : (
          <>
            <CardsGrid>
              <KPICard $color={theme.colors.primary} $bgColor={`${theme.colors.primary}15`}>
                <div className="icon-box">
                  <RenderIcon name="FaFileInvoiceDollar" size={24} color={theme.colors.primary} />
                </div>
                <div className="card-content">
                  <span className="card-label">Total Valor Cuota</span>
                  <span className="card-value">{formatCurrency(kpiTotals.totalValorCuota)}</span>
                </div>
              </KPICard>

              <KPICard $color={theme.colors.success} $bgColor={`${theme.colors.success}15`}>
                <div className="icon-box">
                  <RenderIcon name="FaHandHoldingDollar" size={24} color={theme.colors.success} />
                </div>
                <div className="card-content">
                  <span className="card-label">Total Abonos</span>
                  <span className="card-value">{formatCurrency(kpiTotals.totalAbono)}</span>
                </div>
              </KPICard>

              <KPICard $color={theme.colors.error} $bgColor={`${theme.colors.error}15`}>
                <div className="icon-box">
                  <RenderIcon name="FaTriangleExclamation" size={24} color={theme.colors.error} />
                </div>
                <div className="card-content">
                  <span className="card-label">Total Protestos</span>
                  <span className="card-value">{formatCurrency(kpiTotals.totalProtesto)}</span>
                </div>
              </KPICard>

              <KPICard $color={theme.colors.warning} $bgColor={`${theme.colors.warning}15`}>
                <div className="icon-box">
                  <RenderIcon name="FaClock" size={24} color={theme.colors.warning} />
                </div>
                <div className="card-content">
                  <span className="card-label">Doc. Vencidos</span>
                  <span className="card-value">{kpiTotals.documentosVencidos}</span>
                </div>
              </KPICard>
            </CardsGrid>

            <TableCard>
              <DataTable
                columns={columns}
                data={processedData}
                emptyMessage="No se encontraron facturas o cuotas creadas antes de la fecha de corte seleccionada para esta empresa."
                itemsPerPage={10}
                initialSortField="fechaCreacion"
                initialSortDirection="desc"
              />
            </TableCard>

            <OwedFooterCard>
              <div className="text-side">
                <h3>Resumen Total a Pagar</h3>
                <p>Suma consolidada de saldos pendientes de cuotas registradas hasta el corte ({cutoffDate ? formatDate(cutoffDate) : "-"}).</p>
              </div>
              <div className="amount-side">
                {formatCurrency(kpiTotals.totalSaldoCuota)}
              </div>
            </OwedFooterCard>
          </>
        )}
      </Container>
    </PageContainer>
  );
}
