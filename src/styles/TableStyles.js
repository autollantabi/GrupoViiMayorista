import styled from "styled-components";
import Button from "../components/ui/Button";

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  background-color: ${({ theme }) => theme.colors.surface};
  ${({ $bordered, theme }) => $bordered && `
    border: 1px solid ${theme.colors.border};
  `}
`;

export const TableHeader = styled.thead`
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const TableHeaderCell = styled.th`
  padding: 16px;
  text-align: ${({ $align }) => $align || "left"};
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 600;
  font-size: 0.95rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
  ${({ width }) => width && `width: ${width};`}
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  background-color: ${({ theme, $striped, index }) => 
    $striped && index % 2 !== 0 
      ? theme.mode === "dark" 
        ? theme.colors.backgroundAlt 
        : theme.colors.backgroundLight
      : theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color 0.2s;
  cursor: ${({ $clickable }) => $clickable ? "pointer" : "default"};

  &:hover {
    background-color: ${({ theme }) => theme.colors.border + "40"};
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const TableCell = styled.td`
  padding: 14px 16px;
  color: ${({ theme }) => theme.colors.text};
  vertical-align: middle;
  text-align: ${({ $align }) => $align || "left"};
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  margin-bottom: 24px;

  h3 {
    margin: 0 0 8px 0;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
`;

export const PageButton = styled(Button)`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.white : theme.colors.text};
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: ${({ theme, $active }) =>
      $active ? theme.colors.primaryDark : theme.colors.backgroundLight};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;