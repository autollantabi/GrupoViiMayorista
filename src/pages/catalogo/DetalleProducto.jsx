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
  grid-template-columns: minmax(0, 65%) minmax(0, 35%);
  gap: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  align-items: start;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    gap: 1.25rem;
  }

  @media (max-width: 576px) {
    gap: 1rem;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  min-width: 0;
  box-sizing: border-box;
`;

const Category = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(0.85rem, 2vw, 0.95rem);
  margin-bottom: 0.5rem;
  font-weight: 500;

  @media (max-width: 768px) {
    margin-bottom: 0.375rem;
  }
`;

const ProductTitle = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
  word-break: break-word;

  @media (max-width: 768px) {
    margin-bottom: 0.625rem;
  }
`;

const PriceContainer = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  background-color: ${({ theme }) =>
    theme.mode === "dark"
      ? `${theme.colors.surface}80`
      : `${theme.colors.surface}F5`};
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.04)"};

  @media (max-width: 768px) {
    gap: 0.875rem;
    margin-bottom: 0.875rem;
    flex-direction: column;
    align-items: flex-start;
    padding: 0.875rem 1rem;
  }

  @media (max-width: 480px) {
    gap: 0.75rem;
    padding: 0.75rem 0.875rem;
  }
`;

const CurrentPrice = styled.span`
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};

  @media (max-width: 768px) {
    font-size: 1.625rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const IVAIndicator = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
  display: block;
  margin-bottom: 0.25rem;

  @media (max-width: 480px) {
    margin-bottom: 0;
  }
`;

const OriginalPrice = styled.span`
  font-size: clamp(1rem, 2vw, 1.25rem);
  text-decoration: line-through;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Discount = styled.span`
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.error} 0%, ${theme.colors.warning} 100%)`
      : `linear-gradient(135deg, ${theme.colors.error} 0%, ${theme.colors.warning} 100%)`};
  color: ${({ theme }) => theme.colors.white};
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.875rem;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.2)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)"};

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.25rem 0.625rem;
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

const DescriptionSection = styled.div`
  padding-top: 1.25rem;
  margin-top: 1.5rem;
  border-top: 1px solid
    ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}30` : `${theme.colors.border}20`};

  @media (max-width: 768px) {
    margin-top: 1.25rem;
  }
`;

const DescriptionTitle = styled.span`
  margin-bottom: 0.875rem;
  font-size: clamp(1.1rem, 2.5vw, 1.25rem);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  display: block;
`;

const DescriptionMeta = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: 0.875rem;
  word-break: break-word;
  opacity: 0.8;
`;

const DescriptionText = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.9;
  display: block;
  padding: 0.65rem;
  border-radius: 12px;
  background-color: ${({ theme }) =>
    theme.mode === "dark"
      ? `${theme.colors.surface}80`
      : `${theme.colors.surface}F5`};
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.04)"};

  @media (max-width: 768px) {
    padding: 1rem;
    margin-top: 0.75rem;
  }
`;
const StockIndicator = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  margin: 0;
  padding: 0.5rem 0.875rem;
  border-radius: 12px;
  background-color: ${({ theme, $inStock, $lowStock }) => {
    if ($inStock)
      return theme.mode === "dark"
        ? `${theme.colors.success}15`
        : `${theme.colors.success}10`;
    if ($lowStock)
      return theme.mode === "dark"
        ? `${theme.colors.warning || "#fbbf24"}15`
        : `${theme.colors.warning || "#fbbf24"}10`;
    return theme.mode === "dark"
      ? `${theme.colors.error}15`
      : `${theme.colors.error}10`;
  }};
  border: 1px solid
    ${({ theme, $inStock, $lowStock }) => {
      if ($inStock)
        return theme.mode === "dark"
          ? `${theme.colors.success}30`
          : `${theme.colors.success}20`;
      if ($lowStock)
        return theme.mode === "dark"
          ? `${theme.colors.warning || "#fbbf24"}30`
          : `${theme.colors.warning || "#fbbf24"}20`;
      return theme.mode === "dark"
        ? `${theme.colors.error}30`
        : `${theme.colors.error}20`;
    }};
  display: flex;
  align-items: center;
  width: max-content;
  gap: 0.5rem;
  max-width: 100%;
  flex-wrap: wrap;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.04)"};
  flex-shrink: 0;

  @media (max-width: 768px) {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
  }

  @media (max-width: 480px) {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.375rem 0.625rem;
    gap: 0.375rem;
  }
`;

const BrandCompanyBadge = styled.div`
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  background-color: ${({ theme }) =>
    theme.mode === "dark"
      ? `${theme.colors.surface}80`
      : `${theme.colors.surface}99`};
  border: 1px solid
    ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 0.35rem 0.65rem;
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    padding: 0.3rem 0.55rem;
    font-size: 0.75rem;
  }
`;

const StockBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  display: inline-block;
  padding: 0.5rem 0.875rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  background-color: ${({ theme, $inStock, $lowStock }) => {
    const color = $inStock 
      ? theme.colors.success 
      : $lowStock 
      ? theme.colors.warning || "#fbbf24"
      : theme.colors.error;
    // Agregar 85% de opacidad (D9 en hexadecimal)
    return `${color}D9`;
  }};
  color: ${({ theme }) => theme.colors.white};
  white-space: nowrap;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.2)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)"};

  @media (max-width: 768px) {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  @media (max-width: 480px) {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.375rem 0.625rem;
    font-size: 0.7rem;
  }
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
  flex-shrink: 1;
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const QuantityControlsContainer = styled.div`
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
`;

const QuantityWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
  justify-content: flex-start;

  @media (max-width: 768px) {
    justify-content: flex-start;
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
  width: 100%;
  box-sizing: border-box;
`;

const QuantityButton = styled(Button)`
  width: 38px;
  height: 38px;
  border: 1px solid
    ${({ theme, disabled }) =>
      disabled
        ? theme.mode === "dark"
          ? `${theme.colors.border}40`
          : `${theme.colors.border}30`
        : theme.mode === "dark"
        ? `${theme.colors.border}40`
        : `${theme.colors.border}30`};
  background-color: ${({ theme, disabled }) =>
    disabled
      ? theme.mode === "dark"
        ? `${theme.colors.background}80`
        : theme.colors.background
      : theme.colors.surface};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textSecondary : theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  min-width: 38px;
  padding: 0;
  transition: all 0.2s ease;
  box-shadow: ${({ theme, disabled }) =>
    disabled
      ? "none"
      : theme.mode === "dark"
      ? "0 2px 4px rgba(0, 0, 0, 0.1)"
      : "0 2px 4px rgba(0, 0, 0, 0.04)"};

  &:first-child {
    border-radius: 10px 0 0 10px;
  }

  &:last-child {
    border-radius: 0 10px 10px 0;
  }

  &:hover:not(:disabled) {
    background-color: ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.primary}15`
        : `${theme.colors.primary}08`};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  @media (max-width: 480px) {
    width: 42px;
    height: 42px;
    min-width: 42px;
  }
`;

const QuantityInput = styled.input`
  width: 65px;
  height: 38px;
  border: 1px solid
    ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  background-color: ${({ theme, disabled }) =>
    disabled
      ? theme.mode === "dark"
        ? `${theme.colors.background}80`
        : theme.colors.background
      : theme.colors.surface};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textSecondary : theme.colors.text};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "text")};
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    background-color: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 480px) {
    width: 75px;
    height: 42px;
    font-size: 1.1rem;
  }
`;

// Agregar este nuevo componente para las especificaciones
const SpecificationsSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid
    ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}30` : `${theme.colors.border}20`};

  @media (max-width: 768px) {
    margin-top: 1.25rem;
    padding-top: 1rem;
  }
`;

const SpecificationsTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: clamp(1.1rem, 2.5vw, 1.25rem);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 768px) {
    margin-bottom: 0.875rem;
  }
`;

const SpecificationsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.04)"};
`;

const SpecRow = styled.tr`
  border-bottom: 1px solid
    ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}20` : `${theme.colors.border}15`};

  &:last-child {
    border-bottom: none;
  }
`;

const SpecLabel = styled.td`
  padding: 0.625rem 0.75rem;
  font-weight: 600;
  width: 40%;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
  border-right: 1px solid
    ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}20` : `${theme.colors.border}15`};

  @media (max-width: 768px) {
    padding: 0.5rem 0.625rem;
    font-size: 0.9rem;
    width: 45%;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
    padding: 0.375rem 0.5rem;
  }
`;

const SpecValue = styled.td`
  padding: 0.625rem 0.75rem;
  color: ${({ theme }) => theme.colors.text};
  word-break: break-word;
  font-size: 0.95rem;

  @media (max-width: 768px) {
    padding: 0.5rem 0.625rem;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
    padding: 0.375rem 0.5rem;
  }
`;

const SpecCell = styled.td`
  padding: 0.625rem 0.75rem;
  vertical-align: top;
  width: 50%;
  background-color: ${({ theme, $isEven }) =>
    $isEven
      ? theme.mode === "dark"
        ? `${theme.colors.surface}E6`
        : "#ffffff"
      : theme.mode === "dark"
      ? `${theme.colors.surface}CC`
      : "#f8f9fa"};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.primary}30`
        : `${theme.colors.primary}15`};
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.625rem;
  }

  @media (max-width: 480px) {
    padding: 0.375rem 0.5rem;
  }
`;

const SpecItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SpecItemValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  word-break: break-word;
  font-weight: 500;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const SpecItemLabel = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

// Componentes para los breadcrumbs
const BreadcrumbsContainer = styled.nav`
  margin-bottom: 1.5rem;
  padding: 1rem 0;
  border-bottom: 1px solid
    ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}30` : `${theme.colors.border}20`};

  @media (max-width: 768px) {
    margin-bottom: 1.25rem;
    padding: 0.875rem 0;
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
    $active ? theme.colors.text : theme.colors.textSecondary};
  text-decoration: ${({ $active }) => ($active ? "none" : "none")};
  cursor: ${({ $active }) => ($active ? "default" : "pointer")};
  font-size: clamp(0.85rem, 2vw, 0.95rem);
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};

  @media (max-width: 768px) {
    padding: 0.25rem 0.625rem;
  }

  &:hover:not([disabled]) {
    background-color: ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.primary}15`
        : `${theme.colors.primary}08`};
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
  box-sizing: border-box;
  gap: 0.2rem;
`;

const CodeText = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ImageCaption = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.4rem;
  border-top: 1px solid
    ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}20` : `${theme.colors.border}15`};

  @media (max-width: 768px) {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
`;

const ImageCaptionLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    gap: 0.2rem;
  }
`;

const MainImageContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  cursor: crosshair;
  overflow: hidden;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)"};
  border: 1px solid
    ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? "0 8px 30px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.2)"
        : "0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)"};
  }

  @media (max-width: 768px) {
    cursor: default;
    border-radius: 12px;
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
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `${theme.colors.background}80`
      : theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
  text-align: center;
  padding: 2.5rem;
  border-radius: 16px;
  border: 2px dashed
    ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};

  @media (max-width: 992px) {
    height: 350px;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    height: 300px;
    font-size: 0.9rem;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    height: 250px;
    padding: 1.25rem;
    font-size: 0.85rem;
  }
`;

const ZoomWindow = styled.div`
  position: fixed;
  width: 300px;
  height: 300px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 8px 30px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)"
      : "0 8px 30px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)"};
  overflow: hidden;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.2s ease-in-out;
  pointer-events: none;
  z-index: 5000;
  border: 1px solid
    ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  visibility: ${({ $visible }) => ($visible ? "visible" : "hidden")};

  @media (max-width: 992px) {
    display: none;
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

  // Filtrar y mapear las especificaciones con sus valores
  const specsWithValues = lineConfig.specs
    .map((specConfig) => {
      const value = product.specs[specConfig.field];
      if (value === null || value === undefined || value === "") return null;
      
      return {
        field: specConfig.field,
        label: specConfig.label === "Serie" ? "Alto/Serie" : specConfig.label,
        value: value,
      };
    })
    .filter((spec) => spec !== null);

  // Agrupar en pares para mostrar dos especificaciones por fila
  const groupedSpecs = [];
  for (let i = 0; i < specsWithValues.length; i += 2) {
    groupedSpecs.push(specsWithValues.slice(i, i + 2));
  }

  return (
    <SpecificationsSection>
      <SpecificationsTitle>Especificaciones técnicas</SpecificationsTitle>
      <SpecificationsTable>
        <tbody>
          {groupedSpecs.map((pair, rowIndex) => {
            const getCellColor = (cellIndex) => {
              const totalCellIndex = rowIndex * 2 + cellIndex;
              // Patrón: blanca (0,3), gris (1,2) - se repite cada 4 celdas
              return totalCellIndex % 4 === 0 || totalCellIndex % 4 === 3;
            };
            
            return (
              <SpecRow key={`row-${rowIndex}`}>
                {pair.map((spec, cellIndex) => (
                  <SpecCell key={spec.field} $isEven={getCellColor(cellIndex)}>
                    <SpecItem>
                      <SpecItemLabel>{spec.label}</SpecItemLabel>
                      <SpecItemValue>{spec.value}</SpecItemValue>
                    </SpecItem>
                  </SpecCell>
                ))}
                {/* Si hay un número impar de especificaciones, agregar celda vacía */}
                {pair.length === 1 && (
                  <SpecCell key="empty" $isEven={getCellColor(1)}></SpecCell>
                )}
              </SpecRow>
            );
          })}
        </tbody>
      </SpecificationsTable>
    </SpecificationsSection>
  );
};

const DetalleProducto = () => {
  const { id, empresaId: empresaIdParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loadProductByCodigo, loadProductById } = useProductCatalog();
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
    if (empresaIdParam) return empresaIdParam;
    const companyFromState = location.state?.empresaId;
    if (companyFromState) return companyFromState;
    if (product?.empresaId) return product.empresaId;
    if (product?.empresa) return product.empresa;
    return null;
  }, [empresaIdParam, location.state, product?.empresaId, product?.empresa]);

  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [productNotFound, setProductNotFound] = useState(false);
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

  // Calcular el máximo de cantidad basado en el stock disponible (siempre declarado para cumplir Rules of Hooks)
  const maxQuantity = useMemo(() => {
    if (!product) return 0;
    return product.stock || 0;
  }, [product]);

  // Asegurar que la cantidad no exceda el stock disponible (siempre declarado para cumplir Rules of Hooks)
  useEffect(() => {
    const maxStock = product?.stock || 0;
    if (maxStock === 0) {
      setQuantity(0);
    } else if (quantity > maxStock) {
      setQuantity(maxStock);
    } else if (quantity === 0 && maxStock > 0) {
      setQuantity(1);
    }
  }, [product?.stock]);

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
          loading="lazy"
        />
      </>
    );
  };

  useEffect(() => {
    hasFetchedProductRef.current = false;
    setProductNotFound(false);
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
    if (!id) {
      setProductNotFound(true);
      return;
    }
    if (hasFetchedProductRef.current) {
      return;
    }

    const aplicarProducto = (productoApi) => {
      if (!productoApi) return false;
      setProduct((prev) => {
        if (!prev) return productoApi;
        const merged = {
          ...prev,
          ...productoApi,
        };
        if (!productoApi?.image && prev.image) merged.image = prev.image;
        if (!productoApi?.description && prev.description) merged.description = prev.description;
        if (!productoApi?.brand && prev.brand) merged.brand = prev.brand;
        return merged;
      });
      hasFetchedProductRef.current = true;
      return true;
    };

    const cargarProducto = async () => {
      if (resolvedEmpresaId) {
        const productoApi = await loadProductByCodigo(id, resolvedEmpresaId);
        if (aplicarProducto(productoApi)) return;
        if (!product) handleNavigate();
        return;
      }

      // Sin empresaId en la URL no se puede consultar (la API siempre requiere empresaId)
      if (!resolvedEmpresaId) {
        setProductNotFound(true);
        return;
      }
      setLoadingProduct(true);
      setProductNotFound(false);
      try {
        const productoApi = await loadProductById(id, resolvedEmpresaId);
        if (aplicarProducto(productoApi)) return;
        setProductNotFound(true);
      } finally {
        setLoadingProduct(false);
      }
    };

    cargarProducto();
  }, [id, resolvedEmpresaId, loadProductByCodigo, loadProductById, product]);

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

  // Limpiar intervalos de cantidad al desmontar (siempre declarado para cumplir Rules of Hooks)
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

  if (loadingProduct || (!product && !productNotFound)) {
    return (
      <PageContainer>
        <div style={{ padding: "2rem", textAlign: "center" }}>Cargando producto...</div>
      </PageContainer>
    );
  }

  if (productNotFound) {
    return (
      <PageContainer>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ marginBottom: "1rem" }}>Producto no encontrado.</p>
          <Button onClick={() => navigateToHomeByRole()}>Ir al inicio</Button>
        </div>
      </PageContainer>
    );
  }

  if (!product) {
    return null;
  }

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

  const handleAddToCart = () => {
    if (!isAddingToCart && product.stock > 0 && quantity > 0) {
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
        url={`https://viicommerce.com/productos/${product?.empresaId || resolvedEmpresaId || ""}/${product?.id}`}
        type="product"
        structuredData={structuredData}
      />
      <PageContainer style={{ padding: "0 16px" }}>
        {renderBreadcrumbs()}
        <ProductLayout>
          <ImageSection>
            {/* Nombre del producto */}
            <ProductTitle>{product.name}</ProductTitle>
            
            {/* Categoría */}
            <Category>
              {product.filtersByType &&
              Object.keys(product.filtersByType).length > 0
                ? Object.values(product.filtersByType)
                    .flat() // Aplanar el array de arrays
                    .join(", ")
                : "Producto sin categoría"}
            </Category>

            {/* Contenedor principal de la imagen con eventos de mouse */}
            <MainImageContainer
              ref={imageContainerRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              {/* Badge de unidades disponibles en la esquina superior derecha */}
              <StockBadge $inStock={product.stock > 0} $lowStock={false}>
                {product.stock === 0
                  ? "Sin Stock"
                  : product.stock > 100
                  ? "+100 Unidades"
                  : `${product.stock} Unidad${
                      product.stock !== 1 ? "es" : ""
                    }`}
              </StockBadge>

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

            {/* Pie de imagen con código y badge de empresa/marca */}
            <ImageCaption>
              <ImageCaptionLeft>
                {product.originalData?.DMA_MATERIAL && (
                  <CodeText>
                    Cod: {product.originalData.DMA_MATERIAL}
                  </CodeText>
                )}
                {product.originalData?.DMA_CODIGOPROVEEDOR && (
                  <CodeText>
                    Cod: {product.originalData.DMA_CODIGOPROVEEDOR}
                  </CodeText>
                )}
              </ImageCaptionLeft>
              <BrandCompanyBadge>
                {product.empresa || product.empresaId} / {product.brand}
              </BrandCompanyBadge>
            </ImageCaption>
          </ImageSection>

          <InfoSection>
            {/* Precio en la parte superior */}
            <PriceContainer>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.5rem",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  flex: "1 1 0",
                  minWidth: 0,
                }}
              >
                <CurrentPrice>${(priceWithIVA || 0).toFixed(2)}</CurrentPrice>
                <IVAIndicator>IVA incluido</IVAIndicator>
                {product.discount > 0 && (
                  <>
                    {product.discount > 0 && product.price != null && (
                      <OriginalPrice>${product.price.toFixed(2)}</OriginalPrice>
                    )}
                    <Discount>-{product.discount}%</Discount>
                  </>
                )}
              </div>
              
              {/* Controles de cantidad a la derecha del precio */}
              {isClient && !isVisualizacion && product.stock > 0 && (
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
              )}
            </PriceContainer>
            
            {/* Botón de agregar al carrito */}
            {isClient && !isVisualizacion && (
              <AddToCartButtonWrapper>
                <Button
                  leftIconName={
                    product.stock === 0
                      ? "FaCartShopping"
                      : currentInCart > 0 && !isButtonHovered
                      ? "FaCheck"
                      : "FaCartShopping"
                  }
                  text={
                    product.stock === 0
                      ? "Sin Stock"
                      : isAddingToCart
                      ? "Agregando..."
                      : currentInCart > 0 && !isButtonHovered
                      ? `${currentInCart} en carrito`
                      : isButtonHovered && quantity > 0
                      ? `Agregar ${quantity}`
                      : "Agregar"
                  }
                  variant="solid"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.stock === 0}
                  onMouseEnter={() => setIsButtonHovered(true)}
                  onMouseLeave={() => setIsButtonHovered(false)}
                  backgroundColor={({ theme }) =>
                    product.stock === 0
                      ? theme.colors.textLight
                      : currentInCart > 0 && !isButtonHovered
                      ? theme.colors.success
                      : theme.colors.primary
                  }
                  size="medium"
                  style={{ width: "100%" }}
                />
              </AddToCartButtonWrapper>
            )}

            <Description>
              {/* Información de marca y empresa */}
              <DescriptionSection>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <DescriptionTitle>Descripción</DescriptionTitle>
                  <DescriptionText>{product.description}</DescriptionText>
                </div>
              </DescriptionSection>
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
