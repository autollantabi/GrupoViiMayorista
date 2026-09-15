import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useAppTheme } from "../../context/AppThemeContext";
import Button from "../../components/ui/Button";
import RenderIcon from "../../components/ui/RenderIcon";
import {
  api_bonos_getEligibleProducts,
  api_bonos_createBonus,
  api_bonos_updateMasterItem,
  api_bonos_generateQRMaster,
} from "../../api/bonos/apiBonos";
import { ROUTES } from "../../constants/routes";
import { toast } from "react-toastify";

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
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  z-index: 1001;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  z-index: 10;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.1rem;
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
  padding: 16px;
  overflow-y: auto;
  flex: 1;
`;

const HintText = styled.p`
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.85rem;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 820px;
`;

const Thead = styled.thead`
  background-color: ${({ theme }) => theme.colors.background};
  position: sticky;
  top: 0;
`;

const Th = styled.th`
  text-align: left;
  padding: 10px 8px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: ${({ theme }) => theme.colors.textLight};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: middle;
`;

const Tr = styled.tr`
  ${({ $error, theme }) =>
    $error &&
    `background-color: ${theme.colors.error}10;`}

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const BrandCell = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
`;

const RinCell = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const CellInput = styled.input`
  width: 100%;
  min-width: 90px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FechaCell = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
  white-space: nowrap;
`;

const IncluirCheckbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;

const RowErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.7rem;
  margin-top: 2px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  position: sticky;
  bottom: 0;
  z-index: 10;
  gap: 12px;
  flex-wrap: wrap;
`;

const SelectionSummary = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const FooterActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

/**
 * Dado un diseño elegible, resuelve la medida (RINSIZE) que el backend
 * requiere para validar la combinación BRAND/SIZE/DESIGN/RINSIZE contra el
 * maestro de llantas. El diseño y la medida no se seleccionan manualmente:
 * se auto-resuelven a partir del catálogo elegible.
 */
const resolveRinsize = (eligibleCatalog, brand, rin, design) => {
  const catalogEntries = eligibleCatalog.filter(
    (p) => p.BRAND === brand && p.SIZE === rin
  );

  for (const entry of catalogEntries) {
    const designSizes = entry?.DESIGNS?.[design];
    if (!Array.isArray(designSizes)) continue;

    const match = designSizes.find(
      (s) => typeof s === "string" && s.trim().endsWith(rin)
    );
    if (match) {
      const escapedRin = rin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const measure = match.replace(new RegExp(`\\s*${escapedRin}$`), "").trim();
      if (measure) return measure;
    }
  }

  return null;
};

const groupKeyOf = (entry) =>
  `${entry.BRAND}|${entry.SIZE}|${entry.DESIGN}|${entry.ENTERPRISE}`;

/**
 * Expande el desglose de disponibilidad (uno por marca/rin/diseño, con un
 * conteo agregado) en N filas individuales -- una por cada bono disponible,
 * cada una representando cantidad 1. Se genera una sola vez, al abrir el
 * modal (ver useState perezoso más abajo): los ids son estables durante toda
 * la sesión, así que activar una fila nunca desordena ni borra los datos que
 * el usuario ya escribió en otras filas del mismo grupo.
 */
const buildUnitRows = (breakdown) => {
  const expanded = [];

  (breakdown || []).forEach((entry) => {
    const available = Number(entry.AVAILABLE_BONUSES ?? 0);
    const groupKey = groupKeyOf(entry);

    for (let i = 0; i < available; i++) {
      expanded.push({
        id: `${groupKey}__${i}`,
        groupKey,
        BRAND: entry.BRAND,
        SIZE: entry.SIZE,
        DESIGN: entry.DESIGN,
        ENTERPRISE: entry.ENTERPRISE,
      });
    }
  });

  return expanded.sort(
    (a, b) => a.BRAND.localeCompare(b.BRAND) || a.SIZE.localeCompare(b.SIZE)
  );
};

const DEFAULT_ROW_INPUT = { maestro: "", item: "", selected: false };

const todayLabel = () => {
  const date = new Date();
  const monthNames = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

const FormularioNuevoBonoLista = ({
  onClose,
  onBonoCreated,
  bonosDisponiblesData,
  mayoristaUserId,
}) => {
  const { theme } = useAppTheme();

  // Se genera una sola vez, a partir de la disponibilidad con la que se abrió
  // el modal (useState perezoso: no se recalcula si bonosDisponiblesData
  // cambia de referencia por un refetch del padre mientras el modal sigue
  // abierto). Cada fila = un bono disponible individual (cantidad 1).
  const [rows, setRows] = useState(() =>
    buildUnitRows(bonosDisponiblesData?.BREAKDOWN_BY_DESIGN)
  );
  const [eligibleCatalog, setEligibleCatalog] = useState([]);
  const [rowInputs, setRowInputs] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fechaHoy = useMemo(() => todayLabel(), []);

  useEffect(() => {
    const fetchEligible = async () => {
      try {
        const resp = await api_bonos_getEligibleProducts();
        setEligibleCatalog(resp.success && Array.isArray(resp.data) ? resp.data : []);
      } catch {
        setEligibleCatalog([]);
      }
    };
    fetchEligible();
  }, []);

  const getRowInput = (key) => rowInputs[key] || DEFAULT_ROW_INPUT;

  const updateRowInput = (key, patch) => {
    setRowInputs((prev) => ({
      ...prev,
      [key]: { ...getRowInput(key), ...patch },
    }));
    setRowErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const isRowComplete = (input) => !!input.maestro?.trim() && !!input.item?.trim();

  const selectedCount = rows.filter((row) => getRowInput(row.id).selected).length;

  const handleGuardarTodo = async () => {
    const selectedRows = rows.filter((row) => getRowInput(row.id).selected);

    if (selectedRows.length === 0) {
      toast.info("Seleccione al menos un bono completo para guardar");
      return;
    }

    setSaving(true);
    let successCount = 0;
    let failedCount = 0;
    const qrLinkCache = new Map();

    for (const row of selectedRows) {
      const key = row.id;
      const input = getRowInput(key);

      try {
        const rinsize = resolveRinsize(eligibleCatalog, row.BRAND, row.SIZE, row.DESIGN);
        if (!rinsize) {
          throw new Error("No se pudo resolver la medida para este producto");
        }

        const maestro = input.maestro.trim();

        const createResponse = await api_bonos_createBonus({
          ID_USER: mayoristaUserId,
          INVOICENUMBER: maestro,
          products: [
            {
              BRAND: row.BRAND,
              SIZE: row.SIZE,
              DESIGN: row.DESIGN,
              RINSIZE: rinsize,
              QUANTITY: 1,
            },
          ],
        });

        if (!createResponse.success) {
          throw new Error(createResponse.message || "Error al crear el bono");
        }

        const createdBonuses = createResponse.data?.bonuses || [];
        if (createdBonuses.length === 0) {
          throw new Error("No se pudo crear el bono");
        }

        let verifyUrl = qrLinkCache.get(maestro);
        if (verifyUrl === undefined) {
          const qrResponse = await api_bonos_generateQRMaster(maestro);
          verifyUrl =
            qrResponse.success && qrResponse.data?.qrCode
              ? `${window.location.origin}${
                  ROUTES.REENCAUCHE.VERIFICAR
                }?mstr=${encodeURIComponent(qrResponse.data.qrCode)}`
              : null;
          qrLinkCache.set(maestro, verifyUrl);
        }

        const updateResponse = await api_bonos_updateMasterItem(
          [
            {
              ID_BONUS: createdBonuses[0].ID_BONUS,
              MASTER: maestro,
              ITEM: input.item.trim(),
            },
          ],
          verifyUrl ? [verifyUrl] : ["N/A"]
        );

        if (!updateResponse.success) {
          throw new Error(
            updateResponse.message || "Error al activar el bono (master/item)"
          );
        }

        // La fila queda consumida: desaparece de la lista de disponibles.
        setRows((prev) => prev.filter((r) => r.id !== key));

        setRowInputs((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });

        successCount++;
      } catch (error) {
        console.error("Error activando bono:", error);
        failedCount++;
        setRowErrors((prev) => ({ ...prev, [key]: error.message || "Error al activar" }));
        setRowInputs((prev) => ({
          ...prev,
          [key]: { ...getRowInput(key), selected: false },
        }));
      }
    }

    setSaving(false);

    if (successCount > 0) {
      toast.success(`${successCount} bono(s) activado(s) correctamente`);
      if (onBonoCreated) {
        await onBonoCreated();
      }
    }
    if (failedCount > 0) {
      toast.error(`${failedCount} bono(s) no se pudieron activar`);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <RenderIcon name="FaTicket" size={18} />
            Nuevo Bono
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <RenderIcon name="FaXmark" size={14} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <HintText>
            Complete Maestro e Item para cada bono que desea activar, marque
            la casilla "ACTIVAR" y presione "Guardar" para activarlos todos
            en una sola acción.
          </HintText>

          {rows.length === 0 ? (
            <EmptyState>
              <RenderIcon name="FaBoxOpen" size={48} />
              <p>No tiene bonos disponibles para activar.</p>
            </EmptyState>
          ) : (
            <TableWrapper>
              <StyledTable>
                <Thead>
                  <tr>
                    <Th>Marca</Th>
                    <Th>Aro/Rin</Th>
                    <Th>Maestro *</Th>
                    <Th>Item *</Th>
                    <Th>Fecha</Th>
                    <Th>ACTIVAR</Th>
                  </tr>
                </Thead>
                <tbody>
                  {rows.map((row) => {
                    const key = row.id;
                    const input = getRowInput(key);
                    const complete = isRowComplete(input);

                    return (
                      <Tr key={key} $error={!!rowErrors[key]}>
                        <Td>
                          <BrandCell>{row.BRAND}</BrandCell>
                        </Td>
                        <Td>
                          <RinCell>{row.SIZE}</RinCell>
                        </Td>
                        <Td>
                          <CellInput
                            type="text"
                            placeholder="Maestro"
                            value={input.maestro}
                            onChange={(e) =>
                              updateRowInput(key, { maestro: e.target.value })
                            }
                            disabled={saving}
                          />
                        </Td>
                        <Td>
                          <CellInput
                            type="text"
                            placeholder="N° item"
                            value={input.item}
                            onChange={(e) =>
                              updateRowInput(key, { item: e.target.value })
                            }
                            disabled={saving}
                          />
                        </Td>
                        <Td>
                          <FechaCell>{fechaHoy}</FechaCell>
                        </Td>
                        <Td>
                          <IncluirCheckbox
                            type="checkbox"
                            checked={!!input.selected}
                            disabled={!complete || saving}
                            onChange={(e) =>
                              updateRowInput(key, { selected: e.target.checked })
                            }
                          />
                          {rowErrors[key] && (
                            <RowErrorText>{rowErrors[key]}</RowErrorText>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </StyledTable>
            </TableWrapper>
          )}
        </ModalBody>

        <ModalFooter>
          <SelectionSummary>
            {selectedCount} bono(s) seleccionado(s) para guardar
          </SelectionSummary>
          <FooterActions>
            <Button
              type="button"
              text="Cerrar"
              variant="outlined"
              onClick={onClose}
              disabled={saving}
              leftIconName="FaXmark"
            />
            <Button
              type="button"
              text={saving ? "Guardando..." : "Guardar"}
              variant="solid"
              backgroundColor={theme.colors.primary}
              leftIconName="FaSave"
              onClick={handleGuardarTodo}
              disabled={saving || selectedCount === 0}
            />
          </FooterActions>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FormularioNuevoBonoLista;
