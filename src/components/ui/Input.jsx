import styled from "styled-components";
import RenderIcon from "./RenderIcon";
import { useAppTheme } from "../../context/AppThemeContext";

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
`;

const Label = styled.label`
  text-align: left;
  font-size: clamp(0.875rem, 2vw, 0.95rem);
  font-weight: 600;
  color: ${({ $color, theme }) => $color || theme.colors.text};
  margin-bottom: 0;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: ${({ $multiline }) => ($multiline ? "flex-start" : "center")};
  gap: 0.5rem;
  background: ${({ disabled, theme }) =>
    disabled
      ? theme.mode === "dark"
        ? `${theme.colors.background}80`
        : theme.colors.background
      : theme.colors.surface};
  border: 1px solid
    ${({ disabled, theme, $error }) => {
      if (disabled) {
        return theme.mode === "dark"
          ? `${theme.colors.border}40`
          : `${theme.colors.border}30`;
      }
      if ($error) {
        return theme.colors.error;
      }
      return theme.mode === "dark"
        ? `${theme.colors.border}40`
        : `${theme.colors.border}30`;
    }};
  border-radius: 12px;
  padding: ${({ $multiline }) => ($multiline ? "0.625rem 0.875rem" : "0.625rem 0.875rem")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  box-shadow: ${({ theme, $error, disabled }) =>
    disabled
      ? "none"
      : $error
      ? theme.mode === "dark"
        ? `0 0 0 3px ${theme.colors.error}15`
        : `0 0 0 3px ${theme.colors.error}10`
      : theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.04)"};

  &:hover:not(:focus-within) {
    border-color: ${({ theme, disabled, $error }) => {
      if (disabled) return "transparent";
      if ($error) return theme.colors.error;
      return theme.mode === "dark"
        ? `${theme.colors.border}60`
        : `${theme.colors.border}50`;
    }};
    box-shadow: ${({ theme, $error, disabled }) =>
      disabled
        ? "none"
        : $error
        ? theme.mode === "dark"
          ? `0 0 0 3px ${theme.colors.error}20`
          : `0 0 0 3px ${theme.colors.error}15`
        : theme.mode === "dark"
        ? "0 4px 12px rgba(0, 0, 0, 0.15)"
        : "0 4px 12px rgba(0, 0, 0, 0.06)"};
  }

  &:focus-within {
    border-color: ${({ theme, disabled, $error }) =>
      disabled
        ? theme.mode === "dark"
          ? `${theme.colors.border}40`
          : `${theme.colors.border}30`
        : $error
        ? theme.colors.error
        : theme.colors.primary};
    box-shadow: ${({ theme, disabled, $error }) =>
      disabled
        ? "none"
        : $error
        ? theme.mode === "dark"
          ? `0 0 0 3px ${theme.colors.error}25`
          : `0 0 0 3px ${theme.colors.error}20`
        : theme.mode === "dark"
        ? `0 0 0 3px ${theme.colors.primary}25`
        : `0 0 0 3px ${theme.colors.primary}20`};
    background-color: ${({ disabled, theme }) =>
      disabled
        ? theme.mode === "dark"
          ? `${theme.colors.background}80`
          : theme.colors.background
        : theme.colors.surface};
  }
`;

const StyledInput = styled.input.attrs(({ as }) => ({
  as: as || "input",
}))`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: clamp(0.9rem, 2vw, 1rem);
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.textSecondary : theme.colors.text};
  padding: 0;
  resize: vertical;
  min-height: ${({ as }) => (as === "textarea" ? "80px" : "auto")};
  max-height: ${({ as }) => (as === "textarea" ? "200px" : "auto")};
  line-height: 1.5;
  font-family: inherit;

  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
    box-shadow: none;
  }

  &::placeholder {
    color: ${({ theme, disabled }) =>
      disabled
        ? theme.colors.textSecondary
        : theme.colors.placeholder || theme.colors.textSecondary};
    opacity: 0.6;
  }

  &::-webkit-input-placeholder {
    color: ${({ theme, disabled }) =>
      disabled
        ? theme.colors.textSecondary
        : theme.colors.placeholder || theme.colors.textSecondary};
    opacity: 0.6;
  }

  &::-moz-placeholder {
    color: ${({ theme, disabled }) =>
      disabled
        ? theme.colors.textSecondary
        : theme.colors.placeholder || theme.colors.textSecondary};
    opacity: 0.6;
  }

  &:-ms-input-placeholder {
    color: ${({ theme, disabled }) =>
      disabled
        ? theme.colors.textSecondary
        : theme.colors.placeholder || theme.colors.textSecondary};
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    font-size: 16px; /* Evitar zoom en iOS */
  }
`;

const IconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textSecondary : theme.colors.textSecondary};
  transition: all 0.2s ease;
  border-radius: 6px;
  flex-shrink: 0;

  ${({ $clickable }) =>
    $clickable &&
    `
    &:hover {
      background-color: ${({ theme }) =>
        theme.mode === "dark"
          ? `${theme.colors.background}80`
          : `${theme.colors.background}`};
      color: ${({ theme }) => theme.colors.primary};
    }

    &:active {
      transform: scale(0.95);
    }
  `}
`;

const ErrorMessage = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.error};
  margin-top: 0.125rem;
  font-weight: 500;
  line-height: 1.4;
`;

export default function Input({
  label,
  type = "text",
  placeholder,
  leftIconName,
  rightIconName,
  onLeftIconClick,
  onRightIconClick,
  errorMessage,
  labelColor,
  interpolate = false,
  multiline = false,
  disabled = false,
  fullWidth = false,
  ...props
}) {
  const { theme } = useAppTheme(); // Obtener el tema completo

  return (
    <InputContainer $fullWidth={fullWidth}>
      {label && <Label $color={labelColor}>{label}</Label>}
      <InputWrapper $error={!!errorMessage} disabled={disabled} $multiline={multiline}>
        {leftIconName && (
          <IconContainer
            onClick={disabled ? undefined : onLeftIconClick}
            disabled={disabled}
            $clickable={!!onLeftIconClick && !disabled}
            style={{ marginTop: multiline ? "0.125rem" : "0" }}
          >
            <RenderIcon
              name={leftIconName}
              size={18}
              color={
                disabled
                  ? theme.colors.textSecondary
                  : errorMessage
                  ? theme.colors.error
                  : theme.colors.textSecondary
              }
            />
          </IconContainer>
        )}
        <StyledInput
          as={multiline ? "textarea" : "input"}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />
        {rightIconName && (
          <IconContainer
            onClick={disabled ? undefined : onRightIconClick}
            disabled={disabled}
            $clickable={!!onRightIconClick && !disabled}
            style={{ marginTop: multiline ? "0.125rem" : "0" }}
          >
            <RenderIcon
              name={rightIconName}
              size={18}
              color={
                disabled
                  ? theme.colors.textSecondary
                  : errorMessage
                  ? theme.colors.error
                  : theme.colors.textSecondary
              }
            />
          </IconContainer>
        )}
      </InputWrapper>
      {errorMessage && (
        <ErrorMessage>
          <RenderIcon name="FaCircleExclamation" size={14} color={theme.colors.error} />
          {errorMessage}
        </ErrorMessage>
      )}
    </InputContainer>
  );
}
