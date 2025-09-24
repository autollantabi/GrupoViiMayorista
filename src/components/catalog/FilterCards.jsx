import React from "react";
import styled from "styled-components";
import RenderIcon from "../ui/RenderIcon";

const FilterCardsContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const FilterTitle = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 24px 0;
  font-weight: 700;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 20px;
  }
`;

const FilterDescription = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0 0 32px 0;
  text-align: center;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 24px;
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
`;

const FilterCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-align: center;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px ${({ theme }) => theme.colors.shadow};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  ${({ $selected, theme }) =>
    $selected &&
    `
    border-color: ${theme.colors.primary};
    background: ${theme.colors.primaryLight};
    
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: ${theme.colors.primary};
    }
  `}

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const CardIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.white : theme.colors.primary};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    margin-bottom: 12px;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px 0;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CardDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const CardCount = styled.div`
  font-size: 0.8rem;
  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.textLight};
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.background};
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-block;
  font-weight: 600;
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.primary : theme.colors.border};
`;

const FilterCards = ({ step, options, selectedValue, onSelect }) => {
  if (!step || !options || options.length === 0) {
    return (
      <FilterCardsContainer>
        <FilterTitle>No hay opciones disponibles</FilterTitle>
        <FilterDescription>
          No se encontraron opciones para este filtro en este momento.
        </FilterDescription>
      </FilterCardsContainer>
    );
  }

  return (
    <FilterCardsContainer>
      <FilterTitle>{step.displayName || step.name}</FilterTitle>
      {step.description && (
        <FilterDescription>{step.description}</FilterDescription>
      )}

      <CardsGrid>
        {options.map((option) => (
          <FilterCard
            key={option.value}
            $selected={selectedValue === option.value}
            onClick={() => onSelect(option.value)}
          >
            <CardIcon $selected={selectedValue === option.value}>
              <RenderIcon name={option.icon} size={24} />
            </CardIcon>
            <CardTitle>{option.label}</CardTitle>
            {option.description && (
              <CardDescription>{option.description}</CardDescription>
            )}
            <CardCount $selected={selectedValue === option.value}>
              {option.count} productos
            </CardCount>
          </FilterCard>
        ))}
      </CardsGrid>
    </FilterCardsContainer>
  );
};

export default FilterCards;