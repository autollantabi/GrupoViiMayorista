import React from "react";
import styled from "styled-components";
import RenderIcon from "../ui/RenderIcon";

const BreadcrumbContainer = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${({ theme }) => theme.colors.surface};
  padding: 10px 24px;

  @media (max-width: 768px) {
    padding: 16px 20px;
    margin-bottom: 2px;
  }
`;

const BreadcrumbContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: stretch;

  @media (min-width: 1024px) {
    flex-direction: row;
    gap: 24px;
    align-items: center;
    min-height: 100%;
  }
`;

const BreadcrumbSection = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  @media (min-width: 1024px) {
    margin-bottom: 0;
    height: 100%;
  }

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
`;

const BreadcrumbSectionLines = styled(BreadcrumbSection)`
  @media (min-width: 1024px) {
    flex: 1;
    max-width: 33.333%;
  }
`;

const BreadcrumbSectionFilters = styled(BreadcrumbSection)`
  @media (min-width: 1024px) {
    flex: 2;
    max-width: 66.666%;
  }
`;

const BreadcrumbList = styled.ol`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
`;

const BreadcrumbItemWithSeparator = styled.li`
  display: flex;
  align-items: center;
  font-size: 0.9rem;

  &:not(:last-child)::after {
    content: ">";
    margin: 0 8px;
    color: ${({ theme }) => theme.colors.textLight};
    font-weight: 600;

    @media (max-width: 768px) {
      margin: 0 6px;
    }
  }
`;

const BreadcrumbLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  pointer-events: auto;
  position: relative;
  z-index: 1;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $active, theme }) =>
    $active &&
    `
    background: ${theme.colors.primary};
    color: #fff;
    
    &:hover {
      background: ${theme.colors.primary};
      opacity: 0.9;
      color: #fff;
    }
  `}

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 3px 6px;
  }
`;

const BreadcrumbText = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const CatalogBreadcrumb = ({
  selectedLinea,
  selectedValues,
  availableLines,
  onLineaSelect,
  onFilterSelect,
  onProductsSelect,
  currentStep,
  flowConfig,
  isAtProductView,
}) => {
  const selectedLineaData = availableLines.find(
    (line) => line.key === selectedLinea
  );

  const getFilterDisplayName = (filterId) => {
    const names = {
      categoria: "Categoría",
      aplicacion: "Aplicación",
      clase: "Clase",
      clasificacion: "Clasificación",
      grupo: "Grupo",
      subgrupo: "Subgrupo",
    };
    return names[filterId] || filterId;
  };

  const getDMAFilterDisplayName = (filterId) => {
    const names = {
      DMA_MARCA: "Marca",
      DMA_ANCHO: "Ancho",
      DMA_SERIE: "Serie",
      DMA_RIN: "Rin",
      DMA_CATEGORIA: "Categoría",
      DMA_APLICACION: "Aplicación",
      DMA_EJE: "Eje",
      DMA_TIPO: "Tipo",
      DMA_MODELO: "Modelo",
      DMA_SUBGRUPO: "Subgrupo",
      DMA_GRUPO: "Grupo",
      DMA_CLASIFICACION: "Clasificación",
      DMA_SAE: "SAE",
    };
    return names[filterId] || filterId;
  };

  // Función para obtener el nombre corto de la línea (sin "Neumáticos")
  const getShortLineName = (lineName) => {
    // Si el nombre contiene "Neumáticos Moto", mostrar solo "Moto"
    if (lineName && lineName.includes("Moto")) {
      return "Moto";
    }
    // Si el nombre contiene "Neumáticos ", mostrar solo la parte después
    if (lineName && lineName.startsWith("Neumáticos ")) {
      return lineName.replace("Neumáticos ", "");
    }
    return lineName;
  };

  return (
    <BreadcrumbContainer>
      <BreadcrumbContent>
        {/* Sección de líneas disponibles */}
        <BreadcrumbSectionLines>
          {/* <BreadcrumbSectionTitle>Líneas de Negocio</BreadcrumbSectionTitle> */}
          <BreadcrumbList>
            {availableLines.map((linea) => (
              <BreadcrumbItem key={linea.key}>
                <BreadcrumbLink
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onLineaSelect) {
                      onLineaSelect(linea.key);
                    }
                  }}
                  $active={selectedLinea === linea.key}
                >
                  <RenderIcon name={linea.icon} size={14} />
                  {getShortLineName(linea.name)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </BreadcrumbSectionLines>

        {/* Sección de filtros aplicados */}
        {(selectedLinea || Object.keys(selectedValues).length > 0) && (
          <BreadcrumbSectionFilters>
            {/* <BreadcrumbSectionTitle>Filtros Aplicados</BreadcrumbSectionTitle> */}
            <BreadcrumbList>
              {/* Mostrar filtros del flujo principal */}
              {flowConfig?.steps?.map((step, index) => {
                const stepValue = selectedValues[step.id];
                if (!stepValue) return null;

                return (
                  <BreadcrumbItemWithSeparator key={step.id}>
                    <BreadcrumbLink
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onFilterSelect) {
                          onFilterSelect(step.id);
                        }
                      }}
                      title={`Editar ${step.displayName || step.name}`}
                    >
                      <RenderIcon name="FaTag" size={14} />
                      {getFilterDisplayName(step.id)}: {stepValue}
                    </BreadcrumbLink>
                  </BreadcrumbItemWithSeparator>
                );
              })}

              {/* Mostrar filtros adicionales */}
              {Object.entries(selectedValues)
                .filter(([key, value]) => key.startsWith("DMA_") && value)
                .map(([filterId, value]) => (
                  <BreadcrumbItemWithSeparator key={filterId}>
                    <BreadcrumbLink
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onFilterSelect) {
                          onFilterSelect(filterId);
                        }
                      }}
                      title={`Editar ${getDMAFilterDisplayName(filterId)}`}
                    >
                      <RenderIcon name="FaFilter" size={14} />
                      {getDMAFilterDisplayName(filterId)}: {value}
                    </BreadcrumbLink>
                  </BreadcrumbItemWithSeparator>
                ))}

              {/* Mostrar "Productos" si estamos en la vista de productos */}
              {isAtProductView && (
                <BreadcrumbItem>
                  <BreadcrumbText>
                    <RenderIcon name="FaBox" size={14} />
                    Productos
                  </BreadcrumbText>
                </BreadcrumbItem>
              )}

              {/* Mostrar paso actual si no estamos en la vista de productos */}
              {!isAtProductView && currentStep && (
                <BreadcrumbItem>
                  <BreadcrumbText>
                    <RenderIcon name="FaArrowRight" size={14} />
                    {currentStep.displayName || currentStep.name}
                  </BreadcrumbText>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </BreadcrumbSectionFilters>
        )}
      </BreadcrumbContent>
    </BreadcrumbContainer>
  );
};

export default CatalogBreadcrumb;
