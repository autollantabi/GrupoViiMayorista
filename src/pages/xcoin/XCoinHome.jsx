import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useAppTheme } from "../../context/AppThemeContext";
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

const ClaimedRewardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const ClaimedRewardCard = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `${theme.colors.background}80`
      : `${theme.colors.background}`};
  border-radius: 12px;
  border: 1px solid
    ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.border}40`
        : `${theme.colors.border}30`};
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? "0 4px 12px rgba(0, 0, 0, 0.2)"
        : "0 4px 12px rgba(0, 0, 0, 0.08)"};
  }
`;

const ClaimedRewardIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${({ theme }) => theme.colors.primary}20;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ClaimedRewardInfo = styled.div`
  flex: 1;
`;

const ClaimedRewardName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.1rem;
  font-weight: 700;
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

const StatusBadge = styled.div`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${({ theme, $status }) =>
    $status === "activo"
      ? theme.colors.success + "20"
      : theme.colors.textSecondary + "20"};
  color: ${({ theme, $status }) =>
    $status === "activo" ? theme.colors.success : theme.colors.textSecondary};
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

// Mock data - Esto debería venir de una API
const mockRewards = [
  {
    id: 1,
    name: "Descuento 10% en Llantas",
    description: "Obtén un 10% de descuento en tu próxima compra de llantas",
    points: 500,
    category: "llantas",
    image: null,
  },
  {
    id: 2,
    name: "Descuento 15% en Llantas Moto",
    description: "Descuento especial del 15% en llantas para motocicleta",
    points: 750,
    category: "llantas-moto",
    image: null,
  },
  {
    id: 3,
    name: "Kit de Herramientas Básico",
    description: "Kit completo de herramientas para tu taller",
    points: 1200,
    category: "herramientas",
    image: null,
  },
  {
    id: 4,
    name: "Descuento 20% en Llantas Premium",
    description: "Descuento del 20% en llantas de gama alta",
    points: 1500,
    category: "llantas",
    image: null,
  },
  {
    id: 5,
    name: "Descuento 12% en Llantas Moto",
    description: "Descuento del 12% en llantas para motocicleta",
    points: 600,
    category: "llantas-moto",
    image: null,
  },
  {
    id: 6,
    name: "Herramienta Especializada",
    description: "Herramienta profesional para tu negocio",
    points: 2000,
    category: "herramientas",
    image: null,
  },
];

const XCoinHome = () => {
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [rewards, setRewards] = useState(mockRewards);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [activeTab, setActiveTab] = useState("catalog"); // "catalog" o "claimed"

  // Simular carga de puntos del usuario
  useEffect(() => {
    // TODO: Reemplazar con llamada real a la API
    const loadUserPoints = async () => {
      setLoading(true);
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Mock: puntos del usuario
      setUserPoints(1500);
      setLoading(false);
    };

    loadUserPoints();
  }, []);

  // Cargar premios reclamados
  useEffect(() => {
    // TODO: Reemplazar con llamada real a la API
    const loadClaimedRewards = async () => {
      // Mock: premios reclamados
      setClaimedRewards([
        {
          id: 1,
          rewardId: 1,
          name: "Descuento 10% en Llantas",
          points: 500,
          claimedAt: "2024-01-15T10:30:00",
          status: "activo",
        },
        {
          id: 2,
          rewardId: 3,
          name: "Descuento 15% en Herramientas",
          points: 800,
          claimedAt: "2024-01-10T14:20:00",
          status: "usado",
        },
      ]);
    };

    loadClaimedRewards();
  }, []);

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
    setIsRewardModalOpen(true);
  };

  // Confirmar canje de recompensa
  const handleConfirmClaim = () => {
    if (selectedReward && userPoints >= selectedReward.points) {
      // TODO: Implementar lógica de reclamación con API
      toast.success(
        `¡Recompensa reclamada! Has canjeado "${selectedReward.name}" por ${selectedReward.points.toLocaleString()} puntos.`
      );
      // Actualizar puntos del usuario
      setUserPoints((prev) => prev - selectedReward.points);
      setIsRewardModalOpen(false);
      setSelectedReward(null);
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

  const categories = [
    { id: "all", label: "Todas" },
    { id: "llantas", label: "Llantas" },
    { id: "llantas-moto", label: "Llantas Moto" },
    { id: "herramientas", label: "Herramientas" },
  ];

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

                  {filteredRewards.length === 0 ? (
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
                        const canAfford = userPoints >= reward.points;
                        return (
                          <RewardCard key={reward.id} $canAfford={canAfford}>
                            <RewardImage>
                              {reward.image ? (
                                <img src={reward.image} alt={reward.name} />
                              ) : (
                                <RenderIcon name="FaGift" size={64} />
                              )}
                            </RewardImage>
                            <RewardInfo>
                              <RewardName>{reward.name}</RewardName>
                              <RewardDescription>
                                {reward.description}
                              </RewardDescription>
                            </RewardInfo>
                            <RewardFooter>
                              <RewardPoints>
                                <RenderIcon name="FaCoins" size={16} />
                                {reward.points.toLocaleString()}
                              </RewardPoints>
                              <ClaimButton
                                text={canAfford ? "Canjear" : "Insuficiente"}
                                variant={canAfford ? "solid" : "outline"}
                                disabled={!canAfford}
                                onClick={() => handleClaimReward(reward)}
                                backgroundColor={
                                  canAfford ? theme.colors.primary : undefined
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
              <ClaimedRewardsList>
                {claimedRewards.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem 1rem",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    <RenderIcon name="FaGift" size={64} />
                    <p
                      style={{
                        marginTop: "1rem",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                      }}
                    >
                      Aún no has reclamado ninguna recompensa
                    </p>
                    <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                      Explora el catálogo y canjea tus puntos por increíbles
                      premios
                    </p>
                  </div>
                ) : (
                  claimedRewards.map((claimed) => (
                    <ClaimedRewardCard key={claimed.id}>
                      <ClaimedRewardIcon>
                        <RenderIcon
                          name="FaGift"
                          size={32}
                          style={{ color: theme.colors.primary }}
                        />
                      </ClaimedRewardIcon>
                      <ClaimedRewardInfo>
                        <ClaimedRewardName>{claimed.name}</ClaimedRewardName>
                        <ClaimedRewardDetails>
                          <ClaimedRewardDetail>
                            <RenderIcon name="FaCoins" size={16} />
                            <span>
                              {claimed.points.toLocaleString()} puntos
                            </span>
                          </ClaimedRewardDetail>
                          <ClaimedRewardDetail>
                            <RenderIcon name="FaCalendar" size={14} />
                            <span>
                              {new Date(
                                claimed.claimedAt
                              ).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </ClaimedRewardDetail>
                          <StatusBadge $status={claimed.status}>
                            {claimed.status === "activo" ? "Activo" : "Usado"}
                          </StatusBadge>
                        </ClaimedRewardDetails>
                      </ClaimedRewardInfo>
                    </ClaimedRewardCard>
                  ))
                )}
              </ClaimedRewardsList>
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
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  text={
                    userPoints >= selectedReward.points
                      ? `Canjear por ${selectedReward.points.toLocaleString()} puntos`
                      : "Puntos insuficientes"
                  }
                  variant="solid"
                  disabled={userPoints < selectedReward.points}
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
                {selectedReward.image ? (
                  <img
                    src={selectedReward.image}
                    alt={selectedReward.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <RenderIcon name="FaGift" size={80} />
                )}
              </div>

              {/* Descripción */}
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
                    Costo de canje
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
                    {selectedReward.points.toLocaleString()} puntos
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
              {userPoints < selectedReward.points && (
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
                    {(selectedReward.points - userPoints).toLocaleString()}{" "}
                    puntos más para canjear esta recompensa
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
