import React, { useState, useEffect } from "react";
import styled from "styled-components";
import RenderIcon from "../ui/RenderIcon";
import Input from "../ui/Input";
import Button from "../ui/Button";

const FiltersContainer = styled.div`
  display: none;

  width: 100%;
  @media (min-width: 1024px) {
    display: block;
    width: 290px;
    background: ${({ theme }) => theme.colors.surface};
    padding: 14px 24px;
    overflow-y: auto;
    z-index: 50;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
    flex: 0 0 290px;
    align-self: flex-start;
    height: 100%;

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
  }

  @media (min-width: 1024px) and (max-width: 1280px) {
    width: 240px;
    flex: 0 0 240px;
    padding: 12px 18px;
  }
`;

const FilterHeader = styled.div`
  padding-bottom: 6px;
`;

const FilterTitle = styled.h3`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 1024px) {
    font-size: 16px;
    gap: 10px;
  }
`;

const FilterOptionLabel = styled.span`
  font-size: 14px;
  color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary : theme.colors.text};
  font-weight: ${({ $isSelected }) => ($isSelected ? "600" : "400")};
  flex: 1;

  @media (max-width: 1024px) {
    font-size: 13px;
  }
`;

const FilterOptionCount = styled.span`
  font-size: 12px;
  color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary : theme.colors.textSecondary};
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primaryLight : theme.colors.background};
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  font-weight: ${({ $isSelected }) => ($isSelected ? "600" : "400")};

  @media (max-width: 1024px) {
    font-size: 11px;
    padding: 2px 5px;
    margin-left: 6px;
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  margin-top: 8px;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const FilterClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 10px;
  background: ${({ theme }) => theme.colors.error || "#ef4444"};
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: auto;
  height: auto;
  align-self: stretch;

  &:hover {
    background: ${({ theme }) => theme.colors.errorDark || "#dc2626"};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  @media (min-width: 1024px) {
    font-size: 11px;
    padding: 6px 10px;
    align-self: center;
  }
`;

// Componentes para el modal móvil
const MobileFilterContainer = styled.div`
  padding: 10px;
  display: block;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const MobileFilterButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0px;
  width: 100%;
  justify-content: center;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  width: 100%;
  max-height: 80vh;
  border-radius: 12px 12px 0 0;
  padding: 24px;
  overflow-y: auto;
  position: relative;

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

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  font-weight: 600;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ModalFiltersContainer = styled.div`
  @media (min-width: 1024px) {
    display: none;
  }
`;

// Componentes para filtros acordeonables
const AccordionFilter = styled.div`
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const AccordionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.background};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) =>
      theme.colors.backgroundHover || theme.colors.border};
  }

  @media (max-width: 1024px) {
    padding: 10px 14px;
  }
`;

const AccordionTitle = styled.h4`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (min-width: 1024px) {
    font-size: 15px;
  }
`;

const AccordionIcon = styled.div`
  transition: transform 0.2s ease;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0deg)")};
`;

const AccordionContent = styled.div`
  max-height: ${({ $isOpen }) => ($isOpen ? "700px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const FilterSearchContainer = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;

  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

const SearchInputContainer = styled.div`
  flex: 1;
  min-width: 0; /* Permite que el input se encoja correctamente */
`;

const FilterSearchInput = styled(Input)`
  font-size: 14px;
  width: 100%;
  min-width: 0;

  @media (max-width: 1024px) {
    font-size: 13px;
  }
`;

const FilterOptionsContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;
  padding: 12px;

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

const FilterOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 6px;
  border-radius: 6px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  border: 1px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.primary : "transparent"};
  background: ${({ $isSelected, $disabled, theme }) =>
    $disabled
      ? theme.colors.background
      : $isSelected
      ? theme.colors.primaryLight
      : "transparent"};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  font-size: 14px;

  @media (min-width: 1024px) {
    padding: 10px;
    font-size: 14px;
  }

  &:hover {
    background: ${({ $isSelected, $disabled, theme }) =>
      $disabled
        ? theme.colors.background
        : $isSelected
        ? theme.colors.primaryLight
        : theme.colors.background};
    border-color: ${({ $isSelected, $disabled, theme }) =>
      $disabled
        ? "transparent"
        : $isSelected
        ? theme.colors.primary
        : theme.colors.border};
  }
`;

const SearchContainer = styled.div`
  margin: 10px 0 10px 0;

  @media (min-width: 1024px) {
    margin: 10px 0 10px 0;
  }
`;

const SelectedIndicator = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.8em;
`;

const InfoMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  margin: 0;
  padding: ${({ $withPadding }) => ($withPadding ? "8px" : "0")};

  @media (max-width: 1024px) {
    font-size: 13px;
  }
`;

const ClearSection = styled.div`
  padding: 8px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ClearAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.colors.error || "#ef4444"};
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  justify-content: center;
  margin: 0 0 10px 0;

  @media (max-width: 1024px) {
    font-size: 13px;
    padding: 8px 14px;
    gap: 6px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.errorDark || "#dc2626"};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const AdditionalFilters = ({
  filters = [],
  selectedValues = {},
  onFilterSelect,
  onClearFilter,
  searchQuery = "",
  onSearchChange,
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({});
  const [filterSearches, setFilterSearches] = useState({});

  useEffect(() => {
    setLocalSearchQuery(searchQuery || "");
  }, [searchQuery]);

  // Efecto para abrir ciertos filtros por defecto cuando cambien los filtros disponibles
  useEffect(() => {
    // Filtros que deben empezar abiertos por defecto
    const defaultOpenFilters = ["DMA_MARCA", "DMA_GRUPO"];

    setOpenAccordions((prevOpen) => {
      const newOpen = { ...prevOpen };

      // Abrir los filtros que están en la lista de defaultOpenFilters
      filters.forEach((filter) => {
        if (defaultOpenFilters.includes(filter.id) && !(filter.id in newOpen)) {
          newOpen[filter.id] = true;
        }
      });

      return newOpen;
    });
  }, [filters]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleFilterSelect = (filterId, value) => {
    onFilterSelect(filterId, value);
    // Cerrar modal después de seleccionar un filtro
    closeModal();
  };

  const toggleAccordion = (filterId) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [filterId]: !prev[filterId],
    }));
  };

  const handleFilterSearch = (filterId, value) => {
    setFilterSearches((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const getFilteredOptions = (options, filterId) => {
    const searchTerm = filterSearches[filterId] || "";
    if (!searchTerm) return options;

    return options.filter((option) =>
      String(option.label || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  };

  // Función para limpiar todos los filtros adicionales
  const handleClearAllFilters = () => {
    // Obtener todos los filtros adicionales seleccionados (los que empiezan con DMA_)
    const additionalFilterIds = Object.keys(selectedValues).filter((key) =>
      key.startsWith("DMA_")
    );

    // Limpiar cada filtro
    additionalFilterIds.forEach((filterId) => {
      if (onClearFilter) {
        onClearFilter(filterId);
      }
    });
  };

  // Verificar si hay filtros adicionales seleccionados
  const hasSelectedFilters = Object.keys(selectedValues).some((key) =>
    key.startsWith("DMA_")
  );

  if (filters.length === 0) {
    return (
      <>
        <MobileFilterContainer>
          {/* Botón para abrir modal en móvil */}
          <MobileFilterButton
            variant="primary"
            backgroundColor={({ theme }) => theme.colors.primary}
            color={({ theme }) => theme.colors.white}
            onClick={openModal}
            leftIconName="FaFilter"
            text="Filtros y Búsqueda"
          />
        </MobileFilterContainer>

        {/* Modal para móvil */}
        {isModalOpen && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <RenderIcon name="FaFilter" size={16} />
                  Filtros y Búsqueda
                </ModalTitle>
                <CloseButton onClick={closeModal}>
                  <RenderIcon name="FaTimes" size={18} />
                </CloseButton>
              </ModalHeader>

              <SearchContainer>
                <Input
                  type="text"
                  id="search-products-modal"
                  name="search-products-modal"
                  placeholder="Buscar productos..."
                  value={localSearchQuery}
                  onChange={handleSearchChange}
                  leftIconName="FaSearch"
                  autoComplete="off"
                />
              </SearchContainer>

              <InfoMessage>
                No hay filtros adicionales disponibles para esta selección.
              </InfoMessage>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* Sidebar para desktop */}
        <FiltersContainer>
          <FilterHeader>
            <FilterTitle>
              <RenderIcon name="FaFilter" size={16} />
              Filtros
            </FilterTitle>
          </FilterHeader>

          <SearchContainer>
            <Input
              type="text"
              id="search-products-sidebar-empty"
              name="search-products-sidebar-empty"
              placeholder="Buscar productos..."
              value={localSearchQuery}
              onChange={handleSearchChange}
              leftIconName="FaSearch"
              autoComplete="off"
            />
          </SearchContainer>

          <InfoMessage>
            No hay filtros adicionales disponibles para esta selección.
          </InfoMessage>
        </FiltersContainer>
      </>
    );
  }

  return (
    <>
      <MobileFilterContainer>
        {/* Botón para abrir modal en móvil */}
        <MobileFilterButton
          variant="primary"
          backgroundColor={({ theme }) => theme.colors.primary}
          color={({ theme }) => theme.colors.white}
          onClick={openModal}
          leftIconName="FaFilter"
          text="Filtros y Búsqueda"
        />
      </MobileFilterContainer>

      {/* Modal para móvil */}
      {isModalOpen && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <RenderIcon name="FaFilter" size={16} />
                Filtros y Búsqueda
              </ModalTitle>
              <CloseButton onClick={closeModal}>
                <RenderIcon name="FaTimes" size={18} />
              </CloseButton>
            </ModalHeader>

            <SearchContainer>
              <Input
                type="text"
                id="search-products-modal-filters"
                name="search-products-modal-filters"
                placeholder="Buscar productos..."
                value={localSearchQuery}
                onChange={handleSearchChange}
                leftIconName="FaSearch"
                autoComplete="off"
              />
            </SearchContainer>

            {hasSelectedFilters && (
              <ClearAllButton onClick={handleClearAllFilters}>
                <RenderIcon name="FaTrash" size={14} />
                Limpiar Todos los Filtros
              </ClearAllButton>
            )}

            <ModalFiltersContainer>
              {filters.map((filter) => {
                const isOpen = openAccordions[filter.id] || false;
                const filteredOptions = getFilteredOptions(
                  filter.options,
                  filter.id
                );

                return (
                  <AccordionFilter key={filter.id}>
                    <AccordionHeader onClick={() => toggleAccordion(filter.id)}>
                      <AccordionTitle>
                        <RenderIcon name="FaTag" size={14} />
                        {filter.name}
                        {selectedValues[filter.id] && (
                          <SelectedIndicator>(Seleccionado)</SelectedIndicator>
                        )}
                      </AccordionTitle>
                      <AccordionIcon $isOpen={isOpen}>
                        <RenderIcon name="FaChevronDown" size={14} />
                      </AccordionIcon>
                    </AccordionHeader>

                    <AccordionContent $isOpen={isOpen}>
                      <FilterSearchContainer>
                        <SearchInputWrapper>
                          <SearchInputContainer>
                            <FilterSearchInput
                              type="text"
                              id={`filter-search-${filter.id}-modal`}
                              name={`filter-search-${filter.id}-modal`}
                              placeholder={`Buscar ...`}
                              value={filterSearches[filter.id] || ""}
                              onChange={(e) =>
                                handleFilterSearch(filter.id, e.target.value)
                              }
                              autoComplete="off"
                            />
                          </SearchInputContainer>
                          {selectedValues[filter.id] && (
                            <FilterClearButton
                              onClick={() => onClearFilter(filter.id)}
                            >
                              <RenderIcon name="FaTimes" size={12} />
                              Limpiar
                            </FilterClearButton>
                          )}
                        </SearchInputWrapper>
                      </FilterSearchContainer>

                      <FilterOptionsContainer>
                        {filteredOptions.length > 0 ? (
                          filteredOptions.map((option) => (
                            <FilterOption
                              key={option.value}
                              $isSelected={
                                selectedValues[filter.id] === option.value
                              }
                              $disabled={option.disabled}
                              onClick={() => {
                                if (!option.disabled) {
                                  handleFilterSelect(filter.id, option.value);
                                }
                              }}
                            >
                              <FilterOptionLabel
                                $isSelected={
                                  selectedValues[filter.id] === option.value
                                }
                              >
                                {option.label}
                              </FilterOptionLabel>
                              <FilterOptionCount
                                $isSelected={
                                  selectedValues[filter.id] === option.value
                                }
                              >
                                {option.count}
                              </FilterOptionCount>
                            </FilterOption>
                          ))
                        ) : (
                          <InfoMessage $withPadding>
                            No se encontraron opciones
                          </InfoMessage>
                        )}
                      </FilterOptionsContainer>
                    </AccordionContent>
                  </AccordionFilter>
                );
              })}
            </ModalFiltersContainer>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Sidebar para desktop */}
      <FiltersContainer>
        <FilterHeader>
          <FilterTitle>
            <RenderIcon name="FaFilter" size={16} />
            Filtros
          </FilterTitle>
        </FilterHeader>

        <SearchContainer>
          <Input
            type="text"
            id="search-products-sidebar"
            name="search-products-sidebar"
            placeholder="Buscar productos..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            leftIconName="FaSearch"
            autoComplete="off"
          />
        </SearchContainer>

        {hasSelectedFilters && (
          <ClearAllButton onClick={handleClearAllFilters}>
            <RenderIcon name="FaTrash" size={14} />
            Limpiar Todos los Filtros
          </ClearAllButton>
        )}

        {filters.map((filter) => {
          const isOpen = openAccordions[filter.id] || false;
          const filteredOptions = getFilteredOptions(filter.options, filter.id);

          return (
            <AccordionFilter key={filter.id}>
              <AccordionHeader onClick={() => toggleAccordion(filter.id)}>
                <AccordionTitle>
                  {filter.name}
                  {selectedValues[filter.id] && (
                    <SelectedIndicator>(Seleccionado)</SelectedIndicator>
                  )}
                </AccordionTitle>
                <AccordionIcon $isOpen={isOpen}>
                  <RenderIcon name="FaChevronDown" size={14} />
                </AccordionIcon>
              </AccordionHeader>

              <AccordionContent $isOpen={isOpen}>
                <FilterSearchContainer>
                  <SearchInputWrapper>
                    <SearchInputContainer>
                      <FilterSearchInput
                        type="text"
                        id={`filter-search-${filter.id}-sidebar`}
                        name={`filter-search-${filter.id}-sidebar`}
                        placeholder={`Buscar ...`}
                        value={filterSearches[filter.id] || ""}
                        onChange={(e) =>
                          handleFilterSearch(filter.id, e.target.value)
                        }
                        autoComplete="off"
                      />
                    </SearchInputContainer>
                    {selectedValues[filter.id] && (
                      <FilterClearButton
                        onClick={() => onClearFilter(filter.id)}
                      >
                        <RenderIcon name="FaTimes" size={12} />
                        Limpiar
                      </FilterClearButton>
                    )}
                  </SearchInputWrapper>
                </FilterSearchContainer>

                <FilterOptionsContainer>
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <FilterOption
                        key={option.value}
                        $isSelected={selectedValues[filter.id] === option.value}
                        $disabled={option.disabled}
                        onClick={() => {
                          if (!option.disabled) {
                            onFilterSelect(filter.id, option.value);
                          }
                        }}
                      >
                        <FilterOptionLabel
                          $isSelected={
                            selectedValues[filter.id] === option.value
                          }
                        >
                          {option.label}
                        </FilterOptionLabel>
                        <FilterOptionCount
                          $isSelected={
                            selectedValues[filter.id] === option.value
                          }
                        >
                          {option.count}
                        </FilterOptionCount>
                      </FilterOption>
                    ))
                  ) : (
                    <InfoMessage $withPadding>
                      No se encontraron opciones
                    </InfoMessage>
                  )}
                </FilterOptionsContainer>
              </AccordionContent>
            </AccordionFilter>
          );
        })}
      </FiltersContainer>
    </>
  );
};

export default AdditionalFilters;
