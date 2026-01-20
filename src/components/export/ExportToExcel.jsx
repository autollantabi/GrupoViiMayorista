import React, { useState } from "react";
import styled from "styled-components";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Button from "../ui/Button";
import { getBonoStateLabel } from "../../constants/bonoStates";
import RenderIcon from "../ui/RenderIcon";

const ExportButton = styled.div`
  display: inline-block;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 450px;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ModalDescription = styled.p`
  margin: 0 0 20px 0;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.95rem;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  font-weight: 500;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.primary}10;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const OptionContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const OptionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
`;

const OptionText = styled.div`
  text-align: left;
`;

const OptionTitle = styled.div`
  font-weight: 600;
  margin-bottom: 2px;
`;

const OptionSubtitle = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

/**
 * Componente para exportar datos de bonos a Excel
 * @param {Object} props
 * @param {Array} props.data - Array de facturas con bonos
 * @param {string} props.fileName - Nombre del archivo (sin extensión)
 * @param {string} props.buttonText - Texto del botón
 * @param {string} props.buttonIcon - Icono del botón
 * @param {string} props.variant - Variante del botón
 * @param {string} props.size - Tamaño del botón
 * @param {string} props.backgroundColor - Color de fondo del botón
 */
const ExportToExcel = ({
  data = [],
  fileName = "bonos_reencauche",
  buttonText = "Exportar a Excel",
  buttonIcon = "FaFileExcel",
  variant = "solid",
  size = "medium",
  backgroundColor,
}) => {
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const filterDataByDateRange = (days) => {
    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - days));

    return data
      .map((grupo) => ({
        ...grupo,
        bonuses: grupo.bonuses.filter((bono) => {
          const bonoDate = new Date(bono.updatedAt || bono.createdAt);
          return bonoDate >= cutoffDate;
        }),
      }))
      .filter((grupo) => grupo.bonuses.length > 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExport = async (dateRangeOption) => {
    if (!data || data.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }

    try {
      setExporting(true);
      setShowModal(false);

      // Filtrar datos según la opción seleccionada
      let filteredData = data;
      let rangeLabel = "";

      if (dateRangeOption === "week") {
        filteredData = filterDataByDateRange(7);
        rangeLabel = "ultima_semana";
      } else if (dateRangeOption === "month") {
        filteredData = filterDataByDateRange(30);
        rangeLabel = "ultimo_mes";
      } else if (dateRangeOption === "3months") {
        filteredData = filterDataByDateRange(90);
        rangeLabel = "ultimos_3_meses";
      }

      if (filteredData.length === 0) {
        console.warn("No hay datos en el rango seleccionado");
        setExporting(false);
        return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Portal Mayorista";
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet("Bonos Reencauche", {
        views: [{ state: "frozen", xSplit: 0, ySplit: 1 }],
      });

      // Definir columnas (sin información del cliente ni número de factura)
      worksheet.columns = [
        { header: "N° Bono", key: "bonoNumber", width: 12 },
        { header: "Estado", key: "status", width: 12 },
        { header: "Marca", key: "brand", width: 15 },
        { header: "Aro/Rin", key: "size", width: 12 },
        { header: "Diseño", key: "design", width: 20 },
        { header: "Master", key: "master", width: 15 },
        { header: "Item", key: "item", width: 15 },
        { header: "Factura Reencauche", key: "retreadInvoice", width: 20 },
        { header: "Mayorista", key: "businessPartner", width: 30 },
        { header: "RUC Mayorista", key: "businessPartnerRuc", width: 18 },
        { header: "Email Mayorista", key: "businessPartnerEmail", width: 30 },
        { header: "Fecha Creación", key: "createdAt", width: 18 },
        { header: "Fecha Actualización", key: "updatedAt", width: 18 },
      ];

      // Estilo del encabezado
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1e40af" },
      };
      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      worksheet.getRow(1).height = 25;

      // Agregar datos (sin información del cliente ni número de factura)
      filteredData.forEach((grupo) => {
        grupo.bonuses.forEach((bono) => {
          worksheet.addRow({
            bonoNumber: bono.ID_BONUS || "N/A",
            status: getBonoStateLabel(bono.STATUS),
            brand: bono.parsedProduct?.BRAND || "N/A",
            size: bono.parsedProduct?.SIZE || "N/A",
            design: bono.parsedProduct?.DESIGN || "N/A",
            master: bono.MASTER || "N/A",
            item: bono.ITEM || "N/A",
            retreadInvoice: bono.RETREADINVOICE || "N/A",
            businessPartner: grupo.businessPartner?.NAME_USER || "N/A",
            businessPartnerRuc: grupo.businessPartner?.ACCOUNT_USER || "N/A",
            businessPartnerEmail: grupo.businessPartner?.EMAIL || "N/A",
            createdAt: formatDate(bono.createdAt),
            updatedAt: formatDate(bono.updatedAt),
          });
        });
      });

      // Aplicar bordes a todas las celdas con datos
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFD1D5DB" } },
            left: { style: "thin", color: { argb: "FFD1D5DB" } },
            bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
            right: { style: "thin", color: { argb: "FFD1D5DB" } },
          };

          // Alineación para celdas de datos
          if (rowNumber > 1) {
            cell.alignment = { vertical: "middle", horizontal: "left" };
          }
        });
      });

      // Aplicar colores alternados a las filas
      const rowCount = worksheet.rowCount;
      for (let i = 2; i <= rowCount; i = i + 1) {
        const row = worksheet.getRow(i);
        if (i % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" },
          };
        }
      }

      // Generar el archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Descargar el archivo
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const finalFileName = rangeLabel
        ? `${fileName}_${rangeLabel}_${timestamp}.xlsx`
        : `${fileName}_${timestamp}.xlsx`;
      saveAs(blob, finalFileName);

    } catch (error) {
      console.error("Error al exportar a Excel:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <ExportButton>
        <Button
          text={exporting ? "Exportando..." : buttonText}
          leftIconName={buttonIcon}
          onClick={() => setShowModal(true)}
          disabled={exporting || !data || data.length === 0}
          variant={variant}
          size={size}
          backgroundColor={backgroundColor}
        />
      </ExportButton>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <RenderIcon name="FaCalendarAlt" size={24} />
                Seleccionar Rango de Fecha
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <RenderIcon name="FaXmark" size={16} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <ModalDescription>
                Elige el período de tiempo para exportar los bonos:
              </ModalDescription>

              <OptionsContainer>
                <OptionButton onClick={() => handleExport("week")}>
                  <OptionContent>
                    <OptionIcon>
                      <RenderIcon name="FaCalendarWeek" size={20} />
                    </OptionIcon>
                    <OptionText>
                      <OptionTitle>Última Semana</OptionTitle>
                      <OptionSubtitle>Últimos 7 días</OptionSubtitle>
                    </OptionText>
                  </OptionContent>
                  <RenderIcon name="FaChevronRight" size={16} />
                </OptionButton>

                <OptionButton onClick={() => handleExport("month")}>
                  <OptionContent>
                    <OptionIcon>
                      <RenderIcon name="FaCalendar" size={20} />
                    </OptionIcon>
                    <OptionText>
                      <OptionTitle>Último Mes</OptionTitle>
                      <OptionSubtitle>Últimos 30 días</OptionSubtitle>
                    </OptionText>
                  </OptionContent>
                  <RenderIcon name="FaChevronRight" size={16} />
                </OptionButton>

                <OptionButton onClick={() => handleExport("3months")}>
                  <OptionContent>
                    <OptionIcon>
                      <RenderIcon name="FaCalendarDay" size={20} />
                    </OptionIcon>
                    <OptionText>
                      <OptionTitle>Últimos 3 Meses</OptionTitle>
                      <OptionSubtitle>Últimos 90 días</OptionSubtitle>
                    </OptionText>
                  </OptionContent>
                  <RenderIcon name="FaChevronRight" size={16} />
                </OptionButton>
              </OptionsContainer>
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={() => setShowModal(false)}>
                Cancelar
              </CancelButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default ExportToExcel;
