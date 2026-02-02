import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useAppTheme } from "../../context/AppThemeContext";
import {
  api_xcoin_getBalance,
  api_xcoin_getProducts,
  api_xcoin_getRedemptionHistory,
  api_xcoin_createRedemption,
} from "../../api/xcoin/apiXcoin";
import PageContainer from "../../components/layout/PageContainer";
import RenderIcon from "../../components/ui/RenderIcon";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import SEO from "../../components/seo/SEO";
import RenderLoader from "../../components/ui/RenderLoader";

// Estilos para el contenedor principal
const XCoinContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  min-height: calc(100vh - 45px);
`;

// Hero Section
const HeroSection = styled.section`
  padding: 2rem 2rem;
  padding-bottom: 2.5rem;
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.primary}25 30%, ${theme.colors.surface} 60%, ${theme.colors.primary}15 100%)`
      : `linear-gradient(135deg, ${theme.colors.primary}12 0%, ${theme.colors.primary}20 30%, #ffffff 60%, ${theme.colors.primary}12 100%)`};
  overflow: hidden;
  margin-bottom: 0;
  border-top: 1px solid ${({ theme }) => `${theme.colors.primary}20`};
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.primary}20`};
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `radial-gradient(ellipse at top center, ${theme.colors.primary}20 0%, transparent 70%),
           radial-gradient(ellipse at bottom center, ${theme.colors.primary}15 0%, transparent 70%)`
        : `radial-gradient(ellipse at top center, ${theme.colors.primary}18 0%, transparent 70%),
           radial-gradient(ellipse at bottom center, ${theme.colors.primary}12 0%, transparent 70%)`};
    pointer-events: none;
    animation: pulse 4s ease-in-out infinite;
    transform-origin: center;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.7;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.02);
    }
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 968px) {
    flex-direction: column;
    align-items: stretch;
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1.5rem;
    padding-bottom: 2rem;
  }
`;

const HeroContent = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 2rem;
  width: 100%;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1.5rem;
  }
`;

const HeroLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  margin: 0;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.8s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    font-size: clamp(1.5rem, 3vw, 2rem);
  }
`;

const HeroIcon = styled.div`
  svg {
    color: ${({ theme }) => theme.colors.primary};
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const HeroRight = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const HeroCenter = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const HeroDescription = styled.p`
  font-size: clamp(0.9rem, 1.8vw, 1.1rem);
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: 1.5;
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
`;

const PolicyButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 16px ${({ theme }) => `${theme.colors.primary}30`};
  transition: all 0.3s ease;
  animation: fadeInUp 0.8s ease-out 0.4s backwards;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark || theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${({ theme }) => `${theme.colors.primary}40`};

    &::before {
      width: 300px;
      height: 300px;
    }
  }

  > * {
    position: relative;
    z-index: 1;
  }
`;

// Contenedor principal con fondo
const MainContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px 20px 0 0;
  padding: 2rem;
  border: none;
  border-top: 1px solid
    ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.border}40`
        : `${theme.colors.border}30`};
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 -4px 16px rgba(0, 0, 0, 0.15)"
      : "0 -4px 16px rgba(0, 0, 0, 0.06)"};
  position: relative;
  margin-top: -1rem;
  z-index: 100;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;

  &::before {
    content: "";
    position: absolute;
    top: 0.75rem;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 5px;
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.border}80`
        : `${theme.colors.border}70`};
    border-radius: 3px;
    box-shadow: 0 2px 4px ${({ theme }) =>
      theme.mode === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)"};
    transition: all 0.2s ease;
  }

  &:hover::before {
    width: 60px;
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.border}`
        : `${theme.colors.border}90`};
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    padding-top: 1rem;
    border-radius: 16px 16px 0 0;
    margin-top: -1.5rem;

    &::before {
      width: 45px;
      height: 4px;
    }

    &:hover::before {
      width: 55px;
    }
  }
`;

// Contenedor superior con puntos y categorías
const TopSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 968px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
`;

// Sección de puntos del usuario (izquierda)
const PointsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PointsTitle = styled.h3`
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const PointsDisplay = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
`;

const PointsValue = styled.div`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1;
`;

const PointsLabel = styled.span`
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

const PointsTabsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  border-bottom: 2px solid
    ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.border}40`
        : `${theme.colors.border}30`};
`;

const PointsTabButton = styled.button`
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary : "transparent"};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  font-size: 0.9rem;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -2px;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ClaimedRewardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (min-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  @media (min-width: 900px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ClaimedRewardCard = styled.div`
  padding: 0.65rem;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `${theme.colors.background}80`
      : `${theme.colors.background}`};
  border-radius: 10px;
  border: 1px solid
    ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.border}40`
        : `${theme.colors.border}30`};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? "0 4px 12px rgba(0, 0, 0, 0.15)"
        : "0 4px 12px rgba(0, 0, 0, 0.06)"};
  }

  @media (min-width: 600px) {
    padding: 0.75rem;
    gap: 0.6rem;
  }
`;

const ClaimedRewardImageWrap = styled.div`
  width: 100%;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.primary}10;
  border: 1px solid ${({ theme }) => `${theme.colors.border}25`};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  svg {
    color: ${({ theme }) => theme.colors.primary};
    opacity: 0.45;
    font-size: 1.5rem;
  }

  @media (min-width: 600px) {
    height: 80px;
  }
`;

const ClaimedRewardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
  flex: 1;
`;

const ClaimedRewardName = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (min-width: 600px) {
    font-size: 0.88rem;
  }
`;

const ClaimedRewardMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.7rem;

  @media (min-width: 600px) {
    font-size: 0.74rem;
  }
`;

const ClaimedRewardMetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
`;

const ClaimedRewardFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  margin-top: auto;
  padding-top: 0.4rem;
  border-top: 1px solid ${({ theme }) => `${theme.colors.border}25`};
`;

const ClaimedRewardDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ClaimedRewardDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const ClaimedRedeemButton = styled(Button)`
  padding: 0.35rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 600;
  border-radius: 6px;
  white-space: nowrap;
  width: 100%;
  justify-content: center;
  min-height: 32px;

  @media (min-width: 600px) {
    font-size: 0.76rem;
    padding: 0.4rem 0.65rem;
  }
`;

// Sección de categorías (derecha) - Tabs alineados a la derecha
const CategoriesSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid
    ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.border}40`
        : `${theme.colors.border}30`};
  overflow-x: auto;
  flex-wrap: nowrap;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  
  /* Ocultar scrollbar pero mantener funcionalidad */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) =>
    theme.mode === "dark"
      ? `${theme.colors.border}60 transparent`
      : `${theme.colors.border}40 transparent`};
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.border}60`
        : `${theme.colors.border}40`};
    border-radius: 2px;
  }
`;

const TabButton = styled.button`
  padding: 0.875rem 1.5rem;
  border: none;
  background: transparent;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
  border-bottom: 3px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary : "transparent"};
  margin-bottom: -2px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.primary}10`
        : `${theme.colors.primary}08`};
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }
`;

// Estilos para el modal de políticas
const PolicyText = styled.div`
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.8;
  font-size: 0.95rem;
  white-space: pre-line;
  margin-bottom: 1.5rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `${theme.colors.background}80`
      : `${theme.colors.background}`};
  border-radius: 12px;
  border: 2px solid
    ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.border}40`
        : `${theme.colors.border}30`};
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

const CheckboxLabel = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  cursor: pointer;
  user-select: none;
`;

// Sección de catálogo de recompensas
const RewardsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const RewardsDivider = styled.hr`
  border: none;
  height: 1px;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `${theme.colors.border}40`
      : `${theme.colors.border}30`};
  margin: 0rem 0;
  width: 100%;
`;

const RewardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RewardCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 1rem;
  border: 2px solid transparent;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 2px 8px rgba(0, 0, 0, 0.06)"};
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? "0 8px 24px rgba(0, 0, 0, 0.25)"
        : "0 8px 24px rgba(0, 0, 0, 0.12)"};
    border-color: ${({ theme, $canAfford }) =>
      $canAfford ? theme.colors.primary : theme.colors.border};
  }
`;

const RewardImage = styled.div`
  width: 100%;
  height: 140px;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `${theme.colors.background}80`
      : `${theme.colors.surface}`};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid
    ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.border}40`
        : `${theme.colors.border}30`};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    font-size: 3rem;
    color: ${({ theme }) => theme.colors.textLight};
    opacity: 0.3;
  }
`;

const RewardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RewardName = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const RewardChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
`;

const RewardChip = styled.span`
  display: inline-block;
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 6px;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `${theme.colors.textSecondary}20`
      : `${theme.colors.textSecondary}12`};
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => `${theme.colors.border}50`};
`;

const RewardDescription = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: 1.4;
`;

const RewardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.75rem;
`;

const RewardPoints = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  
  svg {
    font-size: 1rem;
  }
`;

const ClaimButton = styled(Button)`
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 8px;
  min-width: 100px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
`;

const EmptyStateText = styled.p`
  font-size: 1.1rem;
  margin: 0.5rem 0;
`;

// Imagen con fallback si la URL no carga o es inválida (sin wrapper para usar dentro de RewardImage o modal)
const RewardImageWithFallback = ({ src, alt, iconSize = 64 }) => {
  const [imageError, setImageError] = useState(false);
  const showImage = src && typeof src === "string" && src.trim() !== "" && !imageError;
  if (showImage) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setImageError(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  return <RenderIcon name="FaGift" size={iconSize} />;
};

// Descripción: solo el texto; si es solo "-" o vacío, no mostrar nada
const normalizeDescription = (desc) => {
  const s = typeof desc === "string" ? desc.trim() : "";
  return s === "" || s === "-" ? "" : s;
};

// Mapea producto de la API al formato del UI (categoría por ENTERPRISE)
const mapProductToReward = (p) => ({
  id: p.ID_PRODUCT,
  name: p.PRODUCT_NAME || "Producto",
  description: normalizeDescription(p.DESCRIPTION),
  brand: p.BRAND || null,
  enterprise: p.ENTERPRISE || null,
  points: p.POINTS_COST ?? 0,
  category: (p.ENTERPRISE || p.BRAND || "other").toLowerCase().replace(/\s+/g, "-"),
  image: p.PRODUCT_IMAGE_URL || null,
  raw: p,
});

// Mapea item del historial al formato del UI (usa PRODUCT si viene en la respuesta)
const mapRedemptionToClaimed = (r, productsById) => {
  const product = r.PRODUCT || productsById[r.ID_PRODUCT];
  const name = product?.PRODUCT_NAME || `Producto #${r.ID_PRODUCT}`;
  const image = product?.PRODUCT_IMAGE_URL || null;
  const isActive = product?.IS_ACTIVE ?? r.IS_ACTIVE ?? true;
  return {
    id: r.ID_REDEEM,
    rewardId: r.ID_PRODUCT,
    name,
    image,
    brand: product?.BRAND || null,
    enterprise: product?.ENTERPRISE || null,
    quantity: r.QUANTITY ?? 1,
    points: r.POINTS_USED ?? 0,
    claimedAt: r.REDEEM_DATE,
    isActive: !!isActive,
    status: isActive ? "activo" : "inactivo",
  };
};

const XCoinHome = () => {
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const [userPoints, setUserPoints] = useState(0);
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [rewards, setRewards] = useState([]);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeemQuantity, setRedeemQuantity] = useState(1);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [activeTab, setActiveTab] = useState("catalog");
  const [isSubmittingRedeem, setIsSubmittingRedeem] = useState(false);

  // Cargar productos (catálogo)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingProducts(true);
      const res = await api_xcoin_getProducts();
      console.log(res);
      if (cancelled) return;
      if (res.success && Array.isArray(res.data)) {
        setRewards(res.data.map(mapProductToReward));
      } else {
        setRewards([]);
      }
      setLoadingProducts(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Cargar balance del usuario (puntos disponibles)
  useEffect(() => {
    const accountUser = user?.ACCOUNT_USER;
    if (!accountUser) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await api_xcoin_getBalance(accountUser);
      console.log(res);
      if (cancelled) return;
      if (res.success && res.data) {
        setUserPoints(res.data.AVAILABLE_POINTS ?? 0);
        setBalanceData(res.data);
      } else {
        setUserPoints(0);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [user?.ACCOUNT_USER]);

  // Cargar historial de canjes (cuando tenemos ID_USER del balance y productos cargados)
  useEffect(() => {
    const idUser = balanceData?.ID_USER;
    if (!idUser || rewards.length === 0) return;
    let cancelled = false;
    const byId = {};
    rewards.forEach((r) => {
      if (r.raw) byId[r.id] = r.raw;
    });
    async function load() {
      const res = await api_xcoin_getRedemptionHistory(idUser);
      console.log(res);
      if (cancelled) return;
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map((r) => mapRedemptionToClaimed(r, byId));
        setClaimedRewards(mapped);
      } else {
        setClaimedRewards([]);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [balanceData?.ID_USER, rewards.length]);

  // Categorías únicas a partir de los productos (Todas + marcas/empresas)
  const categories = useMemo(() => {
    const base = [{ id: "all", label: "Todas" }];
    const seen = new Set();
    rewards.forEach((r) => {
      if (r.category && r.category !== "other" && !seen.has(r.category)) {
        seen.add(r.category);
        const label = r.category
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ");
        base.push({ id: r.category, label });
      }
    });
    return base;
  }, [rewards]);

  // Filtrar recompensas por categoría
  const filteredRewards = useMemo(() => {
    if (selectedCategory === "all") {
      return rewards;
    }
    return rewards.filter((reward) => reward.category === selectedCategory);
  }, [rewards, selectedCategory]);

  // Manejar clic en botón canjear - abre modal con detalles
  const handleClaimReward = (reward) => {
    setSelectedReward(reward);
    setRedeemQuantity(1);
    setIsRewardModalOpen(true);
  };

  // Máximo de cantidad por puntos y stock (para el modal de canje)
  const maxRedeemQuantity = useMemo(() => {
    if (!selectedReward) return 0;
    const byPoints = selectedReward.points > 0 ? Math.floor(userPoints / selectedReward.points) : 0;
    const stock = selectedReward.raw?.STOCK_QUANTITY ?? 0;
    const byStock = typeof stock === "number" && stock >= 0 ? stock : 999;
    return Math.min(byPoints, byStock);
  }, [selectedReward, userPoints]);

  // Total de puntos a canjear (cantidad × puntos unitarios)
  const redeemTotalPoints = selectedReward ? redeemQuantity * selectedReward.points : 0;
  const canAffordRedeem = userPoints >= redeemTotalPoints && redeemQuantity >= 1 && redeemQuantity <= maxRedeemQuantity;

  // Ajustar cantidad si el máximo baja (p. ej. por stock o puntos)
  useEffect(() => {
    if (selectedReward && redeemQuantity > maxRedeemQuantity) {
      setRedeemQuantity(maxRedeemQuantity);
    }
    if (selectedReward && maxRedeemQuantity === 0) {
      setRedeemQuantity(0);
    }
  }, [selectedReward, maxRedeemQuantity, redeemQuantity]);

  // Confirmar canje de recompensa
  const handleConfirmClaim = async () => {
    if (!selectedReward || !canAffordRedeem) return;
    const idUser = balanceData?.ID_USER;
    if (!idUser) {
      toast.error("No se pudo identificar tu cuenta. Intenta de nuevo.");
      return;
    }
    setIsSubmittingRedeem(true);
    const res = await api_xcoin_createRedemption({
      idUser,
      idProduct: selectedReward.id,
      quantity: redeemQuantity,
    });
    setIsSubmittingRedeem(false);
    if (res.success) {
      const total = redeemQuantity * selectedReward.points;
      const productId = selectedReward.id;
      const qty = redeemQuantity;
      toast.success(
        `¡Recompensa reclamada! Has canjeado ${redeemQuantity} x "${selectedReward.name}" por ${total.toLocaleString()} puntos.`
      );
      setUserPoints((prev) => prev - total);
      // Actualizar stock solo del producto canjeado
      setRewards((prev) =>
        prev.map((r) =>
          r.id === productId
            ? {
                ...r,
                raw: {
                  ...r.raw,
                  STOCK_QUANTITY: Math.max(
                    0,
                    (r.raw?.STOCK_QUANTITY ?? 0) - qty
                  ),
                },
              }
            : r
        )
      );
      setIsRewardModalOpen(false);
      setSelectedReward(null);
      setRedeemQuantity(1);
      // Refrescar balance e historial
      if (user?.ACCOUNT_USER) {
        const balanceRes = await api_xcoin_getBalance(user.ACCOUNT_USER);
        if (balanceRes.success && balanceRes.data) {
          setUserPoints(balanceRes.data.AVAILABLE_POINTS ?? 0);
          setBalanceData(balanceRes.data);
        }
      }
      if (idUser) {
        const historyRes = await api_xcoin_getRedemptionHistory(idUser);
        if (historyRes.success && Array.isArray(historyRes.data)) {
          const byId = {};
          rewards.forEach((r) => { if (r.raw) byId[r.id] = r.raw; });
          setClaimedRewards(historyRes.data.map((r) => mapRedemptionToClaimed(r, byId)));
        }
      }
    } else {
      toast.error(res.message || "Error al realizar el canje");
    }
  };

  // Manejar guardar políticas
  const handleSavePolicies = () => {
    if (acceptedPolicies) {
      // TODO: Guardar aceptación de políticas en API
      setIsPolicyModalOpen(false);
      toast.success("Políticas aceptadas correctamente");
    } else {
      toast.error("Debes aceptar las políticas para continuar");
    }
  };

  // Texto de políticas de canje (mock)
  const policiesText = `POLÍTICAS DE CANJE DE XCOINS

1. ACUMULACIÓN DE PUNTOS
   - Los puntos se acumulan automáticamente con cada compra de llantas, llantas moto y herramientas.
   - Los puntos tienen una validez de 12 meses desde su fecha de acumulación.

2. CANJE DE RECOMPENSAS
   - Las recompensas pueden ser canjeadas en cualquier momento mientras tengas los puntos suficientes.
   - Una vez canjeada una recompensa, los puntos se deducen inmediatamente de tu balance.
   - Las recompensas no son transferibles ni reembolsables.

3. DESCUENTOS
   - Los descuentos obtenidos mediante canje de puntos son aplicables en tu próxima compra.
   - Los descuentos no son acumulables con otras promociones vigentes.
   - Los descuentos tienen una validez de 30 días desde su canje.

4. PRODUCTOS FÍSICOS
   - Los productos físicos canjeados serán enviados a la dirección registrada en tu perfil.
   - El tiempo de entrega puede variar según la disponibilidad del producto.
   - Los productos canjeados no pueden ser devueltos ni cambiados.

5. MODIFICACIONES
   - Nos reservamos el derecho de modificar estas políticas en cualquier momento.
   - Los cambios serán notificados a través de la plataforma.

Al aceptar estas políticas, confirmas que has leído y comprendido todos los términos y condiciones del sistema de recompensas XCoin.`;

  return (
    <>
      <SEO
        title="XCoin - Sistema de Recompensas"
        description="Gana puntos por tus compras y canjéalos por increíbles recompensas"
      />
      <PageContainer 
        fullWidth={true}
        style={{ position: "relative", overflow: "visible", padding: 0 }}
      >
        <XCoinContainer>
          {/* Hero Section */}
          <HeroSection>
            <HeroContent>
              <HeroLeft>
                <HeroIcon>
                  <RenderIcon name="FaCoins" size={40} />
                </HeroIcon>
                <HeroTitle>XCoins</HeroTitle>
              </HeroLeft>
              <HeroCenter>
                <HeroDescription>
                  Gana puntos con cada compra de llantas, llantas moto y herramientas.
                  Canjea tus puntos por increíbles recompensas, descuentos exclusivos y
                  beneficios especiales.
                </HeroDescription>
              </HeroCenter>
              <HeroRight>
                <PolicyButton
                  text="Leer políticas de canje"
                  leftIconName="FaFileContract"
                  onClick={() => setIsPolicyModalOpen(true)}
                />
              </HeroRight>
            </HeroContent>
          </HeroSection>

          {/* Contenedor principal */}
          <MainContainer>
            {/* Tabs principales: Catálogo y Canjeados */}
            <PointsTabsContainer style={{ marginBottom: "2rem" }}>
              <PointsTabButton
                $active={activeTab === "catalog"}
                onClick={() => setActiveTab("catalog")}
              >
                Catálogo
              </PointsTabButton>
              <PointsTabButton
                $active={activeTab === "claimed"}
                onClick={() => setActiveTab("claimed")}
              >
                Canjeados ({claimedRewards.length})
              </PointsTabButton>
            </PointsTabsContainer>

            {activeTab === "catalog" ? (
              <>
                {/* Sección superior: Puntos (izquierda) y Categorías (derecha) */}
                <TopSection>
                  {/* Puntos - Izquierda */}
                  <PointsSection>
                    <PointsTitle>
                      <RenderIcon name="FaCoins" size={24} />
                      Mis puntos
                    </PointsTitle>
                    {loading ? (
                      <RenderLoader />
                    ) : (
                      <PointsDisplay>
                        <PointsValue>{userPoints.toLocaleString()}</PointsValue>
                        <PointsLabel>puntos disponibles</PointsLabel>
                      </PointsDisplay>
                    )}
                  </PointsSection>

                  {/* Categorías como Tabs - Derecha (alineadas a la derecha) */}
                  <CategoriesSection>
                    <TabsContainer>
                      {categories.map((category) => (
                        <TabButton
                          key={category.id}
                          $active={selectedCategory === category.id}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.label}
                        </TabButton>
                      ))}
                    </TabsContainer>
                  </CategoriesSection>
                </TopSection>

                {/* Sección de catálogo de recompensas */}
                <RewardsSection>
                  <RewardsDivider />

                  {loadingProducts ? (
                    <EmptyState>
                      <RenderLoader />
                      <EmptyStateText style={{ marginTop: "1rem" }}>
                        Cargando catálogo...
                      </EmptyStateText>
                    </EmptyState>
                  ) : filteredRewards.length === 0 ? (
                    <EmptyState>
                      <EmptyStateIcon>
                        <RenderIcon name="FaGift" size={64} />
                      </EmptyStateIcon>
                      <EmptyStateText>
                        No hay recompensas disponibles en esta categoría
                      </EmptyStateText>
                    </EmptyState>
                  ) : (
                    <RewardsGrid>
                      {filteredRewards.map((reward) => {
                        const stock = reward.raw?.STOCK_QUANTITY ?? 0;
                        const hasStock = typeof stock === "number" && stock > 0;
                        const canAfford = userPoints >= reward.points;
                        const canRedeem = hasStock && canAfford;
                        const buttonText = !hasStock
                          ? "Sin stock"
                          : !canAfford
                            ? "Puntos insuficientes"
                            : "Canjear";
                        return (
                          <RewardCard key={reward.id} $canAfford={canRedeem}>
                            <RewardImage>
                              <RewardImageWithFallback
                                src={reward.image}
                                alt={reward.name}
                                iconSize={64}
                              />
                            </RewardImage>
                            <RewardInfo>
                              <RewardName>{reward.name}</RewardName>
                              {(reward.brand || reward.enterprise) && (
                                <RewardChips>
                                  {reward.brand && (
                                    <RewardChip>{reward.brand}</RewardChip>
                                  )}
                                  {reward.enterprise && (
                                    <RewardChip>{reward.enterprise}</RewardChip>
                                  )}
                                </RewardChips>
                              )}
                              {reward.description ? (
                                <RewardDescription>
                                  {reward.description}
                                </RewardDescription>
                              ) : null}
                            </RewardInfo>
                            <RewardFooter>
                              <RewardPoints>
                                <RenderIcon name="FaCoins" size={16} />
                                {reward.points.toLocaleString()}
                              </RewardPoints>
                              <ClaimButton
                                text={buttonText}
                                variant={canRedeem ? "solid" : "outline"}
                                disabled={!canRedeem}
                                onClick={() => handleClaimReward(reward)}
                                backgroundColor={
                                  canRedeem ? theme.colors.primary : undefined
                                }
                              />
                            </RewardFooter>
                          </RewardCard>
                        );
                      })}
                    </RewardsGrid>
                  )}
                </RewardsSection>
              </>
            ) : (
              <ClaimedRewardsGrid>
                {claimedRewards.length === 0 ? (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: "2rem 1rem",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    <RenderIcon name="FaGift" size={48} />
                    <p
                      style={{
                        marginTop: "0.75rem",
                        fontSize: "1rem",
                        fontWeight: 600,
                      }}
                    >
                      Aún no has reclamado ninguna recompensa
                    </p>
                    <p style={{ marginTop: "0.35rem", fontSize: "0.85rem" }}>
                      Explora el catálogo y canjea tus puntos por increíbles premios
                    </p>
                  </div>
                ) : (
                  claimedRewards.map((claimed) => {
                    const rewardInCatalog = rewards.find(
                      (r) => r.id === claimed.rewardId
                    );
                    const pointsPerUnit =
                      claimed.quantity > 0
                        ? Math.floor(claimed.points / claimed.quantity)
                        : 0;
                    const hasStock =
                      rewardInCatalog &&
                      (rewardInCatalog.raw?.STOCK_QUANTITY ?? 0) > 0;
                    const canAffordAgain =
                      rewardInCatalog && userPoints >= (rewardInCatalog.points ?? pointsPerUnit);
                    const canRedeemAgain =
                      claimed.isActive &&
                      rewardInCatalog &&
                      hasStock &&
                      canAffordAgain;
                    const redeemAgainText = !claimed.isActive
                      ? "No disponible"
                      : !rewardInCatalog
                        ? "No disponible"
                        : !hasStock
                          ? "Sin stock"
                          : !canAffordAgain
                            ? "Puntos insuficientes"
                            : "Canjear otra vez";
                    return (
                      <ClaimedRewardCard key={claimed.id}>
                        <ClaimedRewardImageWrap>
                          <RewardImageWithFallback
                            src={claimed.image}
                            alt={claimed.name}
                            iconSize={28}
                          />
                        </ClaimedRewardImageWrap>
                        <ClaimedRewardInfo>
                          <ClaimedRewardName>{claimed.name}</ClaimedRewardName>
                          {(claimed.brand || claimed.enterprise) && (
                            <RewardChips>
                              {claimed.brand && (
                                <RewardChip>{claimed.brand}</RewardChip>
                              )}
                              {claimed.enterprise && (
                                <RewardChip>{claimed.enterprise}</RewardChip>
                              )}
                            </RewardChips>
                          )}
                          <ClaimedRewardMeta>
                            <ClaimedRewardMetaItem>
                              <RenderIcon name="FaBox" size={9} />
                              {claimed.quantity} ud.
                            </ClaimedRewardMetaItem>
                            <ClaimedRewardMetaItem>
                              <RenderIcon name="FaCoins" size={9} />
                              {claimed.points.toLocaleString()} pts
                            </ClaimedRewardMetaItem>
                            <ClaimedRewardMetaItem>
                              <RenderIcon name="FaCalendar" size={9} />
                              {new Date(claimed.claimedAt).toLocaleDateString(
                                "es-ES",
                                { day: "numeric", month: "short", year: "2-digit" }
                              )}
                            </ClaimedRewardMetaItem>
                          </ClaimedRewardMeta>
                        </ClaimedRewardInfo>
                        <ClaimedRewardFooter>
                          <ClaimedRedeemButton
                            text={redeemAgainText}
                            variant={canRedeemAgain ? "solid" : "outline"}
                            disabled={!canRedeemAgain}
                            onClick={() =>
                              canRedeemAgain &&
                              rewardInCatalog &&
                              handleClaimReward(rewardInCatalog)
                            }
                            backgroundColor={
                              canRedeemAgain ? theme.colors.primary : undefined
                            }
                            leftIconName={canRedeemAgain ? "FaGift" : undefined}
                          />
                        </ClaimedRewardFooter>
                      </ClaimedRewardCard>
                    );
                  })
                )}
              </ClaimedRewardsGrid>
            )}
          </MainContainer>
        </XCoinContainer>

        {/* Modal de Políticas */}
        <Modal
          isOpen={isPolicyModalOpen}
          onClose={() => setIsPolicyModalOpen(false)}
          title="Políticas de Canje"
          titleIcon="FaFileContract"
          maxWidth="700px"
          footer={
            <Button
              text="Guardar"
              onClick={handleSavePolicies}
              disabled={!acceptedPolicies}
              variant="solid"
              backgroundColor={theme.colors.primary}
            />
          }
        >
          <PolicyText>{policiesText}</PolicyText>
          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              id="acceptPolicies"
              checked={acceptedPolicies}
              onChange={(e) => setAcceptedPolicies(e.target.checked)}
            />
            <CheckboxLabel htmlFor="acceptPolicies">
              Acepto las políticas de canje
            </CheckboxLabel>
          </CheckboxContainer>
        </Modal>

        {/* Modal de Detalles de Recompensa */}
        <Modal
          isOpen={isRewardModalOpen}
          onClose={() => {
            setIsRewardModalOpen(false);
            setSelectedReward(null);
            setRedeemQuantity(1);
          }}
          title={selectedReward?.name || "Detalles de Recompensa"}
          titleIcon="FaGift"
          maxWidth="600px"
          footer={
            selectedReward && (
              <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                <Button
                  text="Cancelar"
                  variant="outline"
                  onClick={() => {
                    setIsRewardModalOpen(false);
                    setSelectedReward(null);
                    setRedeemQuantity(1);
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  text={
                    isSubmittingRedeem
                      ? "Procesando..."
                      : canAffordRedeem
                        ? `Canjear por ${redeemTotalPoints.toLocaleString()} puntos`
                        : "Puntos insuficientes"
                  }
                  variant="solid"
                  disabled={!canAffordRedeem || isSubmittingRedeem}
                  onClick={handleConfirmClaim}
                  backgroundColor={theme.colors.primary}
                  style={{ flex: 1 }}
                />
              </div>
            )
          }
        >
          {selectedReward && (
            <div>
              {/* Imagen de la recompensa */}
              <div
                style={{
                  width: "100%",
                  height: "200px",
                  background:
                    theme.mode === "dark"
                      ? `${theme.colors.background}80`
                      : `${theme.colors.surface}`,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "24px",
                  overflow: "hidden",
                  border: `1px solid ${
                    theme.mode === "dark"
                      ? `${theme.colors.border}40`
                      : `${theme.colors.border}30`
                  }`,
                }}
              >
                <RewardImageWithFallback
                  src={selectedReward.image}
                  alt={selectedReward.name}
                  iconSize={80}
                />
              </div>

              {/* Chips Brand / Enterprise */}
              {(selectedReward.brand || selectedReward.enterprise) && (
                <RewardChips style={{ marginBottom: "20px" }}>
                  {selectedReward.brand && (
                    <RewardChip>{selectedReward.brand}</RewardChip>
                  )}
                  {selectedReward.enterprise && (
                    <RewardChip>{selectedReward.enterprise}</RewardChip>
                  )}
                </RewardChips>
              )}

              {/* Descripción */}
              {selectedReward.description ? (
                <div style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      color: theme.colors.text,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                    }}
                  >
                    Descripción
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: theme.colors.textSecondary,
                      lineHeight: 1.6,
                      fontSize: "0.95rem",
                    }}
                  >
                    {selectedReward.description}
                  </p>
                </div>
              ) : null}

              {/* Cantidad */}
              <div
                style={{
                  marginBottom: "24px",
                  padding: "16px",
                  background:
                    theme.mode === "dark"
                      ? `${theme.colors.background}80`
                      : `${theme.colors.background}`,
                  borderRadius: "12px",
                  border: `1px solid ${
                    theme.mode === "dark"
                      ? `${theme.colors.border}40`
                      : `${theme.colors.border}30`
                  }`,
                }}
              >
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: theme.colors.textSecondary,
                    marginBottom: "8px",
                  }}
                >
                  Cantidad
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                    <button
                      type="button"
                      onClick={() => setRedeemQuantity((q) => Math.max(maxRedeemQuantity === 0 ? 0 : 1, q - 1))}
                      disabled={redeemQuantity <= (maxRedeemQuantity === 0 ? 0 : 1)}
                      style={{
                        width: "36px",
                        height: "36px",
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: "8px 0 0 8px",
                        background: theme.colors.surface,
                        color: theme.colors.text,
                        fontSize: "1.25rem",
                        cursor: redeemQuantity <= (maxRedeemQuantity === 0 ? 0 : 1) ? "not-allowed" : "pointer",
                        opacity: redeemQuantity <= (maxRedeemQuantity === 0 ? 0 : 1) ? 0.5 : 1,
                      }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={maxRedeemQuantity === 0 ? 0 : 1}
                      max={maxRedeemQuantity}
                      value={redeemQuantity}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!Number.isNaN(v)) {
                          const minQ = maxRedeemQuantity === 0 ? 0 : 1;
                          setRedeemQuantity(Math.max(minQ, Math.min(maxRedeemQuantity, v)));
                        }
                      }}
                      style={{
                        width: "56px",
                        height: "36px",
                        border: `1px solid ${theme.colors.border}`,
                        borderLeft: "none",
                        borderRight: "none",
                        borderRadius: 0,
                        textAlign: "center",
                        fontSize: "1rem",
                        fontWeight: 600,
                        background: theme.colors.surface,
                        color: theme.colors.text,
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setRedeemQuantity((q) => Math.min(maxRedeemQuantity, q + 1))}
                      disabled={redeemQuantity >= maxRedeemQuantity}
                      style={{
                        width: "36px",
                        height: "36px",
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: "0 8px 8px 0",
                        background: theme.colors.surface,
                        color: theme.colors.text,
                        fontSize: "1.25rem",
                        cursor: redeemQuantity >= maxRedeemQuantity ? "not-allowed" : "pointer",
                        opacity: redeemQuantity >= maxRedeemQuantity ? 0.5 : 1,
                      }}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: "0.9rem", color: theme.colors.textSecondary }}>
                    Máx. {maxRedeemQuantity} (stock y puntos)
                  </span>
                </div>
              </div>

              {/* Información de puntos */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px",
                  background:
                    theme.mode === "dark"
                      ? `${theme.colors.background}80`
                      : `${theme.colors.background}`,
                  borderRadius: "12px",
                  border: `1px solid ${
                    theme.mode === "dark"
                      ? `${theme.colors.border}40`
                      : `${theme.colors.border}30`
                  }`,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: theme.colors.textSecondary,
                      marginBottom: "4px",
                    }}
                  >
                    Costo total ({redeemQuantity} × {selectedReward.points.toLocaleString()} pts)
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: theme.colors.primary,
                    }}
                  >
                    <RenderIcon name="FaCoins" size={24} />
                    {redeemTotalPoints.toLocaleString()} puntos
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: theme.colors.textSecondary,
                      marginBottom: "4px",
                    }}
                  >
                    Tus puntos disponibles
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: theme.colors.text,
                    }}
                  >
                    {userPoints.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Mensaje si no tiene suficientes puntos */}
              {userPoints < redeemTotalPoints && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px",
                    background:
                      theme.mode === "dark"
                        ? `${theme.colors.error}20`
                        : `${theme.colors.error}10`,
                    borderRadius: "8px",
                    border: `1px solid ${theme.colors.error}40`,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: theme.colors.error,
                    fontSize: "0.9rem",
                  }}
                >
                  <RenderIcon name="FaExclamationTriangle" size={18} />
                  <span>
                    Necesitas{" "}
                    {(redeemTotalPoints - userPoints).toLocaleString()}{" "}
                    puntos más para canjear {redeemQuantity} {redeemQuantity === 1 ? "unidad" : "unidades"}
                  </span>
                </div>
              )}
            </div>
          )}
        </Modal>

      </PageContainer>
    </>
  );
};

export default XCoinHome;
