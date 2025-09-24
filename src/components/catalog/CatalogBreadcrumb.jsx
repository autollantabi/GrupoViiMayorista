import React from "react";
import styled from "styled-components";
import RenderIcon from "../ui/RenderIcon";
import Button from "../ui/Button";

const BreadcrumbContainer = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 14px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 768px) {
    padding: 16px 20px;
    margin-bottom: 20px;
  }
`;

const BreadcrumbSection = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
`;

const BreadcrumbSectionTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 6px;
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

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:active {
    transform: translateY(1px);
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
      DMA_CLASIFICACION: "Clasificación",
      DMA_SAE: "SAE",
    };
    return names[filterId] || filterId;
  };

  return (
    <BreadcrumbContainer>
      {/* Sección de líneas disponibles */}
      <BreadcrumbSection>
        <BreadcrumbSectionTitle>Líneas de Negocio</BreadcrumbSectionTitle>
        <BreadcrumbList>
          {availableLines.map((linea) => (
            <BreadcrumbItem key={linea.key}>
              <BreadcrumbLink
                onClick={() => onLineaSelect(linea.key)}
                $active={selectedLinea === linea.key}
              >
                <RenderIcon name={linea.icon} size={14} />
                {linea.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </BreadcrumbSection>

      {/* Sección de filtros aplicados */}
      {(selectedLinea || Object.keys(selectedValues).length > 0) && (
        <BreadcrumbSection>
          <BreadcrumbSectionTitle>Filtros Aplicados</BreadcrumbSectionTitle>
          <BreadcrumbList>
            {/* Mostrar filtros del flujo principal */}
            {flowConfig?.steps?.map((step, index) => {
              const stepValue = selectedValues[step.id];
              if (!stepValue) return null;

              return (
                <BreadcrumbItemWithSeparator key={step.id}>
                  <BreadcrumbLink
                    onClick={() => onFilterSelect(step.id)}
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
                    onClick={() => onFilterSelect(filterId)}
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
        </BreadcrumbSection>
      )}
    </BreadcrumbContainer>
  );
};

export default CatalogBreadcrumb;
