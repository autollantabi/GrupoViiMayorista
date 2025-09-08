import styled from "styled-components";
import RenderIcon from "../ui/RenderIcon";

const PageContainerStyled = styled.div`
  max-width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "1400px")};
  margin: 5px auto;
  flex-grow: 1;
`;

const BackButton = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: max-content;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s ease;
  margin-bottom: 20px;
  user-select: none;
  transition: transform 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark};
    transform: translateX(-2px);
  }
`;

const PageContainer = ({
  fullWidth = false,
  style,
  backButtonText,
  backButtonOnClick,
  children,
}) => {
  return (
    <PageContainerStyled $fullWidth={fullWidth} style={style}>
      {backButtonText && (
        <BackButton onClick={backButtonOnClick}>
          <RenderIcon name="FaChevronLeft" size={14} />
          {backButtonText}
        </BackButton>
      )}
      {children}
    </PageContainerStyled>
  );
};

export default PageContainer;
