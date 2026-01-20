import { useState } from "react";
import styled from "styled-components";
import { useAppTheme } from "../../../context/AppThemeContext";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { toast } from "react-toastify";

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
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.warning} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.warning} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const FormField = styled.div`
  flex: 1;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 0.75rem;

    button {
      width: 100%;
    }
  }
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
