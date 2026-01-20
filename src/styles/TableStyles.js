import styled from "styled-components";
import Button from "../components/ui/Button";

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 2rem;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)"};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  ${({ $bordered, theme }) => $bordered && `
    border: 1px solid ${theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  `}

  @media (max-width: 768px) {
    border-radius: 16px;
  }
`;

export const TableHeader = styled.thead`
  background-color: ${({ theme }) => theme.colors.surface};
  position: sticky;
  top: 0;
  z-index: 10;
`;

export const TableHeaderCell = styled.th`
  padding: 1.25rem 1.5rem;
  text-align: ${({ $align }) => $align || "left"};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  font-size: clamp(0.85rem, 2vw, 0.95rem);
  border-bottom: 2px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  white-space: nowrap;
  background-color: ${({ theme }) => theme.colors.surface};
  ${({ width }) => width && `width: ${width};`}

  &:first-child {
    border-top-left-radius: 20px;
  }

  &:last-child {
    border-top-right-radius: 20px;
  }

  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
    font-size: 0.85rem;
  }
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  background-color: ${({ theme, $striped, $isEven }) => {
    if (!$striped) {
      return theme.colors.surface;
    }
    // Si es par (índice impar en 0-based), usar fondo alternado
    return $isEven
      ? theme.mode === "dark"
        ? `${theme.colors.background}80`
        : `${theme.colors.background}`
      : theme.colors.surface;
  }};
  border-bottom: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}20` : `${theme.colors.border}15`};
  transition: all 0.2s ease;
  cursor: ${({ $clickable }) => $clickable ? "pointer" : "default"};

  &:hover {
    background-color: ${({ theme, $clickable, $striped, $isEven }) => {
      if ($clickable) {
        return theme.mode === "dark"
          ? `${theme.colors.primary}12`
          : `${theme.colors.primary}08`;
      }
      // Mantener el patrón intercalado en hover
      if ($striped && $isEven) {
        return theme.mode === "dark"
          ? `${theme.colors.background}90`
          : `${theme.colors.background}`;
      }
      return theme.mode === "dark"
        ? `${theme.colors.background}60`
        : `${theme.colors.background}80`;
    }};
    transform: ${({ $clickable }) => ($clickable ? "scale(1.01)" : "none")};
    box-shadow: ${({ $clickable, theme }) =>
      $clickable
        ? theme.mode === "dark"
          ? "0 2px 8px rgba(0, 0, 0, 0.1)"
          : "0 2px 8px rgba(0, 0, 0, 0.05)"
        : "none"};
  }

  &:last-child {
    border-bottom: none;
    
    td:first-child {
      border-bottom-left-radius: 20px;
    }
    
    td:last-child {
      border-bottom-right-radius: 20px;
    }
  }

  @media (max-width: 768px) {
    &:hover {
      transform: none;
    }
  }
`;

export const TableCell = styled.td`
  padding: 1.125rem 1.5rem;
  color: ${({ theme }) => theme.colors.text};
  vertical-align: middle;
  text-align: ${({ $align }) => $align || "left"};
  font-size: 0.95rem;
  line-height: 1.5;

  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
    font-size: 0.9rem;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)"};
  margin-bottom: 2rem;

  h3 {
    margin: 0 0 0.75rem 0;
    color: ${({ theme }) => theme.colors.text};
    font-size: clamp(1.2rem, 3vw, 1.4rem);
    font-weight: 700;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1rem;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
    border-radius: 16px;
  }
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.04)"};
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}30` : `${theme.colors.border}20`};

  @media (max-width: 768px) {
    gap: 0.375rem;
    padding: 0.875rem;
    border-radius: 12px;
  }
`;

export const PageButton = styled.button`
  padding: 0.625rem 1rem;
  border: 1px solid ${({ theme, $active }) =>
    $active
      ? theme.colors.primary
      : theme.mode === "dark"
      ? `${theme.colors.border}40`
      : `${theme.colors.border}30`};
  background-color: ${({ theme, $active }) =>
    $active
      ? theme.colors.primary
      : theme.mode === "dark"
      ? `${theme.colors.background}80`
      : theme.colors.surface};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.white : theme.colors.text};
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: ${({ theme, $active }) =>
      $active
        ? theme.colors.primaryDark || theme.colors.primary
        : theme.mode === "dark"
        ? `${theme.colors.primary}15`
        : `${theme.colors.primary}08`};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => `${theme.colors.primary}30`};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    min-width: 36px;
    border-radius: 8px;
  }
`;