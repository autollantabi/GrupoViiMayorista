import React from "react";
import styled from "styled-components";
import { useAppTheme } from "../../context/AppThemeContext";
import RenderIcon from "./RenderIcon";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth || "500px"};
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  z-index: 1001;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    max-width: 95%;
    max-height: 95vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  z-index: 10;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ $titleSize }) => $titleSize || "1.5rem"};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  z-index: 10;
`;

const Modal = ({
  isOpen,
  onClose,
  title,
  titleIcon,
  titleSize,
  maxWidth,
  children,
  footer,
  showCloseButton = true,
  onOverlayClick,
}) => {
  const { theme } = useAppTheme();

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      if (onOverlayClick) {
        onOverlayClick();
      } else {
        onClose();
      }
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent $maxWidth={maxWidth} onClick={(e) => e.stopPropagation()}>
        {title && (
          <ModalHeader>
            <ModalTitle $titleSize={titleSize}>
              {titleIcon && <RenderIcon name={titleIcon} size={24} />}
              {title}
            </ModalTitle>
            {showCloseButton && (
              <CloseButton onClick={onClose} aria-label="Cerrar modal">
                <RenderIcon name="FaXmark" size={20} />
              </CloseButton>
            )}
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
