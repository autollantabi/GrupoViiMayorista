import { Outlet } from "react-router-dom";
import styled from "styled-components";

const CleanContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({theme}) => theme.colors.background};
`;

/**
 * Layout limpio sin header ni sidebar para páginas de autenticación,
 * error 404 y otras páginas que requieren una vista completa
 */
const CleanLayout = () => {
  return (
    <CleanContainer>
      <Outlet />
    </CleanContainer>
  );
};

export default CleanLayout;
