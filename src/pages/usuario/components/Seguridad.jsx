import { useState } from "react";
import styled from "styled-components";
import { useAppTheme } from "../../../context/AppThemeContext";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { toast } from "react-toastify";

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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const FormField = styled.div`
  flex: 1;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2px;
  gap: 16px;
`;

const Seguridad = () => {
  const { theme } = useAppTheme();
  
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordInfo({
      ...passwordInfo,
      [name]: value,
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    // Validación simple
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (passwordInfo.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Aquí iría la lógica para cambiar la contraseña
    toast.success("Contraseña actualizada correctamente");

    // Limpiar el formulario
    setPasswordInfo({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <Card>
      <CardTitle>Cambiar Contraseña</CardTitle>

      <Form onSubmit={handlePasswordSubmit}>
        <FormField>
          <Input
            label="Contraseña actual"
            name="currentPassword"
            type="password"
            value={passwordInfo.currentPassword}
            onChange={handlePasswordChange}
            leftIconName="FaLock"
            required
          />
        </FormField>

        <FormGroup>
          <FormField>
            <Input
              label="Nueva contraseña"
              name="newPassword"
              type="password"
              value={passwordInfo.newPassword}
              onChange={handlePasswordChange}
              leftIconName="FaLock"
              required
            />
          </FormField>
          <FormField>
            <Input
              label="Confirmar nueva contraseña"
              name="confirmPassword"
              type="password"
              value={passwordInfo.confirmPassword}
              onChange={handlePasswordChange}
              leftIconName="FaLock"
              required
            />
          </FormField>
        </FormGroup>

        <FormActions>
          <Button text="Cancelar" size="small" variant="outlined" />
          <Button
            text="Actualizar contraseña"
            variant="solid"
            size="small"
            type="submit"
            backgroundColor={theme.colors.primary}
          />
        </FormActions>
      </Form>
    </Card>
  );
};

export default Seguridad;
