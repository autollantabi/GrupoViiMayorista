import React from 'react';
import styled from 'styled-components';
import RenderIcon from '../ui/RenderIcon';

const StepperContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto 3rem;
  padding: 0 1rem;
`;

const StepperWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 24px;
    left: 40px;
    right: 40px;
    height: 2px;
    background: ${({ theme }) => theme.colors.border}60;
    z-index: 0;
  }
`;

const ProgressLine = styled.div`
  position: absolute;
  top: 24px;
  left: 40px;
  height: 2px;
  background: ${({ theme }) => theme.colors.primary};
  width: ${({ $progress }) => $progress}%;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  items-align: center;
  position: relative;
  z-index: 2;
  text-align: center;
  width: 80px;
`;

const StepCircle = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${({ theme, $active, $completed }) => 
    $active || $completed ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, $active, $completed }) => 
    $active || $completed ? '#fff' : theme.colors.textSecondary};
  border: 2px solid ${({ theme, $active, $completed }) => 
    $active || $completed ? theme.colors.primary : theme.colors.border}60;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
  transition: all 0.4s ease;
  box-shadow: ${({ $active, theme }) => 
    $active ? `0 0 20px ${theme.colors.primary}40` : 'none'};
`;

const StepLabel = styled.span`
  font-size: 0.85rem;
  font-weight: ${({ $active }) => ($active ? '700' : '500')};
  color: ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.textSecondary)};
  transition: color 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const stepsData = [
  { id: 1, label: 'Empresa', icon: 'FaBuilding' },
  { id: 2, label: 'Línea', icon: 'FaLayerGroup' }
];

const ProcessStepper = ({ currentStep }) => {
  // currentStep 1 is Empresa, 2 is Línea
  const progress = ((currentStep - 1) / (stepsData.length - 1)) * 100;

  return (
    <StepperContainer>
      <StepperWrapper>
        <ProgressLine $progress={progress} />
        {stepsData.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          
          return (
            <StepItem key={step.id}>
              <StepCircle $active={isActive} $completed={isCompleted}>
                <RenderIcon 
                  name={isCompleted ? 'FaCheck' : step.icon} 
                  size={isActive ? 20 : 18} 
                />
              </StepCircle>
              <StepLabel $active={isActive}>{step.label}</StepLabel>
            </StepItem>
          );
        })}
      </StepperWrapper>
    </StepperContainer>
  );
};

export default ProcessStepper;
