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
`;

const CardTitle = styled.h2`
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.text};
`;

const CompanyFilter = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
`;

const CompanyFilterLabel = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
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
`;

const PhoneInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PhoneNumber = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PhoneType = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const PhoneActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
`;

const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
`;

const InfoMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.info + "15"};
  border: 1px solid ${({ theme }) => theme.colors.info + "33"};
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.info};
  font-size: 0.9rem;
`;
const SapBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.primary + "33"};
  color: ${({ theme }) => theme.colors.primary};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-left: 8px;
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
          width="200px"
          placeholder="Seleccionar empresa"
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
              </PhoneNumber>
              <PhoneType>{telefono.PHONE_TYPE}</PhoneType>
            </PhoneInfo>
            <PhoneActions>
              {!telefono.PREDETERMINED && (
                <Button
                  text="Establecer predeterminado"
                  size="small"
                  variant="outlined"
                  onClick={() => handleSetPredeterminado(telefono.ID_PHONE)}
                />
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
