import { useState } from "react";
import styled from "styled-components";
import { useAppTheme } from "../../../context/AppThemeContext";
import Button from "../../../components/ui/Button";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";

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

const PreferenceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  gap: 16px;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: 12px 0;
    gap: 12px;
  }
`;

const PreferenceText = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    flex: 1;
  }
`;

const PreferenceTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const PreferenceDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    line-height: 1.3;
  }
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 46px;
    height: 24px;
  }
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

  @media (max-width: 768px) {
    &:checked + span:before {
      transform: translateX(22px);
    }
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

  @media (max-width: 768px) {
    &:before {
      height: 16px;
      width: 16px;
    }
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
