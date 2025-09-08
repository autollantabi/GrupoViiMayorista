import { useState } from "react";
import styled from "styled-components";
import { useAppTheme } from "../../../context/AppThemeContext";
import Button from "../../../components/ui/Button";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";

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

const PreferenceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const PreferenceText = styled.div``;

const PreferenceTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const PreferenceDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
`;

const SwitchInput = styled.input.attrs({ type: "checkbox" })`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${({ theme }) => theme.colors.primary};
  }

  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.border};
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const Preferencias = () => {
  const { theme, toggleTheme } = useAppTheme();
  const { isClient } = useAuth();

  const [settings, setSettings] = useState({
    receiveEmails: true,
    receiveNotifications: true,
    darkMode: theme.mode === "dark",
  });

  const handleSettingChange = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });

    // Si es el modo oscuro, aplicar el cambio inmediatamente
    if (setting === "darkMode") {
      toggleTheme();
    }
  };

  return (
    <>
      {isClient && (
        <Card>
          <CardTitle>Notificaciones</CardTitle>

          <PreferenceItem>
            <PreferenceText>
              <PreferenceTitle>Correos electrónicos</PreferenceTitle>
              <PreferenceDescription>
                Recibe actualizaciones, ofertas y noticias por correo
              </PreferenceDescription>
            </PreferenceText>
            <Switch>
              <SwitchInput
                checked={settings.receiveEmails}
                onChange={() => handleSettingChange("receiveEmails")}
              />
              <Slider />
            </Switch>
          </PreferenceItem>
        </Card>
      )}

      <Card>
        <CardTitle>Apariencia</CardTitle>

        <PreferenceItem>
          <PreferenceText>
            <PreferenceTitle>Modo oscuro</PreferenceTitle>
            <PreferenceDescription>
              Cambia la apariencia de la interfaz
            </PreferenceDescription>
          </PreferenceText>
          <Switch>
            <SwitchInput
              checked={settings.darkMode}
              onChange={() => handleSettingChange("darkMode")}
            />
            <Slider />
          </Switch>
        </PreferenceItem>
      </Card>
    </>
  );
};

export default Preferencias;
