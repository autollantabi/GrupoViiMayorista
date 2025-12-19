import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { empresas } from "../../mock/products";
import Button from "../../components/ui/Button";
import { api_products_getInfoProductos } from "../../api/products/apiProducts";
import PageContainer from "../../components/layout/PageContainer";
import RenderLoader from "../../components/ui/RenderLoader";
import RenderIcon from "../../components/ui/RenderIcon";
import SEO from "../../components/seo/SEO";
import { ROUTES } from "../../constants/routes";

const HeroSection = styled.section`
  min-height: calc(100vh - 45px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`
      : `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`};
  position: relative;

  @media (max-width: 768px) {
    min-height: auto;
    padding: 2rem 0.5rem;
    justify-content: flex-start;
  }
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: 3rem;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`;

const CompaniesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.5rem;
  padding: 0.5rem 0;
  width: 100%;
  max-width: 1400px;
  justify-items: stretch;

  /* Desktop: Layout especial con 3 arriba y 2 abajo centrados */
  @media (min-width: 1025px) {
    /* Los primeros 3 elementos ocupan 2 columnas cada uno (total 6 columnas) */
    > *:nth-child(1) {
      grid-column: 1 / 3;
    }

    > *:nth-child(2) {
      grid-column: 3 / 5;
    }

    > *:nth-child(3) {
      grid-column: 5 / 7;
    }

    /* El 4to elemento: centrado entre el espacio del 1er y 2do elemento */
    > *:nth-child(4):nth-last-child(2) {
      grid-column: 2 / 4;
    }

    /* El 5to elemento: centrado entre el espacio del 2do y 3er elemento */
    > *:nth-child(5):nth-last-child(1) {
      grid-column: 4 / 6;
    }
  }

  /* Tablet: 2 columnas simples */
  @media (max-width: 1024px) and (min-width: 769px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;

    > * {
      grid-column: span 1 !important;
    }
  }

  /* Móvil: 1 columna */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;

    > * {
      grid-column: span 1 !important;
    }
  }
`;

const CompanyCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 5px 15px rgba(0, 0, 0, 0.3)"
      : "0 5px 15px rgba(0, 0, 0, 0.08)"};
  transition: all 0.4s ease;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? "0 15px 25px rgba(0, 0, 0, 0.5)"
        : "0 15px 25px rgba(0, 0, 0, 0.12)"};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CardContent = styled.div`
  overflow: hidden;
  border-radius: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CardBody = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ProductCount = styled.span`
  position: absolute;
  bottom: 12px;
  right: 12px;
  font-size: 0.75rem;
  border-radius: 20px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 600;
  z-index: 10;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.4)"
      : "0 2px 8px rgba(0, 0, 0, 0.15)"};
  backdrop-filter: blur(10px);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Cinta para destacar visualmente las empresas con acceso
const AccessRibbon = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  height: 200px;
  overflow: hidden;
  pointer-events: none;
  z-index: 20;
`;

const RibbonContent = styled.div`
  background: ${({ $hasAccess, theme }) =>
    $hasAccess ? theme.colors.success : theme.colors.warning};
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.65rem;
  font-weight: 700;
  text-align: center;
  padding: 8px 10px;
  transform: rotate(45deg) translateX(30%) translateY(-80%);
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 5px 10px rgba(0, 0, 0, 0.4)"
      : "0 5px 10px rgba(0, 0, 0, 0.1)"};
  width: 150px;
  z-index: 21;
`;

const CompanyLogo = styled.div`
  height: 170px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)"
      : "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)"};

  position: relative;
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const CompanyDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  line-height: 1.5;
  text-align: center;
`;

// Estilos para la sección de Reencauche
const ReencaucheSection = styled.section`
  padding: 4rem 2rem;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.success}20, ${theme.colors.success}30)`
      : `linear-gradient(135deg, ${theme.colors.success}15, ${theme.colors.success}25)`};
  border-top: 1px solid
    ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.success}40`
        : `${theme.colors.success}30`};
  border-bottom: 1px solid
    ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.success}40`
        : `${theme.colors.success}30`};

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const ReencaucheHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const ReencaucheTitle = styled.h2`
  color: ${({ theme }) => theme.colors.success};
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const ReencaucheDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.2rem;
  margin: 0 0 2rem 0;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ReencaucheActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const ReencaucheButton = styled(Button)`
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border: none;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) =>
      theme.colors.successDark || theme.colors.success};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.success}40;
  }
`;

// Estilos para la sección de App Shell
const AppShellSection = styled.section`
  padding: 4rem 2rem;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.primary}30)`
      : `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.primary}25)`};
  border-top: 1px solid
    ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.primary}40`
        : `${theme.colors.primary}30`};
  border-bottom: 1px solid
    ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.primary}40`
        : `${theme.colors.primary}30`};

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const AppShellHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const AppShellTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const AppShellDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.2rem;
  margin: 0 0 2rem 0;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const AppShellActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const AppShellButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) =>
      theme.colors.primaryDark || theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.primary}40;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 45px);
  width: 100%;
  gap: 1.5rem;
  padding: 2rem;
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  margin: 0;
  text-align: center;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: ${({ $visible }) => ($visible ? "flex" : "none")};
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  animation: ${({ $visible }) =>
    $visible ? "bounce 2s ease-in-out infinite" : "none"};
  cursor: pointer;
  z-index: 10;
  transition: opacity 0.3s ease-in-out;

  @keyframes bounce {
    0%,
    100% {
      transform: translateX(-50%) translateY(0);
    }
    50% {
      transform: translateX(-50%) translateY(-10px);
    }
  }

  @media (max-width: 768px) {
    bottom: 1rem;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ScrollText = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const ClientHomeComponent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [productsInfo, setProductsInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  // Función para encontrar el contenedor con scroll (fuera del useEffect para reutilizarla)
  const findScrollContainer = () => {
    // Primero buscar el contenedor principal de la app (el div dentro de MainContent)
    // Este es el contenedor que tiene overflowY: auto en AuthenticatedLayout
    let scrollContainer = null;

    // Buscar el contenedor principal que tiene overflow-y: auto
    // Este debería ser el div hijo directo de MainContent
    const allDivs = document.querySelectorAll("div");
    for (const div of allDivs) {
      const style = window.getComputedStyle(div);
      if (style.overflowY === "auto" || style.overflowY === "scroll") {
        // Verificar que tenga scroll y que sea un contenedor principal
        if (div.scrollHeight > div.clientHeight) {
          // Priorizar contenedores que están más arriba en el DOM (más cercanos al root)
          if (!scrollContainer || div.contains(scrollContainer)) {
            scrollContainer = div;
          }
        }
      }
    }

    return scrollContainer;
  };

  useEffect(() => {
    const fetchProductsInfo = async () => {
      try {
        setIsLoading(true);
        const response = await api_products_getInfoProductos();

        if (response.success && response.data) {
          // Asegurar que siempre sea un array
          const data = Array.isArray(response.data) ? response.data : [];
          setProductsInfo(data);
        } else {
          console.error(
            "Error al obtener información de productos:",
            response.message
          );
          setProductsInfo([]);
        }
      } catch (error) {
        console.error("Error fetching products info:", error);
        setProductsInfo([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsInfo();
  }, []);

  // Detectar scroll para ocultar el indicador
  useEffect(() => {
    let scrollContainer = null;
    let isScrolling = false;

    const handleScroll = () => {
      if (isScrolling) return; // Evitar múltiples llamadas
      isScrolling = true;

      requestAnimationFrame(() => {
        let scrollY = 0;

        // Obtener el scroll del contenedor (re-buscar por si cambió)
        const currentContainer = findScrollContainer();
        if (currentContainer) {
          scrollY = currentContainer.scrollTop || 0;
        } else {
          // Si no hay contenedor con scroll, usar el scroll del window
          scrollY =
            window.scrollY ||
            window.pageYOffset ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0;
        }

        // Mostrar el indicador si está cerca del top (<= 100px)
        // Ocultar el indicador si está más abajo (> 100px)
        if (scrollY > 100) {
          setShowScrollIndicator(false);
        } else {
          setShowScrollIndicator(true);
        }

        isScrolling = false;
      });
    };

    // Función para configurar los listeners
    const setupListeners = () => {
      // Buscar el contenedor con scroll
      scrollContainer = findScrollContainer();

      // Agregar listener de scroll al contenedor correcto
      if (scrollContainer) {
        scrollContainer.addEventListener("scroll", handleScroll, {
          passive: true,
        });
      }

      // También escuchar en window por si acaso
      window.addEventListener("scroll", handleScroll, { passive: true });

      // Verificar posición inicial
      let initialScrollY = 0;
      if (scrollContainer) {
        initialScrollY = scrollContainer.scrollTop || 0;
      } else {
        initialScrollY =
          window.scrollY ||
          window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;
      }

      if (initialScrollY > 100) {
        setShowScrollIndicator(false);
      }
    };

    // Configurar listeners después de un delay para asegurar que el DOM esté listo
    const timeoutId = setTimeout(setupListeners, 500);

    return () => {
      clearTimeout(timeoutId);
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Obtener accesos del usuario y convertir a mayúsculas para comparación
  const userAccess = user?.EMPRESAS || [];

  // Verificar si el usuario tiene acceso a MAXXIMUNDO
  const hasMaxximundoAccess = userAccess.includes("MAXXIMUNDO");

  const handleCardClick = (empresa) => {
    navigate(`/catalogo/${empresa.nombre}`);
  };

  // Función para obtener la cantidad de productos de una empresa
  const getProductCount = (empresaName) => {
    if (!Array.isArray(productsInfo) || productsInfo.length === 0) {
      return 0;
    }
    const productsInf = productsInfo.filter(
      (product) => product.ENTERPRISE === empresaName
    );
    if (!productsInf || productsInf.length === 0) {
      return 0;
    }
    const productsCount = productsInf[0]?.TOTAL || 0;

    return productsCount;
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <RenderLoader size="64px" showSpinner={true} floatingSpinner={true} />
        <LoadingText>Cargando empresas...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <>
      <SEO
        title={`Bienvenido - Portal Cliente`}
        description={`Portal de cliente ViiCommerce. Accede a catálogos de neumáticos, lubricantes y herramientas. Gestiona bonos de reencauche y explora productos de las mejores empresas.`}
        keywords="portal cliente, catálogo productos, bonos reencauche, neumáticos, lubricantes, herramientas, ViiCommerce"
      />
      {/* Hero Section - Grid de Empresas */}
      <HeroSection>
        <HeroTitle>Nuestras Empresas</HeroTitle>
        <HeroSubtitle>
          Explora los catálogos de productos de las mejores empresas del sector
        </HeroSubtitle>
        <CompaniesGrid>
          {empresas.map((empresa) => {
            // Verificar si el usuario tiene acceso (comparando en mayúsculas)
            const hasAccess = userAccess.includes(empresa.nombre.toUpperCase());
            const productCount = getProductCount(empresa.nombre);

            return (
              <CompanyCard
                key={empresa.id}
                onClick={() => handleCardClick(empresa)}
              >
                <AccessRibbon>
                  <RibbonContent $hasAccess={hasAccess}>
                    {hasAccess ? "ACCESO" : "SIN ACCESO"}
                  </RibbonContent>
                </AccessRibbon>

                <CardContent>
                  <CompanyLogo>
                    <ProductCount>{productCount} productos</ProductCount>
                    <img src={empresa.logo} alt={`Logo de ${empresa.nombre}`} />
                  </CompanyLogo>
                  <CardBody>
                    <CompanyDescription>
                      {empresa.descripcion}
                    </CompanyDescription>
                  </CardBody>
                </CardContent>
              </CompanyCard>
            );
          })}
        </CompaniesGrid>
        <ScrollIndicator
          $visible={showScrollIndicator}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            // Buscar el contenedor con scroll
            const scrollContainer = findScrollContainer();

            if (scrollContainer) {
              // Hacer scroll en el contenedor interno
              const currentScroll = scrollContainer.scrollTop || 0;
              const scrollAmount = 600; // Scroll de 600px
              const targetScroll = currentScroll + scrollAmount;

              // Hacer scroll
              scrollContainer.scrollTo({
                top: targetScroll,
                behavior: "smooth",
              });

              // Ocultar después de un delay para que se vea el scroll
              setTimeout(() => {
                setShowScrollIndicator(false);
              }, 800);
            } else {
              // Si no hay contenedor, hacer scroll en window
              const currentScroll = window.scrollY || window.pageYOffset || 0;
              const scrollAmount = 600;

              window.scrollTo({
                top: currentScroll + scrollAmount,
                behavior: "smooth",
              });

              // Ocultar después de un delay
              setTimeout(() => {
                setShowScrollIndicator(false);
              }, 800);
            }
          }}
        >
          <ScrollText>Ver más</ScrollText>
          <RenderIcon name="FaChevronDown" size={24} />
        </ScrollIndicator>
      </HeroSection>

      {/* Sección de App Shell (solo si tiene acceso a MAXXIMUNDO) */}
      {hasMaxximundoAccess && (
        <AppShellSection>
          <AppShellHeader>
            <AppShellTitle>
              <img
                src={"/shell/ShellLogo.png"}
                style={{ objectFit: "cover", width: "60px" }}
                alt="Logo de Shell"
              />
              App Shell
            </AppShellTitle>
            <AppShellDescription>
              Accede a la aplicación móvil de Maxximundo. Gestiona tus pedidos,
              productos y más desde cualquier dispositivo.
            </AppShellDescription>
          </AppShellHeader>

          <AppShellActions>
            <AppShellButton
              text="Acceder a App Shell"
              leftIconName="FaMobileAlt"
              onClick={() => navigate(ROUTES.ECOMMERCE.APP_SHELL)}
            />
          </AppShellActions>
        </AppShellSection>
      )}

      {/* Sección de Sistema de Bonos */}
      <ReencaucheSection>
        <ReencaucheHeader>
          <ReencaucheTitle>
            <RenderIcon name="FaTicketAlt" size={32} />
            Bonos de Reencauche Haohua
          </ReencaucheTitle>
          <ReencaucheDescription>
            Gestiona los bonos de neumáticos de tus clientes de manera fácil y
            eficiente. Registra bonos por CI/RUC y mantén un control completo de
            todas tus transacciones.
          </ReencaucheDescription>
        </ReencaucheHeader>

        <ReencaucheActions>
          <ReencaucheButton
            text="Acceder al Sistema de Bonos"
            leftIconName="FaTicketAlt"
            onClick={() => navigate(ROUTES.ECOMMERCE.REENCAUCHE)}
          />
        </ReencaucheActions>
      </ReencaucheSection>
    </>
  );
};

export default ClientHomeComponent;
