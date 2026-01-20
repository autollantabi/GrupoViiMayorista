import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import PageContainer from "../../components/layout/PageContainer";
import RenderIcon from "../../components/ui/RenderIcon";
import Button from "../../components/ui/Button";
import SEO from "../../components/seo/SEO";

const ContactContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageTitle = styled.h1`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  margin: 0 0 1rem 0;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
`;

const PageSubtitle = styled.p`
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
`;

const ContactContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  margin-top: 3rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const InfoCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 2px 8px rgba(0, 0, 0, 0.06)"};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? "0 8px 24px rgba(0, 0, 0, 0.2)"
        : "0 8px 24px rgba(0, 0, 0, 0.1)"};
  }
`;

const InfoIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.primary}30, ${theme.colors.primary}20)`
      : `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.primary}15)`};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const InfoTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
`;

const InfoText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
  margin: 0;
  line-height: 1.6;
`;

const ContactForm = styled.form`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2.5rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 2px 8px rgba(0, 0, 0, 0.06)"};
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  font-weight: 600;
`;

const FormInput = styled.input`
  padding: 0.875rem 1rem;
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  border-radius: 12px;
  font-size: 1rem;
  background: ${({ theme }) =>
    theme.mode === "dark" ? theme.colors.background : "#ffffff"};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.background};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const FormTextarea = styled.textarea`
  padding: 0.875rem 1rem;
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  border-radius: 12px;
  font-size: 1rem;
  background: ${({ theme }) =>
    theme.mode === "dark" ? theme.colors.background : "#ffffff"};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.2s ease;
  min-height: 150px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const SubmitButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 12px;
  margin-top: 0.5rem;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) =>
      theme.colors.primaryDark || theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${({ theme }) => `${theme.colors.primary}40`};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Contacto = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: user?.NAME_USER || "",
    email: user?.EMAIL || "",
    telefono: "",
    asunto: "",
    mensaje: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombre.trim() || !formData.email.trim() || !formData.mensaje.trim()) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);

    try {
      // Aquí iría la llamada a la API para enviar el mensaje
      // Por ahora simulamos el envío
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Mensaje enviado exitosamente. Nos contactaremos contigo pronto.");
      
      // Limpiar el formulario
      setFormData({
        nombre: user?.NAME_USER || "",
        email: user?.EMAIL || "",
        telefono: "",
        asunto: "",
        mensaje: "",
      });
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast.error("Error al enviar el mensaje. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Contacto - Portal Mayorista"
        description="Contáctanos para cualquier consulta, soporte o información sobre nuestros servicios y productos."
        keywords="contacto, soporte, ayuda, consulta, Portal Mayorista"
      />
      <PageContainer>
        <ContactContainer>
          <PageTitle>Contáctanos</PageTitle>
          <PageSubtitle>
            ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para asistirte.
            Completa el formulario y nos pondremos en contacto contigo pronto.
          </PageSubtitle>

          <ContactContent>
            <ContactInfo>
              <InfoCard>
                <InfoIcon>
                  <RenderIcon name="FaEnvelope" size={28} />
                </InfoIcon>
                <InfoTitle>Email</InfoTitle>
                <InfoText>soporte@viicommerce.com</InfoText>
                <InfoText>ventas@viicommerce.com</InfoText>
              </InfoCard>

              <InfoCard>
                <InfoIcon>
                  <RenderIcon name="FaPhone" size={28} />
                </InfoIcon>
                <InfoTitle>Teléfono</InfoTitle>
                <InfoText>+593 2 123 4567</InfoText>
                <InfoText>Lun - Vie: 8:30 AM - 13:00 PM | 14:30 PM - 18:00 PM</InfoText>
                <InfoText>Sab: 8:30 AM - 13:00 PM</InfoText>
              </InfoCard>

              <InfoCard>
                <InfoIcon>
                  <RenderIcon name="FaMapLocationDot" size={28} />
                </InfoIcon>
                <InfoTitle>Ubicación</InfoTitle>
                <InfoText>Cuenca, Ecuador</InfoText>
                <InfoText>Oficina Central</InfoText>
              </InfoCard>
            </ContactInfo>

            <ContactForm onSubmit={handleSubmit}>
              <FormGroup>
                <FormLabel>Nombre Completo *</FormLabel>
                <FormInput
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Email *</FormLabel>
                <FormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Teléfono</FormLabel>
                <FormInput
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+593 9 123 4567"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Asunto</FormLabel>
                <FormInput
                  type="text"
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  placeholder="¿Sobre qué quieres contactarnos?"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Mensaje *</FormLabel>
                <FormTextarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  placeholder="Escribe tu mensaje aquí..."
                  required
                />
              </FormGroup>

              <SubmitButton
                type="submit"
                disabled={isSubmitting}
                text={isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                leftIconName={isSubmitting ? "FaSpinner" : "FaPaperPlane"}
              />
            </ContactForm>
          </ContactContent>
        </ContactContainer>
      </PageContainer>
    </>
  );
};

export default Contacto;
