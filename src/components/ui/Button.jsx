import styled from "styled-components";
import RenderIcon from "./RenderIcon";
import { useRef, useState } from "react";
import RenderLoader from "./RenderLoader";

const ButtonStyled = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: ${({ $align }) =>
    $align === "left"
      ? "flex-start"
      : $align === "right"
      ? "flex-end"
      : $align === "center"
      ? "center"
      : $align};
  padding: ${({ $size }) =>
    $size === "small"
      ? "6px 12px"
      : $size === "large"
      ? "14px 24px"
      : "10px 18px"};
  font-size: ${({ $size }) =>
    $size === "small" ? "14px" : $size === "large" ? "18px" : "16px"};
  border-radius: ${({ $radius }) => $radius || "5px"};
  font-weight: ${({ $fontWeight }) => $fontWeight || 400};
  cursor: pointer;
  transition: 0.3s ease-in-out;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  height: max-content;
  border: ${({ $variant, theme, disabled }) =>
    disabled
      ? "solid 1px #b3b3b3" // Borde gris para todos los botones deshabilitados
      : $variant === "outlined"
      ? `solid 1px ${theme.colors.primary}`
      : "none"};
  outline: none;

  background: ${({ $backgroundColor, $variant, theme, disabled }) =>
    disabled
      ? $variant === "outlined"
        ? "transparent" // Fondo transparente para outlined deshabilitado
        : "#e0e0e0" // Fondo gris para solid deshabilitado
      : $backgroundColor ||
        ($variant === "solid"
          ? theme.colors.primary
          : $variant === "outlined"
          ? "transparent"
          : theme.colors.secondary)};

  color: ${({ $color, $variant, theme, disabled }) =>
    disabled
      ? $variant === "outlined"
        ? "#9e9e9e" // Color de texto más visible para outlined deshabilitado
        : "#757575" // Color de texto para solid deshabilitado
      : $color || ($variant === "solid" ? "#fff" : theme.colors.primary)};

  &:hover {
    filter: ${({ disabled }) => (disabled ? "none" : "brightness(0.9)")};
    transform: ${({ disabled }) => (disabled ? "none" : "scale(1.02)")};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: ${({ $variant }) => ($variant === "outlined" ? 0.7 : 0.6)};
    box-shadow: none;
  }
`;

const IconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function Button({
  text,
  variant = "solid",
  size = "medium",
  fullWidth = false,
  disabled = false,
  leftIconName,
  rightIconName,
  color,
  align = "center",
  backgroundColor,
  iconSize = 14,
  fontWeight,
  radius,
  onClick,
  ...props
}) {
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef();

  const handleClick = async (e) => {
    if (typeof onClick === "function") {
      const result = onClick(e);
      if (result instanceof Promise) {
        try {
          setLoading(true);
          await result;
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <ButtonStyled
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $color={color}
      $backgroundColor={backgroundColor}
      $fontWeight={fontWeight}
      $radius={radius}
      $align={align}
      disabled={disabled || loading}
      onClick={handleClick}
      ref={buttonRef}
      {...props}
    >
      {loading ? (
        <RenderLoader color={color} floatingSpinner={false} />
      ) : (
        <>
          {leftIconName && (
            <IconContainer>
              <RenderIcon name={leftIconName} size={iconSize} color={color} />
            </IconContainer>
          )}
          {text}
          {rightIconName && (
            <IconContainer>
              <RenderIcon name={rightIconName} size={iconSize} color={color} />
            </IconContainer>
          )}
        </>
      )}
    </ButtonStyled>
  );
}
