/**
 * Sistema de temas para Portal Mayorista
 * Incluye configuraciones para tema claro y oscuro
 */

// Breakpoints para diseño responsive
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

// Configuraciones base compartidas entre temas
const baseTheme = {
  // Tipografía
  typography: {
    fontFamily: {
      main: "'Roboto', 'Segoe UI', Arial, sans-serif",
      headings: "'Montserrat', 'Segoe UI', Arial, sans-serif",
      mono: "'Roboto Mono', monospace",
    },
    fontSizes: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      md: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.8,
    },
  },

  // Espaciado
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "2.5rem", // 40px
    "3xl": "3rem", // 48px
  },

  // Bordes
  borders: {
    radius: {
      none: "0",
      sm: "0.125rem", // 2px
      md: "0.25rem", // 4px
      lg: "0.5rem", // 8px
      xl: "1rem", // 16px
      full: "9999px", // Círculo completo
    },
    width: {
      none: 0,
      thin: "1px",
      thick: "2px",
      thicker: "3px",
    },
  },

  // Sombras
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },

  // Transiciones
  transitions: {
    default: "all 0.2s ease-in-out",
    fast: "all 0.1s ease-in-out",
    slow: "all 0.3s ease-in-out",
  },

  // Breakpoints
  breakpoints,

  // Opacidades
  opacities: {
    none: 0,
    low: 0.25,
    medium: 0.5,
    high: 0.75,
    full: 1,
  },

  // Z-index
  zIndex: {
    hide: -1,
    auto: "auto",
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// Tema claro
export const lightTheme = {
  ...baseTheme,
  name: "light",
  colors: {
    // Colores principales
    primary: "#fd4703",
    secondary: "#f8f9fa",
    accent: "#e67e22",
    tertiary: "#28a745", // Añadir tertiary que faltaba

    // Estado de UI
    success: "#28a745",
    warning: "#ffc107",
    error: "#dc3545",
    info: "#17a2b8",
    

    // Variaciones de grises
    background: "#f5f5f5",
    surface: "#ffffff",
    text: "#2e2e2e",
    textSecondary: "#6c757d",
    textLight: "#6c757d", // Añadir textLight (mismo que textSecondary)
    border: "#dee2e6",

    // Utilidades
    shadow: "rgba(0, 0, 0, 0.1)",
    overlay: "rgba(0, 0, 0, 0.5)",
    placeholder: "#6c757d",

    // Otros colores
    white: "#ffffff",
    black: "#000000",
    transparent: "transparent",

    // Estados deshabilitados
    disabled: {
      background: "#f5f5f5",
      border: "#e0e0e0",
      text: "#9e9e9e",
      placeholder: "#c0c0c0",
    },
    disabledPlaceholder: "#c0c0c0", // Añadir disabledPlaceholder

    // Colores de empresas
    brands: {
      maxximundo: "#0056b3",
      stox: "#28a745",
      ikonix: "#dc3545",
      automax: "#fd7e14",
    },
  },
};

// Tema oscuro
export const darkTheme = {
  ...baseTheme,
  name: "dark",
  colors: {
    // Colores principales
    primary: "#ff5722", // Naranja más brillante para mejor contraste en modo oscuro
    secondary: "#3d3d3d",
    accent: "#f39c12",
    tertiary: "#2ecc71", // Añadir tertiary

    // Estado de UI
    success: "#4caf50", // Verde más brillante para mejor contraste
    warning: "#ffc107",
    error: "#f44336", // Rojo más brillante para mejor contraste
    info: "#03a9f4", // Azul más brillante para mejor contraste

    // Variaciones de grises
    background: "#1a1a1a", // Más oscuro para mejor contraste
    surface: "#333333",
    text: "#f5f5f5", // Más claro para mejor contraste
    textSecondary: "#bbb",
    textLight: "#bbb", // Añadir textLight (mismo que textSecondary)
    border: "#555555", // Más claro para mejor visibilidad

    // Utilidades
    shadow: "rgba(0, 0, 0, 0.5)",
    overlay: "rgba(0, 0, 0, 0.7)",
    placeholder: "#888888",

    // Otros colores
    white: "#ffffff",
    black: "#000000",
    transparent: "transparent",

    // Estados deshabilitados
    disabled: {
      background: "#3d3d3d",
      border: "#4d4d4d",
      text: "#777777",
      placeholder: "#666666",
    },
    disabledPlaceholder: "#666666", // Añadir disabledPlaceholder

    // Colores de empresas
    brands: {
      maxximundo: "#2196f3",
      stox: "#4caf50",
      ikonix: "#f44336",
      automax: "#ff9800",
    },
  },
};

// Tema por defecto
export default lightTheme;
