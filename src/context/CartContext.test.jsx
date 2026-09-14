import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import { api_products_getProductByCodigo } from "../api/products/apiProducts";
import {
  api_cart_getCarrito,
  api_cart_updateCarrito,
  api_cart_createCarrito,
  api_cart_deleteProductsFromCart,
} from "../api/cart/apiCart";
import { api_vendedores_getCarritoUnificado } from "../api/vendedores/apiVendedores";

// ─────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────

vi.mock("./AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    warn: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("../api/products/apiProducts", () => ({
  api_products_getProductByCodigo: vi.fn(),
}));

vi.mock("../api/cart/apiCart", () => ({
  api_cart_getCarrito: vi.fn(),
  api_cart_updateCarrito: vi.fn(),
  api_cart_createCarrito: vi.fn(),
  api_cart_deleteProductsFromCart: vi.fn(),
}));

vi.mock("../api/vendedores/apiVendedores", () => ({
  api_vendedores_getCarritoUnificado: vi.fn(),
}));

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Raw "backend" product shape as returned by api_products_getProductByCodigo */
const buildApiProduct = ({
  name = "Producto Test",
  price = 10,
  stock = 5,
  dmaInventario = 0,
} = {}) => ({
  DMA_NOMBREITEM: name,
  DMA_PRECIO: price,
  DMA_STOCK: stock,
  DMA_INVENTARIO: dmaInventario,
  DMA_MARCA: "MarcaTest",
  DMA_RUTAIMAGEN: "",
  DMA_LINEANEGOCIO: "DEFAULT",
});

const defaultAuthValue = {
  user: { ACCOUNT_USER: "ACC1", ENTERPRISE: "MAXXIMUNDO", EMAIL: "a@a.com" },
  isClient: true,
  isSeller: false,
  isB2CSeller: false,
  isB2BSeller: false,
  isVisualizacion: false,
};

function setAuth(overrides = {}) {
  useAuth.mockReturnValue({ ...defaultAuthValue, ...overrides });
}

/** Renders CartProvider and captures the latest useCart() value on every render. */
function renderCartProvider() {
  const box = { current: null };
  function Harness() {
    box.current = useCart();
    return null;
  }
  render(
    <CartProvider>
      <Harness />
    </CartProvider>
  );
  return box;
}

beforeEach(() => {
  vi.clearAllMocks();
  setAuth();
  // Por defecto, el carrito remoto está vacío: evita que el efecto de
  // hidratación automática del CartProvider interfiera con los tests.
  api_cart_getCarrito.mockResolvedValue({ success: true, data: [] });
  api_cart_updateCarrito.mockResolvedValue({ success: true, data: {} });
  api_cart_createCarrito.mockResolvedValue({ success: true, data: {} });
  api_cart_deleteProductsFromCart.mockResolvedValue({ success: true });
  api_vendedores_getCarritoUnificado.mockResolvedValue({ success: false });
});

// ─────────────────────────────────────────────
// addToCart — stock normal
// ─────────────────────────────────────────────

describe("CartContext addToCart - stock normal", () => {
  it("agrega el producto con la cantidad solicitada cuando hay stock suficiente", async () => {
    api_products_getProductByCodigo.mockResolvedValue({
      success: true,
      data: buildApiProduct({ stock: 10, price: 25 }),
    });

    const box = renderCartProvider();

    let result;
    await act(async () => {
      result = await box.current.addToCart(
        { id: "P1", empresaId: "MAXXIMUNDO", name: "Producto Test" },
        3
      );
    });

    expect(result.success).toBe(true);
    expect(box.current.cart).toHaveLength(1);
    expect(box.current.cart[0]).toMatchObject({ id: "P1", quantity: 3, stock: 10 });
    expect(toast.warn).not.toHaveBeenCalled();
  });

  it("recorta la cantidad al stock disponible y muestra un toast.warn cuando se excede", async () => {
    api_products_getProductByCodigo.mockResolvedValue({
      success: true,
      data: buildApiProduct({ stock: 5, price: 25 }),
    });

    const box = renderCartProvider();

    await act(async () => {
      await box.current.addToCart(
        { id: "P1", empresaId: "MAXXIMUNDO", name: "Producto Test" },
        8
      );
    });

    expect(box.current.cart[0].quantity).toBe(5);
    expect(toast.warn).toHaveBeenCalledTimes(1);
    expect(toast.warn.mock.calls[0][0]).toMatch(/Solo hay 5 unidades disponibles/);
  });
});

// ─────────────────────────────────────────────
// addToCart — stock en tránsito
// ─────────────────────────────────────────────

describe("CartContext addToCart - stock en tránsito", () => {
  it("agrega el producto usando la cantidad en tránsito cuando no hay stock normal", async () => {
    api_products_getProductByCodigo.mockResolvedValue({
      success: true,
      data: buildApiProduct({ stock: 0, dmaInventario: { cantidad: 20, dias: 30 } }),
    });

    const box = renderCartProvider();

    await act(async () => {
      await box.current.addToCart(
        { id: "P1", empresaId: "MAXXIMUNDO", name: "Producto Test" },
        10
      );
    });

    expect(box.current.cart[0]).toMatchObject({
      quantity: 10,
      hasTransitStock: true,
      transitQuantity: 20,
    });
    expect(toast.warn).not.toHaveBeenCalled();
  });

  it("recorta silenciosamente al stock en tránsito disponible (sin toast.warn)", async () => {
    api_products_getProductByCodigo.mockResolvedValue({
      success: true,
      data: buildApiProduct({ stock: 0, dmaInventario: { cantidad: 20, dias: 30 } }),
    });

    const box = renderCartProvider();

    await act(async () => {
      await box.current.addToCart(
        { id: "P1", empresaId: "MAXXIMUNDO", name: "Producto Test" },
        30
      );
    });

    expect(box.current.cart[0].quantity).toBe(20);
    expect(toast.warn).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// addToCart — control de rol
// ─────────────────────────────────────────────

describe("CartContext addToCart - control de rol", () => {
  it("rechaza el agregado cuando el rol no es cliente ni vendedor", async () => {
    setAuth({ isClient: false, isSeller: false, isVisualizacion: false });

    const box = renderCartProvider();

    let result;
    await act(async () => {
      result = await box.current.addToCart({ id: "P1", empresaId: "MAXXIMUNDO" }, 1);
    });

    expect(result).toEqual({
      success: false,
      message: "Tu rol no permite realizar compras en el sistema",
    });
    expect(box.current.cart).toHaveLength(0);
    expect(api_products_getProductByCodigo).not.toHaveBeenCalled();
  });

  it("rechaza el agregado para un cliente en modo visualización", async () => {
    setAuth({ isClient: true, isSeller: false, isVisualizacion: true });

    const box = renderCartProvider();

    let result;
    await act(async () => {
      result = await box.current.addToCart({ id: "P1", empresaId: "MAXXIMUNDO" }, 1);
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Tu rol no permite realizar compras en el sistema");
    expect(api_products_getProductByCodigo).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// updateQuantity
// ─────────────────────────────────────────────

describe("CartContext updateQuantity", () => {
  it("recorta la cantidad al stock normal disponible y muestra toast.warn", async () => {
    api_products_getProductByCodigo.mockResolvedValue({
      success: true,
      data: buildApiProduct({ stock: 5, price: 10 }),
    });

    const box = renderCartProvider();
    await act(async () => {
      await box.current.addToCart({ id: "P1", empresaId: "MAXXIMUNDO" }, 2);
    });

    toast.warn.mockClear();

    await act(async () => {
      await box.current.updateQuantity("P1", 9);
    });

    expect(box.current.cart[0].quantity).toBe(5);
    expect(toast.warn).toHaveBeenCalledTimes(1);
    expect(toast.warn.mock.calls[0][0]).toMatch(/Solo hay 5 unidades disponibles/);
  });

  it("recorta la cantidad al stock en tránsito disponible sin mostrar toast", async () => {
    api_products_getProductByCodigo.mockResolvedValue({
      success: true,
      data: buildApiProduct({ stock: 0, dmaInventario: { cantidad: 7, dias: 15 } }),
    });

    const box = renderCartProvider();
    await act(async () => {
      await box.current.addToCart({ id: "P1", empresaId: "MAXXIMUNDO" }, 3);
    });

    toast.warn.mockClear();

    await act(async () => {
      await box.current.updateQuantity("P1", 50);
    });

    expect(box.current.cart[0].quantity).toBe(7);
    expect(toast.warn).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// removeFromCart / removeItemsByCompany
// ─────────────────────────────────────────────

describe("CartContext remove helpers", () => {
  it("removeFromCart elimina solo el item indicado (por id + empresaId)", async () => {
    api_products_getProductByCodigo
      .mockResolvedValueOnce({ success: true, data: buildApiProduct({ stock: 5 }) })
      .mockResolvedValueOnce({ success: true, data: buildApiProduct({ stock: 5 }) });

    const box = renderCartProvider();
    await act(async () => {
      await box.current.addToCart({ id: "P1", empresaId: "MAXXIMUNDO" }, 1);
    });
    await act(async () => {
      await box.current.addToCart({ id: "P2", empresaId: "MAXXIMUNDO" }, 1);
    });

    expect(box.current.cart).toHaveLength(2);

    await act(async () => {
      await box.current.removeFromCart("P1", "MAXXIMUNDO");
    });

    expect(box.current.cart).toHaveLength(1);
    expect(box.current.cart[0].id).toBe("P2");
  });

  it("removeItemsByCompany elimina todos los items de una empresa y conserva el resto", async () => {
    api_products_getProductByCodigo
      .mockResolvedValueOnce({ success: true, data: buildApiProduct({ stock: 5 }) })
      .mockResolvedValueOnce({ success: true, data: buildApiProduct({ stock: 5 }) });

    const box = renderCartProvider();
    await act(async () => {
      await box.current.addToCart({ id: "P1", empresaId: "MAXXIMUNDO" }, 1);
    });
    await act(async () => {
      await box.current.addToCart({ id: "P2", empresaId: "STOX" }, 1);
    });

    await act(async () => {
      await box.current.removeItemsByCompany("MAXXIMUNDO");
    });

    expect(box.current.cart).toHaveLength(1);
    expect(box.current.cart[0].empresaId).toBe("STOX");
  });
});

// ─────────────────────────────────────────────
// calculateCartTotal
// ─────────────────────────────────────────────

describe("CartContext calculateCartTotal", () => {
  it("excluye los items con stock en tránsito del total mientras los conserva en la lista", () => {
    const box = renderCartProvider();

    const cart = [
      {
        id: "P1",
        empresaId: "MAXXIMUNDO",
        price: 100,
        quantity: 2,
        hasTransitStock: false,
        lineaNegocio: "DEFAULT",
        promotionalDiscount: 0,
      },
      {
        id: "P2",
        empresaId: "MAXXIMUNDO",
        price: 50,
        quantity: 3,
        hasTransitStock: true,
        lineaNegocio: "DEFAULT",
        promotionalDiscount: 0,
      },
    ];

    const total = box.current.calculateCartTotal(cart);

    // Solo P1 (100*2=200) entra al cálculo; con 15% de IVA y sin descuentos: 230.
    expect(total).toBeCloseTo(230, 5);
    // El array pasado no se muta: el item en tránsito sigue presente en la "lista".
    expect(cart).toHaveLength(2);
    expect(cart.some((i) => i.id === "P2")).toBe(true);
  });
});
