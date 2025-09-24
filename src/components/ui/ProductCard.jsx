import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../../context/CartContext";
import Button from "../ui/Button";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { TAXES, calculatePriceWithIVA } from "../../constants/taxes";
import RenderIcon from "./RenderIcon";
import ContactModal from "./ContactModal";

const StyledCard = styled.div`
  background-color: ${({ theme, $restricted }) =>
    $restricted ? theme.colors.surface : theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ $restricted }) => ($restricted ? "8px" : "12px")};
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: ${({ theme, $restricted }) =>
    $restricted
      ? `0 2px 8px ${theme.colors.shadow}, 0 0 0 1px ${theme.colors.primary}20`
      : `0 2px 12px ${theme.colors.shadow}`};
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    cursor: ${({ $restricted }) => ($restricted ? "default" : "pointer")};
    box-shadow: ${({ theme, $restricted }) =>
      $restricted
        ? `0 4px 12px ${theme.colors.shadow}, 0 0 0 1px ${theme.colors.primary}30`
        : `0 6px 20px ${theme.colors.shadow}`};
    transform: ${({ $restricted }) =>
      $restricted ? "none" : "translateY(-4px)"};
  }

  @media (max-width: 768px) {
    border-radius: ${({ $restricted }) => ($restricted ? "6px" : "8px")};
    box-shadow: ${({ theme, $restricted }) =>
      $restricted
        ? `0 1px 4px ${theme.colors.shadow}, 0 0 0 1px ${theme.colors.primary}20`
        : `0 1px 6px ${theme.colors.shadow}`};

    &:hover {
      transform: ${({ $restricted }) =>
        $restricted ? "none" : "translateY(-2px)"};
      box-shadow: ${({ theme, $restricted }) =>
        $restricted
          ? `0 2px 8px ${theme.colors.shadow}, 0 0 0 1px ${theme.colors.primary}30`
          : `0 3px 12px ${theme.colors.shadow}`};
    }
  }

  @media (max-width: 480px) {
    border-radius: ${({ $restricted }) => ($restricted ? "4px" : "6px")};
    box-shadow: ${({ theme, $restricted }) =>
      $restricted
        ? `0 1px 3px ${theme.colors.shadow}, 0 0 0 1px ${theme.colors.primary}20`
        : `0 1px 4px ${theme.colors.shadow}`};

    &:hover {
      transform: ${({ $restricted }) =>
        $restricted ? "none" : "translateY(-1px)"};
    }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  padding-top: 100%; /* Mantener aspect ratio 1:1 */
  overflow: hidden;
  background: ${({ $restricted, theme }) =>
    $restricted
      ? "transparent"
      : `linear-gradient(135deg, ${theme.colors.surface}, ${theme.colors.primary}02)`};
`;

const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: ${({ $restricted }) => ($restricted ? "brightness(0.95)" : "none")};
  transition: transform 0.3s ease;

  ${({ $restricted }) =>
    !$restricted &&
    `
    &:hover {
      transform: scale(1.05);
    }
  `}
`;

const ImagePlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.8rem;
  text-align: center;
  padding: 20px;

  filter: ${({ $restricted }) => ($restricted ? "brightness(0.95)" : "none")};

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 16px;
  }

  @media (max-width: 480px) {
    font-size: 0.7rem;
    padding: 12px;
  }
`;

const RestrictedBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  z-index: 2;
  opacity: 0.9;

  @media (max-width: 768px) {
    top: 8px;
    left: 8px;
    padding: 3px 6px;
    font-size: 0.65rem;
  }

  @media (max-width: 480px) {
    top: 6px;
    left: 6px;
    padding: 2px 5px;
    font-size: 0.6rem;
  }
`;

const LockIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;

    svg {
      width: 14px;
      height: 14px;
    }
  }

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;

    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 6px 10px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    padding: 4px 8px;
    font-size: 0.7rem;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    top: 8px;
    right: 8px;
    padding: 3px 6px;
    font-size: 0.65rem;
    border-radius: 12px;
  }
`;

const ContentContainer = styled.div`
  padding: ${({ $restricted }) => ($restricted ? "16px" : "20px")};
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: ${({ $restricted }) => ($restricted ? "160px" : "180px")};

  @media (max-width: 768px) {
    padding: ${({ $restricted }) => ($restricted ? "12px" : "16px")};
    min-height: ${({ $restricted }) => ($restricted ? "140px" : "160px")};
  }

  @media (max-width: 480px) {
    padding: ${({ $restricted }) => ($restricted ? "10px" : "12px")};
    min-height: ${({ $restricted }) => ($restricted ? "120px" : "140px")};
  }
`;

const RestrictedContent = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 160px;

  @media (max-width: 768px) {
    padding: 12px;
    min-height: 140px;
  }

  @media (max-width: 480px) {
    padding: 10px;
    min-height: 120px;
  }
`;

const ProductName = styled.h3`
  margin: 0 0 ${({ $restricted }) => ($restricted ? "8px" : "12px")} 0;
  font-size: ${({ $restricted }) => ($restricted ? "1rem" : "1.1rem")};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ $restricted }) => ($restricted ? "normal" : "600")};
  line-height: 1.3;
  word-break: break-word;

  @media (max-width: 768px) {
    font-size: ${({ $restricted }) => ($restricted ? "0.9rem" : "1rem")};
    margin-bottom: ${({ $restricted }) => ($restricted ? "6px" : "10px")};
  }

  @media (max-width: 480px) {
    font-size: ${({ $restricted }) => ($restricted ? "0.85rem" : "0.9rem")};
    margin-bottom: ${({ $restricted }) => ($restricted ? "5px" : "8px")};
  }
`;

const Brand = styled.span`
  display: inline-block;
  font-size: 0.8rem;
  color: ${({ theme, $restricted }) =>
    $restricted ? theme.colors.primary : theme.colors.textLight};
  margin-bottom: 4px;
  font-weight: ${({ $restricted }) => ($restricted ? "500" : "500")};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    letter-spacing: 0.3px;
  }

  @media (max-width: 480px) {
    font-size: 0.7rem;
    letter-spacing: 0.2px;
  }
`;

const Enterprise = styled.span`
  display: inline-block;
  font-size: 0.7rem;
  color: ${({ theme, $restricted }) =>
    $restricted ? theme.colors.primary : theme.colors.textLight};
  margin-bottom: ${({ $restricted }) => ($restricted ? "8px" : "12px")};
  opacity: 0.8;
  font-weight: ${({ $restricted }) => ($restricted ? "500" : "400")};

  @media (max-width: 768px) {
    font-size: 0.65rem;
    margin-bottom: ${({ $restricted }) => ($restricted ? "6px" : "10px")};
  }

  @media (max-width: 480px) {
    font-size: 0.6rem;
    margin-bottom: ${({ $restricted }) => ($restricted ? "5px" : "8px")};
  }
`;

const RestrictedMessage = styled.div`
  margin: 12px 0;
  padding: 12px;
  background: ${({ theme }) => `${theme.colors.primary}05`};
  border-radius: 6px;
  border-left: 3px solid ${({ theme }) => theme.colors.primary};

  @media (max-width: 768px) {
    margin: 10px 0;
    padding: 10px;
  }

  @media (max-width: 480px) {
    margin: 8px 0;
    padding: 8px;
    border-left-width: 2px;
  }
`;

const RestrictedMessageTitle = styled.h4`
  margin: 0 0 6px 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.85rem;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 5px;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
    margin-bottom: 4px;
  }
`;

const RestrictedMessageText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.75rem;
  line-height: 1.4;
`;

const RestrictedDivider = styled.div`
  width: 30px;
  height: 1px;
  background: ${({ theme }) => theme.colors.primary};
  margin: 12px 0;
  opacity: 0.6;
`;

const Price = styled.div`
  margin-top: auto;
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => `${theme.colors.textLight}15`};

  @media (max-width: 768px) {
    gap: 8px;
    padding-top: 12px;
  }

  @media (max-width: 480px) {
    gap: 6px;
    padding-top: 10px;
  }
`;

const CurrentPrice = styled.span`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const OriginalPrice = styled.span`
  font-size: 0.9rem;
  text-decoration: line-through;
  color: ${({ theme }) => theme.colors.textLight};
  opacity: 0.7;
`;

const IVAIndicator = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-style: italic;
  opacity: 0.8;
  margin-left: 8px;
`;

const ButtonContainer = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 10px;

  @media (max-width: 768px) {
    margin-top: 12px;
    gap: 8px;
  }

  @media (max-width: 480px) {
    margin-top: 10px;
    gap: 6px;
  }
`;

const SpecsList = styled.ul`
  margin: 12px 0;
  padding-left: 0;
  list-style: none;
  font-size: 0.8rem;

  @media (max-width: 768px) {
    margin: 10px 0;
    font-size: 0.75rem;
  }

  @media (max-width: 480px) {
    margin: 8px 0;
    font-size: 0.7rem;
  }
`;

const SpecItem = styled.li`
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.textLight};
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;

  @media (max-width: 768px) {
    margin-bottom: 5px;
    gap: 3px;
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 4px;
    gap: 2px;
    font-size: 0.75rem;
  }
`;

const SpecLabel = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const SpecValue = styled.span`
  margin-left: 4px;
  opacity: 0.8;
`;

const StockIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  padding: 3px 6px;
  background: ${({ theme, $inStock }) =>
    $inStock ? `${theme.colors.success}10` : `${theme.colors.error}10`};
  border-radius: 8px;
  border: 1px solid
    ${({ theme, $inStock }) =>
      $inStock ? `${theme.colors.success}20` : `${theme.colors.error}20`};
  width: fit-content;
  min-width: fit-content;

  @media (max-width: 768px) {
    gap: 3px;
    font-size: 0.7rem;
    padding: 2px 5px;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    gap: 2px;
    font-size: 0.65rem;
    padding: 2px 4px;
    border-radius: 5px;
  }
`;

const StockDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ $inStock, theme }) =>
    $inStock ? theme.colors.success : theme.colors.error};
`;

const StockText = styled.span`
  color: ${({ theme, $inStock }) =>
    $inStock ? theme.colors.success : theme.colors.error};
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 768px) {
    font-size: 0.65rem;
    letter-spacing: 0.2px;
    gap: 3px;
  }

  @media (max-width: 480px) {
    font-size: 0.6rem;
    letter-spacing: 0.1px;
    gap: 2px;
  }
`;

const StockIcon = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme, $inStock }) =>
    $inStock ? theme.colors.success : theme.colors.error};
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 6px;
  }

  @media (max-width: 480px) {
    gap: 6px;
    margin-bottom: 4px;
  }
`;

const BrandEnterpriseContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  flex: 1;
  gap: 2px;

  @media (max-width: 768px) {
    gap: 1px;
  }

  @media (max-width: 480px) {
    gap: 1px;
  }
`;

// Configuración de líneas de negocio para especificaciones de productos
const PRODUCT_LINE_CONFIG = {
  neumáticos: {
    specs: [
      { label: "Medida", field: "medida" },
      { label: "Índice de Velocidad", field: "indiceVelocidad" },
      { label: "Perfil", field: "perfil" },
    ],
  },
  lubricantes: {
    specs: [
      { label: "Viscosidad", field: "viscosidad" },
      { label: "Tipo", field: "tipo" },
      { label: "Capacidad", field: "capacidad" },
    ],
  },
  herramientas: {
    specs: [
      { label: "Potencia", field: "potencia" },
      { label: "Material", field: "material" },
      { label: "Piezas", field: "piezas" },
    ],
  },
  iluminación: {
    specs: [
      { label: "Potencia", field: "potencia" },
      { label: "Lumen", field: "lumen" },
      { label: "Temp. de Color", field: "colorTemp" },
    ],
  },
  DEFAULT: {
    specs: [
      { label: "Especificación 1", field: "especificacion1" },
      { label: "Especificación 2", field: "especificacion2" },
      { label: "Especificación 3", field: "especificacion3" },
    ],
  },
};

const SupportButton = styled.button`
  background: ${({ theme }) => theme.colors.tertiary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ProductCard = ({
  product,
  lineConfig,
  restricted = false,
  onRequestAccess,
  currentFilters = {},
  currentSearch = "",
  currentSort = "",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isClient, isVisualizacion } = useAuth();
  const { addToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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

  // Añade verificación para asegurar que product.id exista
  const handleViewDetails = () => {
    // Si está restringido, no permitir navegación
    if (restricted) return;

    // Verificar que el ID existe
    if (!product || product.id === undefined) {
      console.error("Error: ID de producto indefinido", product);
      toast.error("No se pudo cargar el detalle del producto");
      return;
    }

    // Construir la URL anterior según el contexto
    let currentUrl = `${location.pathname}${location.search}`;

    // Si estamos en búsqueda, construir la URL de búsqueda
    if (location.pathname.includes("/busqueda") && currentSearch) {
      currentUrl = `/busqueda?q=${encodeURIComponent(currentSearch)}`;
      if (currentSort && currentSort !== "relevance") {
        currentUrl += `&sort=${currentSort}`;
      }
      if (currentFilters?.priceRange && currentFilters.priceRange !== "all") {
        currentUrl += `&price=${currentFilters.priceRange}`;
      }
    }

    // Navegar al detalle del producto pasando la URL anterior y filtros
    navigate(`/productos/${product.id}`, {
      state: {
        product,
        empresaId: product.empresaId,
        prevUrl: currentUrl, // Guardar la URL anterior para poder volver
        filters: currentFilters,
        searchTerm: currentSearch,
        sortBy: currentSort,
      },
    });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isAddingToCart || restricted) return; // Evitar múltiples clics y productos restringidos

    setIsAddingToCart(true);
    addToCart(product, 1);

    // Mostrar mensaje de éxito
    toast.success(`${product.name} agregado al carrito`);

    // Habilitar nuevamente después de un breve momento
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 1000); // Aumentado a 1 segundo para dar tiempo a la sincronización
  };

  const handleRequestAccess = (e) => {
    e.stopPropagation();
    if (onRequestAccess) {
      onRequestAccess(product.empresaId);
    }
  };

  const handleSupportClick = (e) => {
    e.stopPropagation();
    setIsContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setIsContactModalOpen(false);
  };

  // Lógica para renderizar especificaciones basadas en lineaNegocio
  const renderSpecs = (config) => {
    if (!product.specs) return null;

    const specsText = config.specs
      .slice(0, 3)
      .map(
        (spec) =>
          `${spec.label}: ${
            product.specs[spec.field]
          }`
      )
      .join(" • ");

    return (
      <span>
        <SpecItem>
          <SpecValue>{specsText}</SpecValue>
        </SpecItem>
      </span>
    );
  };

  // Obtener la configuración correspondiente si no se proporciona
  const config =
    lineConfig ||
    PRODUCT_LINE_CONFIG[product.lineaNegocio] ||
    PRODUCT_LINE_CONFIG.DEFAULT;

  // Función para renderizar el contenido del stock
  const renderStockContent = () => {
    // Detectar si estamos en móvil
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;

    if (product.stock > 0) {
      if (product.stock >= 100) {
        return (
          <StockIcon $inStock={true}>
            {isSmallMobile
              ? "+100 unid."
              : isMobile
              ? "+100 unid."
              : "+100 unid."}
          </StockIcon>
        );
      } else {
        const stockText = isSmallMobile
          ? "unid."
          : isMobile
          ? "unid."
          : "unid.";
        return (
          <span>
            {product.stock} {stockText}
          </span>
        );
      }
    } else {
      const noStockText = isSmallMobile
        ? "sin stock"
        : isMobile
        ? "sin stock"
        : "sin stock";
      return <StockIcon $inStock={false}>{noStockText}</StockIcon>;
    }
  };

  // Componente para manejar la imagen con fallback
  const ProductImageWithFallback = ({ src, alt, restricted }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageLoad = () => {
      setImageLoading(false);
      setImageError(false);
    };

    const handleImageError = () => {
      setImageLoading(false);
      setImageError(true);
    };

    if (imageError || !src) {
      return (
        <ImagePlaceholder $restricted={restricted}>
          <div>
            <div>Imágen no disponible</div>
          </div>
        </ImagePlaceholder>
      );
    }

    return (
      <>
        {imageLoading && (
          <ImagePlaceholder $restricted={restricted}>
            <div>Cargando...</div>
          </ImagePlaceholder>
        )}
        <ProductImage
          src={src}
          alt={alt}
          $restricted={restricted}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: imageLoading ? "none" : "block" }}
        />
      </>
    );
  };

  return (
    <>
      <StyledCard onClick={handleViewDetails} $restricted={restricted}>
        <ImageContainer $restricted={restricted}>
          <ProductImageWithFallback
            src={product.image}
            alt={product.name}
            restricted={restricted}
          />
          {restricted && (
            <>
              <RestrictedBadge>Restringido</RestrictedBadge>
              <LockIcon>
                <RenderIcon name="FaLock" size={16} />
              </LockIcon>
            </>
          )}
          {product.discount > 0 && !restricted && (
            <DiscountBadge>-{product.discount}%</DiscountBadge>
          )}
        </ImageContainer>

        {restricted ? (
          <RestrictedContent>
            <Brand $restricted={restricted}>{product.brand}</Brand>
            <Enterprise $restricted={restricted}>
              {product.empresa || product.empresaId}
            </Enterprise>
            <ProductName $restricted={restricted}>{product.name}</ProductName>

            <RestrictedDivider />

            <RestrictedMessage>
              <RestrictedMessageTitle>
                Acceso Restringido
              </RestrictedMessageTitle>
              <RestrictedMessageText>
                Este producto requiere autorización especial. Contacta a{" "}
                {product.empresa || product.empresaId} para más información.
              </RestrictedMessageText>
            </RestrictedMessage>

            <ButtonContainer>
              <Button
                text="Solicitar acceso"
                variant="solid"
                size="small"
                onClick={handleRequestAccess}
                backgroundColor={({ theme }) => theme.colors.primary}
              />
              <SupportButton onClick={handleSupportClick}>
                <RenderIcon name="FaHeadset" size={16} />
              </SupportButton>
            </ButtonContainer>
          </RestrictedContent>
        ) : (
          <ContentContainer $restricted={restricted}>
            <TopRow>
              <BrandEnterpriseContainer>
                <Brand $restricted={restricted}>{product.brand}</Brand>
                <Enterprise $restricted={restricted}>
                  {product.empresa || product.empresaId}
                </Enterprise>
              </BrandEnterpriseContainer>
              <StockIndicator $inStock={product.stock > 0}>
                {/* {product.stock > 0 && product.stock < 100 && (
                  <StockDot $inStock={product.stock > 0} />
                )} */}
                <StockText $inStock={product.stock > 0}>
                  {renderStockContent()}
                </StockText>
              </StockIndicator>
            </TopRow>

            <ProductName $restricted={restricted}>{product.name}</ProductName>
            {renderSpecs(config)}
            <Price>
              <div>
                <CurrentPrice>${(priceWithIVA || 0).toFixed(2)}</CurrentPrice>
                <IVAIndicator>IVA incluido</IVAIndicator>
              </div>
              {product.discount > 0 && product.price != null && (
                <OriginalPrice>${product.price.toFixed(2)}</OriginalPrice>
              )}
            </Price>
            <ButtonContainer>
              <Button
                text="Ver detalle"
                variant="outlined"
                size="small"
                onClick={handleViewDetails}
              />
              {isClient && !isVisualizacion && (
                <Button
                  text={isAddingToCart ? "Agregando..." : "Agregar al carrito"}
                  variant="solid"
                  size="small"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                />
              )}
            </ButtonContainer>
          </ContentContainer>
        )}
      </StyledCard>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={handleCloseContactModal}
        title="Contactar a soporte"
        selectedCompany={product.empresa || product.empresaId}
      />
    </>
  );
};

export default ProductCard;
