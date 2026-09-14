import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { AppThemeProvider, useAppTheme } from "../context/AppThemeContext";

/**
 * Custom render que envuelve los componentes bajo prueba con los providers
 * "de infraestructura" que realmente necesitan para renderizar sin explotar:
 * - MemoryRouter: varios componentes usan useNavigate/useLocation de react-router-dom.
 * - AppThemeProvider + styled-components ThemeProvider: RenderIcon (usado por Button,
 *   ProductCard, etc.) llama a useAppTheme(), y los styled-components leen `theme.colors...`.
 *   Se replica el mismo anidado que main.jsx (AppThemeProvider -> ThemeWrapper -> ThemeProvider)
 *   para que ambos queden sincronizados.
 *
 * Los contextos de negocio (AuthContext, CartContext) NO se proveen aquí a propósito:
 * cada test-file los mockea a nivel de módulo (vi.mock) con exactamente los valores
 * de rol/carrito que ese escenario necesita, en vez de depender de un provider real
 * compartido que sería más difícil de controlar por test.
 */
function ThemeWrapper({ children }) {
  const { theme } = useAppTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

function AllTheProviders({ children, initialEntries = ["/"] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AppThemeProvider>
        <ThemeWrapper>{children}</ThemeWrapper>
      </AppThemeProvider>
    </MemoryRouter>
  );
}

function render(ui, { initialEntries, ...options } = {}) {
  return rtlRender(ui, {
    wrapper: (props) => (
      <AllTheProviders {...props} initialEntries={initialEntries} />
    ),
    ...options,
  });
}

export * from "@testing-library/react";
export { render };
