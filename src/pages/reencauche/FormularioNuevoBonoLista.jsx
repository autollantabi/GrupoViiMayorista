import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppTheme } from "../../context/AppThemeContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import RenderIcon from "../../components/ui/RenderIcon";
import {
  api_bonos_getEligibleProducts,
  api_bonos_createBonus,
} from "../../api/bonos/apiBonos";
import { generateAndSendMultipleBonosPDF } from "../../utils/bonoUtils";
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
  max-width: ${({ $invoiceConfirmed }) =>
    $invoiceConfirmed ? "1100px" : "500px"};
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  z-index: 1001;
  transition: max-width 0.3s ease;
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
  display: grid;
  grid-template-columns: ${({ $invoiceConfirmed }) =>
    $invoiceConfirmed ? "1fr 1fr" : "1fr"};
  gap: 16px;
  overflow: hidden;
  flex: 1;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 8px;
  padding-bottom: 8px;

  /* Estilos del scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.textLight};
  }

  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.border}
    ${({ theme }) => theme.colors.background};
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  padding-left: 16px;
  overflow-y: auto;
  padding-right: 8px;

  /* Estilos del scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.textLight};
  }

  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.border}
    ${({ theme }) => theme.colors.background};

  @media (max-width: 968px) {
    border-left: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    padding-left: 0;
    padding-top: 16px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
`;

const ClientInfo = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ClientName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2px;
  font-size: 0.9rem;
`;

const ClientCiRuc = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const InvoiceNumberContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 10px 12px;
  border-radius: 6px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  margin-bottom: 12px;
`;

const InvoiceNumber = styled.div`
  font-size: 0.95rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 10px;

  @media (max-width: 568px) {
    grid-template-columns: 1fr;
  }
`;

const TireList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding-right: 4px;
  flex: 1;

  /* Estilos del scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.textLight};
  }

  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.border}
    ${({ theme }) => theme.colors.background};
`;

const TireItem = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  position: relative;
  padding: 20px 20px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }
`;

const TireInfo = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const TireField = styled.div`
  display: flex;
  flex-direction: column;
`;

const TireFieldLabel = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 2px;
  text-transform: uppercase;
  font-weight: 500;
`;

const TireFieldValue = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const TireActions = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  flex-direction: column;
  position: absolute;
  right: 5px;
  top: 5px;

  @media (min-width: 1200px) {
    flex-direction: row;
  }
`;

const StatusBadge = styled.span`
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
  background-color: ${({ status, theme }) => {
    if (status === "saved") return theme.colors.success + "20";
    if (status === "error") return theme.colors.error + "20";
    return theme.colors.warning + "20";
  }};
  color: ${({ status, theme }) => {
    if (status === "saved") return theme.colors.success;
    if (status === "error") return theme.colors.error;
    return theme.colors.warning;
  }};
  border: 1px solid
    ${({ status, theme }) => {
      if (status === "saved") return theme.colors.success;
      if (status === "error") return theme.colors.error;
      return theme.colors.warning;
    }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px 20px;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
`;

const FormActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
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

const FooterLeft = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const FooterRight = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const FormularioNuevoBonoLista = ({
  selectedClient,
  onClose,
  onBonoCreated,
  bonosDisponiblesData,
}) => {
  const { theme } = useAppTheme();

  // Estado para el número de factura
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceConfirmed, setInvoiceConfirmed] = useState(false);

  // Estado para el formulario de llanta
  const [tireForm, setTireForm] = useState({
    brand: "",
    size: "",
    model: "",
    measure: "",
    quantity: "1",
  });

  // Lista de llantas agregadas
  const [tireList, setTireList] = useState([]);

  // Estados para productos elegibles
  const [eligibleProducts, setEligibleProducts] = useState([]);
  const [eligibleCatalog, setEligibleCatalog] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [measureOptions, setMeasureOptions] = useState([]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar breakdown disponible desde bonos
  useEffect(() => {
    if (bonosDisponiblesData?.BREAKDOWN_BY_DESIGN) {
      setEligibleProducts(bonosDisponiblesData.BREAKDOWN_BY_DESIGN);
    } else {
      setEligibleProducts([]);
    }
  }, [bonosDisponiblesData]);

  // Cargar catálogo elegible desde API (base para selects)
  useEffect(() => {
    const fetchEligible = async () => {
      try {
        const resp = await api_bonos_getEligibleProducts();
        if (resp.success && Array.isArray(resp.data)) {
          setEligibleCatalog(resp.data);
          const uniqueBrands = [...new Set(resp.data.map((p) => p.BRAND))];
          setBrandOptions(uniqueBrands.map((b) => ({ label: b, value: b })));
        } else {
          setEligibleCatalog([]);
          setBrandOptions([]);
        }
      } catch (e) {
        setEligibleCatalog([]);
        setBrandOptions([]);
      }
    };
    fetchEligible();
  }, []);

  // Función para verificar si hay bonos disponibles para un producto específico
  // La medida es solo informativa, no afecta el conteo de disponibles
  const getAvailableBonusesForProduct = (brand, size, design) => {
    if (!bonosDisponiblesData?.BREAKDOWN_BY_DESIGN) return 0;

    const product = bonosDisponiblesData.BREAKDOWN_BY_DESIGN.find(
      (p) => p.BRAND === brand && p.SIZE === size && p.DESIGN === design
    );

    if (!product) return 0;

    const available = Number(product.AVAILABLE_BONUSES ?? 0);

    const usedInList = tireList
      .filter(
        (tire) =>
          tire.brand === brand && tire.size === size && tire.model === design
      )
      .reduce((sum, tire) => sum + tire.quantity, 0);

    return Math.max(0, available - usedInList);
  };

  // Actualizar opciones de SIZE cuando se selecciona BRAND (desde catálogo elegible)
  useEffect(() => {
    if (tireForm.brand && eligibleCatalog.length > 0) {
      const filteredByBrand = eligibleCatalog.filter(
        (p) => p.BRAND === tireForm.brand
      );
      const uniqueSizes = [...new Set(filteredByBrand.map((p) => p.SIZE))];
      setSizeOptions(uniqueSizes.map((size) => ({ label: size, value: size })));
    } else {
      setSizeOptions([]);
      setModelOptions([]);
      setMeasureOptions([]);
    }
  }, [tireForm.brand, eligibleCatalog]);

  // Actualizar opciones de DESIGN cuando se seleccionan BRAND y SIZE
  // Diseños base del catálogo, filtrados por disponibilidad (AVAILABLE_BONUSES > 0)
  useEffect(() => {
    if (tireForm.brand && tireForm.size) {
      const catalogByBrandSize = eligibleCatalog.filter(
        (p) => p.BRAND === tireForm.brand && p.SIZE === tireForm.size
      );
      const designsFromCatalog = new Set();
      catalogByBrandSize.forEach((item) => {
        const d = item?.DESIGNS || {};
        Object.keys(d).forEach((k) => designsFromCatalog.add(k));
      });

      const availableByBrandSize = eligibleProducts.filter(
        (p) =>
          p.BRAND === tireForm.brand &&
          p.SIZE === tireForm.size &&
          (p.AVAILABLE_BONUSES ?? 0) > 0
      );
      const availableDesigns = new Set(
        availableByBrandSize.map((p) => p.DESIGN)
      );

      const filteredDesigns = [...designsFromCatalog].filter((d) =>
        availableDesigns.has(d)
      );

      setModelOptions(
        filteredDesigns.map((design) => ({ label: design, value: design }))
      );
    } else {
      setModelOptions([]);
      setMeasureOptions([]);
    }
  }, [tireForm.brand, tireForm.size, eligibleCatalog, eligibleProducts]);

  // Actualizar opciones de MEASURE cuando se seleccionan BRAND, SIZE y MODEL
  // Priorizar DESIGNS[MODEL] del catálogo; fallback: RINSIZE del breakdown
  useEffect(() => {
    if (
      tireForm.brand &&
      tireForm.size &&
      tireForm.model &&
      (eligibleCatalog.length > 0 || eligibleProducts.length > 0)
    ) {
      // 1) Intentar construir opciones desde DESIGNS[model] del catálogo
      const catalogByBrandSize = eligibleCatalog.filter(
        (p) => p.BRAND === tireForm.brand && p.SIZE === tireForm.size
      );
      const sizesForDesign = catalogByBrandSize.flatMap((item) => {
        const map = item?.DESIGNS || {};
        const arr = map[tireForm.model];
        return Array.isArray(arr) ? arr : [];
      });
      if (sizesForDesign.length > 0) {
        const filteredByRin = sizesForDesign.filter(
          (s) => typeof s === "string" && s.trim().endsWith(tireForm.size)
        );

        const options = filteredByRin
          .map((s) => {
            const measure = s
              .replace(
                new RegExp(
                  `\\s*${tireForm.size.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`
                ),
                ""
              )
              .trim();
            return measure ? { label: measure, value: measure } : null;
          })
          .filter(Boolean);

        if (options.length > 0) {
          setMeasureOptions(options);
          return;
        }
      }

      // 2) Fallback: usar RINSIZE del breakdown si existe
      const filteredProduct = eligibleProducts.find(
        (p) =>
          p.BRAND === tireForm.brand &&
          p.SIZE === tireForm.size &&
          p.DESIGN === tireForm.model
      );

      if (filteredProduct && filteredProduct.RINSIZE) {
        setMeasureOptions([
          { label: filteredProduct.RINSIZE, value: filteredProduct.RINSIZE },
        ]);
      } else {
        setMeasureOptions([]);
      }
    } else {
      setMeasureOptions([]);
    }
  }, [
    tireForm.brand,
    tireForm.size,
    tireForm.model,
    eligibleCatalog,
    eligibleProducts,
  ]);

  // Actualizar el formulario cuando cambie la lista de llantas para recalcular disponibles
  useEffect(() => {
    // Si hay un producto seleccionado, recalcular los disponibles
    if (tireForm.brand && tireForm.size && tireForm.model) {
      const availableBonuses = getAvailableBonusesForProduct(
        tireForm.brand,
        tireForm.size,
        tireForm.model
      );

      // Si la cantidad actual excede los disponibles, ajustarla
      if (parseInt(tireForm.quantity) > availableBonuses) {
        setTireForm((prev) => ({
          ...prev,
          quantity: availableBonuses.toString(),
        }));
      }
    }
  }, [tireList, tireForm.brand, tireForm.size, tireForm.model]);

  const handleInvoiceSubmit = () => {
    if (!invoiceNumber.trim()) {
      setErrors({ invoice: "El número de factura es requerido" });
      return;
    }
    setInvoiceConfirmed(true);
    setErrors({});
  };

  const handleInvoiceChange = (e) => {
    setInvoiceNumber(e.target.value);
    if (errors.invoice) {
      setErrors((prev) => ({ ...prev, invoice: "" }));
    }
  };

  const handleTireInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "brand") {
      setTireForm((prev) => ({
        ...prev,
        brand: value,
        size: "",
        model: "",
        measure: "",
      }));
    } else if (name === "size") {
      setTireForm((prev) => ({
        ...prev,
        size: value,
        model: "",
        measure: "",
      }));
    } else if (name === "model") {
      setTireForm((prev) => ({
        ...prev,
        model: value,
        measure: "",
      }));
    } else {
      setTireForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateTireForm = () => {
    const newErrors = {};

    if (!tireForm.brand) newErrors.brand = "La marca es requerida";
    if (!tireForm.size) newErrors.size = "El Aro/Rin es requerido";
    if (!tireForm.model) newErrors.model = "El diseño es requerido";
    if (!tireForm.measure) newErrors.measure = "La medida es requerida";
    if (!tireForm.quantity || parseInt(tireForm.quantity) < 1) {
      newErrors.quantity = "La cantidad debe ser mayor a 0";
    } else {
      const availableBonuses = getAvailableBonusesForProduct(
        tireForm.brand,
        tireForm.size,
        tireForm.model
      );
      if (parseInt(tireForm.quantity) > availableBonuses) {
        newErrors.quantity = `La cantidad no puede ser mayor a ${availableBonuses} bonos disponibles`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTire = () => {
    if (!validateTireForm()) {
      return;
    }

    // Verificar si hay bonos disponibles para este producto
    const availableBonuses = getAvailableBonusesForProduct(
      tireForm.brand,
      tireForm.size,
      tireForm.model
    );
    if (availableBonuses <= 0) {
      toast.error(
        `No hay bonos disponibles para ${tireForm.brand} ${tireForm.size} ${tireForm.model}`
      );
      return;
    }

    const newTire = {
      id: Date.now(),
      brand: tireForm.brand,
      size: tireForm.size,
      model: tireForm.model,
      measure: tireForm.measure,
      quantity: parseInt(tireForm.quantity),
    };

    setTireList((prev) => [...prev, newTire]);

    // Limpiar formulario
    setTireForm({
      brand: "",
      size: "",
      model: "",
      measure: "",
      quantity: "1",
    });
    setErrors({});

    toast.success("Llanta agregada a la lista");
  };

  const handleRemoveTire = (tireId) => {
    setTireList((prev) => prev.filter((t) => t.id !== tireId));
    toast.info("Llanta eliminada de la lista");
  };

  const handleSaveAll = async () => {
    if (tireList.length === 0) {
      toast.info("No hay llantas para guardar");
      return;
    }

    if (!selectedClient) {
      toast.error("No se ha seleccionado un cliente");
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar el formato de productos
      const products = tireList.map((tire) => ({
        BRAND: tire.brand,
        SIZE: tire.size,
        DESIGN: tire.model,
        RINSIZE: tire.measure,
        QUANTITY: tire.quantity,
      }));

      // Crear el objeto de datos en el nuevo formato
      const bonusData = {
        ID_CUSTOMERRETREAD: selectedClient.ID_CUSTOMERRETREAD,
        INVOICENUMBER: invoiceNumber,
        products: products,
      };

      // Enviar todos los bonos en una sola petición
      const response = await api_bonos_createBonus(bonusData);

      if (response.success) {
        toast.success("Bonos creados exitosamente");

        // Obtener los bonos creados de la respuesta
        const bonosCreados = response.data.bonuses || response.data.data || [];

        // Notificar al componente padre
        if (onBonoCreated) {
          tireList.forEach((tire) => {
            onBonoCreated({
              ...tire,
              invoiceNumber,
              cliente: {
                ID_CUSTOMERRETREAD: selectedClient.ID_CUSTOMERRETREAD,
                CUSTOMER_NAME: selectedClient.CUSTOMER_NAME,
                CUSTOMER_LASTNAME: selectedClient.CUSTOMER_LASTNAME,
                CUSTOMER_IDENTIFICATION: selectedClient.CUSTOMER_IDENTIFICATION,
              },
            });
          });
        }

        // Generar y enviar PDF con todos los bonos
        if (bonosCreados.length > 0) {
          try {
            toast.info("Generando PDF con todos los bonos...");

            const sendResponse = await generateAndSendMultipleBonosPDF(
              bonosCreados,
              selectedClient,
              invoiceNumber
            );

            if (sendResponse.success) {
              toast.success(
                "PDF con todos los bonos enviado por email y WhatsApp"
              );
            } else {
              toast.warning(
                "Bonos creados pero hubo un error al enviar el PDF"
              );
            }
          } catch (pdfError) {
            console.error("Error al generar/enviar PDF:", pdfError);
            toast.warning("Bonos creados pero hubo un error al enviar el PDF");
          }
        }

        // Limpiar la lista y cerrar después de un delay
        setTimeout(() => {
          toast.success(`${products.length} bonos fueron creados exitosamente`);
          setTireList([]);
          if (onClose) {
            onClose();
          }
        }, 1500);
      } else {
        throw new Error(response.message || "Error al crear los bonos");
      }
    } catch (error) {
      console.error("Error al guardar los bonos:", error);
      toast.error(`Error al crear los bonos: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent
        $invoiceConfirmed={invoiceConfirmed}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader>
          <ModalTitle>
            <RenderIcon name="FaTicket" size={18} />
            Nuevo Bono
            {selectedClient &&
              ` - ${selectedClient.CUSTOMER_NAME} ${selectedClient.CUSTOMER_LASTNAME}`}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <RenderIcon name="FaXmark" size={14} />
          </CloseButton>
        </ModalHeader>

        <ModalBody $invoiceConfirmed={invoiceConfirmed}>
          {/* Columna Izquierda: Formulario */}
          <LeftColumn>
            {selectedClient && (
              <ClientInfo>
                <ClientName>
                  {selectedClient.CUSTOMER_NAME}{" "}
                  {selectedClient.CUSTOMER_LASTNAME}
                </ClientName>
                <ClientCiRuc>
                  CI/RUC: {selectedClient.CUSTOMER_IDENTIFICATION}
                </ClientCiRuc>
              </ClientInfo>
            )}

            {/* Sección 1: Número de Factura */}
            <Section>
              <SectionTitle>
                <RenderIcon name="FaFileInvoice" size={16} />
                Paso 1: Número de Factura
              </SectionTitle>

              {!invoiceConfirmed ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <Input
                    label="Número de Factura *"
                    type="text"
                    name="invoiceNumber"
                    value={invoiceNumber}
                    onChange={handleInvoiceChange}
                    placeholder="Ingrese el número de factura"
                    errorMessage={errors.invoice}
                    fullWidth
                  />
                  <FormActions>
                    <Button
                      type="button"
                      text="Confirmar Factura"
                      variant="solid"
                      backgroundColor={theme.colors.primary}
                      leftIconName="FaCheck"
                      onClick={handleInvoiceSubmit}
                    />
                  </FormActions>
                </div>
              ) : (
                <InvoiceNumberContainer>
                  <InvoiceNumber>
                    <RenderIcon name="FaFileInvoice" size={16} />
                    Factura: {invoiceNumber}
                  </InvoiceNumber>
                </InvoiceNumberContainer>
              )}
            </Section>

            {/* Sección 2: Agregar Llantas */}
            {invoiceConfirmed && (
              <Section>
                <SectionTitle>
                  <RenderIcon name="FaPlus" size={16} />
                  Paso 2: Agregar Llantas
                </SectionTitle>

                <FormGrid>
                  <div>
                    <Select
                      label="Marca *"
                      options={brandOptions}
                      value={tireForm.brand}
                      onChange={handleTireInputChange}
                      placeholder="Seleccione la marca"
                      name="brand"
                      width="100%"
                      maxHeight={200}
                      dropDirection="down"
                    />
                    {errors.brand && (
                      <div
                        style={{
                          color: theme.colors.error,
                          fontSize: "10px",
                          marginTop: "2px",
                        }}
                      >
                        {errors.brand}
                      </div>
                    )}
                  </div>

                  <div>
                    <Select
                      label="Aro/Rin *"
                      options={sizeOptions}
                      value={tireForm.size}
                      onChange={handleTireInputChange}
                      placeholder="Seleccione el Aro/Rin"
                      name="size"
                      width="100%"
                      maxHeight={200}
                      dropDirection="down"
                      disabled={!tireForm.brand}
                    />
                    {errors.size && (
                      <div
                        style={{
                          color: theme.colors.error,
                          fontSize: "10px",
                          marginTop: "2px",
                        }}
                      >
                        {errors.size}
                      </div>
                    )}
                  </div>

                  <div>
                    <Select
                      label="Diseño *"
                      options={modelOptions}
                      value={tireForm.model}
                      onChange={handleTireInputChange}
                      placeholder="Seleccione el diseño"
                      name="model"
                      withSearch={true}
                      width="100%"
                      maxHeight={200}
                      dropDirection="up"
                      disabled={!tireForm.brand || !tireForm.size}
                    />
                    {errors.model && (
                      <div
                        style={{
                          color: theme.colors.error,
                          fontSize: "10px",
                          marginTop: "2px",
                        }}
                      >
                        {errors.model}
                      </div>
                    )}
                  </div>

                  <div>
                    <Select
                      label="Medida *"
                      options={measureOptions}
                      value={tireForm.measure}
                      onChange={handleTireInputChange}
                      placeholder="Seleccione la medida"
                      name="measure"
                      withSearch={true}
                      width="100%"
                      maxHeight={200}
                      dropDirection="up"
                      disabled={
                        !tireForm.brand || !tireForm.size || !tireForm.model
                      }
                    />
                    {errors.measure && (
                      <div
                        style={{
                          color: theme.colors.error,
                          fontSize: "10px",
                          marginTop: "2px",
                        }}
                      >
                        {errors.measure}
                      </div>
                    )}
                  </div>

                  <Input
                    label={`Cantidad * (Disponibles: ${
                      tireForm.brand && tireForm.size && tireForm.model
                        ? getAvailableBonusesForProduct(
                            tireForm.brand,
                            tireForm.size,
                            tireForm.model
                          )
                        : 0
                    })`}
                    type="number"
                    name="quantity"
                    value={tireForm.quantity}
                    onChange={handleTireInputChange}
                    placeholder="Cantidad"
                    errorMessage={errors.quantity}
                    min="1"
                    max={
                      tireForm.brand && tireForm.size && tireForm.model
                        ? getAvailableBonusesForProduct(
                            tireForm.brand,
                            tireForm.size,
                            tireForm.model
                          )
                        : undefined
                    }
                    disabled={
                      !tireForm.brand || !tireForm.size || !tireForm.model
                    }
                    fullWidth
                  />
                </FormGrid>

                <FormActions>
                  <Button
                    type="button"
                    text="Agregar Llanta a la Lista"
                    variant="solid"
                    backgroundColor={theme.colors.success}
                    leftIconName="FaPlus"
                    onClick={handleAddTire}
                  />
                </FormActions>
              </Section>
            )}
          </LeftColumn>

          {/* Columna Derecha: Lista de Llantas */}
          {invoiceConfirmed && (
            <RightColumn>
              <SectionTitle>
                <RenderIcon name="FaList" size={16} />
                Llantas Agregadas ({tireList.length})
              </SectionTitle>

              {tireList.length === 0 ? (
                <EmptyState>
                  <RenderIcon name="FaBoxOpen" size={48} />
                  <p>
                    No hay llantas agregadas. Agregue llantas usando el
                    formulario de la izquierda.
                  </p>
                </EmptyState>
              ) : (
                <TireList>
                  {tireList.map((tire) => (
                    <TireItem key={tire.id}>
                      <TireInfo>
                        <TireField>
                          <TireFieldLabel>Marca</TireFieldLabel>
                          <TireFieldValue>{tire.brand}</TireFieldValue>
                        </TireField>
                        <TireField>
                          <TireFieldLabel>Aro/Rin</TireFieldLabel>
                          <TireFieldValue>{tire.size}</TireFieldValue>
                        </TireField>
                        <TireField>
                          <TireFieldLabel>Diseño</TireFieldLabel>
                          <TireFieldValue>{tire.model}</TireFieldValue>
                        </TireField>
                        <TireField>
                          <TireFieldLabel>Medida</TireFieldLabel>
                          <TireFieldValue>{tire.measure}</TireFieldValue>
                        </TireField>
                        <TireField>
                          <TireFieldLabel>Cantidad</TireFieldLabel>
                          <TireFieldValue>{tire.quantity}</TireFieldValue>
                        </TireField>
                        <TireField>
                          <TireFieldLabel>Bonos Disponibles</TireFieldLabel>
                          <TireFieldValue
                            style={{
                              color:
                                getAvailableBonusesForProduct(
                                  tire.brand,
                                  tire.size,
                                  tire.model
                                ) > 0
                                  ? theme.colors.success
                                  : theme.colors.error,
                              fontWeight: "bold",
                            }}
                          >
                            {getAvailableBonusesForProduct(
                              tire.brand,
                              tire.size,
                              tire.model
                            )}
                          </TireFieldValue>
                        </TireField>
                      </TireInfo>
                      <TireActions>
                        <Button
                          type="button"
                          variant="text"
                          color={theme.colors.error}
                          leftIconName="FaTrash"
                          onClick={() => handleRemoveTire(tire.id)}
                          disabled={isSubmitting}
                          size="small"
                        />
                      </TireActions>
                    </TireItem>
                  ))}
                </TireList>
              )}
            </RightColumn>
          )}
        </ModalBody>

        {/* Footer con acciones */}
        <ModalFooter>
          {tireList.length > 0 && (
            <Button
              type="button"
              text="Cancelar"
              variant="outlined"
              onClick={onClose}
              leftIconName="FaXmark"
              disabled={isSubmitting}
            />
          )}
          {tireList.length > 0 && (
            <Button
              type="button"
              text={isSubmitting ? "Guardando..." : "Guardar Todas"}
              variant="solid"
              backgroundColor={theme.colors.primary}
              leftIconName="FaSave"
              onClick={handleSaveAll}
              disabled={isSubmitting}
            />
          )}
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FormularioNuevoBonoLista;
