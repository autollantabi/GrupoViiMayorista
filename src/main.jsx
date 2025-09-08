import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider } from "styled-components";
import { BrowserRouter } from "react-router-dom";
import { AppThemeProvider, useAppTheme } from "./context/AppThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ProductCatalogProvider } from "./context/ProductCatalogContext.jsx";

function Root() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ProductCatalogProvider>
            <AppThemeProvider>
              <ThemeWrapper>
                <App />
              </ThemeWrapper>
            </AppThemeProvider>
          </ProductCatalogProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Componente auxiliar para manejar el ThemeProvider
function ThemeWrapper({ children }) {
  const { theme } = useAppTheme(); // Ahora sí está dentro del AppThemeProvider

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
