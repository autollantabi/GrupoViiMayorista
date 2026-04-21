import { useState, useEffect, useRef, memo, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Modal from "../../components/ui/Modal";
import { useCart } from "../../context/CartContext";
import Button from "../../components/ui/Button";
import { useAppTheme } from "../../context/AppThemeContext";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../constants/routes";
import RenderIcon from "../../components/ui/RenderIcon";
import RenderLoader from "../../components/ui/RenderLoader";
import { api_order_createOrder } from "../../api/order/apiOrder";
import { TAXES, calculatePriceWithIVA } from "../../constants/taxes";
import PageContainer from "../../components/layout/PageContainer";
import { baseLinkImages } from "../../constants/links";
import { api_cart_deleteProductsFromCart, api_cart_createCarrito } from "../../api/cart/apiCart";
import { api_vendedores_getDirecciones } from "../../api/vendedores/apiVendedores";
import { ROLES } from "../../constants/roles";
import { api_addresses_createAddress } from "../../api/users/apiAddresses";
import MapSelector from "../../components/ui/MapSelector";
import { reverseGeocode } from "../../utils/reverseGeocoding";

const PageTitle = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0 2rem 0;
  color: ${({ theme }) => theme.colors.text};
  gap: 1rem;

  h1 {
    margin: 0;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    font-weight: 800;
    background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }
`;

const CartEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)"};
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};

  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
    border-radius: 16px;
  }
`;

const EmptyCartIcon = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyCartText = styled.p`
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 2rem;
  font-weight: 500;
`;

const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 900px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const CartItemsList = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 20px;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)"};
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  overflow: hidden;

  @media (max-width: 768px) {
    border-radius: 16px;
  }
`;

const CartItemContainer = styled.div`
  display: flex;
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}30` : `${theme.colors.border}20`};
  gap: 1.5rem;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.background}50` : `${theme.colors.background}`};
  }

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
    flex-direction: column;
  }
`;

const ItemImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    align-self: center;
  }
`;

const ImagePlaceholder = styled.div`
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.background}80` : "#f5f5f5"};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.75rem;
  text-align: center;
  padding: 1rem;
  border-radius: 12px;
  border: 2px dashed ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  gap: 0.5rem;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const ItemName = styled.h3`
  margin: 0;
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: 600;
  line-height: 1.4;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ItemBrand = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

const ItemPricing = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 2px;
  min-width: 120px;
`;

const ItemPrice = styled.div`
  font-weight: bold;
  color: ${({ theme, $subtotal }) =>
    $subtotal ? theme.colors.text : theme.colors.primary};
  font-size: ${({ $subtotal }) => ($subtotal ? "0.9rem" : "1.2rem")};
  text-decoration: ${({ $subtotal }) => ($subtotal ? "line-through" : "none")};
`;

const IvaLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const ItemQuantityControl = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
`;

const QuantityButton = styled(Button)`
  width: 28px;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.border : theme.colors.surface};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textLight : theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};

  &:first-child {
    border-radius: 4px 0 0 4px;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const QuantityInput = styled.input`
  width: 40px;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 0.9rem;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`;

const OrderSummary = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 20px;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)"};
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 70px;

  @media (max-width: 768px) {
    border-radius: 16px;
    padding: 1.5rem;
    position: static;
  }
`;

const SummaryTitle = styled.h2`
  font-size: clamp(1.2rem, 3vw, 1.4rem);
  margin: 0 0 1.5rem 0;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SummaryLabel = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
`;

const SummaryValue = styled.span`
  font-weight: ${({ $bold }) => ($bold ? "bold" : "normal")};
  color: ${({ theme }) => theme.colors.text};
`;

const TotalRow = styled(SummaryRow)`
  padding-top: 2px;
  font-size: 1.1rem;
`;

const StockWarning = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.85rem;
  margin: 4px 0 8px;
  font-weight: 500;
`;

const StockInfo = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.8rem;
  margin-top: 6px;
`;

const CartStockText = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.85rem;
  margin: 6px 0;
  display: block;
`;

const StockAlertBanner = styled.div`
  background-color: ${({ theme }) => theme.colors.errorLight || "#FFEBEE"};
  color: ${({ theme }) => theme.colors.error};
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.8rem;
`;

const ShippingSection = styled.div`
  margin: 2rem 0;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 20px;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)"};
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  padding: 2rem;

  @media (max-width: 768px) {
    border-radius: 16px;
    padding: 1.5rem;
    margin: 1.5rem 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.1rem, 3vw, 1.3rem);
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const AddressCard = styled.div`
  border: 2px solid
    ${({ theme, selected }) =>
    selected
      ? theme.colors.primary
      : theme.mode === "dark"
        ? `${theme.colors.border}40`
        : `${theme.colors.border}30`};
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: ${({ theme, selected }) =>
    selected
      ? theme.mode === "dark"
        ? `${theme.colors.primary}15`
        : `${theme.colors.primary}08`
      : theme.mode === "dark"
        ? `${theme.colors.background}80`
        : "transparent"};
  transition: all 0.3s ease;
  box-shadow: ${({ theme, selected }) =>
    selected
      ? theme.mode === "dark"
        ? "0 4px 16px rgba(0, 0, 0, 0.15)"
        : "0 4px 16px rgba(0, 0, 0, 0.08)"
      : "none"};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) =>
    theme.mode === "dark"
      ? `${theme.colors.primary}12`
      : `${theme.colors.primary}08`};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 6px 20px rgba(0, 0, 0, 0.2)"
      : "0 6px 20px rgba(0, 0, 0, 0.1)"};
  }

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 12px;
  }
`;

const AddressInfo = styled.div`
  flex: 1;
`;

const AddressName = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const AddressDetails = styled.div`
  font-size: 0.9rem;
`;

const AddressActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled(Button)`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark || theme.colors.primary};
  }
`;

const NewAddressButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.background}80` : "transparent"};
  border: 2px dashed ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  border-radius: 12px;
  padding: 1rem;
  width: 100%;
  margin-top: 1rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) =>
    theme.mode === "dark"
      ? `${theme.colors.primary}15`
      : `${theme.colors.primary}08`};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => `${theme.colors.primary}20`};
  }

  @media (max-width: 768px) {
    padding: 0.875rem;
    border-radius: 10px;
  }
`;

// Nuevos estilos para las pestañas de empresas
const CompanyTabs = styled.div`
  display: flex;
  overflow-x: auto;
  margin-bottom: 2rem;
  border-bottom: 2px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
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
  }
`;

const CompanyTab = styled.button`
  padding: 0.875rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : "transparent")};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  font-size: 0.95rem;
  cursor: pointer;
  white-space: nowrap;
  border-radius: 12px 12px 0 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
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

const CompanySummary = styled.div`
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  border-radius: 16px;
  background-color: ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.background}50` : `${theme.colors.background}`};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => `${theme.colors.primary}50`};
    box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 4px 16px rgba(0, 0, 0, 0.15)"
      : "0 4px 16px rgba(0, 0, 0, 0.08)"};
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 12px;
  }
`;

const CompanyName = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  color: ${({ theme }) => theme.colors.text};
`;

const ValidationWarning = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.8rem;
  margin-top: 4px;
`;

const EmptyAddressState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 2px dashed ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  border-radius: 16px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  background-color: ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.background}80` : `${theme.colors.background}`};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  gap: 0.75rem;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    border-radius: 12px;
    min-height: 80px;
  }
`;

// Agrega estas definiciones de componentes styled después de EmptyAddressState y antes de CompanyCheckoutButton
const ProcessingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const ProcessingCard = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 25px rgba(0, 0, 0, 0.3)"
      : "0 20px 60px rgba(0, 0, 0, 0.2), 0 8px 25px rgba(0, 0, 0, 0.15)"};
  padding: 2.5rem;
  width: 90%;
  max-width: 450px;
  text-align: center;
  z-index: 1000;
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    border-radius: 16px;
    max-width: 90%;
  }
`;

const ProcessingTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(1.2rem, 3vw, 1.4rem);
  font-weight: 700;
`;

const ProcessingMessage = styled.p`
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
  line-height: 1.6;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? "rgba(10, 11, 14, 0.85)"
      : "rgba(255, 255, 255, 0.85)"};
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  transition: all 0.3s ease;
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 400px;
  text-align: center;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 24px;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 20px 50px rgba(0, 0, 0, 0.4)"
      : "0 20px 50px rgba(0, 0, 0, 0.1)"};
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
`;

const LoadingTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const LoadingText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`;

const SuccessIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: 16px;
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
  gap: 8px;
`;

const LineTitle = styled.h3`
  margin-bottom: 1rem;
  padding: 1rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  font-weight: 700;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.04)"};
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}30` : `${theme.colors.border}20`};

  @media (max-width: 768px) {
    padding: 0.875rem 1.25rem;
    border-radius: 12px;
    font-size: 1rem;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`;

const FormLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FormInput = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CompanyCheckoutButton = styled(Button)`
  width: 100%;
  margin-top: 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  font-weight: 600;
  padding: 0.875rem 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px ${({ theme }) => `${theme.colors.primary}30`};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) =>
    theme.colors.primaryDark || theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${({ theme }) => `${theme.colors.primary}40`};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Componente memoizado para la imagen del producto en el carrito
const MemoizedProductImage = memo(({ src, alt }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const timeoutRef = useRef(null);
  const imgRef = useRef(null);
  const currentSrcRef = useRef(null);

  // Construir la URL completa de la imagen - usar tal cual si ya es URL completa
  const imageSrc = useMemo(() => {
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
    if (currentSrcRef.current === imageSrc) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setImageLoading(false);
      setImageError(false);
    }
  }, [imageSrc]);

  const handleImageError = useCallback(() => {
    // Solo procesar si es la misma imagen que estamos esperando
    if (currentSrcRef.current === imageSrc) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setImageLoading(false);
      setImageError(true);
    }
  }, [imageSrc]);

  // Resetear estados cuando cambia la src
  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (imageSrc) {
      currentSrcRef.current = imageSrc;
      setImageError(false);
      setImageLoading(true);

      // Establecer timeout de 10 segundos como respaldo
      const currentSrc = imageSrc;
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
  }, [imageSrc]);

  // Verificar si la imagen ya está cargada después de renderizar (para imágenes en caché)
  useEffect(() => {
    if (imgRef.current && imageSrc && imageLoading) {
      const img = imgRef.current;
      // Si la imagen ya está completa, disparar onLoad
      if (img.complete && img.naturalWidth > 0 && currentSrcRef.current === imageSrc) {
        handleImageLoad();
      }
    }
  }, [imageSrc, imageLoading, handleImageLoad]);

  if (imageError || !imageSrc) {
    return (
      <ImagePlaceholder>
        <RenderIcon name="FaImage" size={32} />
        <div>Imagen no disponible</div>
      </ImagePlaceholder>
    );
  }

  return (
    <>
      {imageLoading && (
        <ImagePlaceholder>
          <RenderLoader size="24px" showSpinner={true} />
          <div>Cargando...</div>
        </ImagePlaceholder>
      )}
      <ItemImage
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: imageLoading ? "none" : "block" }}
      />
    </>
  );
});

MemoizedProductImage.displayName = "MemoizedProductImage";

const CartItem = ({
  item,
  handleQuantityChange,
  removeFromCart,
  theme,
  navigate,
  extraDiscount = 0,
  isB2BSeller = false,
}) => {
  const discount = item?.discount || 0;
  const maxStock = item?.stock || 0;
  const quantityIntervalRef = useRef(null);
  const currentQuantityRef = useRef(item.quantity);
  const mouseDownExecutedRef = useRef(false);

  // Actualizar el ref cuando cambia la cantidad del item
  useEffect(() => {
    currentQuantityRef.current = item.quantity;
  }, [item.quantity]);

  // Calcular precio con descuentos aplicados (promo + extra de vendedor)
  const promoDiscount = item?.promotionalDiscount || 0;
  const totalDiscountPct = (Number(promoDiscount) + Number(extraDiscount)) / 100;
  const discountedPrice = item.price * (1 - totalDiscountPct);

  // Calcular precio con IVA incluido
  const priceWithIVA = calculatePriceWithIVA(
    discountedPrice,
    item.iva || TAXES.IVA_PERCENTAGE
  );

  const subTotal = priceWithIVA * item.quantity;

  const handleItemClick = () => {
    const empresaId = item.empresaId || "";
    navigate(`/productos/${encodeURIComponent(empresaId)}/${item.id}`, {
      state: {
        product: item, // Pasar el producto completo
        empresaId: item.empresaId,
        prevUrl: "/carrito", // URL del carrito para el botón de regreso
      },
    });
  };

  // Calcular el máximo de cantidad basado en el stock disponible
  const maxQuantity = maxStock || 0;

  // Funciones para manejar el mantenimiento presionado del botón
  const handleDecreaseMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Marcar que mouseDown ya ejecutó la acción
    mouseDownExecutedRef.current = true;

    // Limpiar cualquier timeout de clic
    if (quantityIntervalRef.current) {
      if (typeof quantityIntervalRef.current === "number") {
        clearTimeout(quantityIntervalRef.current);
      } else {
        clearInterval(quantityIntervalRef.current);
      }
      quantityIntervalRef.current = null;
    }

    if (item.quantity > 1) {
      handleQuantityChange(item.id, item.quantity - 1);
    }

    // Iniciar intervalo después de un pequeño delay
    quantityIntervalRef.current = setTimeout(() => {
      const interval = setInterval(() => {
        const currentQuantity = currentQuantityRef.current;
        if (currentQuantity > 1) {
          const newQuantity = currentQuantity - 1;
          currentQuantityRef.current = newQuantity;
          handleQuantityChange(item.id, newQuantity);
        } else {
          clearInterval(interval);
          quantityIntervalRef.current = null;
        }
      }, 150); // Repetir cada 150ms

      quantityIntervalRef.current = interval;
    }, 500); // Delay inicial de 500ms
  };

  const handleIncreaseMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Marcar que mouseDown ya ejecutó la acción
    mouseDownExecutedRef.current = true;

    // Limpiar cualquier timeout de clic
    if (quantityIntervalRef.current) {
      if (typeof quantityIntervalRef.current === "number") {
        clearTimeout(quantityIntervalRef.current);
      } else {
        clearInterval(quantityIntervalRef.current);
      }
      quantityIntervalRef.current = null;
    }

    if (item.quantity < maxQuantity) {
      handleQuantityChange(item.id, item.quantity + 1);
    }

    // Iniciar intervalo después de un pequeño delay
    quantityIntervalRef.current = setTimeout(() => {
      const interval = setInterval(() => {
        const currentQuantity = currentQuantityRef.current;
        if (currentQuantity < maxQuantity) {
          const newQuantity = currentQuantity + 1;
          currentQuantityRef.current = newQuantity;
          handleQuantityChange(item.id, newQuantity);
        } else {
          clearInterval(interval);
          quantityIntervalRef.current = null;
        }
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

  // Componente memoizado para manejar la imagen con fallback
  // Se mueve fuera del render para evitar recrearlo en cada cambio de cantidad

  return (
    <CartItemContainer>
      <MemoizedProductImage src={item?.image} alt={item?.name} />

      <ItemDetails>
        <ItemName onClick={handleItemClick}>{item?.name}</ItemName>
        <ItemBrand>{item?.brand}</ItemBrand>

        {/* Indicador de stock disponible */}
        <CartStockText>
          {maxStock === 0
            ? "Sin Stock"
            : maxStock > 100
              ? "+100 Unidades Disponibles"
              : `${maxStock} Unidad${maxStock !== 1 ? "es" : ""} Disponible${maxStock !== 1 ? "s" : ""
              }`}
        </CartStockText>

        {maxStock > 0 && (
          <ItemQuantityControl>
            <QuantityButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Solo ejecutar si mouseDown no ejecutó la acción ya
                if (!mouseDownExecutedRef.current) {
                  handleQuantityChange(item.id, item.quantity - 1);
                }
              }}
              onMouseDown={handleDecreaseMouseDown}
              onMouseUp={handleQuantityButtonMouseUp}
              onMouseLeave={handleQuantityButtonMouseLeave}
              onTouchStart={handleDecreaseMouseDown}
              onTouchEnd={handleQuantityButtonMouseUp}
              disabled={item.quantity <= 1}
              text={"-"}
              size="small"
              style={{ display: isB2BSeller ? "none" : "flex" }}
            />

            <QuantityInput
              type="number"
              id={`quantity-cart-${item.id}`}
              name={`quantity-cart-${item.id}`}
              min="1"
              max={maxQuantity}
              value={item.quantity}
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value) || 1;
                // Limitar al máximo disponible
                const limitedQuantity = Math.min(newQuantity, maxQuantity);
                handleQuantityChange(item.id, limitedQuantity);
              }}
              autoComplete="off"
              disabled={isB2BSeller}
              style={{
                borderLeft: isB2BSeller ? "1px solid" : "none",
                borderRight: isB2BSeller ? "1px solid" : "none",
                borderRadius: isB2BSeller ? "4px" : "0"
              }}
            />
            <QuantityButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Solo ejecutar si mouseDown no ejecutó la acción ya
                if (!mouseDownExecutedRef.current) {
                  handleQuantityChange(item.id, item.quantity + 1);
                }
              }}
              onMouseDown={handleIncreaseMouseDown}
              onMouseUp={handleQuantityButtonMouseUp}
              onMouseLeave={handleQuantityButtonMouseLeave}
              onTouchStart={handleIncreaseMouseDown}
              onTouchEnd={handleQuantityButtonMouseUp}
              disabled={item.quantity >= maxQuantity}
              text={"+"}
              size="small"
              style={{ display: isB2BSeller ? "none" : "flex" }}
            />
          </ItemQuantityControl>
        )}
      </ItemDetails>

      <ItemPricing>
        <ItemPrice>${subTotal.toFixed(2)}</ItemPrice>
        {(promoDiscount > 0 || extraDiscount > 0) && (
          <ItemPrice $subtotal>
            ${calculatePriceWithIVA(item.price * item.quantity, item.iva || TAXES.IVA_PERCENTAGE).toFixed(2)}
          </ItemPrice>
        )}
        <IvaLabel style={{ textAlign: "right", marginTop: 0 }}>IVA Incl.</IvaLabel>
        {!isB2BSeller && (
          <Button
            onClick={() => removeFromCart(item.id, item.empresaId)}
            text={"Eliminar"}
            color={theme.colors.error}
            size="small"
            backgroundColor={"transparent"}
            style={{ marginTop: "auto" }}
          />
        )}
      </ItemPricing>
    </CartItemContainer>
  );
};

// Función para mapear la línea de producto a la clave de descuento
const mapLineaToDiscountKey = (lineaNegocio) => {
  if (!lineaNegocio) return null;

  const lineaUpper = lineaNegocio.toUpperCase().trim();

  // LLANTAS y LLANTAS MOTO mapean a LLANTAS
  if (lineaUpper === "LLANTAS" || lineaUpper === "LLANTAS MOTO") {
    return "LLANTAS";
  }

  // HERRAMIENTAS mapea a HERRAMIENTAS
  if (lineaUpper === "HERRAMIENTAS") {
    return "HERRAMIENTAS";
  }

  // LUBRICANTES mapea a LUBRICANTES
  if (lineaUpper === "LUBRICANTES") {
    return "LUBRICANTES";
  }

  // Para otras líneas, usar el nombre tal cual
  return lineaUpper;
};

// Función para obtener el nombre de visualización de la línea
const getDisplayLineName = (lineaNegocio) => {
  if (!lineaNegocio) return "DEFAULT";

  const lineaUpper = lineaNegocio.toUpperCase().trim();

  // LLANTAS MOTO se muestra como MOTO
  if (lineaUpper === "LLANTAS MOTO") {
    return "MOTO";
  }

  // Para otras líneas, usar el nombre tal cual
  return lineaUpper;
};

// Añadir esta función para encontrar la mejor dirección disponible
const findBestAvailableAddress = (addresses, company, type) => {
  // 1. Buscar predeterminada para esta empresa
  const defaultForCompany = addresses.find(
    (addr) => addr.type === type && addr.isDefault && addr.empresa === company
  );
  if (defaultForCompany) return defaultForCompany.id;

  // 2. Buscar cualquier dirección de este tipo para esta empresa
  const anyForCompany = addresses.find(
    (addr) => addr.type === type && addr.empresa === company
  );
  if (anyForCompany) return anyForCompany.id;

  // 3. Buscar predeterminada global
  const defaultGlobal = addresses.find(
    (addr) => addr.type === type && addr.isDefault
  );
  if (defaultGlobal) return defaultGlobal.id;

  // 4. Buscar cualquier dirección de este tipo
  const anyAddress = addresses.find((addr) => addr.type === type);
  if (anyAddress) return anyAddress.id;

  // No hay direcciones disponibles
  return null;
};

const ResolvedAddress = ({ address }) => {
  const [resolvedText, setResolvedText] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resolve = async () => {
      // Priorizar coordenadas si existen
      const lat = address.LATITUDE || address.latitude;
      const lng = address.LONGITUDE || address.longitude;
      const hasCoords = lat && lng && lat !== "" && lng !== "";

      if (hasCoords) {
        setLoading(true);
        try {
          const result = await reverseGeocode(lng, lat);
          if (result && result.address) {
            setResolvedText(result.address);
          }
        } catch (error) {
          console.error("Error resolving address:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    resolve();
  }, [address.LATITUDE, address.LONGITUDE, address.latitude, address.longitude]);

  if (loading) return <span>Cargando ubicación...</span>;

  if (resolvedText) {
    return (
      <>
        <div style={{ fontWeight: '500', color: '#2196f3', fontSize: '0.75rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <RenderIcon name="FaMapMarkerAlt" size={10} />
          Ubicación seleccionada por mapa
        </div>
        {resolvedText}
      </>
    );
  }

  return (
    <>
      {address.street || address.STREET} {address.number || address.NUMBER || ""} {address.city || address.CITY},{" "}
      {address.state || address.STATE}
    </>
  );
};

const Carrito = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    isLoading,
    isHydrating,
    loadCartFromAPI, // Función para cargar el carrito
    removeFromCartByDetailIds, // Función para eliminar por idShoppingCartDetail
  } = useCart();
  const navigate = useNavigate();
  const { theme } = useAppTheme();
  const { user, isSeller, isB2CSeller, isB2BSeller } = useAuth(); // Obtenemos el usuario actual e info de rol


  // Estados para manejar direcciones
  const [addresses, setAddresses] = useState([]);

  // Estados para agrupar el carrito por empresa (y dentro por línea)
  const [groupedCart, setGroupedCart] = useState({});
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Agregar estos nuevos estados para el proceso de checkout
  const [isProcessingOrders, setIsProcessingOrders] = useState(false);
  const [currentProcessingCompany, setCurrentProcessingCompany] = useState("");
  const [completedOrders, setCompletedOrders] = useState(0);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [totalOrdersToProcess, setTotalOrdersToProcess] = useState(0);
  const [lastProcessedCompanies, setLastProcessedCompanies] = useState([]);
  const [loadingTimeoutReached, setLoadingTimeoutReached] = useState(false);

  const [companyToCheckout, setCompanyToCheckout] = useState(null);
  const skipCartLoadRef = useRef(false); // Ref para evitar recargar el carrito cuando el modal está visible

  // Estados para modales
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Estados para el modal de selección de direcciones (solo para vendedores)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressModalType, setAddressModalType] = useState("S"); // "S" para envío, "B" para facturación
  const [addressModalCompany, setAddressModalCompany] = useState(null);

  // Estados para creación de dirección (B2B)
  const [isCreateAddressModalOpen, setIsCreateAddressModalOpen] = useState(false);
  const [newAddressData, setNewAddressData] = useState({
    country: "EC",
    state: "",
    city: "",
    street: ""
  });
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Nueva función para confirmar el pago de una línea
  const handleLineCheckoutClick = (company, line) => {
    setCompanyToCheckout(`${company}_${line}`);
    setShowConfirmModal(true);
  };

  // El carrito se carga automáticamente desde CartContext cuando el usuario está disponible
  // Solo cargar manualmente cuando sea necesario (después de checkout, etc.)

  const loadingAddressesRef = useRef(false);
  const lastLoadedAccountRef = useRef(null);

  // Cargar direcciones del usuario o del cliente (si es vendedor)
  const loadAddresses = async (force = false) => {
    if (!user || (loadingAddressesRef.current && !force)) return;

    let userAddresses = [];

    try {
      if (isSeller) {
        // Para vendedores, obtener direcciones.
        // Se envía una sola vez para el primer cliente/empresa encontrado, asegurando el ACCOUNT_USER completo.
        const stored = JSON.parse(sessionStorage.getItem('sellerCartData') || '{}');
        const clientAccounts = stored.clientAccounts || {};
        const entries = Object.entries(clientAccounts);

        if (entries.length > 0) {
          const [empresa, account] = entries[0];

          // Evitar recargar si es la misma cuenta (a menos que se fuerce)
          if (!force && lastLoadedAccountRef.current === account && addresses.length > 0) return;

          loadingAddressesRef.current = true;
          const response = await api_vendedores_getDirecciones(account, isB2BSeller ? "AUTOLLANTA" : empresa);

          if (response.success && Array.isArray(response.data)) {
            userAddresses = response.data.map((addr) => ({
              id: addr.ID.toString(),
              name: addr.TYPE.trim().toUpperCase() === "S" ? "ENVIO" : "FACTURACION",
              street: addr.STREET,
              number: "",
              city: addr.CITY,
              state: addr.STATE,
              zipCode: "",
              phone: "",
              isDefault: addr.PREDETERMINED,
              type: addr.TYPE.trim().toUpperCase() === "S" ? "S" : "B",
              internalType: addr.TYPE.trim().toUpperCase() === "S" ? "S" : "B",
              empresa: addr.EMPRESA,
              origen: addr.ORIGIN,
              LATITUDE: addr.LATITUDE,
              LONGITUDE: addr.LONGITUDE,
            }));
            lastLoadedAccountRef.current = account;
          }
        }
      } else if (user.DIRECCIONES) {
        // Evitar recargar si es el mismo usuario (a menos que se fuerce)
        if (!force && lastLoadedAccountRef.current === user.ACCOUNT_USER && addresses.length > 0) return;

        loadingAddressesRef.current = true;
        // Obtener todas las direcciones y aplanarlas en un solo array
        const allAddresses = Object.values(user.DIRECCIONES).flat();

        userAddresses = allAddresses.map((addr) => ({
          id: addr.ID.toString(),
          name: addr.CLASIFICATION,
          street: addr.STREET,
          number: "",
          city: addr.CITY,
          state: addr.STATE,
          zipCode: "",
          phone: "",
          isDefault: addr.PREDETERMINED,
          type: addr.TYPE.trim(),
          empresa: addr.EMPRESA,
          origen: addr.ORIGIN,
          LATITUDE: addr.LATITUDE,
          LONGITUDE: addr.LONGITUDE,
        }));
        lastLoadedAccountRef.current = user.ACCOUNT_USER;
      }

      if (userAddresses.length > 0) {
        setAddresses(userAddresses);
      }
    } catch (error) {
      console.error("Error al cargar direcciones:", error);
    } finally {
      loadingAddressesRef.current = false;
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [user, isSeller]);

  // Agrupar items del carrito por empresa (y dentro por línea)
  // No ejecutar si el modal de éxito está visible para evitar interferencias
  useEffect(() => {
    // No agrupar si el modal está visible o si estamos procesando
    if (showSuccessCard || isProcessingOrders) {
      return;
    }

    const groupByCompany = () => {
      const grouped = {};

      cart.forEach((item) => {
        const company = item.empresaId || "Sin empresa";
        const lineaNegocio = item.lineaNegocio || "DEFAULT";
        // Usar el nombre de visualización (LLANTAS MOTO se muestra como MOTO)
        const displayLine = getDisplayLineName(lineaNegocio);
        // Usar la clave de descuento para cálculos
        const discountKey = mapLineaToDiscountKey(lineaNegocio) || "DEFAULT";

        if (!grouped[company]) {
          // Verificar si ya existía esta empresa en el agrupamiento anterior
          // y mantener sus direcciones seleccionadas
          grouped[company] = {
            items: [],
            lines: {}, // Agrupar por línea dentro de la empresa (usando línea original)
            total: 0,
            // Mantener las direcciones previamente seleccionadas si existían
            shippingAddressId: groupedCart[company]?.shippingAddressId || null,
            billingAddressId: groupedCart[company]?.billingAddressId || null,
          };
        }

        // Agrupar por línea original (para visualización separada)
        if (!grouped[company].lines[displayLine]) {
          grouped[company].lines[displayLine] = {
            items: [],
            total: 0,
            discountKey: discountKey, // Guardar la clave de descuento para usar en cálculos
          };
        }

        grouped[company].items.push(item);
        grouped[company].lines[displayLine].items.push(item);
        grouped[company].total += item.price * item.quantity;
        grouped[company].lines[displayLine].total += item.price * item.quantity;
      });

      // Ordenar productos alfabéticamente por nombre dentro de cada empresa y línea
      Object.keys(grouped).forEach((company) => {
        grouped[company].items.sort((a, b) => {
          const nameA = (a.name || "").toLowerCase();
          const nameB = (b.name || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });

        Object.keys(grouped[company].lines).forEach((line) => {
          grouped[company].lines[line].items.sort((a, b) => {
            const nameA = (a.name || "").toLowerCase();
            const nameB = (b.name || "").toLowerCase();
            return nameA.localeCompare(nameB);
          });
        });
      });

      // Asignar direcciones predeterminadas solo para empresas nuevas o sin dirección seleccionada
      if (addresses.length > 0) {
        Object.keys(grouped).forEach((company) => {
          // Solo asignar direcciones predeterminadas si no hay una ya seleccionada
          if (!grouped[company].shippingAddressId) {
            grouped[company].shippingAddressId = findBestAvailableAddress(
              addresses,
              company,
              "S"
            );
          }

          if (!grouped[company].billingAddressId) {
            grouped[company].billingAddressId = findBestAvailableAddress(
              addresses,
              company,
              "B"
            );
          }
        });
      }

      setGroupedCart(grouped);

      // Actualizar selectedCompany si es necesario
      if (Object.keys(grouped).length > 0) {
        if (!selectedCompany || !grouped[selectedCompany]) {
          setSelectedCompany(Object.keys(grouped)[0]);
        }
      }
    };

    groupByCompany();
  }, [cart, addresses, showSuccessCard, isProcessingOrders]);

  // Mostrar el overlay de carga si está cargando o hidratando
  if (isLoading || isHydrating) {
    return (
      <LoadingOverlay>
        <LoadingContent>
          <RenderLoader size="64px" showSpinner={true} floatingSpinner={true} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <LoadingTitle>Cargando carrito</LoadingTitle>
            <LoadingText>
              Espere un momento mientras preparamos su pedido.
            </LoadingText>
          </div>
        </LoadingContent>
      </LoadingOverlay>
    );
  }

  // Función para obtener la URL del catálogo a la que se debe redirigir
  const getCatalogUrl = () => {
    const lastCatalogUrl = localStorage.getItem("lastCatalogUrl");

    // Si el usuario es vendedor
    if (isSeller) {
      // Si la última URL fue de vendedor, usarla. De lo contrario, ir a la oferta base.
      if (lastCatalogUrl && lastCatalogUrl.includes("/vendedor")) {
        return lastCatalogUrl;
      }
      return ROUTES.VENDEDOR.OFERTA;
    }

    // Si es cliente, usar la última URL de catálogo o ir a selección de empresa
    return lastCatalogUrl || ROUTES.ECOMMERCE.SELECCION_EMPRESA;
  };

  // No mostrar el estado vacío si el modal de éxito está visible
  // Esto permite que el modal se muestre incluso cuando el carrito está vacío
  if (cart.length === 0 && !showSuccessCard) {
    return (
      <PageContainer style={{ padding: "16px" }}>
        <PageTitle>Carrito de compras</PageTitle>
        <CartEmptyState>
          <RenderIcon
            name="FaCartShopping"
            size={40}
            color={theme.colors.primary}
            style={{ marginBottom: "16px" }}
          />
          <EmptyCartText>Tu carrito está vacío</EmptyCartText>
          <Button
            text="Ir al Catálogo"
            variant="outlined"
            onClick={() => navigate(getCatalogUrl())}
          />
        </CartEmptyState>
      </PageContainer>
    );
  }

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity <= 0) return;

    // Encontrar el ítem del carrito
    const cartItem = cart.find((item) => item.id === id);
    if (!cartItem) return;

    // Actualizar la cantidad sin restricciones de stock
    updateQuantity(id, newQuantity);
  };

  const handleOpenAddressModal = (type, company) => {
    setAddressModalType(type);
    setAddressModalCompany(company);

    if (user?.ROLE_NAME === ROLES.VENDEDOR_B2B) {
      setIsCreateAddressModalOpen(true);
    } else {
      setIsAddressModalOpen(true);
    }
  };

  const handleCreateAddressSubmit = async () => {
    if (!newAddressData.state || !newAddressData.city || !newAddressData.street) {
      toast.warning("Por favor completa todos los campos requeridos");
      return;
    }

    // Validación obligatoria de mapa para envío y facturación en B2B
    if (!selectedLocation) {
      toast.warning("Por favor selecciona una ubicación en el mapa");
      return;
    }

    setIsCreatingAddress(true);

    try {
      const stored = JSON.parse(sessionStorage.getItem('sellerCartData') || '{}');
      const clientAccounts = stored.clientAccounts || {};
      const accountUser = clientAccounts[addressModalCompany] || user.ACCOUNT_USER;

      const payload = {
        ACCOUNT_USER: accountUser,
        CLASIFICATION: "PRINCIPAL",
        TYPE: addressModalType,
        COUNTRY: newAddressData.country,
        STATE: newAddressData.state.toUpperCase(),
        CITY: newAddressData.city.toUpperCase(),
        STREET: newAddressData.street.toUpperCase(),
        PREDETERMINED: false,
        ORIGIN: "USER",
        EMPRESA: isB2BSeller ? "AUTOLLANTA" : addressModalCompany,
        LATITUDE: selectedLocation?.lat || null,
        LONGITUDE: selectedLocation?.lng || null,
      };

      const response = await api_addresses_createAddress(payload);

      if (response.success) {
        toast.success("Dirección creada exitosamente");
        setIsCreateAddressModalOpen(false);
        setNewAddressData({ country: "EC", state: "", city: "", street: "" });
        setSelectedLocation(null);
        // Recargar direcciones para ver la nueva (forzando petición al endpoint)
        await loadAddresses(true);
      } else {
        toast.error(response.error || "Error al crear la dirección");
      }
    } catch (error) {
      console.error("Error en handleCreateAddressSubmit:", error);
      toast.error("Ocurrió un error inesperado al crear la dirección");
    } finally {
      setIsCreatingAddress(false);
    }
  };

  const handleSelectAddressFromModal = (addressId) => {
    const updated = { ...groupedCart };
    if (updated[addressModalCompany]) {
      if (addressModalType === "S") {
        updated[addressModalCompany].shippingAddressId = addressId;
      } else {
        updated[addressModalCompany].billingAddressId = addressId;
      }
    }
    setGroupedCart(updated);
    setIsAddressModalOpen(false);
    toast.success("Dirección seleccionada correctamente");
  };

  // Versión interna para procesar una línea específica
  const handleCheckoutSingleLineInternal = async (
    lineData,
    company,
    displayLine
  ) => {
    if (!lineData || !lineData.items || lineData.items.length === 0) {
      throw new Error("No se encontró información para esta línea");
    }

    // Verificar direcciones
    if (!lineData.shippingAddressId || !lineData.billingAddressId) {
      throw new Error("Faltan direcciones para esta línea");
    }

    // Preparar orden para esta línea
    const shippingAddress = addresses.find(
      (addr) => addr.id === lineData.shippingAddressId
    );
    const billingAddress = addresses.find(
      (addr) => addr.id === lineData.billingAddressId
    );

    // Obtener descuentos extra de la oferta si es vendedor
    const offerData = isB2BSeller ? JSON.parse(sessionStorage.getItem("ofertaVendedor") || "{}") : null;

    const extraProductDiscounts = offerData?.items || {};
    const extraTotalDiscountPct = offerData?.total || 0;
    const previewDiscounts = offerData?.previews || {};
    const preview = previewDiscounts[company];

    let totalDiscountAmount = 0;
    let totalPromoAndExtraAmount = 0;

    // Calcular total con IVA incluido para cada item
    const itemsWithIVA = lineData.items.map((item) => {
      const productSapDiscount = preview?.DESCUENTOS_PRODUCTOS?.find(p => p.PRODUCT_CODE === item.id)?.DISCOUNT_PRODUCTO_SAP || 0;
      const extraDiscount = extraProductDiscounts[item.id] || 0;
      const promoDiscount = (Number(item.promotionalDiscount) || 0) + productSapDiscount;
      const totalPct = (promoDiscount + extraDiscount) / 100;

      const discountedPrice = item.price * (1 - totalPct);

      // Calcular descuento de cliente para este ítem específico
      const linea = (item.lineaNegocio || "").toUpperCase();
      let clientDiscountPct = 0;
      if (preview?.DESCUENTO_CLIENTE) {
        if (linea === "LUBRICANTES") {
          clientDiscountPct = preview.DESCUENTO_CLIENTE.DISCOUNT_LUBRICANTES || 0;
        } else {
          clientDiscountPct = preview.DESCUENTO_CLIENTE.DISCOUNT || 0;
        }
      } else {
        const discountKey = lineData.discountKey || displayLine;
        const potentialDiscount = user?.DESCUENTOS?.[company];
        clientDiscountPct = potentialDiscount?.[discountKey] ?? (typeof potentialDiscount === 'number' ? potentialDiscount : 0);
      }

      const priceAfterClientDiscount = discountedPrice * (1 - clientDiscountPct / 100);
      const priceWithIVA = calculatePriceWithIVA(
        priceAfterClientDiscount,
        item.iva || TAXES.IVA_PERCENTAGE
      );

      // Guardamos la diferencia para el reporte o lógica posterior si fuera necesario
      // Pero aquí lo que importa es el TOTAL final enviado a la API

      return {
        ...item,
        priceWithIVA,
        totalWithIVA: priceWithIVA * item.quantity,
      };
    });

    // Subtotal con IVA incluido (esto ya incluye descuentos de producto y cliente)
    const subtotalFinalWithIVA = itemsWithIVA.reduce(
      (acc, item) => acc + item.totalWithIVA,
      0
    );

    // Aplicar descuento extra al TOTAL (vendedor)
    const totalExtraDiscountValue = subtotalFinalWithIVA * (extraTotalDiscountPct / 100);
    const totalConIva = subtotalFinalWithIVA - totalExtraDiscountValue;

    // Obtener el ACCOUNT_USER correcto
    let accountUser = user.ACCOUNT_USER;
    if (isSeller) {

      const stored = JSON.parse(sessionStorage.getItem('sellerCartData') || '{}');
      const clientAccounts = stored.clientAccounts || {};
      accountUser = clientAccounts[company] || user.ACCOUNT_USER;
    }

    const productsToProcess = lineData.items.map((item) => {
      const productSapDiscount = preview?.DESCUENTOS_PRODUCTOS?.find(p => p.PRODUCT_CODE === item.id)?.DISCOUNT_PRODUCTO_SAP || 0;
      const productData = {
        PRODUCT_CODE: item.id,
        QUANTITY: item.quantity,
        PRICE: item.price,
        PROMOTIONAL_DISCOUNT: (Number(item.promotionalDiscount) || 0) + productSapDiscount,
      };

      if (isB2BSeller) {
        productData.EXTRA_DISCOUNT = extraProductDiscounts[item.id] || 0;
      }

      return productData;
    });

    // Obtener CODE_SPANCOP y PROFORMA_HEADER de sessionStorage
    const spancopCodeStr = sessionStorage.getItem("CODIGO_DATOS_SPANCOP");
    const proformaHeaderStr = sessionStorage.getItem("PROFORMA_HEADER");

    const orderToProcess = {
      ENTERPRISE: company,
      ACCOUNT_USER: accountUser,
      SHIPPING_ADDRESS_ID: parseInt(shippingAddress.id),
      BILLING_ADDRESS_ID: parseInt(billingAddress.id),
      SUBTOTAL: subtotalFinalWithIVA / (1 + (user?.IVA || TAXES.IVA_PERCENTAGE) / 100), // Aproximación del subtotal neto
      ADITIONAL_DISCOUNT: 0, // No mandamos descuento de línea plano, ya va en el precio/subtotal
      OFFER_TOTAL_DISCOUNT: extraTotalDiscountPct,
      EXTRA_DISCOUNT: isB2BSeller ? extraTotalDiscountPct : 0,
      TOTAL: totalConIva,
      PRODUCTOS: productsToProcess,
    };

    // Agregar PROFORMA_HEADER si el usuario es VENDEDOR B2B
    if (isB2BSeller && proformaHeaderStr) {

      const proformaId = parseInt(proformaHeaderStr);
      if (!isNaN(proformaId)) {
        orderToProcess.PROFORMA_HEADER = proformaId;
      }
    }


    // Agregar CODE_SPANCOP solo si el usuario es VENDEDOR B2B y existe en sessionStorage
    if (user?.ROLE_NAME === ROLES.VENDEDOR_B2B && spancopCodeStr !== null && spancopCodeStr !== undefined && spancopCodeStr !== "") {
      const spancopCode = parseInt(spancopCodeStr);
      if (!isNaN(spancopCode)) {
        orderToProcess.CODE_SPANCOP = spancopCode;
      }
    }


    const responseOrder = await api_order_createOrder(orderToProcess);


    if (!responseOrder.success) {
      throw new Error(responseOrder.message || "Error al procesar el pedido");
    }

    return responseOrder;
  };

  // Función para procesar una línea específica de una empresa
  const handleCheckoutSingleLine = async (company, line) => {
    try {
      const companyData = groupedCart[company];
      if (!companyData || !companyData.lines[line]) {
        throw new Error("No se encontró información para esta línea");
      }

      setCurrentProcessingCompany(`${company} - ${line}`);
      setIsProcessingOrders(true);
      setTotalOrdersToProcess(1);
      setCompletedOrders(0);

      const lineDataObj = companyData.lines[line];
      const lineData = {
        items: lineDataObj.items,
        shippingAddressId: companyData.shippingAddressId,
        billingAddressId: companyData.billingAddressId,
        discountKey: lineDataObj.discountKey, // Incluir la clave de descuento
      };

      const itemsIdsToDeleteFromCart = lineData.items.map(
        (item) => item.idShoppingCartDetail
      );

      await handleCheckoutSingleLineInternal(lineData, company, line);

      // Solo para vendedores B2B: obtenemos los UUIDs reales desde el backend antes de borrar
      let finalIdsToDelete = itemsIdsToDeleteFromCart;
      if (isB2BSeller) {

        const stored = JSON.parse(sessionStorage.getItem('sellerCartData') || '{}');
        const clientAccounts = stored.clientAccounts || {};
        const clientAccount = clientAccounts[company];

        if (clientAccount) {
          const cartResult = await api_cart_createCarrito(clientAccount, company);
          if (cartResult?.success && cartResult?.data?.details) {
            // IMPORTANTE: Filtrar los detalles devueltos por la API para que solo coincidan con los productos 
            // de la línea actual que estamos procesando. De lo contrario, borraríamos todo el carrito de la empresa.
            const currentLineProductCodes = lineData.items.map(item => item.id);

            finalIdsToDelete = cartResult.data.details
              .filter(detail => currentLineProductCodes.includes(detail.ID_PRODUCT))
              .map(detail => detail.ID_SHOPPING_CART_DETAIL);

          }
        }

        // Si por alguna razón finalIdsToDelete quedó vacío o inválido, usamos el fallback
        if (!finalIdsToDelete || finalIdsToDelete.length === 0 || finalIdsToDelete.some(id => !id)) {
          finalIdsToDelete = itemsIdsToDeleteFromCart.filter(id => id);
        }
      }

      // Verificación final de que tengamos IDs para borrar para evitar el error 400
      if (!Array.isArray(finalIdsToDelete) || finalIdsToDelete.length === 0) {
        // No lanzamos error para permitir que el flujo de éxito continúe si el pedido se creó
      } else {
        const responseDelete = await api_cart_deleteProductsFromCart(
          finalIdsToDelete
        );
        if (!responseDelete.success) {
          throw new Error(
            responseDelete.message ||
            "Error al eliminar los productos del carrito"
          );
        }
      }

      // Deshabilitar la recarga automática del carrito mientras mostramos el modal
      skipCartLoadRef.current = true;

      // Primero mostrar el modal de éxito ANTES de eliminar items del estado local
      // Esto evita que el componente se re-renderice con carrito vacío y oculte el modal
      setCompletedOrders(1);
      setIsProcessingOrders(false);
      setShowSuccessCard(true);

      // Guardar el grupo que se procesó para limpiarlo cuando se cierre el modal
      setLastProcessedCompanies([`${company}_${line}`]);

      // Esperar un momento para que el modal se muestre completamente
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Ahora eliminar los items del estado local usando idShoppingCartDetail
      // para evitar que se reintroduzcan al recargar
      if (removeFromCartByDetailIds) {
        removeFromCartByDetailIds(itemsIdsToDeleteFromCart);
      }

      // Esperar un momento para que el backend procese la eliminación
      await new Promise((resolve) => setTimeout(resolve, 700));

      // Recargar el carrito desde la API reemplazando completamente (forceReplace = true)
      // Esto evita que se reintroduzcan productos que ya fueron eliminados
      // Hacerlo después de mostrar el modal para no interferir con el estado del modal
      await loadCartFromAPI(true);

      // Rehabilitar la recarga automática después de un momento
      setTimeout(() => {
        skipCartLoadRef.current = false;
      }, 2000);
    } catch (error) {
      console.error(
        `Error al procesar pedido para ${company} - ${line}:`,
        error
      );
      toast.error(`Error al procesar pedido: ${error.message}`);
      setIsProcessingOrders(false);
    }
  };

  // Agregar función para cerrar la tarjeta de éxito e ir a Mis Pedidos
  const handleGoToOrders = async () => {
    setShowSuccessCard(false);
    skipCartLoadRef.current = false; // Rehabilitar recarga automática
    navigate(ROUTES.ECOMMERCE.MIS_PEDIDOS);
  };

  // Agregar función para cerrar la tarjeta de éxito y seguir comprando
  const handleContinueShopping = async () => {
    setShowSuccessCard(false);
    skipCartLoadRef.current = false; // Rehabilitar recarga automática

    // Usar la función getCatalogUrl para decidir a dónde ir
    navigate(getCatalogUrl());
  };


  return (
    <PageContainer style={{ padding: "16px" }}>
      <PageTitle>
        <RenderIcon name="FaCartShopping" size={28} />
        <h1>Carrito de compras</h1>
      </PageTitle>

      {/* Pestañas de empresas */}
      <CompanyTabs>
        {Object.keys(groupedCart).map((company) => (
          <CompanyTab
            key={company}
            $active={selectedCompany === company}
            onClick={() => setSelectedCompany(company)}
          >
            {company}
          </CompanyTab>
        ))}
      </CompanyTabs>

      <CartLayout>
        <div>
          {/* Mostrar productos agrupados por línea dentro de la empresa seleccionada */}
          {selectedCompany && groupedCart[selectedCompany] && (
            <>
              {Object.entries(groupedCart[selectedCompany].lines).map(
                ([line, lineData]) => (
                  <div key={line} style={{ marginBottom: "24px" }}>
                    <LineTitle>
                      {line}
                    </LineTitle>
                    <CartItemsList>
                      {lineData.items.map((item) => {
                        const offerData = isB2BSeller ? JSON.parse(sessionStorage.getItem("ofertaVendedor") || "{}") : null;

                        const extraDisc = offerData?.items?.[item.id] || 0;
                        return (
                          <CartItem
                            key={item.id}
                            item={item}
                            handleQuantityChange={handleQuantityChange}
                            removeFromCart={removeFromCart}
                            theme={theme}
                            navigate={navigate}
                            extraDiscount={extraDisc}
                            isB2BSeller={isB2BSeller}
                          />
                        );
                      })}
                    </CartItemsList>
                  </div>
                )
              )}
            </>
          )}

          {/* Sección de dirección de envío para la empresa seleccionada */}
          <ShippingSection>
            <SectionTitle>
              <RenderIcon name="FaMapPin" size={20} />
              Dirección de envío para {selectedCompany}
            </SectionTitle>

            {selectedCompany &&
              addresses.filter(
                (addr) => addr.type === "S" && (isB2BSeller ? addr.empresa === "AUTOLLANTA" : addr.empresa === selectedCompany)
              ).length > 0 ? (
              <div>
                {addresses
                  .filter(
                    (addr) =>
                      addr.type === "S" && (isB2BSeller ? addr.empresa === "AUTOLLANTA" : addr.empresa === selectedCompany)
                  )
                  .map((address) => {
                    const companyData = groupedCart[selectedCompany];
                    return (
                      <AddressCard
                        key={address.id}
                        selected={companyData?.shippingAddressId === address.id}
                        onClick={() => {
                          const updated = { ...groupedCart };
                          if (updated[selectedCompany]) {
                            updated[selectedCompany].shippingAddressId =
                              address.id;
                          }
                          setGroupedCart(updated);
                        }}
                      >
                        <AddressInfo>
                          <AddressName>
                            {address.name}{" "}
                            {address.origen === "SAP" && (
                              <span
                                style={{
                                  marginLeft: "8px",
                                  fontSize: "0.75rem",
                                  padding: "2px 6px",
                                  backgroundColor: "transparent",
                                  border: `solid 1px ${theme.colors.primary}`,
                                  borderRadius: "4px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  color: theme.colors.primary,
                                }}
                              >
                                {/* <RenderIcon name="FaLock" size={10} /> */}
                                <span>Registrada</span>
                              </span>
                            )}
                          </AddressName>
                          <AddressDetails>
                            <ResolvedAddress address={address} />
                            {address.isDefault && (
                              <span
                                style={{
                                  marginLeft: 8,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  color: theme.colors.success,
                                  fontSize: "0.85rem",
                                  fontWeight: 600,
                                }}
                              >
                                <RenderIcon name="FaCircleCheck" size={12} />
                                Predeterminada
                              </span>
                            )}
                          </AddressDetails>
                        </AddressInfo>
                        {!isSeller && (
                          <AddressActions>
                            {address.origen === "SAP" ? (
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.info(
                                    "Las direcciones sincronizadas con el sistema no se pueden editar. Contacta a soporte para solicitar cambios."
                                  );
                                }}
                                style={{
                                  color: theme.colors.textLight,
                                }}
                                // leftIconName={"FaLock"}
                                size="small"
                              />
                            ) : (
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Redirigir a la página de perfil con los parámetros para editar esta dirección
                                  navigate(ROUTES.ECOMMERCE.PERFIL, {
                                    state: {
                                      activeTab: "addresses",
                                      editAddressId: address.id,
                                      empresa: address.empresa,
                                    },
                                  });
                                }}
                                leftIconName={"FaPencilAlt"}
                                size="small"
                              />
                            )}
                          </AddressActions>
                        )}
                      </AddressCard>
                    );
                  })}
              </div>
            ) : (
              <EmptyAddressState>
                <RenderIcon name="FaMapPin" size={32} color={theme.colors.textSecondary} />
                <div>No tienes direcciones de envío para esta empresa.</div>
              </EmptyAddressState>
            )}

            {user?.ROLE_NAME === ROLES.VENDEDOR_B2B ? (
              <NewAddressButton
                onClick={() => handleOpenAddressModal("S", selectedCompany)}
                text={"Crear dirección de envío"}
                size="small"
                leftIconName={"FaPlus"}
              />
            ) : isSeller ? (

              <NewAddressButton
                onClick={() => handleOpenAddressModal("S", selectedCompany)}
                text={"Seleccionar dirección de envío"}
                size="small"
                leftIconName={"FaPlus"}
              />
            ) : (
              <NewAddressButton
                onClick={() =>
                  navigate(ROUTES.ECOMMERCE.PERFIL, {
                    state: {
                      activeTab: "addresses",
                      openAddressForm: true,
                      addressType: "S",
                      empresa: selectedCompany,
                    },
                  })
                }
                text={"Ir a Perfil para agregar dirección de envío"}
                size="small"
                leftIconName={"FaPlus"}
              />
            )}
          </ShippingSection>

          {/* Sección de dirección de facturación similar a la de envío */}
          <ShippingSection style={{ marginTop: "24px" }}>
            <SectionTitle>
              <RenderIcon name="FaFileInvoice" size={20} />
              Dirección de facturación
            </SectionTitle>

            {selectedCompany &&
              addresses.filter(
                (addr) => addr.type === "B" && (isB2BSeller ? addr.empresa === "AUTOLLANTA" : addr.empresa === selectedCompany)
              ).length > 0 ? (
              <div>
                {addresses
                  .filter(
                    (addr) =>
                      addr.type === "B" && (isB2BSeller ? addr.empresa === "AUTOLLANTA" : addr.empresa === selectedCompany)
                  )
                  .map((address) => {
                    const companyData = groupedCart[selectedCompany];
                    return (
                      <AddressCard
                        key={address.id}
                        selected={companyData?.billingAddressId === address.id}
                        onClick={() => {
                          const updated = { ...groupedCart };
                          if (updated[selectedCompany]) {
                            updated[selectedCompany].billingAddressId =
                              address.id;
                          }
                          setGroupedCart(updated);
                        }}
                      >
                        <AddressInfo>
                          <AddressName>
                            {address.name}{" "}
                            {address.origen === "SAP" && (
                              <span
                                style={{
                                  marginLeft: "8px",
                                  fontSize: "0.75rem",
                                  padding: "2px 6px",
                                  backgroundColor: "transparent",
                                  border: `solid 1px ${theme.colors.primary}`,
                                  borderRadius: "4px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  color: theme.colors.primary,
                                }}
                              >
                                {/* <RenderIcon name="FaLock" size={10} /> */}
                                <span>Registrada</span>
                              </span>
                            )}
                          </AddressName>
                          <AddressDetails>
                            <ResolvedAddress address={address} />
                            {address.isDefault && (
                              <span
                                style={{
                                  marginLeft: 8,
                                  color: theme.colors.info,
                                }}
                              >
                                • Predeterminada
                              </span>
                            )}
                          </AddressDetails>
                        </AddressInfo>
                        {!isSeller && (
                          <AddressActions>
                            {address.origen === "SAP" ? (
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.info(
                                    "Las direcciones sincronizadas con el sistema no se pueden editar. Contacta a soporte para solicitar cambios."
                                  );
                                }}
                                style={{ color: theme.colors.textLight }}
                                // leftIconName={"FaLock"}
                                size="small"
                              />
                            ) : (
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(ROUTES.ECOMMERCE.PERFIL, {
                                    state: {
                                      activeTab: "addresses",
                                      editAddressId: address.id,
                                      empresa: address.empresa,
                                    },
                                  });
                                }}
                                leftIconName={"FaPencilAlt"}
                                size="small"
                              />
                            )}
                          </AddressActions>
                        )}
                      </AddressCard>
                    );
                  })}
              </div>
            ) : (
              <EmptyAddressState>
                <RenderIcon name="FaFileInvoice" size={32} color={theme.colors.textSecondary} />
                <div>No tienes direcciones de facturación para esta empresa.</div>
              </EmptyAddressState>
            )}

            {user?.ROLE_NAME === ROLES.VENDEDOR_B2B ? (
              <NewAddressButton
                onClick={() => handleOpenAddressModal("B", selectedCompany)}
                text={"Crear dirección de facturación"}
                leftIconName={"FaPlus"}
                size="small"
              />
            ) : isSeller ? (

              <NewAddressButton
                onClick={() => handleOpenAddressModal("B", selectedCompany)}
                text={"Seleccionar dirección de facturación"}
                leftIconName={"FaPlus"}
                size="small"
              />
            ) : (
              <NewAddressButton
                onClick={() =>
                  navigate(ROUTES.ECOMMERCE.PERFIL, {
                    state: {
                      activeTab: "addresses",
                      openAddressForm: true,
                      addressType: "B",
                      empresa: selectedCompany,
                    },
                  })
                }
                text={"Ir a Perfil para agregar dirección de facturación"}
                leftIconName={"FaPlus"}
                size="small"
              />
            )}
          </ShippingSection>
        </div>

        <OrderSummary>
          <SummaryTitle>Resumen del pedido</SummaryTitle>

          <Button
            text="Seguir comprando"
            variant="outlined"
            style={{ width: "100%", marginTop: "0px", marginBottom: "12px" }}
            onClick={() => navigate(getCatalogUrl())}
          />
          <div
            style={{
              borderTop: `1px solid ${theme.colors.border}`,
              marginBottom: "12px",
            }}
          ></div>
          {/* Resumen por empresa y línea */}
          {selectedCompany && groupedCart[selectedCompany] && (
            <>
              {Object.entries(groupedCart[selectedCompany].lines).map(
                ([line, lineData]) => {
                  const offerData = isB2BSeller ? JSON.parse(sessionStorage.getItem("ofertaVendedor") || "{}") : null;

                  const extraProductDiscounts = offerData?.items || {};
                  const extraTotalDiscountPct = offerData?.total || 0;
                  const previewDiscounts = offerData?.previews || {};
                  const preview = previewDiscounts[selectedCompany];

                  const itemsWithIVA = lineData.items.map((item) => {
                    const productSapDiscount = preview?.DESCUENTOS_PRODUCTOS?.find(p => p.PRODUCT_CODE === item.id)?.DISCOUNT_PRODUCTO_SAP || 0;
                    const extraDiscount = extraProductDiscounts[item.id] || 0;
                    const promoDiscount = (Number(item.promotionalDiscount) || 0) + productSapDiscount;
                    const totalPct = (promoDiscount + extraDiscount) / 100;

                    const discountedPrice = item.price * (1 - totalPct);
                    const priceWithIVABeforeClient = calculatePriceWithIVA(discountedPrice, item.iva || TAXES.IVA_PERCENTAGE);

                    const lineaItem = (item.lineaNegocio || "").toUpperCase();
                    let itemClientDiscountPct = 0;
                    if (preview?.DESCUENTO_CLIENTE) {
                      if (lineaItem === "LUBRICANTES") {
                        itemClientDiscountPct = preview.DESCUENTO_CLIENTE.DISCOUNT_LUBRICANTES || 0;
                      } else {
                        itemClientDiscountPct = preview.DESCUENTO_CLIENTE.DISCOUNT || 0;
                      }
                    } else {
                      const discountKey = lineData.discountKey || line;
                      const potentialDiscount = user?.DESCUENTOS?.[selectedCompany];
                      itemClientDiscountPct = potentialDiscount?.[discountKey] ?? (typeof potentialDiscount === 'number' ? potentialDiscount : 0);
                    }

                    const discountAmt = priceWithIVABeforeClient * (itemClientDiscountPct / 100);
                    const finalPriceIVA = priceWithIVABeforeClient - discountAmt;

                    return {
                      ...item,
                      priceWithIVABeforeClient,
                      discountAmt,
                      finalPriceIVA,
                      totalWithIVA: finalPriceIVA * item.quantity,
                      totalBeforeClientWithIVA: priceWithIVABeforeClient * item.quantity,
                    };
                  });

                  const subtotalWithIVA = itemsWithIVA.reduce((acc, i) => acc + i.totalBeforeClientWithIVA, 0);
                  const totalClientDiscountAmount = itemsWithIVA.reduce((acc, i) => acc + (i.discountAmt * i.quantity), 0);
                  const subtotalFinalWithIVA = subtotalWithIVA - totalClientDiscountAmount;
                  const totalExtraDiscountValue = subtotalFinalWithIVA * (extraTotalDiscountPct / 100);
                  const totalConIva = subtotalFinalWithIVA - totalExtraDiscountValue;

                  const companyData = groupedCart[selectedCompany];

                  return (
                    <CompanySummary key={line}>
                      <CompanyName>{selectedCompany} {line}</CompanyName>
                      <SummaryRow>
                        <SummaryLabel>Subtotal ({lineData.items.length} productos)</SummaryLabel>
                        <SummaryValue>${subtotalWithIVA.toFixed(2)}</SummaryValue>
                      </SummaryRow>
                      {totalClientDiscountAmount > 0 && (
                        <SummaryRow>
                          <SummaryLabel>Descuento Cliente {line}:</SummaryLabel>
                          <SummaryValue>-${totalClientDiscountAmount.toFixed(2)}</SummaryValue>
                        </SummaryRow>
                      )}
                      {extraTotalDiscountPct > 0 && (
                        <SummaryRow>
                          <SummaryLabel>Descuento Extra Oferta ({extraTotalDiscountPct}%):</SummaryLabel>
                          <SummaryValue style={{ color: "#ef4444" }}>-${totalExtraDiscountValue.toFixed(2)}</SummaryValue>
                        </SummaryRow>
                      )}
                      <SummaryRow>
                        <SummaryLabel style={{ fontSize: "0.8rem", fontStyle: "italic" }}>* Precios con IVA incluido</SummaryLabel>
                      </SummaryRow>
                      <TotalRow>
                        <SummaryLabel>Total</SummaryLabel>
                        <SummaryValue $bold>${totalConIva.toFixed(2)}</SummaryValue>
                      </TotalRow>

                      {!companyData.shippingAddressId && (
                        <ValidationWarning>Falta dirección de envío</ValidationWarning>
                      )}
                      {!companyData.billingAddressId && (
                        <ValidationWarning>Falta dirección de facturación</ValidationWarning>
                      )}

                      <CompanyCheckoutButton
                        text={`Proceder al pedido`}
                        color={theme.colors.white}
                        variant="outlined"
                        size="small"
                        leftIconName={"FaCartShopping"}
                        backgroundColor={theme.colors.primary}
                        style={{ width: "100%" }}
                        onClick={() => handleLineCheckoutClick(selectedCompany, line)}
                        disabled={!companyData.shippingAddressId || !companyData.billingAddressId}
                      />
                    </CompanySummary>
                  );
                }
              )}
            </>
          )}
          {showConfirmModal && (
            <ProcessingOverlay>
              <ProcessingCard>
                <ProcessingTitle>¿Está seguro que desea confirmar esta orden?</ProcessingTitle>
                <ProcessingMessage>
                  {companyToCheckout && (() => {
                    const [company, line] = companyToCheckout.split("_");
                    return (
                      <>Se generará el pedido para <b>{company} - {line}</b>.</>
                    );
                  })()}
                </ProcessingMessage>
                <Button
                  text="Confirmar"
                  variant="solid"
                  backgroundColor={theme.colors.success}
                  style={{ width: "100%", marginBottom: "12px" }}
                  onClick={async () => {
                    setShowConfirmModal(false);
                    if (companyToCheckout) {
                      const [company, line] = companyToCheckout.split("_");
                      await handleCheckoutSingleLine(company, line);
                      setCompanyToCheckout(null);
                    }
                  }}
                  leftIconName="FaCheck"
                />
                <Button
                  text="Cancelar"
                  variant="outlined"
                  style={{ width: "100%" }}
                  onClick={() => {
                    setShowConfirmModal(false);
                    setCompanyToCheckout(null);
                  }}
                  leftIconName="FaXmark"
                />
              </ProcessingCard>
            </ProcessingOverlay>
          )}
        </OrderSummary>

      </CartLayout>

      {/* Agregar estos componentes al final del return para mostrar el progreso y éxito */}
      {isProcessingOrders && (
        <>
          <ProcessingOverlay />
          <ProcessingCard>
            <ProcessingTitle>Procesando pedido</ProcessingTitle>
            <ProcessingMessage>Generando orden</ProcessingMessage>
            <ProgressIndicator>
              <RenderLoader
                size="32px"
                showSpinner={true}
                floatingSpinner={true}
              />
            </ProgressIndicator>
          </ProcessingCard>
        </>
      )}

      {showSuccessCard && (
        <>
          <ProcessingOverlay />
          <ProcessingCard>
            <SuccessIcon>
              <RenderIcon
                name="FaCircleCheck"
                size={48}
                color={theme.colors.success}
              />
            </SuccessIcon>
            <ProcessingTitle>¡Pedido realizado con éxito!</ProcessingTitle>
            <ProcessingMessage>
              {completedOrders > 1
                ? `Se han generado ${completedOrders} órdenes correctamente.`
                : "Tu pedido ha sido generado correctamente."}
            </ProcessingMessage>
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <Button
                text="Pedidos"
                variant="solid"
                backgroundColor={theme.colors.primary}
                style={{ flex: 1 }}
                onClick={handleGoToOrders}
                leftIconName="FaListAlt"
              />
              <Button
                text="Catálogo"
                variant="outlined"
                style={{ flex: 1 }}
                onClick={handleContinueShopping}
                leftIconName="FaCartShopping"
              />
            </div>
            <Button
              text="Volver al Carrito"
              variant="outlined"
              style={{ width: "100%" }}
              onClick={() => setShowSuccessCard(false)}
              leftIconName="FaArrowLeft"
            />
          </ProcessingCard>
        </>
      )}
      {/* Modal de selección de direcciones para vendedores */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title={addressModalType === "S" ? "Seleccionar Dirección de Envío" : "Seleccionar Dirección de Facturación"}
        titleIcon={addressModalType === "S" ? "FaMapPin" : "FaFileInvoice"}
        maxWidth="600px"
      >
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {addresses
            .filter(
              (addr) =>
                addr.type === addressModalType &&
                addr.empresa === addressModalCompany
            ).length > 0 ? (
            addresses
              .filter(
                (addr) =>
                  addr.type === addressModalType &&
                  addr.empresa === addressModalCompany
              )
              .map((address) => (
                <AddressCard
                  key={address.id}
                  selected={
                    addressModalType === "S"
                      ? groupedCart[addressModalCompany]?.shippingAddressId === address.id
                      : groupedCart[addressModalCompany]?.billingAddressId === address.id
                  }
                  onClick={() => handleSelectAddressFromModal(address.id)}
                  style={{ marginBottom: "12px" }}
                >
                  <AddressInfo>
                    <AddressName>
                      {address.name}{" "}
                      {address.origen === "SAP" && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "0.75rem",
                            padding: "2px 6px",
                            border: `solid 1px ${theme.colors.primary}`,
                            borderRadius: "4px",
                            color: theme.colors.primary,
                          }}
                        >
                          Registrada
                        </span>
                      )}
                    </AddressName>
                    <AddressDetails>
                      <ResolvedAddress address={address} />
                      {address.isDefault && (
                        <span
                          style={{
                            marginLeft: 8,
                            color: theme.colors.success,
                            fontWeight: 600,
                          }}
                        >
                          • Predeterminada
                        </span>
                      )}
                    </AddressDetails>
                  </AddressInfo>
                </AddressCard>
              ))
          ) : (
            <div style={{ textAlign: "center", padding: "2rem", color: theme.colors.textSecondary }}>
              No hay direcciones disponibles de este tipo ({addressModalType === "S" ? "Envío" : "Facturación"}) para esta empresa.
            </div>
          )}
        </div>
        <div style={{ marginTop: "1rem", textAlign: "right" }}>
          <Button
            text="Cerrar"
            variant="outlined"
            onClick={() => setIsAddressModalOpen(false)}
          />
        </div>
      </Modal>

      {/* Modal de creación de direcciones para vendedores B2B */}
      <Modal
        isOpen={isCreateAddressModalOpen}
        onClose={() => {
          setIsCreateAddressModalOpen(false);
          setSelectedLocation(null);
        }}
        title={addressModalType === "S" ? "Crear Dirección de Envío" : "Crear Dirección de Facturación"}
        titleIcon={addressModalType === "S" ? "FaMapPin" : "FaFileInvoice"}
        maxWidth="500px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button
              text="Cancelar"
              variant="outlined"
              onClick={() => {
                setIsCreateAddressModalOpen(false);
                setSelectedLocation(null);
              }}
              style={{ flex: 1 }}
            />
            <Button
              text={isCreatingAddress ? "Creando..." : "Crear Dirección"}
              variant="solid"
              backgroundColor={theme.colors.primary}
              onClick={handleCreateAddressSubmit}
              disabled={isCreatingAddress}
              style={{ flex: 1 }}
            />
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <FormField>
            <FormLabel>País</FormLabel>
            <FormInput
              type="text"
              value={newAddressData.country}
              disabled={true}
            />
          </FormField>
          <FormField>
            <FormLabel>Provincia / Estado *</FormLabel>
            <FormInput
              type="text"
              placeholder="Ej: AZUAY"
              value={newAddressData.state}
              onChange={(e) => setNewAddressData({ ...newAddressData, state: e.target.value })}
              autoComplete="off"
            />
          </FormField>
          <FormField>
            <FormLabel>Ciudad *</FormLabel>
            <FormInput
              type="text"
              placeholder="Ej: CUENCA"
              value={newAddressData.city}
              onChange={(e) => setNewAddressData({ ...newAddressData, city: e.target.value })}
              autoComplete="off"
            />
          </FormField>
          <FormField>
            <FormLabel>Dirección (Calle y número) *</FormLabel>
            <FormInput
              type="text"
              placeholder="Ej: OCARINA Y TURUHUAYCO 1-75"
              value={newAddressData.street}
              onChange={(e) => setNewAddressData({ ...newAddressData, street: e.target.value })}
              autoComplete="off"
            />
          </FormField>

          <div style={{ marginTop: "1rem" }}>
            <FormLabel>Ubicación en el mapa *</FormLabel>
            <MapSelector
              onLocationSelect={(loc) => {
                setSelectedLocation(loc);
                if (loc.province || loc.city || loc.address) {
                  setNewAddressData(prev => ({
                    ...prev,
                    state: loc.province || prev.state,
                    city: loc.city || prev.city,
                    street: loc.address || prev.street
                  }));
                }
              }}
              initialLocation={selectedLocation}
            />
            {!selectedLocation && (
              <div style={{ color: theme.colors.error, fontSize: "0.75rem", marginTop: "0.5rem" }}>
                * Debes marcar un punto en el mapa
              </div>
            )}
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default Carrito;
