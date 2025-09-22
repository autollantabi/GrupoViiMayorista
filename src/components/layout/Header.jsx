import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useAppTheme } from "../../context/AppThemeContext";
import { useState } from "react";
import {
  FaShoppingCart,
  FaUser,
  FaSignOutAlt,
  FaHistory,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { ROLES } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import RenderIcon from "../ui/RenderIcon";

const HeaderContainer = styled.header`
  width: 100%;
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};
  position: relative;
  height: 45px;

  @media (min-width: 768px) {
    padding: 0.5rem 2rem;
  }

  @media (min-width: 1024px) {
    padding: 0.5rem 3rem;
  }

  @media (min-width: 1440px) {
    padding: 0.5rem 4rem;
  }
`;

const Logo = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white};
  white-space: nowrap;

  @media (min-width: 768px) {
    font-size: 1.4rem;
  }
`;

const IconButton = styled(Button)`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  font-size: 1.2rem;
  cursor: pointer;
  position: relative;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }

  @media (min-width: 768px) {
    margin-left: 1rem;
  }
`;

const CartCount = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.7rem;
  font-weight: bold;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserMenuDropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 4px;
  box-shadow: 0 2px 10px ${({ theme }) => theme.colors.shadow};
  width: 200px;
  z-index: 100;
  overflow: hidden;
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};

  @media (max-width: 767px) {
    position: fixed;
    top: 0;
    right: 0;
    width: 250px;
    height: 100vh;
    border-radius: 0;
    transform: ${({ $isOpen }) =>
      $isOpen ? "translateX(0)" : "translateX(100%)"};
    transition: transform 0.3s ease;
    display: block;
  }
`;

const UserMenuItem = styled.div`
  padding: 0.8rem 1rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;

  svg {
    margin-right: 10px;
    font-size: 1rem;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }

  @media (max-width: 767px) {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.background};
  }
`;

const UserGreeting = styled.div`
  font-size: 0.9rem;
  margin-right: 0.5rem;
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.background};
  background-color: ${({ theme }) => theme.colors.primary};

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenuTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.white};
  font-size: 1.1rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
`;

const RightSection = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 768px) {
    gap: 0.3rem;
  }
`;

const DesktopOnlySection = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
`;

const MobileOnlySection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenuContent = styled.div`
  padding: 1rem 0;
`;

export default function Header() {
  const { user, isClient, isVisualizacion, logout } = useAuth();
  const { itemCount } = useCart();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Función para manejar la búsqueda en todas las empresas
  const handleSearchAllCompanies = () => {
    navigate("/busqueda");
    setIsMobileMenuOpen(false);
  };

  const handleGoToCart = () => {
    navigate("/carrito");
    setIsMobileMenuOpen(false);
  };

  const handleGoToHome = () => {
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    if (isUserMenuOpen) {
      setIsUserMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleOrderHistory = () => {
    navigate("/mis-pedidos");
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleProfile = () => {
    navigate("/perfil");
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeAllMenus = () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <HeaderContainer>
        <Logo onClick={handleGoToHome}>
          <RenderIcon name="FaHome" size={18} />
        </Logo>

        <RightSection>
          <DesktopOnlySection>
            <IconButton
              leftIconName="FaSearch"
              iconSize={18}
              onClick={handleSearchAllCompanies}
            />

            {isClient && !isVisualizacion && (
              <IconButton
                text={itemCount > 0 && <CartCount>{itemCount}</CartCount>}
                leftIconName={"FaShoppingCart"}
                iconSize={18}
                onClick={handleGoToCart}
              />
            )}

            <UserMenu>
              <IconButton
                onClick={toggleUserMenu}
                iconSize={16}
                leftIconName={"FaUser"}
              />

              <UserMenuDropdown $isOpen={isUserMenuOpen}>
                <UserMenuItem onClick={handleProfile}>
                  <RenderIcon name="FaUser" size={16} />
                  Perfil
                </UserMenuItem>

                {isClient && !isVisualizacion && (
                  <UserMenuItem onClick={handleOrderHistory}>
                    <RenderIcon name="FaHistory" size={16} />
                    Mis Pedidos
                  </UserMenuItem>
                )}

                <UserMenuItem onClick={toggleTheme}>
                  <RenderIcon
                    name={isDarkMode ? "FaSun" : "FaMoon"}
                    size={16}
                  />
                  Cambiar a tema {isDarkMode ? "claro" : "oscuro"}
                  <div style={{ marginLeft: "auto", display: "none" }}>
                    <input
                      type="checkbox"
                      checked={isDarkMode}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleTheme();
                      }}
                    />
                  </div>
                </UserMenuItem>
                <UserMenuItem onClick={handleLogout}>
                  <RenderIcon name="FaSignOutAlt" size={16} />
                  Cerrar Sesión
                </UserMenuItem>
              </UserMenuDropdown>
            </UserMenu>
          </DesktopOnlySection>

          <MobileOnlySection>
            {isClient && !isVisualizacion && (
              <IconButton
                text={itemCount > 0 && <CartCount>{itemCount}</CartCount>}
                leftIconName={"FaShoppingCart"}
                iconSize={20}
                onClick={handleGoToCart}
              />
            )}

            <MobileMenuButton onClick={toggleMobileMenu}>
              <RenderIcon name="FaBars" size={20} />
            </MobileMenuButton>
          </MobileOnlySection>
        </RightSection>
      </HeaderContainer>

      {/* Menú móvil */}
      <MobileMenuOverlay $isOpen={isMobileMenuOpen} onClick={closeAllMenus} />

      <UserMenuDropdown $isOpen={isMobileMenuOpen}>
        <MobileMenuHeader>
          <MobileMenuTitle>Menú</MobileMenuTitle>
          <CloseButton onClick={closeAllMenus}>
            <RenderIcon name="FaTimes" size={20} />
          </CloseButton>
        </MobileMenuHeader>

        <MobileMenuContent>
          <UserMenuItem onClick={handleSearchAllCompanies}>
            <RenderIcon name="FaSearch" size={16} />
            Buscar en todas las empresas
          </UserMenuItem>

          <UserMenuItem onClick={handleProfile}>
            <RenderIcon name="FaUser" size={16} />
            Perfil
          </UserMenuItem>

          {isClient && !isVisualizacion && (
            <>
              {/* <UserMenuItem onClick={handleGoToCart}>
                <RenderIcon name="FaShoppingCart" size={16} />
                Carrito {itemCount > 0 && `(${itemCount})`}
              </UserMenuItem> */}

              <UserMenuItem onClick={handleOrderHistory}>
                <RenderIcon name="FaHistory" size={16} />
                Mis Pedidos
              </UserMenuItem>
            </>
          )}

          <UserMenuItem onClick={toggleTheme}>
            <RenderIcon name={isDarkMode ? "FaSun" : "FaMoon"} size={16} />
            Cambiar a tema {isDarkMode ? "claro" : "oscuro"}
          </UserMenuItem>

          <UserMenuItem onClick={handleLogout}>
            <RenderIcon name="FaSignOutAlt" size={16} />
            Cerrar Sesión
          </UserMenuItem>
        </MobileMenuContent>
      </UserMenuDropdown>
    </>
  );
}
