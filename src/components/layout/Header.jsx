import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useAppTheme } from "../../context/AppThemeContext";
import { useState, useEffect } from "react";
import { ROUTES } from "../../constants/routes";
import {
  api_access_sections_get_permission_by_email_and_section,
} from "../../api/accessSections/apiAccessSections";
import GrupoViiLogo from "../../assets/GrupoViiLogo.png";

import RenderIcon from "../ui/RenderIcon";

const HeaderContainer = styled.header`
  width: 100%;
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 1rem;
  z-index: 500;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};
  position: relative;
  min-height: 45px;
  height: auto;

  @media (min-width: 768px) {
    grid-template-columns: auto 1fr auto;
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
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: start;
  height: 25px;
  
  img {
    height: 20px;
    width: auto;
    object-fit: contain;
  }

  @media (min-width: 768px) {
    height: 25px;
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

const CartIndicator = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 50%;
  width: 10px;
  height: 10px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserMenuBridge = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  height: 10px;
  z-index: 259;
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
`;

const UserMenuDropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 4px;
  box-shadow: 0 2px 10px ${({ theme }) => theme.colors.shadow};
  width: 200px;
  z-index: 260;
  overflow: hidden;
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};

  @media (max-width: 767px) {
    position: fixed;
    top: 45px;
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
  z-index: 250;
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};

  @media (min-width: 768px) {
    display: none;
  }
`;

const RightSection = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  justify-self: end;
  flex-wrap: wrap;
  min-width: fit-content;

  @media (min-width: 768px) {
    gap: 0.3rem;
    flex-wrap: nowrap;
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
  padding: 0;
`;

const UserEmail = styled.div`
  padding: 1rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
  font-weight: 500;
  word-break: break-all;
  overflow-wrap: break-word;

  @media (min-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }
`;

const NavigationMenu = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-self: center;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.white : "rgba(255, 255, 255, 0.8)"};
  font-size: 0.9rem;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.white};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.white};
    transform: ${({ $active }) => ($active ? "scaleX(1)" : "scaleX(0)")};
    transition: transform 0.2s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

export default function Header() {
  const { user, isClient, isVisualizacion, isReencaucheUser, logout } =
    useAuth();
  const { hasItems } = useCart(); // Solo usamos hasItems para mostrar indicador
  const { isDarkMode, toggleTheme } = useAppTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accessSections, setAccessSections] = useState([]);

  // Verificar si estamos en el home
  const isHome = location.pathname === ROUTES.ECOMMERCE.HOME;

  // Obtener accesos a secciones
  useEffect(() => {
    if (!user?.EMAIL) return;

    const fetchAccessSections = async () => {
      try {
        const [response1, response2, response3] = await Promise.all([
          api_access_sections_get_permission_by_email_and_section(user.EMAIL, "APPSHELL"),
          api_access_sections_get_permission_by_email_and_section(user.EMAIL, "REENCAUCHE"),
          api_access_sections_get_permission_by_email_and_section(user.EMAIL, "XCOIN")
        ]);

        const sections = [];
        if (response1.success && response1.data) {
          sections.push(response1.data);
        }
        if (response2.success && response2.data) {
          sections.push(response2.data);
        }
        if (response3.success && response3.data) {
          sections.push(response3.data);
        }
        setAccessSections(sections);
      } catch (error) {
        console.error("Error fetching access sections:", error);
        setAccessSections([]);
      }
    };

    fetchAccessSections();
  }, [user?.EMAIL]);

  const hasAppShellAccess = accessSections.some(
    (section) => section.SECTION_PERMITTED_USER === "APPSHELL"
  );
  
  const hasReencaucheAccess = accessSections.some(
    (section) => section.SECTION_PERMITTED_USER === "REENCAUCHE"
  );

  const hasXCoinAccess = accessSections.some(
    (section) => section.SECTION_PERMITTED_USER === "XCOIN"
  );

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

  const handleUserMenuMouseLeave = () => {
    setIsUserMenuOpen(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Función helper para hacer scroll a un elemento esperando a que esté disponible
  const scrollToElement = (selector, maxAttempts = 20, interval = 100) => {
    let attempts = 0;
    
    const tryScroll = () => {
      const element = document.querySelector(selector);
      
      if (element) {
        // Verificar que el elemento esté visible y tenga dimensiones
        const rect = element.getBoundingClientRect();
        if (rect.height > 0 || rect.width > 0) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          return true;
        }
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(tryScroll, interval);
      } else {
        // Último intento después de esperar un poco más
        setTimeout(() => {
          const element = document.querySelector(selector);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 500);
      }
      
      return false;
    };
    
    tryScroll();
  };

  // Función para manejar la navegación y scroll a una sección
  const handleNavigateAndScroll = (selector) => {
    setIsMobileMenuOpen(false);
    
    if (location.pathname !== ROUTES.ECOMMERCE.HOME) {
      // Si no estamos en el home, navegar primero
      navigate(ROUTES.ECOMMERCE.HOME);
      // Esperar un poco más para que React Router complete la navegación
      setTimeout(() => {
        scrollToElement(selector);
      }, 100);
    } else {
      // Si ya estamos en el home, hacer scroll directamente
      scrollToElement(selector);
    }
  };

  return (
    <>
      <HeaderContainer>
        <Logo onClick={handleGoToHome}>
          <img src={GrupoViiLogo} alt="Grupo VII" />
        </Logo>

        <NavigationMenu>
          <NavLink
            $active={false}
            onClick={() => handleNavigateAndScroll("#inicio")}
          >
            Inicio
          </NavLink>
          <NavLink
            $active={false}
            onClick={() => handleNavigateAndScroll("#empresas-grid")}
          >
            Catálogos
          </NavLink>
          {hasAppShellAccess && (
            <NavLink
              $active={false}
              onClick={() => handleNavigateAndScroll("#club-shell-maxx")}
            >
              Club Shell Maxx
            </NavLink>
          )}
          {hasReencaucheAccess && (
            <NavLink
              $active={false}
              onClick={() => handleNavigateAndScroll("#bonos-haohua")}
            >
              Bonos Haohua
            </NavLink>
          )}
          {hasXCoinAccess && (
            <NavLink
              $active={false}
              onClick={() => handleNavigateAndScroll("#xcoin")}
            >
              XCoin
            </NavLink>
          )}
        </NavigationMenu>

        <RightSection>
          <DesktopOnlySection>
            {!isReencaucheUser && (
              <IconButton
                leftIconName="FaMagnifyingGlass"
                iconSize={18}
                onClick={handleSearchAllCompanies}
              />
            )}

            {isClient && !isVisualizacion && !isReencaucheUser && (
              <IconButton
                text={hasItems && <CartIndicator />}
                leftIconName={"FaCartShopping"}
                iconSize={18}
                onClick={handleGoToCart}
              />
            )}

            <UserMenu onMouseLeave={handleUserMenuMouseLeave}>
              <IconButton
                onClick={toggleUserMenu}
                iconSize={16}
                leftIconName={"FaUser"}
              />

              <UserMenuBridge $isOpen={isUserMenuOpen} />

              <UserMenuDropdown $isOpen={isUserMenuOpen}>
                <UserEmail>
                  {user?.CORREOS?.[0] || user?.EMAIL || "Usuario"}
                </UserEmail>

                {!isReencaucheUser && (
                  <UserMenuItem onClick={handleProfile}>
                    <RenderIcon name="FaUser" size={16} />
                    Perfil
                  </UserMenuItem>
                )}

                {isClient && !isVisualizacion && !isReencaucheUser && (
                  <UserMenuItem onClick={handleOrderHistory}>
                    <RenderIcon name="FaBagShopping" size={16} />
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
                  <RenderIcon name="FaDoorClosed" size={16} />
                  Cerrar Sesión
                </UserMenuItem>
              </UserMenuDropdown>
            </UserMenu>
          </DesktopOnlySection>

          <MobileOnlySection>
            {isClient && !isVisualizacion && !isReencaucheUser && (
              <IconButton
                text={hasItems && <CartIndicator />}
                leftIconName={"FaCartShopping"}
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
        <UserEmail>{user?.CORREOS?.[0] || user?.EMAIL || "Usuario"}</UserEmail>

        <MobileMenuContent>
          <UserMenuItem
            $active={location.pathname === ROUTES.ECOMMERCE.HOME}
            onClick={() => {
              handleNavClick(ROUTES.ECOMMERCE.HOME);
            }}
          >
            <RenderIcon name="FaHouse" size={16} />
            Inicio
          </UserMenuItem>
          <UserMenuItem
            onClick={() => {
              handleNavigateAndScroll("#empresas-grid");
            }}
          >
            <RenderIcon name="FaBuilding" size={16} />
            Catálogos
          </UserMenuItem>
          {hasAppShellAccess && (
            <UserMenuItem
              onClick={() => {
                handleNavigateAndScroll("#club-shell-maxx");
              }}
            >
              <RenderIcon name="FaMobile" size={16} />
              Club Shell Maxx
            </UserMenuItem>
          )}
          {hasReencaucheAccess && (
            <UserMenuItem
              onClick={() => {
                handleNavigateAndScroll("#bonos-haohua");
              }}
            >
              <RenderIcon name="FaTicket" size={16} />
              Bonos Haohua
            </UserMenuItem>
          )}
          {hasXCoinAccess && (
            <UserMenuItem
              onClick={() => {
                handleNavigateAndScroll("#xcoin");
              }}
            >
              <RenderIcon name="FaCoins" size={16} />
              XCoin
            </UserMenuItem>
          )}
          {!isReencaucheUser && (
            <UserMenuItem onClick={handleSearchAllCompanies}>
              <RenderIcon name="FaMagnifyingGlass" size={16} />
              Buscar en todas las empresas
            </UserMenuItem>
          )}
          {!isReencaucheUser && (
            <UserMenuItem onClick={handleProfile}>
              <RenderIcon name="FaUser" size={16} />
              Perfil
            </UserMenuItem>
          )}
          {isClient && !isVisualizacion && !isReencaucheUser && (
            <UserMenuItem onClick={handleOrderHistory}>
              <RenderIcon name="FaBagShopping" size={16} />
              Mis Pedidos
            </UserMenuItem>
          )}
          <UserMenuItem onClick={toggleTheme}>
            <RenderIcon name={isDarkMode ? "FaSun" : "FaMoon"} size={16} />
            Cambiar a tema {isDarkMode ? "claro" : "oscuro"}
          </UserMenuItem>
          <UserMenuItem onClick={handleLogout}>
            <RenderIcon name="FaDoorClosed" size={16} />
            Cerrar Sesión
          </UserMenuItem>
        </MobileMenuContent>
      </UserMenuDropdown>
    </>
  );
}
