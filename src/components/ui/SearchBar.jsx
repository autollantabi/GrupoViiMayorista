import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import RenderIcon from "./RenderIcon";

const SearchInputWrapper = styled.div`
  position: relative;
  width: ${({ width }) => width || "100%"};
  display: flex;
  align-items: center;

  > svg:first-child {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textSecondary};
    z-index: 1;
    pointer-events: none;
  }

  > svg:last-child {
    position: absolute;
    right: ${({ $hasClearButton }) => ($hasClearButton ? "2.25rem" : "0.75rem")};
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textSecondary};
    z-index: 1;
    pointer-events: none;
  }
`;

const SearchInput = styled.input`
  padding: 0.625rem 0.875rem;
  padding-left: ${({ $hasLeftIcon }) => ($hasLeftIcon ? "2.25rem" : "0.875rem")};
  padding-right: ${({ $hasRightIcon, $hasClearButton }) => {
    if ($hasClearButton) return "2.25rem";
    if ($hasRightIcon) return "2.25rem";
    return "0.875rem";
  }};
  border-radius: 12px;
  border: 1px solid
    ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(0.9rem, 2vw, 1rem);
  width: 100%;
  height: ${({ height }) => height || "auto"};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.04)"};

  &:hover:not(:focus) {
    border-color: ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}60` : `${theme.colors.border}50`};
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? "0 4px 12px rgba(0, 0, 0, 0.15)"
        : "0 4px 12px rgba(0, 0, 0, 0.06)"};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? `0 0 0 3px ${theme.colors.primary}25`
        : `0 0 0 3px ${theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder || theme.colors.textSecondary};
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    font-size: 16px; /* Evitar zoom en iOS */
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  z-index: 2;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.background}80`
        : `${theme.colors.background}`};
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

/**
 * Componente de barra de búsqueda reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {string} props.value - Valor actual del campo de búsqueda
 * @param {Function} props.onChange - Función para manejar cambios en el valor
 * @param {string} props.placeholder - Texto de placeholder
 * @param {number} props.debounceTime - Tiempo de espera para debounce en ms (0 para deshabilitar)
 * @param {string} props.width - Ancho del componente (ej: "100%", "300px")
 * @param {string} props.height - Altura del componente (ej: "40px")
 * @param {string} props.iconName - Nombre del icono (FaMagnifyingGlass por defecto)
 * @param {string} props.iconPosition - Posición del icono ("left" o "right")
 * @param {boolean} props.showClearButton - Mostrar botón para limpiar el campo
 * @param {Function} props.onSearch - Función que se ejecuta al realizar búsqueda (enter)
 */
const SearchBar = ({
  value = "",
  onChange,
  placeholder = "Buscar...",
  debounceTime = 300,
  width = "100%",
  height,
  iconName = "FaMagnifyingGlass",
  iconPosition = "left",
  showClearButton = true,
  onSearch,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const debounceTimerRef = useRef(null);

  // Sincronizar valor interno con el prop value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Manejar cambio con debounce opcional
  const handleChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    if (debounceTime > 0) {
      // Cancelar el timer anterior si existe
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Crear un nuevo timer
      debounceTimerRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceTime);
    } else {
      // Sin debounce
      onChange(newValue);
    }
  };

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Manejar evento de limpiar
  const handleClear = () => {
    setInternalValue("");
    onChange("");
    
    // Cancelar cualquier debounce pendiente
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  // Manejar tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) {
      // Cancelar cualquier debounce pendiente
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      onSearch(internalValue);
    }
  };

  const hasLeftIcon = iconPosition === "left";
  const hasRightIcon = iconPosition === "right";
  const hasClearButton = showClearButton && internalValue;

  return (
    <SearchInputWrapper width={width} $hasClearButton={hasClearButton} {...props}>
      {hasLeftIcon && <RenderIcon name={iconName} size={18} />}
      
      <SearchInput
        type="text"
        id={props.id || "search-bar"}
        name={props.name || "search-bar"}
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        $hasLeftIcon={hasLeftIcon}
        $hasRightIcon={hasRightIcon}
        $hasClearButton={hasClearButton}
        height={height}
        autoComplete="off"
      />
      
      {hasRightIcon && <RenderIcon name={iconName} size={18} />}
      
      {hasClearButton && (
        <ClearButton onClick={handleClear} type="button">
          <RenderIcon name="FaXmark" size={16} />
        </ClearButton>
      )}
    </SearchInputWrapper>
  );
};

export default SearchBar;