import styled from "styled-components";
import { useAuth } from "../../../context/AuthContext";
import { useAppTheme } from "../../../context/AppThemeContext";
import Button from "../../../components/ui/Button";
import { toast } from "react-toastify";
import { ROLES } from "../../../constants/roles";

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)"};
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? "0 8px 30px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.2)"
        : "0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)"};
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
  }
`;

const CardTitle = styled.h2`
  font-size: clamp(1.3rem, 3vw, 1.5rem);
  margin-top: 0;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  gap: 2.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
`;

const Avatar = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 4px solid ${({ theme }) => theme.colors.primary};
  box-shadow: 0 8px 24px ${({ theme }) => `${theme.colors.primary}30`};
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &::after {
    content: "";
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.secondary || theme.colors.primary}
    );
    z-index: -1;
    opacity: 0.3;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 32px ${({ theme }) => `${theme.colors.primary}40`};
  }

  @media (max-width: 768px) {
    width: 140px;
    height: 140px;
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const FormSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InfoItem = styled.div`
  padding: 1rem;
  background: ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.background}80` : `${theme.colors.background}`};
  border-radius: 12px;
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}30` : `${theme.colors.border}20`};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => `${theme.colors.primary}40`};
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.primary}08`
        : `${theme.colors.primary}05`};
  }

  strong {
    display: block;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 0.5rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  div {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 500;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  gap: 1rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const EmpresasContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const EmpresaChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.primary}15)`
      : `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.primary}08)`};
  border: 1px solid ${({ theme }) => `${theme.colors.primary}40`};
  border-radius: 20px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => `${theme.colors.primary}30`};
    border-color: ${({ theme }) => `${theme.colors.primary}60`};
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `linear-gradient(135deg, ${theme.colors.primary}30, ${theme.colors.primary}20)`
        : `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.primary}12)`};
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 0.45rem 0.875rem;
  }
`;

const InformacionPersonal = () => {
  const { user } = useAuth();
  const { theme } = useAppTheme();

  const personalInfo = {
    nombre: user?.NAME_USER || "",
    email: user?.EMAIL || "",
    telefono: "",
    empresa: "",
    rfc: "",
  };

  const handleSolicitarCambio = () => {
    toast.info(
      "Para modificar tus datos, contacta a soporte o solicita el cambio a tu administrador."
    );
  };

  return (
    <Card>
      <CardTitle>Información Personal</CardTitle>
      <ProfileSection>
        <AvatarSection>
          <Avatar>
            <AvatarImage
              src={`https://ui-avatars.com/api/?name=${personalInfo.nombre}&background=random&size=150`}
              alt="Avatar"
            />
          </Avatar>
        </AvatarSection>
        <FormSection>
          <InfoItem>
            <strong>Nombre completo</strong>
            <div>{personalInfo.nombre}</div>
          </InfoItem>
          <InfoItem>
            <strong>Correo electrónico</strong>
            <div>{personalInfo.email}</div>
          </InfoItem>
          <InfoItem>
            <strong>Empresas disponibles</strong>
            {user?.EMPRESAS.length > 0 ? (
              <EmpresasContainer>
                {user?.EMPRESAS.map((empresa, idx) => (
                  <EmpresaChip key={idx}>{empresa}</EmpresaChip>
                ))}
              </EmpresasContainer>
            ) : (
              <div style={{ color: "#aaa", fontStyle: "italic", marginTop: "0.5rem" }}>
                Sin empresas asignadas
              </div>
            )}
          </InfoItem>
          {user?.ROLE_NAME === ROLES.CLIENTE && (
            <FormActions>
              <Button
                text="Solicitar cambio de información"
                size="small"
                variant="outlined"
                onClick={handleSolicitarCambio}
              />
            </FormActions>
          )}
        </FormSection>
      </ProfileSection>
    </Card>
  );
};

export default InformacionPersonal;
