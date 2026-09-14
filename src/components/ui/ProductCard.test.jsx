import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../../test/test-utils";
import ProductCard from "./ProductCard";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

vi.mock("../../context/CartContext", () => ({
  useCart: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    warn: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const baseProduct = {
  id: "P1",
  name: "Llanta Aro 15",
  brand: "MarcaX",
  price: 100,
  discount: 0,
  iva: 15,
  image: "",
  empresaId: "MAXXIMUNDO",
  lineaNegocio: "DEFAULT",
  salesIndicator: 0,
};

function setCart(cart = [], overrides = {}) {
  useCart.mockReturnValue({
    cart,
    addToCart: vi.fn().mockResolvedValue({ success: true }),
    ...overrides,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  useAuth.mockReturnValue({ isClient: true, isSeller: false, isVisualizacion: false });
});

function getAddButton() {
  return screen.getByRole("button", {
    name: /Sin Stock|Stock máximo|Agregar|Agregado|en carrito/i,
  });
}

describe("ProductCard - matriz de habilitación del botón Agregar", () => {
  it("deshabilita el botón y muestra 'Sin Stock por el momento' cuando stock=0 y no hay stock en tránsito", () => {
    setCart([]);
    render(<ProductCard product={{ ...baseProduct, stock: 0 }} />);

    const button = getAddButton();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Sin Stock por el momento");
  });

  it("habilita el botón cuando stock=0 pero hay stock en tránsito (DMA_INVENTARIO con dias)", () => {
    setCart([]);
    render(
      <ProductCard
        product={{
          ...baseProduct,
          stock: 0,
          originalData: { DMA_INVENTARIO: { cantidad: 15, dias: 20 } },
        }}
      />
    );

    const button = getAddButton();
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent("Disponible en 20 días");
  });

  it("deshabilita el botón con 'Stock máximo en carrito' cuando la cantidad en carrito alcanza el stock real", () => {
    setCart([{ id: "P1", empresaId: "MAXXIMUNDO", quantity: 5 }]);
    render(<ProductCard product={{ ...baseProduct, stock: 5 }} />);

    const button = getAddButton();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Stock máximo en carrito");
  });

  it("habilita el botón cuando hay stock real y la cantidad en carrito es menor al stock", () => {
    setCart([{ id: "P1", empresaId: "MAXXIMUNDO", quantity: 2 }]);
    render(<ProductCard product={{ ...baseProduct, stock: 5 }} />);

    const button = getAddButton();
    expect(button).not.toBeDisabled();
  });
});

describe("ProductCard - reflejo de la hidratación del carrito en el catálogo", () => {
  it("muestra en el input de cantidad la cantidad ya presente en el carrito hidratado", () => {
    setCart([{ id: "P1", empresaId: "MAXXIMUNDO", quantity: 3 }]);
    render(<ProductCard product={{ ...baseProduct, stock: 10 }} />);

    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(3);
  });

  it("no confunde la cantidad en carrito entre el mismo id de producto vendido por dos empresas distintas", () => {
    // El carrito solo tiene un item de la EMPRESA_A con code "P1".
    setCart([{ id: "P1", empresaId: "EMPRESA_A", quantity: 5 }]);

    // Se renderiza la tarjeta del producto "P1" pero de la EMPRESA_B (empresa distinta).
    render(
      <ProductCard product={{ ...baseProduct, id: "P1", empresaId: "EMPRESA_B", stock: 10 }} />
    );

    // quantityInCart debe hacer match por id + empresaId, así que esta tarjeta
    // (EMPRESA_B) no debe heredar la cantidad del carrito de EMPRESA_A.
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(1);
  });
});
