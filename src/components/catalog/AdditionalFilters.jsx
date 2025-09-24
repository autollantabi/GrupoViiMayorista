import React, { useState, useEffect } from "react";
import styled from "styled-components";
import RenderIcon from "../ui/RenderIcon";
import Input from "../ui/Input";
import Button from "../ui/Button";

const FiltersContainer = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: block;
    width: 290px;
    background: ${({ theme }) => theme.colors.surface};
    padding: 24px;
    overflow-y: auto;
    height: calc(100vh - 250px);
    position: sticky;
    top: 169px;
    margin-right: 20px;
    z-index: 50;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
    border-radius: 12px;
  }
`;

const FilterHeader = styled.div`
  padding-bottom: 16px;
`;

const FilterTitle = styled.h3`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FilterOptionLabel = styled.span`
  font-size: 14px;
  color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary : theme.colors.text};
  font-weight: ${({ $isSelected }) => ($isSelected ? "600" : "400")};
  flex: 1;
`;

const FilterOptionCount = styled.span`
  font-size: 12px;
  color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary : theme.colors.textSecondary};
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primaryLight : '#f5f5f5'};
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  font-weight: ${({ $isSelected }) => ($isSelected ? "600" : "400")};
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f5f5f5;
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
  margin-bottom: 16px;
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
    background: #f5f5f5;
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
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e0e0e0;
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
    font-size: 16px;
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
  border-bottom: 1px solid #e0e0e0;
`;

const FilterSearchInput = styled(Input)`
  font-size: 14px;
`;

const FilterOptionsContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;
  padding: 12px;
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
      ? "#f5f5f5"
      : $isSelected
      ? theme.colors.primaryLight
      : "transparent"};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  font-size: 14px;

  @media (min-width: 1024px) {
    padding: 12px;
    font-size: 16px;
  }

  &:hover {
    background: ${({ $isSelected, $disabled, theme }) =>
      $disabled
        ? "#f5f5f5"
        : $isSelected
        ? theme.colors.primaryLight
        : "#f5f5f5"};
    border-color: ${({ $isSelected, $disabled, theme }) =>
      $disabled
        ? "transparent"
        : $isSelected
        ? theme.colors.primary
        : theme.colors.border};
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 16px;

  @media (min-width: 1024px) {
    margin-bottom: 24px;
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

  // Efecto para abrir ciertos filtros por defecto cuando cambien los filtros disponibles
  useEffect(() => {
    // Filtros que deben empezar abiertos por defecto
    const defaultOpenFilters = ['DMA_MARCA', 'DMA_SUBGRUPO'];
    
    setOpenAccordions(prevOpen => {
      const newOpen = { ...prevOpen };
      
      // Abrir los filtros que están en la lista de defaultOpenFilters
      filters.forEach(filter => {
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
    setOpenAccordions(prev => ({
      ...prev,
      [filterId]: !prev[filterId]
    }));
  };

  const handleFilterSearch = (filterId, value) => {
    setFilterSearches(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const getFilteredOptions = (options, filterId) => {
    const searchTerm = filterSearches[filterId] || '';
    if (!searchTerm) return options;
    
    return options.filter(option =>
      String(option.label || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (filters.length === 0) {
    return (
      <>
        <MobileFilterContainer>
          {/* Botón para abrir modal en móvil */}
          <MobileFilterButton
            variant="secondary"
            onClick={openModal}
            leftIconName="FaFilter"
          >
            Filtros y Búsqueda
          </MobileFilterButton>
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
                  placeholder="Buscar productos..."
                  value={localSearchQuery}
                  onChange={handleSearchChange}
                  leftIconName="FaSearch"
                />
              </SearchContainer>

              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                No hay filtros adicionales disponibles para esta selección.
              </p>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* Sidebar para desktop */}
        <FiltersContainer>
          <FilterHeader>
            <FilterTitle>
              <RenderIcon name="FaFilter" size={16} />
              Filtros Adicionales
            </FilterTitle>
          </FilterHeader>

          <SearchContainer>
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={localSearchQuery}
              onChange={handleSearchChange}
              leftIconName="FaSearch"
            />
          </SearchContainer>

          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            No hay filtros adicionales disponibles para esta selección.
          </p>
        </FiltersContainer>
      </>
    );
  }

  return (
      <>
        <MobileFilterContainer>
          {/* Botón para abrir modal en móvil */}
          <MobileFilterButton
            variant="secondary"
            onClick={openModal}
            leftIconName="FaFilter"
          >
            Filtros y Búsqueda (
            {
              Object.keys(selectedValues).filter((key) => key.startsWith("DMA_"))
                .length
            }
            )
          </MobileFilterButton>
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
                placeholder="Buscar productos..."
                value={localSearchQuery}
                onChange={handleSearchChange}
                leftIconName="FaSearch"
              />
            </SearchContainer>

            <ModalFiltersContainer>
              {filters.map((filter) => {
                const isOpen = openAccordions[filter.id] || false;
                const filteredOptions = getFilteredOptions(filter.options, filter.id);
                
                return (
                  <AccordionFilter key={filter.id}>
                    <AccordionHeader onClick={() => toggleAccordion(filter.id)}>
                      <AccordionTitle>
                        <RenderIcon name="FaTag" size={14} />
                        {filter.name}
                        {selectedValues[filter.id] && (
                          <span style={{ color: 'var(--primary-color)', fontSize: '0.8em' }}>
                            (Seleccionado)
                          </span>
                        )}
                      </AccordionTitle>
                      <AccordionIcon $isOpen={isOpen}>
                        <RenderIcon name="FaChevronDown" size={14} />
                      </AccordionIcon>
                    </AccordionHeader>
                    
                    <AccordionContent $isOpen={isOpen}>
                      <FilterSearchContainer>
                        <FilterSearchInput
                          type="text"
                          placeholder={`Buscar ...`}
                          value={filterSearches[filter.id] || ''}
                          onChange={(e) => handleFilterSearch(filter.id, e.target.value)}
                          leftIconName="FaSearch"
                        />
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
                                  handleFilterSelect(filter.id, option.value);
                                }
                              }}
                            >
                              <FilterOptionLabel
                                $isSelected={selectedValues[filter.id] === option.value}
                              >
                                {option.label}
                              </FilterOptionLabel>
                              <FilterOptionCount
                                $isSelected={selectedValues[filter.id] === option.value}
                              >
                                {option.count}
                              </FilterOptionCount>
                            </FilterOption>
                          ))
                        ) : (
                          <p style={{ color: '#666', fontSize: '14px', margin: 0, padding: '8px' }}>
                            No se encontraron opciones
                          </p>
                        )}
                      </FilterOptionsContainer>
                      
                      {selectedValues[filter.id] && (
                        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-color)' }}>
                          <ClearButton onClick={() => onClearFilter(filter.id)}>
                            <RenderIcon name="FaTimes" size={12} />
                            Limpiar
                          </ClearButton>
                        </div>
                      )}
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
            Filtros Adicionales
          </FilterTitle>
        </FilterHeader>

        <SearchContainer>
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            leftIconName="FaSearch"
          />
        </SearchContainer>

        {filters.map((filter) => {
          const isOpen = openAccordions[filter.id] || false;
          const filteredOptions = getFilteredOptions(filter.options, filter.id);
          
          return (
            <AccordionFilter key={filter.id}>
              <AccordionHeader onClick={() => toggleAccordion(filter.id)}>
                <AccordionTitle>
                  {filter.name}
                  {selectedValues[filter.id] && (
                    <span style={{ color: 'var(--primary-color)', fontSize: '0.8em' }}>
                      (Seleccionado)
                    </span>
                  )}
                </AccordionTitle>
                <AccordionIcon $isOpen={isOpen}>
                  <RenderIcon name="FaChevronDown" size={14} />
                </AccordionIcon>
              </AccordionHeader>
              
              <AccordionContent $isOpen={isOpen}>
                <FilterSearchContainer>
                  <FilterSearchInput
                    type="text"
                    placeholder={`Buscar ...`}
                    value={filterSearches[filter.id] || ''}
                    onChange={(e) => handleFilterSearch(filter.id, e.target.value)}
                    leftIconName="FaSearch"
                  />
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
                          $isSelected={selectedValues[filter.id] === option.value}
                        >
                          {option.label}
                        </FilterOptionLabel>
                        <FilterOptionCount
                          $isSelected={selectedValues[filter.id] === option.value}
                        >
                          {option.count}
                        </FilterOptionCount>
                      </FilterOption>
                    ))
                  ) : (
                    <p style={{ color: '#666', fontSize: '14px', margin: 0, padding: '8px' }}>
                      No se encontraron opciones
                    </p>
                  )}
                </FilterOptionsContainer>
                
                {selectedValues[filter.id] && (
                  <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-color)' }}>
                    <ClearButton onClick={() => onClearFilter(filter.id)}>
                      <RenderIcon name="FaTimes" size={12} />
                      Limpiar
                    </ClearButton>
                  </div>
                )}
              </AccordionContent>
            </AccordionFilter>
          );
        })}
      </FiltersContainer>
    </>
  );
};

export default AdditionalFilters;