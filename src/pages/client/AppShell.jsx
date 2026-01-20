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

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  padding: 3rem 2rem;
  background: ${({ theme }) =>
    theme.mode === "dark" ? theme.colors.surface : "#ffffff"};
  border-radius: 20px;
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.2)"
      : "0 4px 20px rgba(0, 0, 0, 0.06)"};
  animation: fadeInUp 0.6s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    margin-bottom: 3rem;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const LogoImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 16px;
  padding: 0.5rem;
  background: ${({ theme }) =>
    theme.mode === "dark" ? theme.colors.background : "#f8fafc"};
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}30` : `${theme.colors.border}20`};
`;

const WelcomeTitle = styled.h1`
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 800;
  margin: 0 0 1rem 0;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const WelcomeSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  margin: 0 0 1rem 0;
  line-height: 1.6;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const WelcomeDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(0.95rem, 1.5vw, 1.05rem);
  margin: 0;
  line-height: 1.7;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const FormSection = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 3rem 2.5rem;
  background: ${({ theme }) =>
    theme.mode === "dark" ? theme.colors.surface : "#ffffff"};
  border-radius: 20px;
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.2)"
      : "0 4px 20px rgba(0, 0, 0, 0.06)"};
  animation: fadeInUp 0.6s ease-out 0.2s backwards;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const FormTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(1.5rem, 3vw, 1.8rem);
  font-weight: 700;
  margin: 0 0 2rem 0;
  text-align: center;
  letter-spacing: -0.01em;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.75rem;
  }
`;

const SubmitButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
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
        <Container>
          <WelcomeSection>
            <LogoContainer>
              <LogoImage
                src={"/shell/ShellLogo.png"}
                alt="Logo de Shell"
              />
            </LogoContainer>
            <WelcomeTitle>¡Bienvenido a Club Shell Maxx!</WelcomeTitle>
            <WelcomeSubtitle>
              Únete para recompensarte por tus compras
            </WelcomeSubtitle>
            <WelcomeDescription>
              Completa el siguiente formulario para acceder a Club Shell Maxx y
              comenzar a ganar recompensas, descuentos exclusivos y premios increíbles
              por cada compra que realices.
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
                text={isSubmitting ? "Procesando..." : "Registrarse"}
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
        </Container>
      </PageContainer>
    </>
  );
};

export default AppShell;
