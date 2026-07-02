import React from "react";
import styled from "styled-components";
import RenderIcon from "../ui/RenderIcon";

const VendedorWrapper = styled.div`
  display: flex;
  align-items: center;

  @media (min-width: 1024px) {
    margin-left: auto; // empuja el bloque hacia la derecha en desktop
  }
`;

const VendedorText = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const VendedorAsignado = ({ vendedores, loading, error }) => {
    if (loading) {
        return (
            <VendedorWrapper>
                <VendedorText>
                    <RenderIcon name="FaUser" size={14} />
                    Vendedor: cargando...
                </VendedorText>
            </VendedorWrapper>
        );
    }

    if (error || !vendedores || vendedores.length === 0) {
        return null;
    }

    const nombres = vendedores
        .map((v) => v.DVE_NOMBREVENDEDOR)
        .filter(Boolean)
        .join(", ");

    if (!nombres) return null;

    return (
        <VendedorWrapper>
            <VendedorText>
                <RenderIcon name="FaUser" size={14} />
                Vendedor: {nombres}
            </VendedorText>
        </VendedorWrapper>
    );
};

export default VendedorAsignado;