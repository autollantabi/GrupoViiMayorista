import React from "react";
import styled from "styled-components";

const SwitchContainer = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  user-select: none;
`;

const SwitchLabel = styled.span`
  font-size: clamp(0.875rem, 2vw, 0.95rem);
  font-weight: 600;
  color: ${({ theme, $disabled }) => ($disabled ? theme.colors.textLight : theme.colors.text)};
  transition: color 0.3s ease;
`;

const ToggleContainer = styled.div`
  position: relative;
  width: 48px;
  height: 24px;
  background-color: ${({ theme, $checked, $disabled }) =>
    $disabled
      ? theme.colors.border
      : $checked
      ? theme.colors.primary
      : theme.mode === "dark"
      ? `${theme.colors.border}40`
      : `${theme.colors.border}80`};
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.15);
  border: 1px solid
    ${({ theme, $checked, $disabled }) =>
      $disabled
        ? theme.colors.border
        : $checked
        ? theme.colors.primary
        : theme.colors.border};
`;

const ToggleThumb = styled.div`
  position: absolute;
  top: 1px;
  left: 1px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${({ $checked }) => ($checked ? "translateX(24px)" : "translateX(0)")};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const HiddenCheckbox = styled.input`
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
  id,
  name,
  ...props
}) {
  const handleToggle = (e) => {
    if (disabled) return;
    if (typeof onChange === "function") {
      onChange(e);
    }
  };

  return (
    <SwitchContainer $disabled={disabled}>
      <HiddenCheckbox
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={handleToggle}
        {...props}
      />
      <ToggleContainer $checked={checked} $disabled={disabled}>
        <ToggleThumb $checked={checked} />
      </ToggleContainer>
      {label && <SwitchLabel $disabled={disabled}>{label}</SwitchLabel>}
    </SwitchContainer>
  );
}
