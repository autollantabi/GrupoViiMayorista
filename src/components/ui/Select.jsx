import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import Button from "./Button";
import RenderIcon from "./RenderIcon";

const SelectContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: ${({ width }) => width || "250px"};
`;

const Label = styled.label`
  text-align: left;
  font-size: clamp(0.875rem, 2vw, 0.95rem);
  font-weight: 600;
  color: ${({ $color, theme }) => $color || theme.colors.text};
  margin-bottom: 0;
`;

const SelectButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.625rem 0.875rem;
  border-radius: 12px;
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
  font-size: clamp(0.9rem, 2vw, 1rem);
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  text-align: left;
  appearance: none;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ theme, disabled }) =>
    disabled
      ? "none"
      : theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.04)"};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}60` : `${theme.colors.border}50`};
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? "0 4px 12px rgba(0, 0, 0, 0.15)"
        : "0 4px 12px rgba(0, 0, 0, 0.06)"};
  }

  &:focus:not(:disabled) {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? `0 0 0 3px ${theme.colors.primary}25`
        : `0 0 0 3px ${theme.colors.primary}20`};
  }

  &:focus-visible:not(:disabled) {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? `0 0 0 3px ${theme.colors.primary}25`
        : `0 0 0 3px ${theme.colors.primary}20`};
  }

  &:disabled {
    opacity: 0.7;
  }

  svg {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0)")};
    color: ${({ theme, disabled }) =>
      disabled ? theme.colors.textSecondary : theme.colors.textSecondary};
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    font-size: 16px; /* Evitar zoom en iOS */
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: ${({ $dropUp }) => ($dropUp ? "auto" : "100%")};
  bottom: ${({ $dropUp }) => ($dropUp ? "100%" : "auto")};
  left: 0;
  right: 0;
  margin-top: ${({ $dropUp }) => ($dropUp ? "0" : "0.5rem")};
  margin-bottom: ${({ $dropUp }) => ($dropUp ? "0.5rem" : "0")};
  max-height: ${({ $maxHeight }) => $maxHeight}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid
    ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  border-radius: 12px;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 8px 24px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)"
      : "0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)"};
  z-index: 100;
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  overflow: hidden;
  animation: ${({ $isOpen }) =>
    $isOpen ? "fadeInDown 0.2s ease-out" : "none"};

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  padding: 0.625rem 0.875rem;
  border-bottom: 1px solid
    ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}30` : `${theme.colors.border}20`};

  svg {
    position: absolute;
    left: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textSecondary};
    z-index: 1;
    pointer-events: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  padding-left: 2.25rem;
  border-radius: 8px;
  border: 1px solid
    ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? `0 0 0 2px ${theme.colors.primary}20`
        : `0 0 0 2px ${theme.colors.primary}15`};
  }

  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? `0 0 0 2px ${theme.colors.primary}20`
        : `0 0 0 2px ${theme.colors.primary}15`};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder || theme.colors.textSecondary};
    opacity: 0.6;
  }
`;

const OptionsList = styled.ul`
  list-style: none;
  padding: 0.25rem;
  margin: 0;
  max-height: ${({ $hasSearch, $maxHeight }) =>
    $hasSearch ? `${$maxHeight - 60}px` : `${$maxHeight}px`};
  overflow-y: auto;

  /* Estilos personalizados para el scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}60` : `${theme.colors.border}50`};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) =>
      theme.mode === "dark" ? `${theme.colors.border}80` : `${theme.colors.border}70`};
  }

  /* Para Firefox */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}60` : `${theme.colors.border}50`}
    transparent;
`;

const OptionItem = styled.li`
  padding: 0.625rem 0.875rem;
  cursor: pointer;
  color: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.primary : theme.colors.text};
  background-color: ${({ theme, $isSelected }) =>
    $isSelected
      ? theme.mode === "dark"
        ? `${theme.colors.primary}20`
        : `${theme.colors.primary}10`
      : "transparent"};
  font-weight: ${({ $isSelected }) => ($isSelected ? "600" : "400")};
  font-size: 0.95rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-bottom: 0.125rem;

  &:hover {
    background-color: ${({ theme, $isSelected }) =>
      $isSelected
        ? theme.mode === "dark"
          ? `${theme.colors.primary}25`
          : `${theme.colors.primary}15`
        : theme.mode === "dark"
        ? `${theme.colors.background}80`
        : `${theme.colors.background}`};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const NoResults = styled.div`
  padding: 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
  font-size: 0.9rem;
`;

const Select = ({
  options = [],
  value = "",
  onChange,
  placeholder = "Seleccionar...",
  withSearch = false,
  searchPlaceholder = "Buscar...",
  width = "250px",
  labelKey = "label",
  valueKey = "value",
  preValue = "",
  postValue = "",
  label,
  name = "",
  id = "",
  disabled = false,
  maxHeight = 300,
  dropDirection = "auto", // "auto", "down", "up"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filtrar opciones basadas en el término de búsqueda
  const filteredOptions = options.filter((option) => {
    const label = option[labelKey];
    if (!label || typeof label !== "string") return false;
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Encontrar la opción seleccionada
  const selectedOption = options.find((option) => {
    const optionValue = option[valueKey];
    return (
      optionValue !== null && optionValue !== undefined && optionValue === value
    );
  });

  // Manejar clic fuera para cerrar dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus en el input de búsqueda cuando se abre el dropdown
  useEffect(() => {
    if (isOpen && withSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, withSearch]);

  // Escuchar cambios en el tamaño de la ventana para recalcular dirección
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        checkDropDirection();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  // Función para detectar si debe desplegarse hacia arriba
  const checkDropDirection = () => {
    // Si el usuario especificó una dirección manual, usarla
    if (dropDirection === "up") {
      setDropUp(true);
      return;
    } else if (dropDirection === "down") {
      setDropUp(false);
      return;
    }

    // Si es "auto", calcular automáticamente
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const dropdownHeight = maxHeight; // usar el maxHeight proporcionado
      const spaceBelow = windowHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Si no hay suficiente espacio abajo pero sí arriba, desplegar hacia arriba
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    }
  };

  const toggleDropdown = () => {
    if (!disabled) {
      if (!isOpen) {
        // Verificar dirección antes de abrir
        checkDropDirection();
      }
      setIsOpen(!isOpen);
      setSearchTerm("");
    }
  };

  const handleOptionSelect = (option) => {
    // Crear un objeto similar a un evento nativo para mantener compatibilidad
    // con código que espera e.target.value
    const syntheticEvent = {
      target: {
        name: name,
        value: option[valueKey],
      },
    };

    onChange(syntheticEvent);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <SelectContainer ref={containerRef} width={width}>
      {label && <Label>{label}</Label>}
      <SelectButton
        type="button"
        onClick={toggleDropdown}
        $isOpen={isOpen}
        disabled={disabled}
        text={
          selectedOption
            ? `${preValue} ${selectedOption[labelKey]} ${postValue}`
            : placeholder
        }
        rightIconName={"FaChevronDown"}
      />

      <DropdownMenu $isOpen={isOpen} $dropUp={dropUp} $maxHeight={maxHeight}>
        {withSearch && (
          <SearchInputWrapper>
            <RenderIcon name="FaMagnifyingGlass" size={16} />
            <SearchInput
              ref={searchInputRef}
              type="text"
              id={id ? `select-search-${id}` : (name ? `select-search-${name}` : 'select-search-default')}
              name={name ? `select-search-${name}` : (id ? `select-search-${id}` : 'select-search-default')}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoComplete="off"
            />
          </SearchInputWrapper>
        )}

        <OptionsList $hasSearch={withSearch} $maxHeight={maxHeight}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <OptionItem
                key={index}
                $isSelected={option[valueKey] === value}
                onClick={() => handleOptionSelect(option)}
              >
                {option[labelKey]}
              </OptionItem>
            ))
          ) : (
            <NoResults>No se encontraron resultados</NoResults>
          )}
        </OptionsList>
      </DropdownMenu>
    </SelectContainer>
  );
};

export default Select;
