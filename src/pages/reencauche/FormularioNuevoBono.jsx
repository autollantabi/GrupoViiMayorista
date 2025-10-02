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
import { generateAndSendBonoPDF } from "../../utils/bonoUtils";
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
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: visible;
  position: relative;
  z-index: 1001;
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
  font-size: 1.5rem;
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
  overflow: visible;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

const SuccessMessage = styled.div`
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.9rem;
  margin-top: 4px;
  text-align: center;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.success}20;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.success};
`;

const FormActions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 24px;
  flex-wrap: wrap;
`;

const ClientInfo = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ClientName = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const ClientCiRuc = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const FormularioNuevoBono = ({ selectedClient, onClose, onBonoCreated }) => {
  const { theme } = useAppTheme();
  const [formData, setFormData] = useState({
    brand: "",
    size: "",
    model: "",
    numeroFactura: "",
  });

  const [eligibleProducts, setEligibleProducts] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);

  const obtenerProductosEligibles = async () => {
    const response = await api_bonos_getEligibleProducts();
    setEligibleProducts(response.data);

    // Extraer opciones únicas para BRAND
    const uniqueBrands = [...new Set(response.data.map((p) => p.BRAND))];
    setBrandOptions(
      uniqueBrands.map((brand) => ({ label: brand, value: brand }))
    );
  };

  useEffect(() => {
    obtenerProductosEligibles();
  }, []);

  // Actualizar opciones de SIZE cuando se selecciona BRAND
  useEffect(() => {
    if (formData.brand && eligibleProducts.length > 0) {
      const filteredByBrand = eligibleProducts.filter(
        (p) => p.BRAND === formData.brand
      );
      const uniqueSizes = [...new Set(filteredByBrand.map((p) => p.SIZE))];
      setSizeOptions(uniqueSizes.map((size) => ({ label: size, value: size })));
    } else {
      setSizeOptions([]);
      setModelOptions([]);
    }
  }, [formData.brand, eligibleProducts]);

  // Actualizar opciones de DESIGN cuando se seleccionan BRAND y SIZE
  useEffect(() => {
    if (formData.brand && formData.size && eligibleProducts.length > 0) {
      const productMatch = eligibleProducts.find(
        (p) => p.BRAND === formData.brand && p.SIZE === formData.size
      );

      if (
        productMatch &&
        productMatch.DESIGNS &&
        Array.isArray(productMatch.DESIGNS)
      ) {
        setModelOptions(
          productMatch.DESIGNS.map((design) => ({
            label: design,
            value: design,
          }))
        );
      } else {
        setModelOptions([]);
      }
    } else {
      setModelOptions([]);
    }
  }, [formData.brand, formData.size, eligibleProducts]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Si cambia la marca, resetear size y design
    if (name === "brand") {
      setFormData((prev) => ({
        ...prev,
        brand: value,
        size: "",
        model: "",
      }));
    }
    // Si cambia el tamaño, resetear design
    else if (name === "size") {
      setFormData((prev) => ({
        ...prev,
        size: value,
        model: "",
      }));
    }
    // Para otros campos
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brand || formData.brand === "") {
      newErrors.brand = "La marca es requerida";
    }
    if (!formData.size || formData.size === "") {
      newErrors.size = "El tamaño es requerido";
    }
    if (!formData.model || formData.model === "") {
      newErrors.model = "El diseño es requerido";
    }
    if (!formData.numeroFactura || !formData.numeroFactura.trim()) {
      newErrors.numeroFactura = "El número de factura es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!selectedClient) {
        throw new Error("No se ha seleccionado un cliente");
      }

      // Verificar que el producto existe en los datos disponibles
      const productMatch = eligibleProducts.find(
        (p) => p.BRAND === formData.brand && p.SIZE === formData.size
      );

      if (!productMatch || !productMatch.DESIGNS.includes(formData.model)) {
        throw new Error("No se encontró el producto seleccionado");
      }

      const bonusData = {
        ID_CUSTOMERRETREAD: selectedClient.ID_CUSTOMERRETREAD,
        BRAND: formData.brand,
        SIZE: formData.size,
        DESIGN: formData.model,
        INVOICENUMBER: formData.numeroFactura.trim(),
      };

      const response = await api_bonos_createBonus(bonusData);

      if (response.success) {

        const bonoCreado = response.data;

        setSubmitSuccess(true);
        toast.success("Bono creado exitosamente");

        // Generar y enviar PDF automáticamente
        try {

          // Si el backend retorna un objeto con la propiedad 'bonus' o 'bono'
          const bonoRaw = bonoCreado.bonus || bonoCreado.bono || bonoCreado;

          // Asegurarnos de que el bono tenga todos los campos necesarios
          const bonoCompleto = {
            ID_BONUS: bonoRaw.ID_BONUS || bonoRaw.id,
            INVOICENUMBER: bonoRaw.INVOICENUMBER || formData.numeroFactura,
            STATUS: bonoRaw.STATUS || "ACTIVO",
            PRODUCT_SPECIFICATION:
              bonoRaw.PRODUCT_SPECIFICATION ||
              `${formData.brand};${formData.size};${formData.model}`,
            createdAt: bonoRaw.createdAt || new Date().toISOString(),
            ...bonoRaw,
          };

          const sendResponse = await generateAndSendBonoPDF(
            bonoCompleto,
            selectedClient
          );

          if (sendResponse.success) {
            toast.success("PDF del bono enviado por email y WhatsApp");
          } else {
            toast.warning("Bono creado pero hubo un error al enviar el PDF");
            console.error("Error al enviar PDF:", sendResponse.message);
          }
        } catch (pdfError) {
          console.error("=== Error al generar/enviar PDF ===");
          console.error("Error:", pdfError);
          console.error("Stack:", pdfError.stack);
          toast.warning(
            `Bono creado pero hubo un error al enviar el PDF: ${pdfError.message}`
          );
        }

        // Notificar al componente padre que se creó un bono
        if (onBonoCreated) {
          onBonoCreated({
            ...formData,
            cliente: {
              ID_CUSTOMERRETREAD: selectedClient.ID_CUSTOMERRETREAD,
              CUSTOMER_NAME: selectedClient.CUSTOMER_NAME,
              CUSTOMER_LASTNAME: selectedClient.CUSTOMER_LASTNAME,
              CUSTOMER_IDENTIFICATION: selectedClient.CUSTOMER_IDENTIFICATION,
            },
          });
        }

        // Limpiar formulario después del éxito
        setTimeout(() => {
          setFormData({
            brand: "",
            size: "",
            model: "",
            numeroFactura: "",
          });
          setSubmitSuccess(false);
          // Cerrar el modal después de 2 segundos
          if (onClose) {
            setTimeout(() => {
              onClose();
            }, 1000);
          }
        }, 2000);
      } else {
        throw new Error(response.message || "Error al crear el bono");
      }
    } catch (error) {
      console.error("Error al crear bono:", error);
      setErrors({ general: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      brand: "",
      size: "",
      model: "",
      numeroFactura: "",
    });
    setErrors({});
    setSubmitSuccess(false);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <RenderIcon name="FaTicketAlt" size={24} />
            {selectedClient
              ? `Nuevo Bono - ${selectedClient.CUSTOMER_NAME} ${selectedClient.CUSTOMER_LASTNAME}`
              : "Nuevo Bono"}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <RenderIcon name="FaTimes" size={16} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
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

          <form onSubmit={handleSubmit}>
            <FormGrid>
              <div>
                <Select
                  label="Marca *"
                  options={brandOptions}
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Seleccione la marca"
                  name="brand"
                  width="100%"
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
                  label="Tamaño *"
                  options={sizeOptions}
                  value={formData.size}
                  onChange={handleInputChange}
                  placeholder="Seleccione el tamaño"
                  name="size"
                  width="100%"
                  disabled={!formData.brand}
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
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="Seleccione el diseño"
                  name="model"
                  width="100%"
                  disabled={!formData.brand || !formData.size}
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

              <Input
                label="Número de Factura *"
                type="text"
                name="numeroFactura"
                value={formData.numeroFactura}
                onChange={handleInputChange}
                placeholder="Ingrese el número de factura"
                errorMessage={errors.numeroFactura}
                fullWidth
              />
            </FormGrid>

            {submitSuccess && (
              <SuccessMessage>✅ Bono creado exitosamente.</SuccessMessage>
            )}

            {errors.general && (
              <div
                style={{
                  color: theme.colors.error,
                  fontSize: "0.9rem",
                  marginTop: "4px",
                  textAlign: "center",
                  padding: "12px",
                  backgroundColor: theme.colors.error + "20",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.error}`,
                }}
              >
                ❌ {errors.general}
              </div>
            )}

            <FormActions>
              {onClose && (
                <Button
                  type="button"
                  text="Cancelar"
                  variant="outlined"
                  onClick={onClose}
                  leftIconName="FaTimes"
                />
              )}
              <Button
                type="submit"
                text={isSubmitting ? "Creando..." : "Crear Bono"}
                variant="solid"
                backgroundColor={theme.colors.primary}
                leftIconName="FaTicketAlt"
                disabled={isSubmitting}
              />
            </FormActions>
          </form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FormularioNuevoBono;
