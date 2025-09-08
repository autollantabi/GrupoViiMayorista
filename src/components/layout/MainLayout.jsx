import styled from "styled-components";
import { Outlet } from "react-router-dom";

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  min-width: 100%;
  flex-direction: column;
  position: relative;
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  width: 100%;
`;

const MainLayout = () => {
  return (
    <LayoutWrapper>
      <ContentArea>
        <Outlet />
      </ContentArea>
    </LayoutWrapper>
  );
};

export default MainLayout;
