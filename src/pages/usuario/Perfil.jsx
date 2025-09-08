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

const PageTitle = styled.h1`
  margin: 0 0 24px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 24px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const TabButton = styled(Button)`
  padding: 12px 24px;
  background: none;
  border: none;
  border-radius: 0;
  border-bottom: 2px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : "transparent")};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textLight};
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const TabContent = styled.div`
  display: ${({ $active }) => ($active ? "block" : "none")};
`;

// Componente Principal
const Perfil = () => {
  const { isClient } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <PageContainer>
      <PageTitle>Mi Perfil</PageTitle>

      <TabsContainer>
        <TabButton
          $active={activeTab === "personal"}
          onClick={() => setActiveTab("personal")}
          text={"Información Personal"}
          size="small"
        />
        <TabButton
          $active={activeTab === "security"}
          onClick={() => setActiveTab("security")}
          text={"Seguridad"}
          size="small"
        />
        {isClient && (
          <TabButton
            $active={activeTab === "addresses"}
            onClick={() => setActiveTab("addresses")}
            text={"Direcciones"}
            size="small"
          />
        )}
        {isClient && (
          <TabButton
            $active={activeTab === "telefonos"}
            onClick={() => setActiveTab("telefonos")}
            text={"Teléfonos"}
            size="small"
          />
        )}
        <TabButton
          $active={activeTab === "preferences"}
          onClick={() => setActiveTab("preferences")}
          text={"Preferencias"}
          size="small"
        />
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
    </PageContainer>
  );
};

export default Perfil;
