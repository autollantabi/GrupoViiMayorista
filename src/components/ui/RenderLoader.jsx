import React from "react";
import styled, { keyframes } from "styled-components";

// Animación de flotación para el spinner
const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(90deg); }
  50% { transform: translateY(0) rotate(180deg); }
  75% { transform: translateY(5px) rotate(270deg); }
  100% { transform: translateY(0) rotate(360deg); }
`;

// Animación de rebote para los puntos
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

// Animación de rotación simple
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Contenedor principal alineado verticalmente
const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

// Contenedor para el spinner con animación flotante
const SpinnerContainer = styled.div`
  animation: ${float} 2s infinite ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// El spinner con su rotación
const Loader = styled.div`
  border: 2px solid ${({ theme }) => theme?.colors?.background || "#f3f3f3"};
  border-top: 3px solid ${({ $color, theme }) => $color || theme.colors.primary};
  border-radius: 50%;
  width: ${({ $size }) => $size || "24px"};
  height: ${({ $size }) => $size || "24px"};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  animation: ${spin} 1s linear infinite;
`;

// Contenedor del texto y los puntos animados
const TextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Texto del loader
const LoaderText = styled.span`
  color: ${({ $color, theme }) =>
    $color || theme?.colors?.text || theme.colors.primary};
  font-size: ${({ $size }) => {
    $size || "16px";
  }};
  font-weight: 500;
`;

// Contenedor para los puntos animados
const DotsContainer = styled.div`
  display: flex;
  gap: 2px;
`;

// Puntos individuales con animación de rebote
const Dot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: ${({ $color, theme }) =>
    $color || theme?.colors?.text || "#333"};
  display: inline-block;
  animation: ${bounce} 1s infinite;
  animation-delay: ${({ $delay }) => $delay || "0s"};
`;

// Tarjeta para el modo card
const LoaderCard = styled.div`
  background-color: ${({ theme }) => theme?.colors?.surface || "#fff"};
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 32px;
  min-width: 180px;
  min-height: 120px;
  width: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  border: 1px solid ${({ theme }) => theme?.colors?.border || "#eaeaea"};
`;

/**
 * Componente de carga modular y personalizable
 * @param {Object} props - Props del componente
 * @param {string} props.color - Color del spinner y puntos
 * @param {string} props.size - Tamaño del spinner (ej: "24px")
 * @param {string} props.text - Texto a mostrar
 * @param {boolean} props.showSpinner - Si debe mostrar el spinner (default: true)
 * @param {boolean} props.showText - Si debe mostrar el texto (default: true si hay texto)
 * @param {boolean} props.showDots - Si debe mostrar los puntos animados (default: true)
 * @param {boolean} props.floatingSpinner - Si el spinner debe tener animación flotante (default: true)
 * @param {boolean} props.card - Si es true, muestra el loader dentro de una tarjeta
 * @returns {JSX.Element} Componente de carga animado
 */
const RenderLoader = ({
  color,
  size,
  text,
  showSpinner = true,
  showText = !!text,
  showDots = false,
  floatingSpinner = true,
  card = false,
}) => {
  const loaderContent = (
    <LoaderContainer>
      {showSpinner &&
        (floatingSpinner ? (
          <SpinnerContainer>
            <Loader $color={color} $size={size} />
          </SpinnerContainer>
        ) : (
          <Loader $color={color} $size={size} />
        ))}

      {(showText) && (
        <TextContainer>
          {showText && text && (
            <LoaderText $color={color} $size={size}>
              {text}
            </LoaderText>
          )}
        </TextContainer>
      )}
      {showDots && (
        <DotsContainer>
          <Dot $color={color} $delay="0s" />
          <Dot $color={color} $delay="0.2s" />
          <Dot $color={color} $delay="0.4s" />
        </DotsContainer>
      )}
    </LoaderContainer>
  );

  // Si card es true, envolver el loader en una tarjeta
  if (card) {
    return <LoaderCard>{loaderContent}</LoaderCard>;
  }

  // Si no, devolver el loader normal
  return <div style={{ width: "100%" }}>{loaderContent}</div>;
};

export default RenderLoader;
