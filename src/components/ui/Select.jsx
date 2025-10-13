import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import Button from "./Button";

const SelectContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: ${({ width }) => width || "250px"};
`;

const Label = styled.label`
  text-align: left;
  font-size: 14px;
  color: ${({ $color, theme }) => $color || theme.colors.text};
`;

const SelectButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  cursor: pointer;
  text-align: left;
  appearance: none;
  outline: none;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
    box-shadow: none;
  }

  svg {
    transition: transform 0.2s ease;
    transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0)")};
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: ${({ $dropUp }) => ($dropUp ? "auto" : "100%")};
  bottom: ${({ $dropUp }) => ($dropUp ? "100%" : "auto")};
  left: 0;
  right: 0;
  margin-top: ${({ $dropUp }) => ($dropUp ? "0" : "4px")};
  margin-bottom: ${({ $dropUp }) => ($dropUp ? "4px" : "0")};
  max-height: ${({ $maxHeight }) => $maxHeight}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
`;

const SearchInputWrapper = styled.div`
  position: relative;
  padding: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px;
  padding-left: 32px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
  outline: none;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
`;

const OptionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: ${({ $hasSearch, $maxHeight }) =>
    $hasSearch ? `${$maxHeight - 58}px` : `${$maxHeight}px`};
  overflow-y: auto;

  /* Estilos personalizados para el scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.colors.background};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.textLight};
  }

  /* Para Firefox */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.border}
    ${({ theme }) => theme.colors.background};
`;

const OptionItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;
  color: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.primary : theme.colors.text};
  background-color: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.primaryLight + "33" : theme.colors.surface};
  font-weight: ${({ $isSelected }) => ($isSelected ? "500" : "normal")};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const NoResults = styled.div`
  padding: 12px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  font-style: italic;
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
            <FaSearch size={14} />
            <SearchInput
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
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
