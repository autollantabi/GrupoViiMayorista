import styled from "styled-components";
import RenderIcon from "./RenderIcon";
import { useAppTheme } from "../../context/AppThemeContext";

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
`;

const Label = styled.label`
  text-align: left;
  font-size: 14px;
  color: ${({ $color, theme }) => $color || theme.colors.text};
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  background: ${({ disabled, theme }) =>
    disabled ? theme.colors.background : theme.colors.surface};
  border: ${({ disabled, theme, $error }) =>
    disabled
      ? `1px solid ${theme.colors.border}`
      : $error
      ? `1px solid ${theme.colors.error}`
      : `1px solid ${theme.colors.border}`};
  border-radius: 5px;
  padding: 4px 8px;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  position: relative;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};

  &:focus-within {
    border-color: ${({ theme, disabled, $error }) =>
      disabled
        ? theme.colors.border
        : $error
        ? theme.colors.error
        : theme.colors.primary};
  }
`;

const StyledInput = styled.input.attrs(({as}) => ({
  as: as || "input",
}))`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.textLight : theme.colors.text};
  padding: 5px;
  resize: vertical;
  min-height: ${({ as }) => (as === "textarea" ? "30px" : "auto")};
  max-height: ${({ as }) => (as === "textarea" ? "200px" : "auto")};

  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
    box-shadow: none;
  }

  ::placeholder {
    color: ${({ theme, disabled }) =>
      disabled ? theme.colors.disabledPlaceholder : theme.colors.placeholder};
  }
`;

const IconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  cursor: ${(onClick) => (onClick ? "pointer" : "default")};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textLight : theme.colors.text};
`;

const ErrorMessage = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.error};
  margin-top: 2px;
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
      <InputWrapper $error={!!errorMessage} disabled={disabled}>
        {leftIconName && (
          <IconContainer
            onClick={disabled ? undefined : onLeftIconClick}
            disabled={disabled}
          >
            <RenderIcon
              name={leftIconName}
              size={16}
              color={disabled ? theme.colors.textLight : theme.colors.text}
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
          >
            <RenderIcon
              name={rightIconName}
              size={16}
              color={disabled ? theme.colors.textLight : theme.colors.text}
            />
          </IconContainer>
        )}
      </InputWrapper>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </InputContainer>
  );
}
