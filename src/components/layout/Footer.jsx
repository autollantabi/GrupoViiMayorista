import styled from "styled-components";

const FooterContainer = styled.footer`
  width: 100%;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

export default function Footer() {
  return (
    <FooterContainer>
      © {new Date().getFullYear()} Portal MISTOX — Todos los derechos reservados
    </FooterContainer>
  );
}
