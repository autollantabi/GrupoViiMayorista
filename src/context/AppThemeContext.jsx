import { createContext, useContext, useEffect, useState } from "react";
import { lightTheme, darkTheme } from "../constants/theme";
import { usePreferredTheme } from "../hooks/usePreferredTheme";

const AppThemeContext = createContext();

export function AppThemeProvider({ children }) {
  // Usar localStorage para recordar la preferencia del usuario
  const systemPrefersDark = usePreferredTheme();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode !== null ? savedMode === "true" : systemPrefersDark;
  });

  // Elegir el tema basado en isDarkMode
  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Guardar preferencia en localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);

    // Aplicar clase al elemento HTML para estilos globales
    document.documentElement.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  return (
    <AppThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppTheme debe usarse dentro de AppThemeProvider");
  }
  return context;
}
