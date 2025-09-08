import React from "react";
import styled from "styled-components";
import Button from "./Button";
import RenderIcon from "./RenderIcon";

// Estilos del modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModalBody = styled.div`
  padding: 24px;
  flex: 1;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const CompanySection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CompanyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const CompanyLogo = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 4px;
`;

const CompanyName = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.1rem;
`;

const ContactList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ContactLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  min-width: 80px;
`;

const ContactButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const HelpText = styled.div`
  background-color: ${({ theme }) => theme.colors.info + "15"};
  border-left: 3px solid ${({ theme }) => theme.colors.info};
  padding: 12px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
`;

const contactInfo = [
  {
    id: "AUTOLLANTA",
    name: "Autollanta",
    phone: "+593987654321",
    whatsapp: "593987654321",
    email: "soporte@autollanta.com",
  },
  {
    id: "MAXXIMUNDO",
    name: "Maxximundo Cía. Ltda.",
    phone: "+593998765432",
    whatsapp: "593998765432",
    email: "soporte@maxximundo.com",
  },
  {
    id: "STOX",
    name: "Stox",
    phone: "+593912345678",
    whatsapp: "593912345678",
    email: "soporte@stox.com.ec",
  },
  {
    id: "IKONIX",
    name: "Ikonix",
    phone: "+593912345678",
    whatsapp: "593912345678",
    email: "soporte@ikonix.com.ec",
  },
  {
    id: "AUTOMAX",
    name: "Automax",
    phone: "+593912345678",
    whatsapp: "593912345678",
    email: "soporte@automax.cr",
  },
];

/**
 * Modal de contacto reutilizable que muestra números de contacto de empresas
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Controla si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {string} props.title - Título del modal
 * @param {Array} props.companies - Lista de empresas con su información de contacto
 * @param {string} props.selectedCompany - ID de la empresa seleccionada (opcional)
 */
const ContactModal = ({
  isOpen,
  onClose,
  title = "Contactar a soporte",
  companies = contactInfo,
  selectedCompany = null,
  selectedOrderId = null,
}) => {
  if (!isOpen) return null;

  // Filtrar empresas si hay una seleccionada
  const displayCompanies = selectedCompany
    ? companies.filter((company) => company.id === selectedCompany)
    : companies;

  const handleCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = (phoneNumber, nroPedido) => {
    const message = encodeURIComponent(
      `Hola, necesito ayuda con mi pedido: ${nroPedido}.`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>
            <RenderIcon name="FaHeadset" size={18} />
            {title}
          </ModalTitle>
          <Button
            variant="text"
            onClick={onClose}
            leftIconName="FaTimes"
            size="small"
          />
        </ModalHeader>

        <ModalBody>
          <HelpText>
            <strong>¿Necesitas ayuda?</strong> Contacta directamente con el
            servicio de atención al cliente a través de los siguientes canales
            de comunicación.
          </HelpText>

          {displayCompanies.length > 0 ? (
            displayCompanies.map((company) => (
              <CompanySection key={company.id}>
                <CompanyHeader>
                  <CompanyName>{company.name}</CompanyName>
                </CompanyHeader>

                <ContactList>
                  {company.phone && (
                    <ContactItem>
                      <ContactLabel>Teléfono:</ContactLabel>
                      <ContactButtons>
                        <Button
                          text={company.phone}
                          variant="outlined"
                          size="small"
                          leftIconName="FaPhone"
                          onClick={() => handleCall(company.phone)}
                        />
                      </ContactButtons>
                    </ContactItem>
                  )}

                  {company.whatsapp && (
                    <ContactItem>
                      <ContactLabel>WhatsApp:</ContactLabel>
                      <ContactButtons>
                        <Button
                          text={company.whatsapp}
                          variant="solid"
                          backgroundColor="#25D366"
                          size="small"
                          leftIconName="FaWhatsapp"
                          onClick={() =>
                            handleWhatsApp(company.whatsapp, selectedOrderId)
                          }
                        />
                      </ContactButtons>
                    </ContactItem>
                  )}

                  {company.email && (
                    <ContactItem>
                      <ContactLabel>Email:</ContactLabel>
                      <ContactButtons>
                        <Button
                          text={company.email}
                          variant="outlined"
                          size="small"
                          leftIconName="FaEnvelope"
                          onClick={() =>
                            (window.location.href = `mailto:${company.email}`)
                          }
                        />
                      </ContactButtons>
                    </ContactItem>
                  )}
                </ContactList>
              </CompanySection>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              No hay información de contacto disponible.
            </div>
          )}
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ContactModal;
