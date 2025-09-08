import styled from "styled-components";
import { useAuth } from "../../../context/AuthContext";
import { useAppTheme } from "../../../context/AppThemeContext";
import Button from "../../../components/ui/Button";
import { toast } from "react-toastify";
import { ROLES } from "../../../constants/roles";

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
`;

const CardTitle = styled.h2`
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.text};
`;

const ProfileSection = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Avatar = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 16px;
  border: 3px solid ${({ theme }) => theme.colors.primary};
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const FormSection = styled.div`
  flex: 1;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2px;
  gap: 16px;
`;

const EmpresasList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.98rem;
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div>
              <strong>Nombre completo:</strong>
              <div>{personalInfo.nombre}</div>
            </div>
            <div>
              <strong>Correo electrónico:</strong>
              <div>{personalInfo.email}</div>
            </div>
            <div>
              <strong>Empresas disponibles:</strong>
              {user?.EMPRESAS.length > 0 ? (
                <EmpresasList>
                  {user?.EMPRESAS.map((empresa, idx) => (
                    <li key={idx}>{empresa}</li>
                  ))}
                </EmpresasList>
              ) : (
                <div style={{ color: "#aaa" }}>Sin empresas asignadas</div>
              )}
            </div>
          </div>
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
