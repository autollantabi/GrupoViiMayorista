import React, { useState, memo, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../../context/CartContext";
import Button from "../ui/Button";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { TAXES, calculatePriceWithIVA } from "../../constants/taxes";
import RenderIcon from "./RenderIcon";
import ContactModal from "./ContactModal";
import { getRGBA } from "../../utils/utils";
import { baseLinkImages } from "../../constants/links";

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
  border: 1px solid
    ${({ theme, $indicadorRecurrencia }) =>
      $indicadorRecurrencia === 1
        ? theme.colors.primary
        : $indicadorRecurrencia === 2
        ? getRGBA(theme.colors.primary, 1)
        : $indicadorRecurrencia === 3
        ? getRGBA(theme.colors.primary, 1)
        : "transparent"};
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: ${({ theme, $restricted }) =>
    $restricted
      ? `0 2px 8px ${theme.colors.shadow}, 0 0 0 1px ${theme.colors.primary}20`
      : `0 2px 12px ${theme.colors.shadow}`};

  &:hover {
    cursor: default;
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
  cursor: pointer;
  margin: 0 0 ${({ $restricted }) => ($restricted ? "8px" : "12px")} 0;
  font-size: ${({ $restricted }) => ($restricted ? "1rem" : "1.1rem")};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ $restricted }) => ($restricted ? "normal" : "600")};
  line-height: 1.3;
  word-break: break-word;
  &:hover {
    text-decoration: underline;
  }

  @media (max-width: 1024px) {
    font-size: ${({ $restricted }) => ($restricted ? "0.85rem" : "0.95rem")};
    margin-bottom: ${({ $restricted }) => ($restricted ? "6px" : "10px")};
  }

  @media (max-width: 768px) {
    font-size: ${({ $restricted }) => ($restricted ? "0.75rem" : "0.85rem")};
    margin-bottom: ${({ $restricted }) => ($restricted ? "5px" : "8px")};
  }

  @media (max-width: 480px) {
    font-size: ${({ $restricted }) => ($restricted ? "0.7rem" : "0.8rem")};
    margin-bottom: ${({ $restricted }) => ($restricted ? "4px" : "6px")};
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

  @media (max-width: 1024px) {
    font-size: 0.7rem;
    letter-spacing: 0.4px;
  }

  @media (max-width: 768px) {
    font-size: 0.65rem;
    letter-spacing: 0.3px;
  }

  @media (max-width: 480px) {
    font-size: 0.6rem;
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

  @media (max-width: 1024px) {
    font-size: 0.65rem;
    margin-bottom: ${({ $restricted }) => ($restricted ? "6px" : "10px")};
  }

  @media (max-width: 768px) {
    font-size: 0.6rem;
    margin-bottom: ${({ $restricted }) => ($restricted ? "5px" : "8px")};
  }

  @media (max-width: 480px) {
    font-size: 0.55rem;
    margin-bottom: ${({ $restricted }) => ($restricted ? "4px" : "6px")};
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
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => `${theme.colors.textLight}15`};

  @media (max-width: 1024px) {
    gap: 8px;
    padding-top: 14px;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    gap: 8px;
    padding-top: 12px;
    flex-direction: column;
    align-items: flex-start;
  }

  @media (max-width: 480px) {
    gap: 6px;
    padding-top: 10px;
  }
`;

const PriceLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`;

const PriceRight = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    flex-shrink: 1;
    min-width: 0;
    max-width: 100%;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    flex-shrink: 0;
  }
`;

const CurrentPrice = styled.span`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};

  @media (max-width: 1024px) {
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const OriginalPrice = styled.span`
  font-size: 0.9rem;
  text-decoration: line-through;
  color: ${({ theme }) => theme.colors.textLight};
  opacity: 0.7;

  @media (max-width: 1024px) {
    font-size: 0.8rem;
  }

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }

  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const IVAIndicator = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-style: italic;
  opacity: 0.8;

  @media (max-width: 1024px) {
    font-size: 0.65rem;
  }

  @media (max-width: 768px) {
    font-size: 0.6rem;
  }

  @media (max-width: 480px) {
    font-size: 0.55rem;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 16px;
  display: flex;
  width: 100%;

  @media (max-width: 768px) {
    margin-top: 12px;
  }

  @media (max-width: 480px) {
    margin-top: 10px;
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
  max-width: 100%;

  @media (max-width: 1024px) {
    max-width: 120px;
    flex-shrink: 1;
    min-width: 0;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    justify-content: center;
  }
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textLight : theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  transition: background-color 0.2s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.background};
  }

  &:first-child {
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }

  &:last-child {
    border-left: 1px solid ${({ theme }) => theme.colors.border};
  }

  @media (max-width: 1024px) {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }
`;

const QuantityInput = styled.input`
  width: 50px;
  height: 32px;
  border: none;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 0;
  min-width: 0;
  flex: 1;

  &:focus {
    outline: none;
  }

  @media (max-width: 1024px) {
    width: 45px;
    height: 28px;
    font-size: 0.85rem;
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 36px;
    font-size: 1rem;
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

  @media (max-width: 1024px) {
    margin-bottom: 5px;
    gap: 3px;
    font-size: 0.75rem;
  }

  @media (max-width: 768px) {
    margin-bottom: 4px;
    gap: 2px;
    font-size: 0.7rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 3px;
    gap: 2px;
    font-size: 0.65rem;
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
  background: ${({ theme, $inStock, $lowStock }) => {
    if ($inStock) return `${theme.colors.success}10`;
    if ($lowStock) return `${theme.colors.warning || "#fbbf24"}10`;
    return `${theme.colors.error}10`;
  }};
  border-radius: 8px;
  border: 1px solid
    ${({ theme, $inStock, $lowStock }) => {
      if ($inStock) return `${theme.colors.success}20`;
      if ($lowStock) return `${theme.colors.warning || "#fbbf24"}20`;
      return `${theme.colors.error}20`;
    }};
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
  color: ${({ theme, $inStock, $lowStock }) => {
    if ($inStock) return theme.colors.success;
    if ($lowStock) return theme.colors.warning || "#fbbf24";
    return theme.colors.error;
  }};
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 1024px) {
    font-size: 0.65rem;
    letter-spacing: 0.25px;
    gap: 3px;
  }

  @media (max-width: 768px) {
    font-size: 0.6rem;
    letter-spacing: 0.2px;
    gap: 2px;
  }

  @media (max-width: 480px) {
    font-size: 0.55rem;
    letter-spacing: 0.1px;
    gap: 2px;
  }
`;

const StockIcon = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme, $inStock, $lowStock }) => {
    if ($inStock) return theme.colors.success;
    if ($lowStock) return theme.colors.warning || "#fbbf24";
    return theme.colors.error;
  }};
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

// Componente memoizado para la imagen del producto
const MemoizedProductImage = memo(({ src, alt, restricted }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const timeoutRef = useRef(null);
  const imgRef = useRef(null);
  const currentSrcRef = useRef(null);

  // Construir la URL completa de la imagen - usar tal cual si ya es URL completa
  const resolvedSrc = useMemo(() => {
    if (!src) return "";
    const trimmed = src.trim();
    if (!trimmed) return "";
    // Si ya es una URL completa, usarla tal cual sin modificar
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    // Si no, construir la URL con baseLinkImages
    return `${baseLinkImages}${trimmed.startsWith("/") ? trimmed.slice(1) : trimmed}`;
  }, [src]);

  const handleImageLoad = useCallback(() => {
    // Solo procesar si es la misma imagen que estamos esperando
    if (currentSrcRef.current === resolvedSrc) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setImageLoading(false);
      setImageError(false);
    }
  }, [resolvedSrc]);

  const handleImageError = useCallback(() => {
    // Solo procesar si es la misma imagen que estamos esperando
    if (currentSrcRef.current === resolvedSrc) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setImageLoading(false);
      setImageError(true);
    }
  }, [resolvedSrc]);

  // Resetear estados cuando cambia la src
  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (resolvedSrc) {
      currentSrcRef.current = resolvedSrc;
      setImageError(false);
      setImageLoading(true);

      // Establecer timeout de 10 segundos como respaldo
      const currentSrc = resolvedSrc;
      timeoutRef.current = setTimeout(() => {
        // Solo marcar como error si todavía estamos esperando esta misma src
        setImageLoading((prevLoading) => {
          if (prevLoading && currentSrcRef.current === currentSrc) {
            setImageError(true);
            return false;
          }
          return prevLoading;
        });
      }, 10000);
    } else {
      currentSrcRef.current = null;
      setImageLoading(false);
      setImageError(true);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [resolvedSrc]);

  // Verificar si la imagen ya está cargada después de renderizar (para imágenes en caché)
  useEffect(() => {
    if (imgRef.current && resolvedSrc && imageLoading) {
      const img = imgRef.current;
      // Si la imagen ya está completa, disparar onLoad
      if (img.complete && img.naturalWidth > 0 && currentSrcRef.current === resolvedSrc) {
        handleImageLoad();
      }
    }
  }, [resolvedSrc, imageLoading, handleImageLoad]);

  if (imageError || !resolvedSrc) {
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
        ref={imgRef}
        src={resolvedSrc}
        alt={alt}
        $restricted={restricted}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: imageLoading ? "none" : "block" }}
      />
    </>
  );
});

MemoizedProductImage.displayName = "MemoizedProductImage";

const ProductCard = ({
  product,
  lineConfig,
  restricted = false,
  onRequestAccess,
  currentFilters = {},
  currentSearch = "",
  currentSort = "",
  onClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isClient, isVisualizacion } = useAuth();
  const { addToCart, cart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // Buscar el producto en el carrito
  const cartItem = cart.find((item) => item?.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  // Asegurar que la cantidad no exceda el stock disponible
  useEffect(() => {
    const maxStock = product.stock || 0;
    if (quantity > maxStock && maxStock > 0) {
      setQuantity(maxStock);
    } else if (maxStock === 0 && quantity > 0) {
      setQuantity(0);
    }
  }, [product.stock, quantity]);

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

    // Si hay un onClick externo, llamarlo y NO navegar desde aquí
    // El onClick externo se encargará de la navegación
    if (onClick) {
      onClick(product);
      return;
    }

    // Si no hay onClick externo, navegar normalmente
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
    navigate(
      `/productos/${product.id}?prevUrl=${encodeURIComponent(currentUrl)}`,
      {
        state: {
          product,
          empresaId: product.empresaId,
        },
        replace: false,
      }
    );
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isAddingToCart || restricted) return; // Evitar múltiples clics y productos restringidos

    setIsAddingToCart(true);
    try {
      const result = await addToCart(product, quantity);
      if (result?.success) {
        toast.success(
          `${quantity} ${product.name}${quantity > 1 ? "s" : ""} agregado${
            quantity > 1 ? "s" : ""
          } al carrito`
        );
      } else {
        const message =
          result?.message || "No se pudo agregar el producto al carrito";
        toast.error(message);
      }
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
      toast.error("Ocurrió un problema al agregar el producto al carrito");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    const max = product.stock || 0;
    if (!isNaN(value) && value > 0 && value <= max) {
      setQuantity(value);
    }
  };

  const decreaseQuantity = (e) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = (e) => {
    e.stopPropagation();
    const maxStock = product.stock || 0;
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    }
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
      .map((spec) => `${spec.label}: ${product.specs[spec.field]}`)
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
    if (product.stock === 0) {
      // Si hay 0, mostrar "Sin Stock" (rojo)
      return (
        <StockIcon $inStock={false} $lowStock={false}>
          Sin Stock
        </StockIcon>
      );
    } else if (product.stock > 100) {
      // Si hay más de 100, mostrar "+100 un." (verde)
      return (
        <StockIcon $inStock={true} $lowStock={false}>
          +100 un.
        </StockIcon>
      );
    } else {
      // Si hay entre 1 y 100, mostrar la cantidad exacta (verde)
      return (
        <StockIcon $inStock={true} $lowStock={false}>
          {product.stock} un.
        </StockIcon>
      );
    }
  };

  // Componente memoizado para manejar la imagen con fallback
  // Se mueve fuera del render para evitar recrearlo en cada cambio de cantidad

  return (
    <>
      <StyledCard
        $restricted={restricted}
        $indicadorRecurrencia={product.originalData.DMA_INDICADOR_VENTAS}
      >
        <ImageContainer $restricted={restricted}>
          <MemoizedProductImage
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
              <StockIndicator $inStock={product.stock > 0} $lowStock={false}>
                {/* {product.stock > 0 && product.stock < 100 && (
                  <StockDot $inStock={product.stock > 0} />
                )} */}
                <StockText $inStock={product.stock > 0} $lowStock={false}>
                  {renderStockContent()}
                </StockText>
              </StockIndicator>
            </TopRow>

            <ProductName onClick={handleViewDetails} $restricted={restricted}>
              {product.name}
            </ProductName>
            {renderSpecs(config)}
            <Price>
              <PriceLeft>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                  }}
                >
                  <CurrentPrice>${(priceWithIVA || 0).toFixed(2)}</CurrentPrice>
                  {product.discount > 0 && product.price != null && (
                    <OriginalPrice>${product.price.toFixed(2)}</OriginalPrice>
                  )}
                </div>
                <IVAIndicator>IVA incluido</IVAIndicator>
              </PriceLeft>
              {isClient && !isVisualizacion && product.stock > 0 && (
                <PriceRight>
                  <QuantitySelector onClick={(e) => e.stopPropagation()}>
                    <QuantityButton
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      -
                    </QuantityButton>
                    <QuantityInput
                      type="number"
                      id={`quantity-${product.id}`}
                      name={`quantity-${product.id}`}
                      min="1"
                      max={product.stock || 0}
                      value={quantity}
                      onChange={handleQuantityChange}
                      onClick={(e) => e.stopPropagation()}
                      autoComplete="off"
                    />
                    <QuantityButton
                      onClick={increaseQuantity}
                      disabled={quantity >= (product.stock || 0)}
                    >
                      +
                    </QuantityButton>
                  </QuantitySelector>
                </PriceRight>
              )}
            </Price>
            {isClient && !isVisualizacion && (
              <ButtonContainer>
                <Button
                  leftIconName={
                    quantityInCart > 0 && !isButtonHovered
                      ? "FaCheck"
                      : "FaShoppingCart"
                  }
                  text={
                    product.stock === 0
                      ? "Sin Stock"
                      : isAddingToCart
                      ? "Agregando..."
                      : quantityInCart > 0 && !isButtonHovered
                      ? `${quantityInCart} en carrito`
                      : "Agregar"
                  }
                  variant="solid"
                  size="small"
                  backgroundColor={({ theme }) =>
                    product.stock === 0
                      ? theme.colors.textLight
                      : quantityInCart > 0 && !isButtonHovered
                      ? theme.colors.success
                      : theme.colors.primary
                  }
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.stock === 0}
                  onMouseEnter={() => setIsButtonHovered(true)}
                  onMouseLeave={() => setIsButtonHovered(false)}
                  style={{ width: "100%" }}
                />
              </ButtonContainer>
            )}
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

// Memoizar ProductCard para evitar re-renderizados innecesarios
export default memo(ProductCard, (prevProps, nextProps) => {
  // Comparar props relevantes para decidir si re-renderizar
  return (
    prevProps.product?.id === nextProps.product?.id &&
    prevProps.product?.image === nextProps.product?.image &&
    prevProps.restricted === nextProps.restricted &&
    prevProps.product?.stock === nextProps.product?.stock &&
    prevProps.product?.price === nextProps.product?.price &&
    prevProps.product?.discount === nextProps.product?.discount
  );
});
