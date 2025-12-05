import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../../context/CartContext";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { PRODUCT_LINE_CONFIG } from "../../constants/productLineConfig";
import { toast } from "react-toastify";
import { useProductCatalog } from "../../context/ProductCatalogContext";
import { TAXES, calculatePriceWithIVA } from "../../constants/taxes";
import PageContainer from "../../components/layout/PageContainer";
import ContactModal from "../../components/ui/ContactModal";
import SEO from "../../components/seo/SEO";
import { useProductStructuredData } from "../../hooks/useStructuredData";
import { baseLinkImages } from "../../constants/links";

const ProductLayout = styled.div`
  display: grid;
  grid-template-columns: 35% 1fr;
  gap: 40px;
  background-color: ${({ theme }) => theme.colors.background};
  align-items: start;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  @media (max-width: 768px) {
    gap: 24px;
  }

  @media (max-width: 576px) {
    gap: 20px;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  min-width: 0;
`;

const Category = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 6px;
  }
`;

const ProductTitle = styled.h1`
  margin: 0 0 5px 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.8rem;
  word-break: break-word;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin-bottom: 8px;
  }

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const PriceContainer = styled.div`
  margin-bottom: 10px;
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const CurrentPrice = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const IVAIndicator = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-style: italic;
  display: block;
  margin-bottom: 5px;

  @media (max-width: 480px) {
    margin-bottom: 0;
  }
`;

const OriginalPrice = styled.span`
  font-size: 1.2rem;
  text-decoration: line-through;
  color: ${({ theme }) => theme.colors.textLight};

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Discount = styled.span`
  background-color: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.colors.white};
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 3px 6px;
  }
`;

const Description = styled.div`
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
  white-space: pre-line;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;
const StockIndicator = styled.div`
  margin: 10px 0;
  padding: 12px 16px;
  border-radius: 6px;
  background-color: ${({ theme, $inStock, $lowStock }) => {
    if ($inStock) return `${theme.colors.success}10`;
    if ($lowStock) return `${theme.colors.warning || "#fbbf24"}10`;
    return `${theme.colors.error}10`;
  }};
  display: flex;
  align-items: center;
  width: max-content;
  gap: 10px;
  max-width: 100%;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    padding: 10px 14px;
    gap: 8px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    gap: 6px;
  }
`;

const StockBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: ${({ theme, $inStock, $lowStock }) => {
    if ($inStock) return theme.colors.success;
    if ($lowStock) return theme.colors.warning || "#fbbf24";
    return theme.colors.error;
  }};
  color: ${({ theme }) => theme.colors.white};
  white-space: nowrap;
`;

const StockMessage = styled.span`
  font-size: 0.9rem;
  color: ${({ theme, $inStock, $lowStock }) => {
    if ($inStock) return theme.colors.success;
    if ($lowStock) return theme.colors.warning || "#fbbf24";
    return theme.colors.error;
  }};
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const QuantityControlsContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    margin-bottom: 16px;
  }
`;

const QuantityWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const QuantityLabel = styled.div`
  font-weight: 500;
  min-width: 80px;

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

const CartCount = styled.span`
  font-size: 0.85em;
  color: #666;
  margin-left: 8px;

  @media (max-width: 768px) {
    margin-left: auto;
  }
`;

const AddToCartButtonWrapper = styled.div`
  min-width: 180px;
  max-width: 250px;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
  }
`;

const QuantityButton = styled(Button)`
  width: 36px;
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme, disabled }) =>
    disabled ? `${theme.colors.border}` : theme.colors.surface};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textLight : theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  min-width: 36px;
  padding: 0;

  &:first-child {
    border-radius: 4px 0 0 4px;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.background};
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    min-width: 40px;
  }
`;

const QuantityInput = styled.input`
  width: 60px;
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 1rem;
  background-color: ${({ theme, disabled }) =>
    disabled ? `${theme.colors.border}30` : theme.colors.surface};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textLight : theme.colors.text};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "text")};

  @media (max-width: 480px) {
    width: 70px;
    height: 40px;
    font-size: 1.1rem;
  }
`;

// Agregar este nuevo componente para las especificaciones
const SpecificationsSection = styled.div`
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 768px) {
    margin-top: 20px;
    padding-top: 12px;
  }
`;

const SpecificationsTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 12px;
  }
`;

const SpecificationsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const SpecRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const SpecLabel = styled.td`
  padding: 8px 0;
  font-weight: 500;
  width: 40%;
  color: ${({ theme }) => theme.colors.textLight};

  @media (max-width: 768px) {
    padding: 6px 0;
    font-size: 0.9rem;
    width: 45%;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
    padding: 5px 0;
  }
`;

const SpecValue = styled.td`
  padding: 8px 0;
  color: ${({ theme }) => theme.colors.text};
  word-break: break-word;

  @media (max-width: 768px) {
    padding: 6px 0;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
    padding: 5px 0;
  }
`;

// Componentes para los breadcrumbs
const BreadcrumbsContainer = styled.nav`
  margin-bottom: 24px;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 768px) {
    margin-bottom: 16px;
    padding: 12px 0;
  }
`;

const BreadcrumbsList = styled.ol`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
`;

const BreadcrumbLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text : theme.colors.textLight};
  text-decoration: ${({ $active }) => ($active ? "none" : "underline")};
  cursor: ${({ $active }) => ($active ? "default" : "pointer")};
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 3px 6px;
  }

  &:hover:not([disabled]) {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0 4px;
  font-size: 0.8rem;

  @media (max-width: 768px) {
    font-size: 0.7rem;
    margin: 0 3px;
  }
`;

// Estilos adicionales para el zoom de la imagen
const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
`;

const MainImageContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  cursor: crosshair;
  overflow: hidden;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 4px 10px ${({ theme }) => theme.colors.shadow};
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    cursor: default;
    border-radius: 6px;
    box-shadow: 0 2px 6px ${({ theme }) => theme.colors.shadow};
    overflow: hidden;
  }
`;

const MainImage = styled.img`
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: contain;
  display: block;

  @media (max-width: 992px) {
    max-height: 450px;
  }

  @media (max-width: 768px) {
    max-height: 350px;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    max-height: 280px;
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  max-width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
  text-align: center;
  padding: 40px;
  border-radius: 8px;
  border: 2px dashed ${({ theme }) => theme.colors.border};

  @media (max-width: 992px) {
    height: 350px;
  }

  @media (max-width: 768px) {
    padding: 24px;
    height: 300px;
    font-size: 0.9rem;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    height: 250px;
    padding: 20px;
    font-size: 0.85rem;
  }
`;

const ZoomWindow = styled.div`
  position: fixed;
  /* Eliminar right: -100% para que no esté fijo */
  width: 300px;
  height: 300px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
  box-shadow: 0 4px 10px ${({ theme }) => theme.colors.shadow};
  overflow: hidden;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.2s ease-in-out;
  pointer-events: none;
  z-index: 5000;
  border: 1px solid ${({ theme }) => theme.colors.border};
  visibility: ${({ $visible }) => ($visible ? "visible" : "hidden")};

  @media (max-width: 992px) {
    display: none; // Ocultar en dispositivos móviles/tablets
  }
`;

const ZoomedImage = styled.div`
  position: absolute;
  background-image: url(${({ src }) => src});
  background-repeat: no-repeat;
  width: 400%; // Imagen ampliada a 3x
  height: 400%;
  background-size: cover;
  transform-origin: 0 0;
`;

// En el componente DetalleProducto, agregar esta función para renderizar especificaciones
const renderSpecifications = (product) => {
  if (!product.specs || Object.keys(product.specs).length === 0) {
    return null;
  }

  // Obtener la configuración correspondiente a la línea de negocio
  const lineConfig =
    PRODUCT_LINE_CONFIG[product.lineaNegocio] || PRODUCT_LINE_CONFIG.DEFAULT;

  return (
    <SpecificationsSection>
      <SpecificationsTitle>Especificaciones técnicas</SpecificationsTitle>
      <SpecificationsTable>
        <tbody>
          {lineConfig.specs.map((specConfig) => {
            const value = product.specs[specConfig.field];

            // Solo mostrar si hay un valor
            if (value === null) return null;

            return (
              <SpecRow key={specConfig.field}>
                <SpecLabel>
                  {specConfig.label === "Serie"
                    ? "Alto/Serie"
                    : specConfig.label}
                </SpecLabel>
                <SpecValue>{value}</SpecValue>
              </SpecRow>
            );
          })}
        </tbody>
      </SpecificationsTable>
    </SpecificationsSection>
  );
};

const DetalleProducto = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loadProductByCodigo } = useProductCatalog();
  const { navigateToHomeByRole, isClient, isVisualizacion } = useAuth();
  const { addToCart, cart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  // Intentar obtener el producto del estado de navegación primero
  const [product, setProduct] = useState(location.state?.product || null);

  // Obtener prevUrl desde los parámetros de URL en lugar de location.state
  const prevUrl = searchParams.get("prevUrl")
    ? decodeURIComponent(searchParams.get("prevUrl"))
    : location.state?.prevUrl || null;

  // SEO y datos estructurados
  const structuredData = useProductStructuredData(product);

  const resolvedEmpresaId = useMemo(() => {
    const companyFromState = location.state?.empresaId;
    if (companyFromState) return companyFromState;
    if (product?.empresaId) return product.empresaId;
    if (product?.empresa) return product.empresa;
    return null;
  }, [location.state, product?.empresaId, product?.empresa]);

  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const hoverTimeoutRef = useRef(null);
  const hasFetchedProductRef = useRef(false);
  const quantityIntervalRef = useRef(null);
  const mouseDownExecutedRef = useRef(false);

  // Función para renderizar los breadcrumbs dinámicos según el origen
  const renderBreadcrumbs = () => {
    let breadcrumbs = [
      {
        label: "Inicio",
        onClick: () => navigateToHomeByRole(),
        active: false,
      },
    ];

    // Determinar el segundo breadcrumb según el origen
    if (prevUrl) {
      if (prevUrl.includes("/catalogo/")) {
        // Vino desde el catálogo
        breadcrumbs.push({
          label: `Catálogo ${product?.empresa || product?.empresaId || ""}`,
          onClick: () => {
            // Navegar directamente a la URL sin pasar state, ya que todo está en la URL
            navigate(prevUrl);
          },
          active: false,
        });
      } else if (prevUrl.includes("/carrito")) {
        // Vino desde el carrito
        breadcrumbs.push({
          label: "Carrito",
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(prevUrl);
          },
          active: false,
        });
      } else if (prevUrl.includes("/mis-pedidos/")) {
        // Vino desde detalle de pedido del cliente
        breadcrumbs.push({
          label: "Detalle del Pedido",
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(prevUrl);
          },
          active: false,
        });
      } else if (prevUrl.includes("/coordinadora/pedidos/")) {
        // Vino desde detalle de pedido del coordinador
        breadcrumbs.push({
          label: "Detalle del Pedido",
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(prevUrl);
          },
          active: false,
        });
      } else if (prevUrl.includes("/busqueda")) {
        // Vino desde búsqueda global
        const searchParams = new URLSearchParams(prevUrl.split("?")[1]);
        const searchTerm = searchParams.get("q") || "Búsqueda";
        breadcrumbs.push({
          label: `Búsqueda: ${searchTerm}`,
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(prevUrl);
          },
          active: false,
        });
      } else {
        // Otro origen - mostrar la ruta
        const pathParts = prevUrl.split("/").filter((part) => part);
        const lastPart = pathParts[pathParts.length - 1];
        breadcrumbs.push({
          label: lastPart.charAt(0).toUpperCase() + lastPart.slice(1),
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(prevUrl);
          },
          active: false,
        });
      }
    } else {
      // Sin prevUrl - ir al catálogo de la empresa
      breadcrumbs.push({
        label: `Catálogo ${product?.empresa || product?.empresaId || ""}`,
        onClick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate(`/catalogo/${product?.empresaId || resolvedEmpresaId}`);
        },
        active: false,
      });
    }

    // Agregar el producto actual
    breadcrumbs.push({
      label: product?.name || "Producto",
      onClick: null,
      active: true,
    });

    return (
      <BreadcrumbsContainer>
        <BreadcrumbsList>
          {breadcrumbs.map((breadcrumb, index) => (
            <BreadcrumbItem key={index}>
              <BreadcrumbLink
                onClick={breadcrumb.onClick}
                $active={breadcrumb.active}
                disabled={breadcrumb.active || !breadcrumb.onClick}
              >
                {breadcrumb.label}
              </BreadcrumbLink>
              {index < breadcrumbs.length - 1 && (
                <BreadcrumbSeparator>/</BreadcrumbSeparator>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbsList>
      </BreadcrumbsContainer>
    );
  };

  // Funciones para manejar el zoom
  const handleMouseEnter = () => {
    // Limpiar cualquier timeout pendiente
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    // Usar timeout para evitar parpadeos cuando el mouse pasa sobre la ventana de zoom
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
    }, 100); // 100ms de delay
  };

  const handleMouseMove = (e) => {
    if (imageContainerRef.current) {
      const { left, top, width, height } =
        imageContainerRef.current.getBoundingClientRect();

      // Verificar si el mouse está realmente dentro del área de la imagen
      const isInsideImage =
        e.clientX >= left &&
        e.clientX <= left + width &&
        e.clientY >= top &&
        e.clientY <= top + height;

      if (!isInsideImage) {
        // Si el mouse no está dentro de la imagen, ocultar el zoom
        setIsHovering(false);
        return;
      }

      // Calcular la posición relativa del cursor dentro de la imagen (0-1)
      const x = Math.min(Math.max((e.clientX - left) / width, 0), 1);
      const y = Math.min(Math.max((e.clientY - top) / height, 0), 1);

      setMousePosition({ x, y });

      // Posicionar la ventana de zoom cerca del cursor, pero no exactamente encima
      // para que no tape lo que estamos viendo
      const zoomSize = 300;

      // Determinar si colocamos la ventana a la derecha o izquierda del cursor
      // basado en la posición del cursor en la pantalla
      let zoomX;
      if (e.clientX < window.innerWidth / 2) {
        // Si el cursor está en la mitad izquierda, mostrar a la derecha
        zoomX = e.clientX + 50; // 50px de offset
      } else {
        // Si el cursor está en la mitad derecha, mostrar a la izquierda
        zoomX = e.clientX - zoomSize - 50; // 50px de offset
      }

      // Para Y, simplemente alinear con el cursor verticalmente
      const zoomY = e.clientY - zoomSize / 2;

      // Asegurar que la ventana no se salga de la pantalla
      const adjustedZoomX = Math.min(
        Math.max(zoomX, 10),
        window.innerWidth - zoomSize - 10
      );
      const adjustedZoomY = Math.min(
        Math.max(zoomY, 10),
        window.innerHeight - zoomSize - 10
      );

      setZoomPosition({ x: adjustedZoomX, y: adjustedZoomY });
    }
  };

  const handleNavigate = () => {
    navigateToHomeByRole();
  };

  // Calcular cantidad actual en el carrito
  const currentInCart = React.useMemo(() => {
    if (!cart || !product) return 0;

    const cartItem = cart.find((item) => item?.id === product.id);

    return cartItem ? cartItem.quantity : 0;
  }, [cart, product]);

  // Calcular stock disponible restante
  const availableStock = React.useMemo(() => {
    if (!product) return 0;
    return Math.max(0, product.stock - currentInCart);
  }, [product, currentInCart]);

  // Funciones para manejar la imagen
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Componente para manejar la imagen con fallback
  const ProductImageWithFallback = ({ src, alt }) => {
    if (imageError || !src) {
      return (
        <ImagePlaceholder>
          <div>
            <div>Imagen no disponible</div>
          </div>
        </ImagePlaceholder>
      );
    }

    return (
      <>
        {imageLoading && (
          <ImagePlaceholder>
            <div>Cargando...</div>
          </ImagePlaceholder>
        )}
        <MainImage
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: imageLoading ? "none" : "block" }}
        />
      </>
    );
  };

  useEffect(() => {
    hasFetchedProductRef.current = false;
  }, [id]);

  const resolvedImageSrc = useMemo(() => {
    if (!product?.image) return "";
    const trimmed = product.image.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return `${baseLinkImages}${
      trimmed.startsWith("/") ? trimmed.slice(1) : trimmed
    }`;
  }, [product?.image]);

  useEffect(() => {
    setImageError(false);
    setImageLoading(!!resolvedImageSrc);
  }, [resolvedImageSrc]);

  useEffect(() => {
    if (hasFetchedProductRef.current) {
      return;
    }

    if (!resolvedEmpresaId) {
      if (!product) {
        handleNavigate();
      }
      return;
    }

    const cargarProducto = async () => {
      const productoApi = await loadProductByCodigo(id, resolvedEmpresaId);

      if (productoApi) {
        setProduct((prev) => {
          if (!prev) {
            return productoApi;
          }

          const merged = {
            ...prev,
            ...productoApi,
          };

          // Preservar la imagen previa si la nueva es falsy
          if (!productoApi?.image && prev.image) {
            merged.image = prev.image;
          }

          // Preservar la descripción previa si la nueva es falsy
          if (!productoApi?.description && prev.description) {
            merged.description = prev.description;
          }

          // Preservar la marca previa si la nueva es falsy
          if (!productoApi?.brand && prev.brand) {
            merged.brand = prev.brand;
          }

          return merged;
        });
        hasFetchedProductRef.current = true;
      } else if (!product) {
        handleNavigate();
      }
    };

    cargarProducto();
  }, [id, resolvedEmpresaId, loadProductByCodigo, product]);

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Efecto para manejar el mouse global y detectar cuando sale del área
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (imageContainerRef.current && isHovering) {
        const { left, top, width, height } =
          imageContainerRef.current.getBoundingClientRect();

        // Verificar si el mouse está fuera del área de la imagen
        const isOutsideImage =
          e.clientX < left ||
          e.clientX > left + width ||
          e.clientY < top ||
          e.clientY > top + height;

        if (isOutsideImage) {
          // Limpiar timeout existente
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
          // Ocultar zoom inmediatamente
          setIsHovering(false);
        }
      }
    };

    // Agregar listener global
    document.addEventListener("mousemove", handleGlobalMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isHovering]);

  if (!product) {
    return <div>Cargando...</div>;
  }

  // Calcular el máximo de cantidad basado en el stock disponible
  const maxQuantity = useMemo(() => {
    if (!product) return 5000;
    // Si hay stock, usar el stock como máximo, sino permitir hasta 5000
    return product.stock > 0 ? product.stock : 5000;
  }, [product]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= maxQuantity) {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => {
      if (prev > 1) {
        return prev - 1;
      }
      return prev;
    });
  };

  const increaseQuantity = () => {
    setQuantity((prev) => {
      if (prev < maxQuantity) {
        return prev + 1;
      }
      return prev;
    });
  };

  // Funciones para manejar el mantenimiento presionado del botón
  const handleDecreaseMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Marcar que mouseDown ya ejecutó la acción
    mouseDownExecutedRef.current = true;

    // Limpiar cualquier intervalo existente
    if (quantityIntervalRef.current) {
      if (typeof quantityIntervalRef.current === "number") {
        clearTimeout(quantityIntervalRef.current);
      } else {
        clearInterval(quantityIntervalRef.current);
      }
      quantityIntervalRef.current = null;
    }

    // Primera acción inmediata
    decreaseQuantity();

    // Iniciar intervalo después de un pequeño delay
    quantityIntervalRef.current = setTimeout(() => {
      const interval = setInterval(() => {
        setQuantity((prev) => {
          if (prev > 1) {
            return prev - 1;
          }
          clearInterval(interval);
          quantityIntervalRef.current = null;
          return prev;
        });
      }, 150); // Repetir cada 150ms

      quantityIntervalRef.current = interval;
    }, 500); // Delay inicial de 500ms
  };

  const handleIncreaseMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Marcar que mouseDown ya ejecutó la acción
    mouseDownExecutedRef.current = true;

    // Limpiar cualquier intervalo existente
    if (quantityIntervalRef.current) {
      if (typeof quantityIntervalRef.current === "number") {
        clearTimeout(quantityIntervalRef.current);
      } else {
        clearInterval(quantityIntervalRef.current);
      }
      quantityIntervalRef.current = null;
    }

    // Primera acción inmediata
    increaseQuantity();

    // Iniciar intervalo después de un pequeño delay
    quantityIntervalRef.current = setTimeout(() => {
      const interval = setInterval(() => {
        setQuantity((prev) => {
          if (prev < maxQuantity) {
            return prev + 1;
          }
          clearInterval(interval);
          quantityIntervalRef.current = null;
          return prev;
        });
      }, 150); // Repetir cada 150ms

      quantityIntervalRef.current = interval;
    }, 500); // Delay inicial de 500ms
  };

  const handleQuantityButtonMouseUp = () => {
    // Limpiar timeout si aún no se ejecutó
    if (quantityIntervalRef.current) {
      if (typeof quantityIntervalRef.current === "number") {
        clearTimeout(quantityIntervalRef.current);
      } else {
        clearInterval(quantityIntervalRef.current);
      }
      quantityIntervalRef.current = null;
    }

    // Resetear el flag después de un delay para que onClick no se ejecute
    // si mouseDown ya ejecutó la acción
    setTimeout(() => {
      mouseDownExecutedRef.current = false;
    }, 200);
  };

  const handleQuantityButtonMouseLeave = () => {
    // Limpiar cuando el mouse sale del botón
    handleQuantityButtonMouseUp();
  };

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (quantityIntervalRef.current) {
        if (typeof quantityIntervalRef.current === "number") {
          clearTimeout(quantityIntervalRef.current);
        } else {
          clearInterval(quantityIntervalRef.current);
        }
      }
    };
  }, []);

  const handleAddToCart = () => {
    if (!isAddingToCart) {
      setIsAddingToCart(true);
      addToCart(product, quantity);
      // Mostrar confirmación
      toast.success(`${quantity} ${product.name} agregado al carrito`);

      // Habilitar nuevamente después de un breve momento
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 1000);
    }
  };

  // Calcular precio con descuento aplicado
  const discountedPrice =
    product.discount && product.price !== null
      ? product.price * (1 - product.discount / 100)
      : product.price || 0;

  // Calcular precio con IVA incluido (aplicado al precio con descuento)
  const priceWithIVA = calculatePriceWithIVA(
    discountedPrice,
    product.iva || TAXES.IVA_PERCENTAGE
  );

  const handleOpenContactModal = () => {
    setIsContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setIsContactModalOpen(false);
  };

  return (
    <>
      <SEO
        title={product?.name || "Producto"}
        description={
          product?.description ||
          `Producto ${product?.name} de la marca ${
            product?.brand
          }. Precio: $${priceWithIVA?.toFixed(2)}. Stock disponible.`
        }
        keywords={`${product?.name}, ${product?.brand}, ${
          product?.empresa
        }, neumáticos, repuestos automotrices, ${
          product?.filtersByType
            ? Object.values(product.filtersByType).flat().join(", ")
            : ""
        }`}
        image={product?.image}
        url={`https://viicommerce.com/productos/${product?.id}`}
        type="product"
        structuredData={structuredData}
      />
      <PageContainer style={{ padding: "0 16px" }}>
        {renderBreadcrumbs()}
        <ProductLayout>
          <ImageSection>
            {/* Contenedor principal de la imagen con eventos de mouse */}
            <MainImageContainer
              ref={imageContainerRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              <ProductImageWithFallback
                src={resolvedImageSrc}
                alt={product.name}
              />

              {/* Ventana de zoom */}
              <ZoomWindow
                $visible={isHovering}
                style={{
                  left: `${zoomPosition.x}px`,
                  top: `${zoomPosition.y}px`,
                  transform: "none", // Eliminar cualquier transformación predeterminada
                }}
              >
                <ZoomedImage
                  src={product.image}
                  style={{
                    transform: `translate(-${mousePosition.x * 80}%, -${
                      mousePosition.y * 75
                    }%)`,
                  }}
                />
              </ZoomWindow>
            </MainImageContainer>
          </ImageSection>

          <InfoSection>
            {/* Mostrar categorías desde filtersByType de forma amigable */}
            <Category>
              {product.filtersByType &&
              Object.keys(product.filtersByType).length > 0
                ? Object.values(product.filtersByType)
                    .flat() // Aplanar el array de arrays
                    .join(", ")
                : "Producto sin categoría"}
            </Category>
            <ProductTitle>{product.name}</ProductTitle>
            {product.originalData?.DMA_MATERIAL && (
              <span style={{ fontSize: "0.9rem", color: "#666" }}>
                Cod: {product.originalData.DMA_MATERIAL}
              </span>
            )}
            {product.originalData?.DMA_CODIGOPROVEEDOR && (
              <span style={{ fontSize: "0.9rem", color: "#666" }}>
                Cod: {product.originalData.DMA_CODIGOPROVEEDOR}
              </span>
            )}

            {/* Precio en la parte superior */}
            <PriceContainer>
              <div
                style={{
                  display: "flex",
                  marginTop: "10px",
                  flexDirection: "row",
                  gap: "5px",
                  alignItems: "flex-end",
                }}
              >
                <CurrentPrice>${(priceWithIVA || 0).toFixed(2)}</CurrentPrice>
                <IVAIndicator>IVA incluido</IVAIndicator>
              </div>
              {product.discount > 0 && (
                <>
                  {product.discount > 0 && product.price != null && (
                    <OriginalPrice>${product.price.toFixed(2)}</OriginalPrice>
                  )}
                  <Discount>-{product.discount}%</Discount>
                </>
              )}
            </PriceContainer>

            {/* Nuevo indicador de stock posicionado debajo del precio */}
            <StockIndicator
              $inStock={product.stock > 1}
              $lowStock={product.stock <= 1 && product.stock >= 0}
            >
              <StockBadge
                $inStock={product.stock > 1}
                $lowStock={product.stock <= 1 && product.stock >= 0}
              >
                {product.stock > 1 ? "DISPONIBLE" : "POCO STOCK"}
              </StockBadge>
            </StockIndicator>
            {/* Sección de cantidad y botón en la misma línea */}
            {isClient && !isVisualizacion && (
              <QuantityControlsContainer>
                {/* Controles de cantidad */}
                <QuantityWrapper>
                  <QuantityLabel>Cantidad:</QuantityLabel>
                  <QuantitySelector>
                    <QuantityButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Solo ejecutar si mouseDown no ejecutó la acción ya
                        if (!mouseDownExecutedRef.current) {
                          decreaseQuantity();
                        }
                      }}
                      onMouseDown={handleDecreaseMouseDown}
                      onMouseUp={handleQuantityButtonMouseUp}
                      onMouseLeave={handleQuantityButtonMouseLeave}
                      onTouchStart={handleDecreaseMouseDown}
                      onTouchEnd={handleQuantityButtonMouseUp}
                      disabled={quantity <= 1}
                      text={"-"}
                    />
                    <QuantityInput
                      type="number"
                      id={`quantity-${product.id}`}
                      name={`quantity-${product.id}`}
                      min="1"
                      max={maxQuantity}
                      value={quantity}
                      onChange={handleQuantityChange}
                      autoComplete="off"
                    />
                    <QuantityButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Solo ejecutar si mouseDown no ejecutó la acción ya
                        if (!mouseDownExecutedRef.current) {
                          increaseQuantity();
                        }
                      }}
                      onMouseDown={handleIncreaseMouseDown}
                      onMouseUp={handleQuantityButtonMouseUp}
                      onMouseLeave={handleQuantityButtonMouseLeave}
                      onTouchStart={handleIncreaseMouseDown}
                      onTouchEnd={handleQuantityButtonMouseUp}
                      disabled={quantity >= maxQuantity}
                      text={"+"}
                    />
                  </QuantitySelector>
                </QuantityWrapper>

                {/* Botón de agregar al carrito */}
                <AddToCartButtonWrapper>
                  <Button
                    leftIconName={
                      currentInCart > 0 && !isButtonHovered
                        ? "FaCheck"
                        : "FaShoppingCart"
                    }
                    text={
                      isAddingToCart
                        ? "Agregando..."
                        : currentInCart > 0 && !isButtonHovered
                        ? `${currentInCart} en carrito`
                        : "Agregar"
                    }
                    variant="solid"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    onMouseEnter={() => setIsButtonHovered(true)}
                    onMouseLeave={() => setIsButtonHovered(false)}
                    backgroundColor={({ theme }) =>
                      currentInCart > 0 && !isButtonHovered
                        ? theme.colors.success
                        : theme.colors.primary
                    }
                    size="medium"
                    style={{ width: "100%" }}
                  />
                </AddToCartButtonWrapper>
              </QuantityControlsContainer>
            )}

            <Description>
              {/* Información de marca y empresa */}
              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "16px",
                  borderTop: "1px solid #e0e0e0",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      marginBottom: "10px",
                      fontSize: "1.1em",
                      fontWeight: 600,
                    }}
                  >
                    Descripción
                  </span>
                  <div
                    style={{
                      color: "#666",
                      fontSize: "0.85em",
                      marginBottom: "10px",
                      wordBreak: "break-word",
                    }}
                  >
                    Marca: {product.brand} · Empresa:{" "}
                    {product.empresa || product.empresaId}
                  </div>
                  <span
                    style={{
                      color: "#666",
                      fontSize: "1rem",
                      lineHeight: "1.6",
                    }}
                  >
                    {product.description}
                  </span>
                </div>
              </div>
            </Description>
            {renderSpecifications(product)}
          </InfoSection>
        </ProductLayout>

        {/* Modal de contacto */}
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={handleCloseContactModal}
          title="Cualquier duda, no dude en contactarnos"
          selectedCompany={product?.empresaId}
        />
      </PageContainer>
    </>
  );
};

export default DetalleProducto;
