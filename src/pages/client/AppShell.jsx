import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PageContainer from "../../components/layout/PageContainer";
import RenderIcon from "../../components/ui/RenderIcon";
import SEO from "../../components/seo/SEO";
import { toast } from "react-toastify";
import { ROUTES } from "../../constants/routes";
import { api_shell_createUser } from "../../api/shell/apiShell";
import { useAuth } from "../../context/AuthContext";

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
`;

const WelcomeTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 2rem;
    flex-direction: column;
  }
`;

const WelcomeSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
  line-height: 1.6;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const WelcomeDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
  margin: 1rem 0 0 0;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const FormSection = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
`;

const FormTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  text-align: center;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SubmitButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const AppShell = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    correo: "",
    fechaNacimiento: "",
    telefono: "",
  });
  const { user } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Formatear el teléfono: agregar +593 si no lo tiene
      let phone = formData.telefono.trim();
      if (phone && !phone.startsWith("+")) {
        if (phone.startsWith("0")) {
          phone = "+593" + phone.substring(1);
        } else {
          phone = "+593" + phone;
        }
      }

      // Obtener direcciones de MAXXIMUNDO y transformarlas al formato requerido
      // Solo incluir direcciones con TYPE "S"
      const direccionesMaxximundo = [];
      if (
        user?.DIRECCIONES?.MAXXIMUNDO &&
        Array.isArray(user.DIRECCIONES.MAXXIMUNDO)
      ) {
        user.DIRECCIONES.MAXXIMUNDO.forEach((direccion) => {
          if (direccion.TYPE === "S " || direccion.TYPE === "S") {
            direccionesMaxximundo.push({
              province: direccion.STATE || "",
              city: direccion.CITY || "",
              address: direccion.STREET || "",
              phone: phone,
              delivery_instructions: "",
            });
          }
        });
      }

      // Preparar los datos en el formato requerido por la API
      const userData = {
        name: formData.nombre.trim(),
        lastname: formData.apellido.trim(),
        card_id: formData.cedula.trim(),
        email: formData.correo.trim(),
        phone: phone,
        roleId: 1,
        birth_date: formData.fechaNacimiento,
        sap_code: user?.ACCOUNT_USER || "",
        direcciones: direccionesMaxximundo,
      };

      const response = await api_shell_createUser(userData);

      if (response.success) {
        toast.success(
          "¡Acceso a Lider Shell solicitado exitosamente! Te contactaremos pronto."
        );

        // Limpiar formulario
        setFormData({
          nombre: "",
          apellido: "",
          cedula: "",
          correo: "",
          fechaNacimiento: "",
          telefono: "",
        });
      } else {
        toast.error(response.message || "Error al procesar la solicitud");
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      toast.error(
        "Error al procesar la solicitud. Por favor, intenta nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Lider Shell - Únete a nuestra aplicación"
        description="Únete a Lider Shell para recompensarte por tus ventas. Llena el formulario para poder acceder a Lider Shell."
        keywords="lider shell, maxximundo, recompensas, ventas, aplicación móvil"
      />
      <PageContainer>
        <WelcomeSection>
          <WelcomeTitle>
            <img
              src={"/shell/ShellLogo.png"}
              style={{ objectFit: "cover", width: "50px" }}
              alt="Logo de Shell"
            />
            ¡Bienvenido!
          </WelcomeTitle>
          <WelcomeSubtitle>
            Únete a Lider Shell para recompensarte por tus ventas
          </WelcomeSubtitle>
          <WelcomeDescription>
            Llena el siguiente formulario para poder acceder a Lider Shell y
            comenzar a recibir recompensas por tus ventas.
          </WelcomeDescription>
        </WelcomeSection>

        <FormSection>
          <FormTitle>Formulario de Registro</FormTitle>
          <FormContainer onSubmit={handleSubmit}>
            <FormRow>
              <Input
                label="Nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ingresa tu nombre"
                required
                fullWidth
                leftIconName="FaUser"
              />

              <Input
                label="Apellido"
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                placeholder="Ingresa tu apellido"
                required
                fullWidth
                leftIconName="FaUser"
              />
            </FormRow>

            <Input
              label="Cédula"
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleInputChange}
              placeholder="Ingresa tu cédula"
              required
              fullWidth
              leftIconName="FaIdCard"
            />

            <Input
              label="Correo"
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
              placeholder="correo@ejemplo.com"
              required
              fullWidth
              leftIconName="FaEnvelope"
            />

            <Input
              label="Fecha de Nacimiento"
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleInputChange}
              required
              fullWidth
              leftIconName="FaCalendar"
            />

            <Input
              label="Teléfono"
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              placeholder="0999999999"
              required
              fullWidth
              leftIconName="FaPhone"
            />

            <SubmitButtonContainer>
              <Button
                type="submit"
                text={isSubmitting ? "Accediendo..." : "Acceder Lider Shell"}
                leftIconName="FaPaperPlane"
                disabled={isSubmitting}
                style={{ minWidth: "200px" }}
              />
              <Button
                type="button"
                text="Cancelar"
                variant="outlined"
                onClick={() => navigate(ROUTES.ECOMMERCE.HOME)}
                style={{ minWidth: "200px" }}
              />
            </SubmitButtonContainer>
          </FormContainer>
        </FormSection>
      </PageContainer>
    </>
  );
};

export default AppShell;
