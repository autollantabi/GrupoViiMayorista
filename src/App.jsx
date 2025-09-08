import "react-toastify/dist/ReactToastify.css";

import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  adminRoutes,
  ecommerceRoutes,
  coordinadorRoutes,
  publicRoutes,
} from "./routes/routes";
import { createGlobalStyle } from "styled-components";
import { useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./routes/ProtectedRoutes";
import CleanLayout from "./components/layout/CleanLayout";
import AuthenticatedLayout from "./components/layout/AuthenticatedLayout";
import { ROUTES } from "./constants/routes";
import { ROLES } from "./constants/roles";
import Home from "./pages/Home";

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    font-family: "Quicksand", sans-serif !important;
    font-optical-sizing: auto !important;
    font-weight: 400;
    font-style: normal;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  html, body, #root {
    max-width: 100vw;
    overflow-x: hidden;
    transition: background-color 0.3s ease, color 0.3s ease;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
  
  // Añadir transición para todos los elementos que usan colores temáticos
  button, a, input, select, textarea, div, span, p, h1, h2, h3, h4, h5, h6 {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }

   @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <GlobalStyle />

      <Routes>
        {/* Rutas públicas con layout limpio */}
        <Route element={<CleanLayout />}>
          {publicRoutes.map((route, idx) => (
            <Route
              key={`public-${idx}`}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>

        {/* Todas las rutas protegidas dentro del layout autenticado */}
        <Route
          element={
            <ProtectedRoute
              element={<AuthenticatedLayout />}
              allowedRoles={[
                ROLES.CLIENTE,
                ROLES.ADMIN,
                ROLES.COORDINADOR,
                ROLES.VISUALIZACION,
              ]}
            />
          }
        >
          {/* Ruta principal */}
          <Route path="/" element={<Home />} index />

          {/* Rutas de e-commerce */}
          {ecommerceRoutes
            .filter((route) => route.path !== "/")
            .map((route, idx) => (
              <Route
                key={`ecommerce-${idx}`}
                path={route.path}
                element={
                  <ProtectedRoute
                    element={route.element}
                    allowedRoles={route.allowedRoles}
                  />
                }
              />
            ))}

          {/* Rutas de admin */}
          {adminRoutes.map((route, idx) => (
            <Route
              key={`admin-${idx}`}
              path={route.path}
              element={
                <ProtectedRoute
                  element={route.element}
                  allowedRoles={route.allowedRoles}
                />
              }
            />
          ))}

          {/* Rutas de coordinador */}
          {coordinadorRoutes.map((route, idx) => (
            <Route
              key={`coord-${idx}`}
              path={route.path}
              element={
                <ProtectedRoute
                  element={route.element}
                  allowedRoles={route.allowedRoles}
                />
              }
            />
          ))}
        </Route>

        {/* Rutas not found y redirecciones finales */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to={ROUTES.PUBLIC.NOT_FOUND} />
            ) : (
              <Navigate to={ROUTES.AUTH.LOGIN} />
            )
          }
        />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          top: "50px",
          right: "20px",
        }}
      />
    </>
  );
};

export default App;
