import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { FaSearch } from "react-icons/fa";
import RenderIcon from "./RenderIcon";

const SearchInputWrapper = styled.div`
  position: relative;
  width: ${({ width }) => width || "100%"};

  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const SearchInput = styled.input`
  padding: 10px;
  padding-left: 30px;
  padding-right: 30px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  width: 100%;
  height: ${({ height }) => height || "auto"};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 35px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
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
 * @param {string} props.iconName - Nombre del icono (FaSearch por defecto)
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
  iconName = "FaSearch",
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

  return (
    <SearchInputWrapper width={width} {...props}>
      {iconPosition === "left" && <RenderIcon name={iconName} size={16} />}
      
      <SearchInput
        type="text"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        $iconPosition={iconPosition}
        height={height}
      />
      
      {iconPosition === "right" && <RenderIcon name={iconName} size={16} />}
      
      {showClearButton && internalValue && (
        <ClearButton onClick={handleClear} type="button">
          <RenderIcon name="FaTimes" size={14} />
        </ClearButton>
      )}
    </SearchInputWrapper>
  );
};

export default SearchBar;