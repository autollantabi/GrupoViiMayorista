import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../../test/test-utils";
import Carrito from "./Carrito";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { api_order_createOrder } from "../../api/order/apiOrder";
import { api_cart_deleteProductsFromCart, api_cart_createCarrito } from "../../api/cart/apiCart";
import { api_vendedores_getDirecciones } from "../../api/vendedores/apiVendedores";
import { api_addresses_createAddress } from "../../api/users/apiAddresses";
import { api_banners_getByTipo } from "../../api/banners/apiBanners";
import { useNuvei } from "../../hooks/useNuevi";
import { api_generate_payment_reference, api_verify_transaction } from "../../api/payments/apiPayments";
import { api_cartera_getResumenCarteraClienteByEmpresa } from "../../api/cartera/apiCarteraClientes";

// ─────────────────────────────────────────────
// Mocks de módulo
// ─────────────────────────────────────────────

vi.mock("../../context/CartContext", () => ({
  useCart: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    warn: vi.fn(),
    warning: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../../api/order/apiOrder", () => ({
  api_order_createOrder: vi.fn(),
}));

vi.mock("../../api/cart/apiCart", () => ({
  api_cart_deleteProductsFromCart: vi.fn(),
  api_cart_createCarrito: vi.fn(),
}));

vi.mock("../../api/vendedores/apiVendedores", () => ({
  api_vendedores_getDirecciones: vi.fn(),
}));

vi.mock("../../api/users/apiAddresses", () => ({
  api_addresses_createAddress: vi.fn(),
}));

vi.mock("../../api/banners/apiBanners", () => ({
  api_banners_getByTipo: vi.fn(),
}));

vi.mock("../../hooks/useNuevi", () => ({
  useNuvei: vi.fn(),
}));

vi.mock("../../api/payments/apiPayments", () => ({
  api_generate_payment_reference: vi.fn(),
  api_verify_transaction: vi.fn(),
}));

vi.mock("../../api/cartera/apiCarteraClientes", () => ({
  api_cartera_getResumenCarteraClienteByEmpresa: vi.fn(),
}));

// ─────────────────────────────────────────────
// Helpers de datos
// ─────────────────────────────────────────────

const makeCartItem = (overrides = {}) => ({
  id: "P1",
  empresaId: "MAXXIMUNDO",
  name: "Producto Uno",
  brand: "Marca",
  image: "",
  price: 100,
  quantity: 2,
  stock: 10,
  hasTransitStock: false,
  transitQuantity: 0,
  promotionalDiscount: 0,
  iva: 15,
  lineaNegocio: "DEFAULT",
  idShoppingCartDetail: 555,
  ...overrides,
});

const makeAddress = ({ id, type, empresa = "MAXXIMUNDO" }) => ({
  ID: id,
  CLASIFICATION: type === "S" ? "ENVIO" : "FACTURACION",
  STREET: "Calle Falsa 123",
  CITY: "Quito",
  STATE: "Pichincha",
  PREDETERMINED: true,
  TYPE: type,
  EMPRESA: empresa,
  ORIGIN: "APP",
  LATITUDE: -0.18,
  LONGITUDE: -78.47,
});

const makeUser = (direcciones = {}) => ({
  ACCOUNT_USER: "ACC1",
  NAME_USER: "Cliente Test",
  EMAIL: "cliente@test.com",
  ENTERPRISE: "MAXXIMUNDO",
  DIRECCIONES: direcciones,
  IVA: 15,
});

const bothAddresses = {
  ENVIO: [makeAddress({ id: 1, type: "S" })],
  FACTURACION: [makeAddress({ id: 2, type: "B" })],
};

function setCart(cart) {
  useCart.mockReturnValue({
    cart,
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    isLoading: false,
    isHydrating: false,
    loadCartFromAPI: vi.fn().mockResolvedValue(undefined),
    removeFromCartByDetailIds: vi.fn(),
  });
}

function setAuth(direcciones = bothAddresses, overrides = {}) {
  useAuth.mockReturnValue({
    user: makeUser(direcciones),
    isSeller: false,
    isB2BSeller: false,
    ...overrides,
  });
}

let capturedNuveiCallbacks = null;
let openCheckoutMock;

beforeEach(() => {
  vi.clearAllMocks();
  capturedNuveiCallbacks = null;

  openCheckoutMock = vi.fn();
  useNuvei.mockImplementation(({ onSuccess, onError, onClose }) => {
    capturedNuveiCallbacks = { onSuccess, onError, onClose };
    return { openCheckout: openCheckoutMock, closeCheckout: vi.fn() };
  });

  api_banners_getByTipo.mockResolvedValue({ success: true, data: [] });
  api_cartera_getResumenCarteraClienteByEmpresa.mockResolvedValue({
    success: false,
    message: "sin datos",
  });
  api_vendedores_getDirecciones.mockResolvedValue({ success: true, data: [] });
  api_addresses_createAddress.mockResolvedValue({ success: true, data: {} });
  api_cart_createCarrito.mockResolvedValue({ success: true, data: {} });
  api_cart_deleteProductsFromCart.mockResolvedValue({ success: true });
  api_order_createOrder.mockResolvedValue({ success: true, data: { ID_ORDER: 1 } });
  api_generate_payment_reference.mockResolvedValue({
    success: true,
    data: { reference: "REF-123" },
  });
  api_verify_transaction.mockResolvedValue({
    success: true,
    data: {
      transaction: { id: "TX1", status: "success", status_detail: 3 },
      card: { type: "VISA", number: "4242", expiry_year: "28", expiry_month: "05" },
    },
  });
});

async function clickCheckoutAndConfirm() {
  const checkoutButton = await screen.findByRole("button", { name: /Proceder al pedido/i });
  await userEvent.click(checkoutButton);
  const confirmButton = await screen.findByRole("button", { name: "Confirmar" });
  await userEvent.click(confirmButton);
}

// ─────────────────────────────────────────────
// 1. Carrito vacío
// ─────────────────────────────────────────────

describe("Carrito - estado vacío", () => {
  it("no renderiza el layout de checkout (ni el botón 'Proceder al pedido') cuando el carrito está vacío", () => {
    setCart([]);
    setAuth();

    render(<Carrito />);

    expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ir al Catálogo/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Proceder al pedido/i })).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// 2. Gating por direcciones
// ─────────────────────────────────────────────

describe("Carrito - gating del botón 'Proceder al pedido' por direcciones", () => {
  it("deshabilita el botón y muestra ambas advertencias cuando faltan las dos direcciones", async () => {
    setCart([makeCartItem()]);
    setAuth({}); // sin direcciones registradas

    render(<Carrito />);

    const checkoutButton = await screen.findByRole("button", { name: /Proceder al pedido/i });
    expect(checkoutButton).toBeDisabled();
    expect(screen.getByText("Falta dirección de envío")).toBeInTheDocument();
    expect(screen.getByText("Falta dirección de facturación")).toBeInTheDocument();
  });

  it("deshabilita el botón y muestra solo la advertencia de envío cuando falta esa dirección", async () => {
    setCart([makeCartItem()]);
    setAuth({ FACTURACION: [makeAddress({ id: 2, type: "B" })] }); // solo facturación

    render(<Carrito />);

    const checkoutButton = await screen.findByRole("button", { name: /Proceder al pedido/i });
    expect(checkoutButton).toBeDisabled();
    expect(screen.getByText("Falta dirección de envío")).toBeInTheDocument();
    expect(screen.queryByText("Falta dirección de facturación")).not.toBeInTheDocument();
  });

  it("habilita el botón y no muestra advertencias cuando ambas direcciones están presentes", async () => {
    setCart([makeCartItem()]);
    setAuth(bothAddresses);

    render(<Carrito />);

    const checkoutButton = await screen.findByRole("button", { name: /Proceder al pedido/i });
    await waitFor(() => expect(checkoutButton).not.toBeDisabled());
    expect(screen.queryByText("Falta dirección de envío")).not.toBeInTheDocument();
    expect(screen.queryByText("Falta dirección de facturación")).not.toBeInTheDocument();
  });

  it("abre el modal de confirmación al hacer click en 'Proceder al pedido'", async () => {
    setCart([makeCartItem()]);
    setAuth(bothAddresses);

    render(<Carrito />);

    const checkoutButton = await screen.findByRole("button", { name: /Proceder al pedido/i });
    await waitFor(() => expect(checkoutButton).not.toBeDisabled());
    await userEvent.click(checkoutButton);

    expect(
      screen.getByText(/¿Está seguro que desea confirmar esta orden\?/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// 3. Flujo de pago CREDIT
// ─────────────────────────────────────────────

describe("Carrito - checkout con pago a CREDITO", () => {
  it("confirma el pedido llamando directamente a api_order_createOrder, sin tocar la pasarela de pago", async () => {
    setCart([makeCartItem()]);
    setAuth(bothAddresses);

    render(<Carrito />);

    await screen.findByRole("button", { name: /Proceder al pedido/i });
    await clickCheckoutAndConfirm();

    await waitFor(() => expect(api_order_createOrder).toHaveBeenCalledTimes(1));
    expect(api_generate_payment_reference).not.toHaveBeenCalled();
    expect(openCheckoutMock).not.toHaveBeenCalled();

    const orderArg = api_order_createOrder.mock.calls[0][0];
    expect(orderArg.PAYMENT_METHOD).toBe("CREDIT");
    expect(orderArg.ENTERPRISE).toBe("MAXXIMUNDO");
  });
});

// ─────────────────────────────────────────────
// 4. Flujo de pago CREDIT_CARD (Nuvei/Paymentez)
// ─────────────────────────────────────────────

describe("Carrito - checkout con pago con TARJETA (CREDIT_CARD)", () => {
  async function selectCreditCard() {
    const radio = await screen.findByRole("radio", { name: /Tarjeta de crédito/i });
    await userEvent.click(radio);
  }

  it("genera la referencia de pago y abre el checkout de Nuvei, sin crear la orden todavía", async () => {
    setCart([makeCartItem()]);
    setAuth(bothAddresses);

    render(<Carrito />);
    await screen.findByRole("button", { name: /Proceder al pedido/i });
    await selectCreditCard();
    await clickCheckoutAndConfirm();

    await waitFor(() => expect(api_generate_payment_reference).toHaveBeenCalledTimes(1));
    expect(openCheckoutMock).toHaveBeenCalledWith("REF-123");
    expect(api_order_createOrder).not.toHaveBeenCalled();
  });

  it("crea la orden únicamente después de que el callback onSuccess de Nuvei se dispara con una transacción aprobada", async () => {
    setCart([makeCartItem()]);
    setAuth(bothAddresses);

    render(<Carrito />);
    await screen.findByRole("button", { name: /Proceder al pedido/i });
    await selectCreditCard();
    await clickCheckoutAndConfirm();

    await waitFor(() => expect(openCheckoutMock).toHaveBeenCalled());
    expect(api_order_createOrder).not.toHaveBeenCalled();

    // Simular que la pasarela llama a onSuccess con una transacción aprobada
    await userEventDispatchNuveiSuccess();

    await waitFor(() => expect(api_verify_transaction).toHaveBeenCalledWith("TX1"));
    await waitFor(() => expect(api_order_createOrder).toHaveBeenCalledTimes(1));

    const orderArg = api_order_createOrder.mock.calls[0][0];
    expect(orderArg.TRANSACTION_DATA).toBeTruthy();
    expect(orderArg.TRANSACTION_DATA.TRANSACTION_ID).toBe("TX1");
  });

  async function userEventDispatchNuveiSuccess(transaction = {
    id: "TX1",
    status: "success",
    status_detail: 3,
  }) {
    await waitFor(() => expect(capturedNuveiCallbacks?.onSuccess).toBeTypeOf("function"));
    const { act } = await import("@testing-library/react");
    await act(async () => {
      await capturedNuveiCallbacks.onSuccess(transaction);
    });
  }

  describe("estados de reembolso cuando falla la creación de la orden tras el cobro", () => {
    async function runUntilOrderCreationFails() {
      setCart([makeCartItem()]);
      setAuth(bothAddresses);

      render(<Carrito />);
      await screen.findByRole("button", { name: /Proceder al pedido/i });
      await selectCreditCard();
      await clickCheckoutAndConfirm();
      await waitFor(() => expect(openCheckoutMock).toHaveBeenCalled());
      await userEventDispatchNuveiSuccess();
      await waitFor(() => expect(api_order_createOrder).toHaveBeenCalledTimes(1));
    }

    it("refunded === true -> muestra el toast de 'reembolsado automáticamente'", async () => {
      api_order_createOrder.mockResolvedValue({
        success: false,
        message: "fallo al crear pedido",
        refunded: true,
      });

      await runUntilOrderCreationFails();

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/reembolsado automáticamente/i),
          expect.objectContaining({ autoClose: 8000 })
        )
      );
    });

    it("refunded === false -> muestra el toast de 'reembolso automático falló'", async () => {
      api_order_createOrder.mockResolvedValue({
        success: false,
        message: "fallo al crear pedido",
        refunded: false,
      });

      await runUntilOrderCreationFails();

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/reembolso automático falló/i),
          expect.objectContaining({ autoClose: false })
        )
      );
    });

    it("refunded === undefined -> muestra el toast genérico de error de pedido (no era pago con tarjeta o el backend no envió el campo)", async () => {
      api_order_createOrder.mockResolvedValue({
        success: false,
        message: "fallo al crear pedido",
        refunded: undefined,
      });

      await runUntilOrderCreationFails();

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/Error al procesar tu pedido: fallo al crear pedido/i)
        )
      );
    });

    it("los tres estados de refunded producen mensajes de toast distintos entre sí", async () => {
      const messages = [];
      for (const refunded of [true, false, undefined]) {
        cleanup();
        vi.clearAllMocks();
        // Volver a fijar los mocks por defecto que borra clearAllMocks
        openCheckoutMock = vi.fn();
        useNuvei.mockImplementation(({ onSuccess, onError, onClose }) => {
          capturedNuveiCallbacks = { onSuccess, onError, onClose };
          return { openCheckout: openCheckoutMock, closeCheckout: vi.fn() };
        });
        api_banners_getByTipo.mockResolvedValue({ success: true, data: [] });
        api_cartera_getResumenCarteraClienteByEmpresa.mockResolvedValue({ success: false });
        api_generate_payment_reference.mockResolvedValue({
          success: true,
          data: { reference: "REF-123" },
        });
        api_verify_transaction.mockResolvedValue({
          success: true,
          data: {
            transaction: { id: "TX1", status: "success", status_detail: 3 },
            card: { type: "VISA", number: "4242", expiry_year: "28", expiry_month: "05" },
          },
        });
        api_order_createOrder.mockResolvedValue({
          success: false,
          message: "fallo",
          refunded,
        });

        await runUntilOrderCreationFails();
        await waitFor(() => expect(toast.error).toHaveBeenCalled());
        messages.push(toast.error.mock.calls.at(-1)[0]);
      }

      const uniqueMessages = new Set(messages);
      expect(uniqueMessages.size).toBe(3);
    });
  });
});
