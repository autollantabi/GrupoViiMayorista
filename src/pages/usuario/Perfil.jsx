import { useState } from "react";
import styled from "styled-components";
import Button from "../../components/ui/Button";

// Importar los componentes modulares
import InformacionPersonal from "./components/InformacionPersonal";
import Seguridad from "./components/Seguridad";
import Direcciones from "./components/Direcciones";
import Preferencias from "./components/Preferencias";
import Telefonos from "./components/Telefonos";
import { useAuth } from "../../context/AuthContext";
import PageContainer from "../../components/layout/PageContainer";

const ProfileContainer = styled(PageContainer)`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(180deg, ${theme.colors.background} 0%, ${theme.colors.surface}15 100%)`
      : `linear-gradient(180deg, ${theme.colors.background} 0%, ${theme.colors.primary}02 100%)`};
  min-height: calc(100vh - 45px);

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const PageTitle = styled.h1`
  margin: 0 0 2rem 0;
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  animation: fadeInUp 0.6s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 2px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  margin-bottom: 2rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  gap: 0.5rem;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    height: 2px;
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `linear-gradient(90deg, ${theme.colors.primary}40, transparent)`
        : `linear-gradient(90deg, ${theme.colors.primary}30, transparent)`};
    width: 100%;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    gap: 0.25rem;
  }
`;

const TabButton = styled.button`
  padding: 0.875rem 1.5rem;
  background: none;
  border: none;
  border-radius: 12px 12px 0 0;
  border-bottom: 3px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : "transparent")};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  white-space: nowrap;
  background: ${({ theme, $active }) =>
    $active
      ? theme.mode === "dark"
        ? `${theme.colors.primary}10`
        : `${theme.colors.primary}08`
      : "transparent"};

  &::before {
    content: "";
    position: absolute;
    bottom: -3px;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ theme }) => theme.colors.primary};
    transform: ${({ $active }) => ($active ? "scaleX(1)" : "scaleX(0)")};
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme, $active }) =>
      !$active
        ? theme.mode === "dark"
          ? `${theme.colors.primary}08`
          : `${theme.colors.primary}05`
        : theme.mode === "dark"
        ? `${theme.colors.primary}15`
        : `${theme.colors.primary}12`};
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }
`;

const TabContent = styled.div`
  display: ${({ $active }) => ($active ? "block" : "none")};
  animation: ${({ $active }) =>
    $active ? "fadeIn 0.4s ease-out" : "none"};

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Componente Principal
const Perfil = () => {
  const { isClient } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <ProfileContainer>
      <PageTitle>Mi Perfil</PageTitle>

      <TabsContainer>
        <TabButton
          $active={activeTab === "personal"}
          onClick={() => setActiveTab("personal")}
        >
          Información Personal
        </TabButton>
        <TabButton
          $active={activeTab === "security"}
          onClick={() => setActiveTab("security")}
        >
          Seguridad
        </TabButton>
        {isClient && (
          <TabButton
            $active={activeTab === "addresses"}
            onClick={() => setActiveTab("addresses")}
          >
            Direcciones
          </TabButton>
        )}
        {isClient && (
          <TabButton
            $active={activeTab === "telefonos"}
            onClick={() => setActiveTab("telefonos")}
          >
            Teléfonos
          </TabButton>
        )}
        <TabButton
          $active={activeTab === "preferences"}
          onClick={() => setActiveTab("preferences")}
        >
          Preferencias
        </TabButton>
      </TabsContainer>

      {/* Tab: Información Personal */}
      <TabContent $active={activeTab === "personal"}>
        <InformacionPersonal />
      </TabContent>

      {/* Tab: Seguridad */}
      <TabContent $active={activeTab === "security"}>
        <Seguridad />
      </TabContent>

      {/* Tab: Direcciones */}
      <TabContent $active={activeTab === "addresses"}>
        <Direcciones />
      </TabContent>

      {/* Tab: Teléfonos */}
      <TabContent $active={activeTab === "telefonos"}>
        <Telefonos />
      </TabContent>

      {/* Tab: Preferencias */}
      <TabContent $active={activeTab === "preferences"}>
        <Preferencias />
      </TabContent>
    </ProfileContainer>
  );
};

export default Perfil;
