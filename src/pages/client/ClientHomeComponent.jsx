import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { useAppTheme } from "../../context/AppThemeContext";
import { empresas, getEmpresaLogo } from "../../mock/products";
import Button from "../../components/ui/Button";
import { api_products_getInfoProductos } from "../../api/products/apiProducts";
import PageContainer from "../../components/layout/PageContainer";
import RenderLoader from "../../components/ui/RenderLoader";
import RenderIcon from "../../components/ui/RenderIcon";
import SEO from "../../components/seo/SEO";
import { ROUTES } from "../../constants/routes";
import {
  api_access_sections_create,
  api_access_sections_get_all,
  api_access_sections_get_permission_by_email_and_section,
} from "../../api/accessSections/apiAccessSections";
import ClubShellMaxxImage from "../../assets/ClubShellMaxx.jpg";
import GraficoFuncionesClubShellMaxxImage from "../../assets/GraficoFuncionesClubShellMaxx.jpg";

const HeroSection = styled.section`
  min-height: calc(85dvh - 45px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 6rem 2rem 4rem;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`
      : `linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)`};


  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    min-height: calc(85dvh - 45px);
    padding: 4rem 1rem 3rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 800;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.3;
  letter-spacing: -0.02em;
  min-height: 1.2em;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0 1rem;

  @media (max-width: 768px) {
    font-size: clamp(1.5rem, 6vw, 2.5rem);
    margin-bottom: 1rem;
    padding: 0 0.5rem;
    white-space: normal;
    overflow: visible;
    word-wrap: break-word;
    overflow-wrap: break-word;
    min-height: auto;
    line-height: 1.4;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 480px) {
    font-size: clamp(1.25rem, 5vw, 2rem);
    padding: 0 0.25rem;
    line-height: 1.5;
  }
`;

const TypewriterText = styled.span`
  position: relative;
  display: inline-block;
  white-space: nowrap;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    white-space: normal;
    display: block;
    word-wrap: break-word;
    overflow-wrap: break-word;
    text-align: center;
  }

  &::after {
    content: "|";
    display: inline-block;
    margin-left: 0.15em;
    animation: blink 1s infinite;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 300;
    font-size: 1.2em;
    line-height: 1.2;
    opacity: 1;
    text-shadow: 0 0 8px ${({ theme }) => `${theme.colors.primary}60`};
    -webkit-text-fill-color: ${({ theme }) => theme.colors.primary};
    background: none;
    -webkit-background-clip: unset;
    background-clip: unset;
    vertical-align: baseline;
  }

  @keyframes blink {
    0%, 45% {
      opacity: 1;
    }
    46%, 100% {
      opacity: 0.3;
    }
  }
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: 3rem;
  max-width: 700px;
  line-height: 1.7;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 2.5rem;
    max-width: 100%;
  }
`;

// Elementos destacados del hero
const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 2rem;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.primary}25, ${theme.colors.primary}15)`
      : `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.primary}08)`};
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => `${theme.colors.primary}30`};
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px ${({ theme }) => `${theme.colors.primary}15`};
  animation: fadeInUp 0.6s ease-out;
`;

const HeroCTAContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 2.5rem;
`;

const HeroPrimaryButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: 1rem 2.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px ${({ theme }) => `${theme.colors.primary}40`},
    0 0 0 0 ${({ theme }) => `${theme.colors.primary}20`};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
    background: ${({ theme }) =>
      theme.colors.primaryDark || theme.colors.primary};
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 15px 40px ${({ theme }) => `${theme.colors.primary}50`},
      0 0 0 4px ${({ theme }) => `${theme.colors.primary}15`};

    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &:active {
    transform: translateY(-1px) scale(1);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
`;

const HeroSecondaryLink = styled.button`
  border-radius: 999px;
  padding: 0.7rem 1.4rem;
  border: 1px solid ${({ theme }) => `${theme.colors.textSecondary}55`};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background: ${({ theme }) => `${theme.colors.surface}cc`};
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }
`;

const CompaniesSection = styled.section`
  min-height: calc(85dvh - 45px);
  padding: 6rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(180deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`
      : `linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)`};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `radial-gradient(ellipse at top center, ${theme.colors.primary}15 0%, transparent 50%),
           radial-gradient(ellipse at bottom center, ${theme.colors.secondary}10 0%, transparent 50%)`
        : `radial-gradient(ellipse at top center, ${theme.colors.primary}10 0%, transparent 50%),
           radial-gradient(ellipse at bottom center, ${theme.colors.secondary}08 0%, transparent 50%)`};
    pointer-events: none;
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  text-align: center;
  margin-bottom: 1.5rem;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 50%, ${theme.colors.secondary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 50%, ${theme.colors.secondary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  animation: fadeInUp 0.8s ease-out;
  position: relative;

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
`;

const SectionSubtitle = styled.p`
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
  font-weight: 400;
`;

const CompaniesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  padding: 2rem 0;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  justify-items: stretch;

  /* Desktop: 4 columnas */
  @media (min-width: 1025px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }

  /* Tablet: 2 columnas */
  @media (max-width: 1024px) and (min-width: 769px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  /* Móvil: 1 columna */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const CompanyCard = styled.div`
  border-radius: 16px;
  overflow: hidden;
  background: ${({ theme }) =>
    theme.mode === "dark" ? theme.colors.surface : "#ffffff"};
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 2px 8px rgba(0, 0, 0, 0.06)"};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 300px;
  opacity: ${({ $hasAccess }) => ($hasAccess ? 1 : 0.85)};

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ $hasAccess, theme }) =>
      $hasAccess
        ? theme.mode === "dark"
          ? `${theme.colors.primary}60`
          : `${theme.colors.primary}50`
        : theme.mode === "dark"
        ? `${theme.colors.warning}60`
        : `${theme.colors.warning}50`};
    box-shadow: ${({ theme, $hasAccess }) =>
      $hasAccess
        ? theme.mode === "dark"
          ? "0 8px 24px rgba(0, 0, 0, 0.2)"
          : "0 8px 24px rgba(0, 0, 0, 0.1)"
        : theme.mode === "dark"
        ? "0 8px 24px rgba(0, 0, 0, 0.2)"
        : "0 8px 24px rgba(0, 0, 0, 0.1)"};
  }

  &:active {
    transform: translateY(-2px);
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
  gap: 0.5rem;
`;

const ProductCount = styled.span`
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 0.75rem;
  border-radius: 12px;
  padding: 6px 12px;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primary}dd)`
      : theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 600;
  z-index: 10;
  box-shadow: 0 4px 12px ${({ theme }) => `${theme.colors.primary}40`};
  backdrop-filter: blur(10px);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid ${({ theme }) => `${theme.colors.primary}30`};
`;

// Badge de acceso mejorado
const AccessBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  background: ${({ $hasAccess, theme }) =>
    $hasAccess
      ? theme.colors.success
      : theme.mode === "dark"
      ? `${theme.colors.surface}cc`
      : `${theme.colors.border}30`};
  color: ${({ $hasAccess, theme }) =>
    $hasAccess ? theme.colors.white : theme.colors.textSecondary};
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border: 1px solid
    ${({ $hasAccess, theme }) =>
      $hasAccess
        ? `${theme.colors.success}40`
        : theme.mode === "dark"
        ? `${theme.colors.border}40`
        : `${theme.colors.border}30`};
`;

const AccessIcon = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
`;

const CompanyLogo = styled.div`
  height: 200px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: ${({ theme }) =>
    theme.mode === "dark" ? theme.colors.background : "#fafafa"};
  position: relative;
  overflow: hidden;

  img {
    max-width: 80%;
    max-height: 80%;
    object-fit: contain;
    transition: transform 0.3s ease;
    position: relative;
    z-index: 1;
  }

  ${CompanyCard}:hover img {
    transform: scale(1.05);
  }
`;

const CompanyDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
  line-height: 1.6;
  text-align: center;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

// Estilos para la sección de Reencauche
const ReencaucheSection = styled.section`
  min-height: calc(85dvh - 45px);
  padding: 2rem 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`
      : `linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)`};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `radial-gradient(ellipse at top right, #f49f1420 0%, transparent 50%),
           radial-gradient(ellipse at bottom left, #f49f1415 0%, transparent 50%)`
        : `radial-gradient(ellipse at top right, #f49f1412 0%, transparent 50%),
           radial-gradient(ellipse at bottom left, #f49f1408 0%, transparent 50%)`};
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    padding: 4rem 2rem;
    margin: 3rem 0;
  }
`;

const ReencaucheContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
`;

const ReencaucheContainerReversed = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
`;

const ReencaucheContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReencaucheIconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, #f49f1430, #f49f1420)`
      : `linear-gradient(135deg, #f49f1420, #f49f1415)`};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 8px 24px #f49f1430;
  border: 2px solid #f49f1440;

  @media (max-width: 768px) {
    width: 70px;
    height: 70px;
    margin: 0 auto 1rem;
  }
`;

const ReencaucheTitle = styled.h2`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  margin: 0;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, #f49f14 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, #f49f14 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const ReencaucheDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(1rem, 2vw, 1.25rem);
  margin: 0;
  line-height: 1.7;
  max-width: 500px;

  @media (max-width: 968px) {
    max-width: 100%;
    text-align: center;
  }
`;

const ReencaucheFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (max-width: 968px) {
    align-items: center;
  }
`;

const ReencaucheFeature = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;

  svg {
    color: #f49f14;
    flex-shrink: 0;
  }

  @media (max-width: 968px) {
    justify-content: center;
  }
`;

const ReencaucheVisual = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  @media (max-width: 968px) {
    order: -1;
  }
`;

const ReencaucheVisualCircle = styled.div`
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, #f49f1425, #f49f1415)`
      : `linear-gradient(135deg, #f49f1420, #f49f1412)`};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px #f49f1425,
    inset 0 0 0 1px #f49f1430;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `radial-gradient(circle, #f49f1420 0%, transparent 70%)`
        : `radial-gradient(circle, #f49f1415 0%, transparent 70%)`};
    animation: rotate 20s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    width: 250px;
    height: 250px;
  }
`;

const ReencaucheIconLarge = styled.div`
  color: #f49f14;
  opacity: 0.3;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ReencaucheActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 968px) {
    justify-content: center;
  }
`;

const ReencaucheButton = styled(Button)`
  background: #f49f14;
  color: white;
  border: none;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px #f49f1440;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: #e08f12;
    transform: translateY(-3px);
    box-shadow: 0 15px 40px #f49f1450;
  }

  &:active {
    transform: translateY(-1px);
  }
`;

// Estilos para la sección de XCoin
const XCoinSection = styled.section`
  min-height: calc(85dvh - 45px);
  padding: 2rem 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`
      : `linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)`};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `radial-gradient(ellipse at top left, ${theme.colors.primary}20 0%, transparent 50%),
           radial-gradient(ellipse at bottom right, ${theme.colors.primary}15 0%, transparent 50%)`
        : `radial-gradient(ellipse at top left, ${theme.colors.primary}12 0%, transparent 50%),
           radial-gradient(ellipse at bottom right, ${theme.colors.primary}08 0%, transparent 50%)`};
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    padding: 4rem 2rem;
    margin: 3rem 0;
  }
`;

const XCoinContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
`;

const XCoinContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const XCoinIconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.primary}30, ${theme.colors.primary}20)`
      : `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.primary}15)`};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 8px 24px ${({ theme }) => `${theme.colors.primary}30`};
  border: 2px solid ${({ theme }) => `${theme.colors.primary}40`};

  @media (max-width: 768px) {
    width: 70px;
    height: 70px;
    margin: 0 auto 1rem;
  }
`;

const XCoinTitle = styled.h2`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  margin: 0;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const XCoinDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(1rem, 2vw, 1.25rem);
  margin: 0;
  line-height: 1.7;
  max-width: 500px;

  @media (max-width: 968px) {
    max-width: 100%;
    text-align: center;
  }
`;

const XCoinFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (max-width: 968px) {
    align-items: center;
  }
`;

const XCoinFeature = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;

  svg {
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }

  @media (max-width: 968px) {
    justify-content: center;
  }
`;

const XCoinVisual = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  @media (max-width: 968px) {
    order: -1;
  }
`;

const XCoinVisualCircle = styled.div`
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.primary}10)`
      : `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.primary}08)`};
  border: 3px solid ${({ theme }) => `${theme.colors.primary}30`};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px ${({ theme }) => `${theme.colors.primary}25`},
    inset 0 0 0 1px ${({ theme }) => `${theme.colors.primary}30`};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `radial-gradient(circle, ${theme.colors.primary}20 0%, transparent 70%)`
        : `radial-gradient(circle, ${theme.colors.primary}15 0%, transparent 70%)`};
    animation: rotate 20s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    width: 250px;
    height: 250px;
  }
`;

const XCoinIconLarge = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  opacity: 0.3;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const XCoinActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 968px) {
    justify-content: center;
  }
`;

const XCoinButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px ${({ theme }) => `${theme.colors.primary}40`};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark || theme.colors.primary};
    transform: translateY(-3px);
    box-shadow: 0 15px 40px ${({ theme }) => `${theme.colors.primary}50`};
  }

  &:active {
    transform: translateY(-1px);
  }
`;

// Estilos para la sección de App Shell
const AppShellSection = styled.section`
  min-height: calc(85dvh - 45px);
  padding: 2rem 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`
      : `linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)`};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `radial-gradient(ellipse at top left, ${theme.colors.primary}20 0%, transparent 50%),
           radial-gradient(ellipse at bottom right, ${theme.colors.primary}15 0%, transparent 50%)`
        : `radial-gradient(ellipse at top left, ${theme.colors.primary}12 0%, transparent 50%),
           radial-gradient(ellipse at bottom right, ${theme.colors.primary}08 0%, transparent 50%)`};
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    padding: 4rem 2rem;
    margin: 3rem 0;
  }
`;

const AppShellContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
`;

const AppShellContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const AppShellImage = styled.img`
  width: 170px;
  height: 170px;
  border-radius: 24px;
  object-fit: cover;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    width: 160px;
    height: 160px;
    margin: 0 auto 1.5rem;
  }
`;

const AppShellTitle = styled.h2`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  margin: 0;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const AppShellDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(1rem, 2vw, 1.25rem);
  margin: 0;
  line-height: 1.7;
  max-width: 500px;

  @media (max-width: 968px) {
    max-width: 100%;
    text-align: center;
  }
`;

const AppShellFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (max-width: 968px) {
    align-items: center;
  }
`;

const AppShellFeature = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;

  svg {
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }

  @media (max-width: 968px) {
    justify-content: center;
  }
`;

const AppShellVisual = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  @media (max-width: 968px) {
    order: -1;
  }
`;

const AppShellVisualImage = styled.img`
  width: 100%;
  max-width: 500px;
  height: auto;
  border-radius: 24px;
  object-fit: contain;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const AppShellActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 968px) {
    justify-content: center;
  }
`;

const AppShellButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px ${({ theme }) => `${theme.colors.primary}40`};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${({ theme }) =>
      theme.colors.primaryDark || theme.colors.primary};
    transform: translateY(-3px);
    box-shadow: 0 15px 40px ${({ theme }) => `${theme.colors.primary}50`};
  }

  &:active {
    transform: translateY(-1px);
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

const Footer = styled.footer`
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%)`
      : `linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)`};
  border-top: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  padding: 4rem 2rem 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: ${({ theme }) =>
      theme.mode === "dark"
        ? `linear-gradient(90deg, transparent 0%, ${theme.colors.primary}50 50%, transparent 100%)`
        : `linear-gradient(90deg, transparent 0%, ${theme.colors.primary}30 50%, transparent 100%)`};
  }

  @media (max-width: 768px) {
    padding: 3rem 1.5rem 1.5rem;
  }
`;

const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FooterTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const FooterLink = styled.a`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    justify-content: center;
    width: 100%;
  }
`;

const FooterText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
`;

const FooterBottom = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const FooterCopyright = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  margin: 0;
`;

const FooterSocial = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SocialLink = styled.a`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) =>
    theme.mode === "dark" ? theme.colors.surface : "#f1f5f9"};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => `${theme.colors.primary}40`};
  }
`;

// Componente Typewriter optimizado con ref para evitar re-renders
const TypewriterComponent = ({ texts, typingSpeed = 100, deletingSpeed = 50, pauseTime = 2000 }) => {
  const textRef = useRef(null);
  const currentTextIndexRef = useRef(0);
  const currentTextRef = useRef("");
  const isDeletingRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const updateText = () => {
      const currentFullText = texts[currentTextIndexRef.current];
      
      if (!isDeletingRef.current && currentTextRef.current === currentFullText) {
        // Pausa antes de empezar a borrar
        timeoutRef.current = setTimeout(() => {
          isDeletingRef.current = true;
          updateText();
        }, pauseTime);
      } else if (isDeletingRef.current && currentTextRef.current === "") {
        // Cambiar al siguiente texto después de borrar
        isDeletingRef.current = false;
        currentTextIndexRef.current = (currentTextIndexRef.current + 1) % texts.length;
        updateText();
      } else {
        // Escribir o borrar
        if (isDeletingRef.current) {
          currentTextRef.current = currentTextRef.current.slice(0, -1);
        } else {
          currentTextRef.current = currentFullText.slice(0, currentTextRef.current.length + 1);
        }
        
        // Actualizar el DOM directamente sin causar re-render
        if (textRef.current) {
          textRef.current.textContent = currentTextRef.current;
        }
        
        timeoutRef.current = setTimeout(updateText, isDeletingRef.current ? deletingSpeed : typingSpeed);
      }
    };

    // Iniciar el efecto
    updateText();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [texts, typingSpeed, deletingSpeed, pauseTime]);

  return <TypewriterText ref={textRef} />;
};

const ClientHomeComponent = () => {
  const { user } = useAuth();
  const { isDarkMode, theme } = useAppTheme();
  const navigate = useNavigate();
  const [productsInfo, setProductsInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [accessSections, setAccessSections] = useState([]);

  // Textos para el efecto typewriter
  const typewriterTexts = [
    "Explora catálogos exclusivos",
    "Gestiona tus pedidos fácilmente",
    "Accede a beneficios especiales"
  ];

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

    const fetchAccessSections = async () => {
      try {
        // Hacer todas las peticiones en paralelo
        const [response1, response2, response3] = await Promise.all([
          api_access_sections_get_permission_by_email_and_section(user.EMAIL, "APPSHELL"),
          api_access_sections_get_permission_by_email_and_section(user.EMAIL, "REENCAUCHE"),
          api_access_sections_get_permission_by_email_and_section(user.EMAIL, "XCOIN")
        ]);


        // Acumular las secciones que tienen acceso
        // Cuando tiene acceso: success: true, data: { objeto }
        // Cuando no tiene acceso: success: false, error: { message }
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

        // Actualizar el estado con todas las secciones encontradas
        setAccessSections(sections);
      } catch (error) {
        console.error("Error fetching access sections:", error);
        setAccessSections([]);
      }
      // const sio = 1;
      // if (sio === 1) {
      //   const response = await api_access_sections_create(
      //     user.EMAIL,
      //     "REENCAUCHE"
      //   );
      //   console.log("Access sections:", response);
      // }
    };
    fetchAccessSections();
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

  // Verificar acceso a secciones específicas basándose en accessSections
  const hasAppShellAccess = accessSections.some(
    (section) => section.SECTION_PERMITTED_USER === "APPSHELL"
  );
  
  const hasReencaucheAccess = accessSections.some(
    (section) => section.SECTION_PERMITTED_USER === "REENCAUCHE"
  );

  const hasXCoinAccess = accessSections.some(
    (section) => section.SECTION_PERMITTED_USER === "XCOIN"
  );

  const handleCardClick = (empresa, hasAccess) => {
    // Navegar al catálogo siempre, allí se manejará la solicitud de acceso si no tiene permisos
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
        title={`Bienvenido Mayorista`}
        description={`Portal de cliente ViiCommerce. Accede a catálogos de neumáticos, lubricantes y herramientas. Gestiona bonos de reencauche y explora productos de las mejores empresas.`}
        keywords="portal mayorista, catálogo productos, bonos reencauche, neumáticos, lubricantes, herramientas, ViiCommerce"
      />
      {/* Hero Section - Grid de Empresas */}
      <HeroSection id="inicio">
        <HeroBadge>Portal Mayorista ViiCommerce</HeroBadge>
        <HeroTitle>
          <TypewriterComponent texts={typewriterTexts} typingSpeed={100} deletingSpeed={50} pauseTime={2000} />
        </HeroTitle>
        <HeroSubtitle>
          Explora catálogos modernos, gestiona tus pedidos y accede a beneficios
          exclusivos de tus marcas favoritas en un solo lugar.
        </HeroSubtitle>

        <HeroCTAContainer>
          <HeroPrimaryButton
            text="Explorar catálogos"
            leftIconName="FaStore"
            onClick={() => {
              const element = document.querySelector("#empresas-grid");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}
          />
        </HeroCTAContainer>

      </HeroSection>

      {/* Sección de Empresas */}
      <CompaniesSection id="empresas-grid">
        <SectionTitle>Explora Nuestros Catálogos</SectionTitle>
        <SectionSubtitle>
          Descubre productos exclusivos de las mejores marcas del mercado
        </SectionSubtitle>
        <CompaniesGrid>
          {empresas.map((empresa) => {
            // Verificar si el usuario tiene acceso (comparando en mayúsculas)
            const hasAccess = userAccess.includes(empresa.nombre.toUpperCase());
            const productCount = getProductCount(empresa.nombre);

            return (
              <CompanyCard
                key={empresa.id}
                onClick={() => handleCardClick(empresa, hasAccess)}
                $hasAccess={hasAccess}
              >
                <AccessBadge $hasAccess={hasAccess}>
                  <AccessIcon>
                    <RenderIcon
                      name={hasAccess ? "FaCircleCheck" : "FaLock"}
                      size={14}
                    />
                  </AccessIcon>
                  {hasAccess ? "Disponible" : "Solicitar acceso"}
                </AccessBadge>

                <CardContent>
                  <CompanyLogo>
                    {/* <ProductCount>{productCount} productos</ProductCount> */}
                    <img src={getEmpresaLogo(empresa, isDarkMode)} alt={`Logo de ${empresa.nombre}`} />
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
      </CompaniesSection>

      {/* Sección de App Shell (solo si tiene acceso a APPSHELL) */}
      {hasAppShellAccess && (
        <AppShellSection id="club-shell-maxx">
          <AppShellContainer>
            <AppShellContent>
              <AppShellImage
                src={ClubShellMaxxImage}
                alt="Club Shell Maxx"
              />
              <AppShellTitle>App Club Shell Maxx</AppShellTitle>
              <AppShellDescription>
                Gana recompensas por tus compras. Cada compra te acerca a beneficios
                exclusivos, descuentos especiales y premios increíbles.
              </AppShellDescription>
              <AppShellFeatures>
                <AppShellFeature>
                  <RenderIcon name="FaCircleCheck" size={18} />
                  <span>Recompensas por cada compra</span>
                </AppShellFeature>
                <AppShellFeature>
                  <RenderIcon name="FaCircleCheck" size={18} />
                  <span>Descuentos y beneficios exclusivos</span>
                </AppShellFeature>
                <AppShellFeature>
                  <RenderIcon name="FaCircleCheck" size={18} />
                  <span>Canjea puntos por premios</span>
                </AppShellFeature>
              </AppShellFeatures>
              <AppShellActions>
                <AppShellButton
                  text="Descargar ahora"
                  leftIconName="FaMobile"
                  onClick={() => navigate(ROUTES.ECOMMERCE.APP_SHELL)}
                />
              </AppShellActions>
            </AppShellContent>
            <AppShellVisual>
              <AppShellVisualImage
                src={GraficoFuncionesClubShellMaxxImage}
                alt="Gráfico de funciones Club Shell Maxx"
              />
            </AppShellVisual>
          </AppShellContainer>
        </AppShellSection>
      )}

      {/* Sección de Sistema de Bonos (solo si tiene acceso a REENCAUCHE) */}
      {hasReencaucheAccess && (
        <ReencaucheSection id="bonos-haohua">
          <ReencaucheContainerReversed>
            <ReencaucheVisual>
              <ReencaucheVisualCircle>
                <ReencaucheIconLarge>
                  <RenderIcon name="FaTicket" size={120} />
                </ReencaucheIconLarge>
              </ReencaucheVisualCircle>
            </ReencaucheVisual>
            <ReencaucheContent>
              <ReencaucheIconWrapper>
                <RenderIcon name="FaTicket" size={40} style={{ color: "#f49f14" }} />
              </ReencaucheIconWrapper>
              <ReencaucheTitle>Bonos de Reencauche Haohua</ReencaucheTitle>
              <ReencaucheDescription>
                Gestiona los bonos de neumáticos de tus clientes de manera fácil y
                eficiente. Registra bonos por CI/RUC y mantén un control completo de
                todas tus transacciones.
              </ReencaucheDescription>
              <ReencaucheFeatures>
                <ReencaucheFeature>
                  <RenderIcon name="FaCircleCheck" size={18} />
                  <span>Registro por CI/RUC</span>
                </ReencaucheFeature>
                <ReencaucheFeature>
                  <RenderIcon name="FaCircleCheck" size={18} />
                  <span>Control completo de transacciones</span>
                </ReencaucheFeature>
                <ReencaucheFeature>
                  <RenderIcon name="FaCircleCheck" size={18} />
                  <span>Gestión fácil y eficiente</span>
                </ReencaucheFeature>
              </ReencaucheFeatures>
              <ReencaucheActions>
                <ReencaucheButton
                  text="¡Gestionar Mis Bonos!"
                  leftIconName="FaTicket"
                  onClick={() => navigate(ROUTES.ECOMMERCE.REENCAUCHE)}
                />
              </ReencaucheActions>
            </ReencaucheContent>
          </ReencaucheContainerReversed>
        </ReencaucheSection>
      )}

      {/* Sección de XCoin - Sistema de Recompensas (solo si tiene acceso a XCOIN) */}
      {hasXCoinAccess && (
        <XCoinSection id="xcoin">
        <XCoinContainer>
          <XCoinContent>
            <XCoinIconWrapper>
              <RenderIcon name="FaCoins" size={40} style={{ color: theme.colors.primary }} />
            </XCoinIconWrapper>
            <XCoinTitle>XCoin - Sistema de Recompensas</XCoinTitle>
            <XCoinDescription>
              Gana puntos con cada compra de llantas, llantas moto y herramientas.
              Canjea tus puntos por increíbles recompensas, descuentos exclusivos y
              beneficios especiales.
            </XCoinDescription>
            <XCoinFeatures>
              <XCoinFeature>
                <RenderIcon name="FaCircleCheck" size={18} />
                <span>Puntos por compras de llantas</span>
              </XCoinFeature>
              <XCoinFeature>
                <RenderIcon name="FaCircleCheck" size={18} />
                <span>Puntos por llantas moto</span>
              </XCoinFeature>
              <XCoinFeature>
                <RenderIcon name="FaCircleCheck" size={18} />
                <span>Puntos por herramientas</span>
              </XCoinFeature>
              <XCoinFeature>
                <RenderIcon name="FaCircleCheck" size={18} />
                <span>Canjea puntos por recompensas</span>
              </XCoinFeature>
            </XCoinFeatures>
            <XCoinActions>
              <XCoinButton
                text="Ver Catálogo de Recompensas"
                leftIconName="FaGift"
                onClick={() => navigate(ROUTES.ECOMMERCE.XCOIN)}
              />
            </XCoinActions>
          </XCoinContent>
          <XCoinVisual>
            <XCoinVisualCircle>
              <XCoinIconLarge>
                <RenderIcon name="FaCoins" size={120} />
              </XCoinIconLarge>
            </XCoinVisualCircle>
          </XCoinVisual>
        </XCoinContainer>
      </XCoinSection>
      )}

      {/* Footer */}
      <Footer>
        <FooterContainer>
          <FooterSection>
            <FooterTitle>Portal Mayorista</FooterTitle>
            <FooterText>
              Tu plataforma integral para gestionar catálogos, pedidos y beneficios exclusivos de las mejores marcas del mercado.
            </FooterText>
          </FooterSection>

          <FooterSection>
            <FooterTitle>Catálogos</FooterTitle>
            {empresas.slice(0, 4).map((empresa) => (
              <FooterLink
                key={empresa.id}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/catalogo/${empresa.nombre}`);
                }}
              >
                <RenderIcon name="FaStore" size={14} />
                {empresa.nombre}
              </FooterLink>
            ))}
          </FooterSection>

          <FooterSection>
            <FooterTitle>Servicios</FooterTitle>
            {hasAppShellAccess && (
              <FooterLink
                onClick={(e) => {
                  e.preventDefault();
                  navigate(ROUTES.ECOMMERCE.APP_SHELL);
                }}
              >
                <RenderIcon name="FaMobile" size={14} />
                Club Shell Maxx
              </FooterLink>
            )}
            {hasReencaucheAccess && (
              <FooterLink
                onClick={(e) => {
                  e.preventDefault();
                  navigate(ROUTES.ECOMMERCE.REENCAUCHE);
                }}
              >
                <RenderIcon name="FaTicket" size={14} />
                Bonos Haohua
              </FooterLink>
            )}
            {hasXCoinAccess && (
              <FooterLink
                onClick={(e) => {
                  e.preventDefault();
                  navigate(ROUTES.ECOMMERCE.XCOIN);
                }}
              >
                <RenderIcon name="FaCoins" size={14} />
                XCoin
              </FooterLink>
            )}
            <FooterLink
              onClick={(e) => {
                e.preventDefault();
                navigate("/mis-pedidos");
              }}
            >
              <RenderIcon name="FaBagShopping" size={14} />
              Mis Pedidos
            </FooterLink>
          </FooterSection>

          <FooterSection>
            <FooterTitle>Contacto</FooterTitle>
            <FooterText>
              ¿Necesitas ayuda? Estamos aquí para asistirte.
            </FooterText>
            <FooterLink
              onClick={(e) => {
                e.preventDefault();
                navigate(ROUTES.ECOMMERCE.CONTACTO);
              }}
            >
              <RenderIcon name="FaEnvelope" size={14} />
              Contáctanos
            </FooterLink>
            <FooterLink
              onClick={(e) => {
                e.preventDefault();
                navigate("/perfil");
              }}
            >
              <RenderIcon name="FaUser" size={14} />
              Mi Perfil
            </FooterLink>
          </FooterSection>
        </FooterContainer>

        <FooterBottom>
          <FooterCopyright>
            © {new Date().getFullYear()} ViiCommerce. Todos los derechos reservados.
          </FooterCopyright>
          <FooterSocial>
            <SocialLink
              href="#"
              onClick={(e) => e.preventDefault()}
              aria-label="Facebook"
            >
              <RenderIcon name="FaFacebook" size={18} />
            </SocialLink>
            <SocialLink
              href="#"
              onClick={(e) => e.preventDefault()}
              aria-label="LinkedIn"
            >
              <RenderIcon name="FaLinkedin" size={18} />
            </SocialLink>
            <SocialLink
              href="#"
              onClick={(e) => e.preventDefault()}
              aria-label="Email"
            >
              <RenderIcon name="FaEnvelope" size={18} />
            </SocialLink>
          </FooterSocial>
        </FooterBottom>
      </Footer>
    </>
  );
};

export default ClientHomeComponent;
