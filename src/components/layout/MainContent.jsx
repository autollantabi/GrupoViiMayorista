import styled from 'styled-components';

const MainContentContainer = styled.main`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MainContent = ({ children }) => {
  return <MainContentContainer>{children}</MainContentContainer>;
};

export default MainContent;