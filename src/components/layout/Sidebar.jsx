import styled from "styled-components";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RenderIcon from "../ui/RenderIcon";
import Button from "../ui/Button";
import FlexBoxComponent from "../common/FlexBox";
import { useAppTheme } from "../../context/AppThemeContext";
import { useState } from "react";
import { ROUTES } from "../../constants/routes";
import { ROLES } from "../../constants/roles";
import { empresas } from "../../mock/products"; // Importar empresas del mock

const SidebarContainer = styled.nav`
  height: 100%;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 10;
  box-shadow: 2px 0 10px ${({ theme }) => theme.colors.shadow};
`;

const SidebarItem = styled(NavLink)`
  color: ${({ theme }) => theme.colors.text};
  border: solid 1px ${({ theme }) => theme.colors.transparent};
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &.active {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const SectionTitle = styled.h3`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin: 1rem 0 0.5rem;
  padding: 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Badge = styled.span`
  background-color: ${({ theme, variant }) =>
    variant === "new"
      ? theme.colors.primary
      : variant === "count"
      ? theme.colors.accent
      : theme.colors.textLight};
  color: ${({ theme }) => theme.colors.white};
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  font-size: 0.7rem;
  margin-left: auto;
`;

export default function Sidebar({ onToggleSidebar }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const { isDarkMode, toggleTheme, theme } = useAppTheme();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState({
    Catálogos: true, // Por defecto, expandir la sección de catálogos
  });

  // Obtener accesos del usuario
  const userAccess = user?.EMPRESAS || [];

  // Configuración del menú dividida en secciones
  const menuSections = [
    {
      title: "Compras",
      items: [
        {
          type: "link",
          path: "/",
          label: "Inicio",
          icon: "HomeOutline",
          iconLibrary: 7,
          onClick: onToggleSidebar,
        },
        {
          type: "expandable",
          label: "Catálogos",
          icon: "ShoppingBag",
          iconLibrary: 7,
          items: empresas.map((empresa) => ({
            path: `/catalogo/${empresa.id}`,
            label: empresa.nombre,
            onClick: onToggleSidebar,
            icon: "Tag",
            iconLibrary: 7,
            disabled: !userAccess.includes(empresa.id),
            badge: !userAccess.includes(empresa.id)
              ? { text: "Solicitar", variant: "new" }
              : null,
          })),
        },
        {
          type: "link",
          path: "/carrito",
          label: "Carrito",
          icon: "ShoppingCart",
          iconLibrary: 7,
          onClick: onToggleSidebar,
          badge: { text: "3", variant: "count" }, // Esto deberías reemplazarlo con itemCount del cart
        },
        {
          type: "link",
          path: "/mis-pedidos",
          label: "Mis Pedidos",
          icon: "ShoppingBag",
          iconLibrary: 7,
          onClick: onToggleSidebar,
        },
      ],
    },
    {
      title: "Mi Cuenta",
      items: [
        {
          type: "link",
          path: "/perfil",
          label: "Mi Perfil",
          icon: "User",
          iconLibrary: 7,
          onClick: onToggleSidebar,
        },
        {
          type: "link",
          path: "/favoritos",
          label: "Favoritos",
          icon: "Heart",
          iconLibrary: 7,
          onClick: onToggleSidebar,
        },
      ],
    },
    ...(user?.ROLES?.includes(ROLES.ADMIN)
      ? [
          {
            title: "Administración",
            items: [
              {
                type: "link",
                path: "/admin/usuarios",
                label: "Usuarios",
                icon: "Users",
                iconLibrary: 7,
                onClick: onToggleSidebar,
              },
              {
                type: "link",
                path: "/admin/productos",
                label: "Productos",
                icon: "Package",
                iconLibrary: 7,
                onClick: onToggleSidebar,
              },
              {
                type: "link",
                path: "/admin/pedidos",
                label: "Pedidos",
                icon: "ClipboardList",
                iconLibrary: 7,
                onClick: onToggleSidebar,
              },
            ],
          },
        ]
      : []),
    {
      title: "Configuración",
      items: [
        {
          type: "action",
          label: `Tema ${isDarkMode ? "Claro" : "Oscuro"}`,
          icon: isDarkMode ? "Sun" : "Moon",
          iconLibrary: 7,
          action: () => {
            toggleTheme();
            onToggleSidebar();
          },
        },
        {
          type: "action",
          label: "Cerrar Sesión",
          icon: "LogOut",
          iconLibrary: 7,
          action: () => {
            logout();
            onToggleSidebar();
            navigate("/auth/login");
          },
        },
      ],
    },
  ];

  const toggleExpand = (label) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const renderMenuItems = (items) => {
    return items.map((item, index) => {
      const isActive = location.pathname === item.path;
      const isDisabled = item.disabled;

      const itemStyle = isDisabled
        ? {
            opacity: 0.6,
            cursor: "default",
            pointerEvents: isDisabled ? "none" : "auto",
          }
        : { cursor: "pointer" };

      switch (item.type) {
        case "link":
          return (
            <SidebarItem
              key={index}
              to={item.path}
              onClick={item.onClick}
              style={itemStyle}
            >
              <RenderIcon
                size={18}
                name={item.icon}
                color={isActive ? theme.colors.white : theme.colors.text}
                library={item.iconLibrary || 2}
              />
              {item.label}
              {item.badge && (
                <Badge variant={item.badge.variant}>{item.badge.text}</Badge>
              )}
            </SidebarItem>
          );

        case "expandable":
          return (
            <div key={index}>
              <SidebarItem
                as="div"
                onClick={() => toggleExpand(item.label)}
                style={{ cursor: "pointer" }}
              >
                <RenderIcon
                  size={18}
                  name={item.icon}
                  color={theme.colors.text}
                  library={item.iconLibrary || 2}
                />
                {item.label}
                <RenderIcon
                  style={{ marginLeft: "auto" }}
                  size={14}
                  name={
                    expandedItems[item.label] ? "ChevronDown" : "ChevronRight"
                  }
                  library={7}
                  color={theme.colors.textLight}
                />
              </SidebarItem>

              {expandedItems[item.label] && (
                <div style={{ paddingLeft: "1rem" }}>
                  {renderMenuItems(
                    item.items.map((subItem) => ({
                      ...subItem,
                      type: "link",
                    }))
                  )}
                </div>
              )}
            </div>
          );

        case "action":
          return (
            <SidebarItem
              key={index}
              as="div"
              onClick={item.action}
              style={itemStyle}
            >
              <RenderIcon
                size={18}
                name={item.icon}
                library={item.iconLibrary || 2}
                color={theme.colors.text}
              />
              {item.label}
            </SidebarItem>
          );

        default:
          return null;
      }
    });
  };

  return (
    <SidebarContainer>
      <FlexBoxComponent
        flexDirection="column"
        alignItems="stretch"
        height="100%"
      >
        <FlexBoxComponent height={"1.5rem"} justifyContent="flex-end">
          <Button
            onClick={onToggleSidebar}
            leftIconName={"X"}
            iconSize={15}
            color={theme.colors.text}
            size="small"
            variant="outlined"
            style={{ borderColor: theme.colors.transparent, paddingRight: 0 }}
          />
        </FlexBoxComponent>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <SectionTitle>{section.title}</SectionTitle>
              {renderMenuItems(section.items)}
            </div>
          ))}
        </div>
      </FlexBoxComponent>
    </SidebarContainer>
  );
}
