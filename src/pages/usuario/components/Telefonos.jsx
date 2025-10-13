import { useState, useMemo } from "react";
import styled from "styled-components";
import { useAppTheme } from "../../../context/AppThemeContext";
import Button from "../../../components/ui/Button";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import Select from "../../../components/ui/Select";
import RenderIcon from "../../../components/ui/RenderIcon";

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};

  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 16px;
  }
`;

const CardTitle = styled.h2`
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 16px;
  }
`;

const CompanyFilter = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin-bottom: 16px;
  }
`;

const CompanyFilterLabel = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const PhoneItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin-bottom: 12px;
  background-color: ${({ theme }) => theme.colors.background};
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
    gap: 12px;
  }
`;

const PhoneInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PhoneNumber = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const PhoneType = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const PhoneActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    gap: 10px;

    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

const PriorityBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;

  ${({ $pred, theme }) =>
    $pred
      ? `
    background-color: ${theme.colors.success + "20"};
    color: ${theme.colors.success};
    border: 1px solid ${theme.colors.success + "40"};
  `
      : ""}

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
`;

const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  border: 1px dashed ${({ theme }) => theme.colors.border};

  @media (max-width: 768px) {
    padding: 16px;
    font-size: 0.9rem;
  }
`;

const InfoMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.info + "15"};
  border: 1px solid ${({ theme }) => theme.colors.info + "33"};
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.info};
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 10px;
    margin-bottom: 12px;
  }
`;

const SapBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.primary + "33"};
  color: ${({ theme }) => theme.colors.primary};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 2px 6px;
  }
`;

const ActionButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  color: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 8px 14px;
  white-space: nowrap;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    background: ${({ theme }) =>
      theme.colors.primaryDark || theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 10px 16px;
    white-space: normal;
    text-align: center;
    width: 100%;
  }
`;

const Telefonos = () => {
  const { theme } = useAppTheme();
  const { user, setUser } = useAuth();

  // Empresas disponibles
  const empresasDisponibles = useMemo(() => {
    return user && user.TELEFONOS ? Object.keys(user.TELEFONOS) : [];
  }, [user?.TELEFONOS]);

  // Empresa seleccionada
  const [selectedEmpresa, setSelectedEmpresa] = useState(
    empresasDisponibles[0] || ""
  );

  // Teléfonos filtrados por empresa
  const telefonos = useMemo(() => {
    if (!user || !user.TELEFONOS) return [];
    return user.TELEFONOS[selectedEmpresa] || [];
  }, [user, selectedEmpresa]);

  // Cambiar predeterminado
  const handleSetPredeterminado = async (id) => {
    // Aquí deberías llamar a tu servicio para actualizar el teléfono predeterminado en backend
    // Por ahora solo simula el cambio en frontend
    const nuevosTelefonos = telefonos.map((tel) => ({
      ...tel,
      PREDETERMINED: tel.ID_PHONE === id,
    }));

    // Simula actualización en el usuario
    setUser({
      ...user,
      TELEFONOS: {
        ...user.TELEFONOS,
        [selectedEmpresa]: nuevosTelefonos,
      },
    });

    toast.success("Teléfono predeterminado actualizado");
  };

  return (
    <Card>
      <CardTitle>Mis Teléfonos</CardTitle>

      <InfoMessage>
        <strong>Gestión de prioridades:</strong> Puedes establecer un teléfono
        como <strong>predeterminado</strong> para cada empresa. Este será
        utilizado para contactarte.
      </InfoMessage>

      {/* Selector de empresa */}
      <CompanyFilter>
        <CompanyFilterLabel>Ver teléfonos para:</CompanyFilterLabel>
        <Select
          options={empresasDisponibles.map((empresa) => ({
            value: empresa,
            label: empresa,
          }))}
          value={selectedEmpresa}
          onChange={(e) => setSelectedEmpresa(e.target.value)}
          placeholder="Seleccionar empresa"
          style={{ width: window.innerWidth <= 768 ? "100%" : "200px" }}
        />
      </CompanyFilter>

      {telefonos.length > 0 ? (
        telefonos.map((telefono) => (
          <PhoneItem key={telefono.ID_PHONE}>
            <PhoneInfo>
              <PhoneNumber>
                {telefono.PHONE_NUMBER}
                {telefono.PREDETERMINED && (
                  <PriorityBadge $pred={telefono.PREDETERMINED}>
                    Predeterminado
                  </PriorityBadge>
                )}
                {telefono.ORIGIN === "SAP" && (
                  <SapBadge>
                    <RenderIcon
                      name="FaLock"
                      size={10}
                      style={{ marginRight: "4px" }}
                    />
                    Sistema
                  </SapBadge>
                )}
              </PhoneNumber>
              <PhoneType>{telefono.PHONE_TYPE}</PhoneType>
            </PhoneInfo>
            <PhoneActions>
              {!telefono.PREDETERMINED && (
                <ActionButton
                  text="Establecer predeterminado"
                  size="small"
                  leftIconName="FaCheck"
                  onClick={() => handleSetPredeterminado(telefono.ID_PHONE)}
                />
              )}
            </PhoneActions>
          </PhoneItem>
        ))
      ) : (
        <EmptyState>
          No tienes teléfonos registrados para esta empresa.
        </EmptyState>
      )}
    </Card>
  );
};

export default Telefonos;
