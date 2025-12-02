import React, { useState } from "react";
import styled from "styled-components";
import { useAppTheme } from "../../context/AppThemeContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import RenderIcon from "../../components/ui/RenderIcon";
import { api_bonos_createCustomer } from "../../api/bonos/apiBonos";
import { useAuth } from "../../context/AuthContext";
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

const FormularioNuevoCliente = ({ onClose, onClientCreated }) => {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    ciRuc: "",
    email: "",
    celular: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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

    // Validar nombres (mínimo 5 caracteres)
    if (!formData.nombre.trim()) {
      newErrors.nombre = "Los nombres son requeridos";
    } else if (formData.nombre.trim().length < 5) {
      newErrors.nombre = "Los nombres deben tener al menos 5 caracteres";
    }

    // Validar apellidos (mínimo 5 caracteres)
    if (!formData.apellido.trim()) {
      newErrors.apellido = "Los apellidos son requeridos";
    } else if (formData.apellido.trim().length < 5) {
      newErrors.apellido = "Los apellidos deben tener al menos 5 caracteres";
    }

    // Validar CI/RUC (10 o 13 caracteres)
    if (!formData.ciRuc.trim()) {
      newErrors.ciRuc = "El CI/RUC es requerido";
    } else {
      const ciRucLength = formData.ciRuc.trim().length;
      if (ciRucLength !== 10 && ciRucLength !== 13) {
        newErrors.ciRuc = "El CI/RUC debe tener 10 o 13 caracteres";
      }
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es requerido";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "El correo electrónico no es válido";
      }
    }

    // Validar celular (prefijo + número, mínimo 10 dígitos, máximo 15)
    if (!formData.celular.trim()) {
      newErrors.celular = "El número de celular es requerido";
    } else {
      const celularRegex = /^[0-9]{10,15}$/;
      if (!celularRegex.test(formData.celular.trim())) {
        newErrors.celular = "Ingrese prefijo y número (10-15 dígitos, sin +)";
      }
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
      const customerData = {
        CUSTOMER_NAME: formData.nombre.trim(),
        CUSTOMER_LASTNAME: formData.apellido.trim(),
        CUSTOMER_IDENTIFICATION: formData.ciRuc.trim(),
        CUSTOMER_EMAIL: formData.email.trim(),
        CUSTOMER_PHONE: formData.celular.trim(),
        ID_USER: user.ID_USER,
      };

      const response = await api_bonos_createCustomer(customerData);

      if (response.success) {
        setSubmitSuccess(true);
        toast.success(response.message || "Cliente creado exitosamente");

        // Notificar al componente padre que se creó un cliente
        if (onClientCreated) {
          onClientCreated(formData);
        }

        // Limpiar formulario después del éxito
        setTimeout(() => {
          setFormData({
            nombre: "",
            apellido: "",
            ciRuc: "",
            email: "",
            celular: "",
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
        throw new Error(response.message || "Error al crear el cliente");
      }
    } catch (error) {
      console.error("Error al crear cliente:", error);
      toast.error(
        error.message || "Error al crear el cliente. Intente nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      nombre: "",
      apellido: "",
      ciRuc: "",
      email: "",
      celular: "",
    });
    setErrors({});
    setSubmitSuccess(false);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <RenderIcon name="FaUserPlus" size={24} />
            Nuevo Cliente
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <RenderIcon name="FaTimes" size={16} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <Input
                label="Nombres *"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ingrese los nombres"
                errorMessage={errors.nombre}
                fullWidth
              />

              <Input
                label="Apellidos *"
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                placeholder="Ingrese los apellidos"
                errorMessage={errors.apellido}
                fullWidth
              />

              <Input
                label="CI/RUC *"
                type="text"
                name="ciRuc"
                value={formData.ciRuc}
                onChange={handleInputChange}
                placeholder="Ingrese el CI o RUC"
                errorMessage={errors.ciRuc}
                fullWidth
              />

              <Input
                label="Correo Electrónico *"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="ejemplo@correo.com"
                errorMessage={errors.email}
                fullWidth
              />

              <Input
                label="Número de Celular *"
                type="tel"
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                placeholder="593987654321 (prefijo + número, sin +)"
                errorMessage={errors.celular}
                fullWidth
                maxLength="15"
              />
            </FormGrid>

            {submitSuccess && (
              <SuccessMessage>✅ Cliente creado exitosamente.</SuccessMessage>
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
                text={isSubmitting ? "Creando..." : "Crear Cliente"}
                variant="solid"
                backgroundColor={theme.colors.primary}
                leftIconName="FaUserPlus"
                disabled={isSubmitting}
              />
            </FormActions>
          </form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FormularioNuevoCliente;
