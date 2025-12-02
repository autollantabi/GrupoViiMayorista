/**
 * Configuración de estados de bonos
 * Centraliza los colores, nombres y configuraciones de los estados de bonos
 */

export const BONO_STATES = {
  ACTIVO: "ACTIVO",
  USADO: "USADO",
  VENCIDO: "VENCIDO",
  PENDIENTE: "PENDIENTE",
  RECHAZADO: "RECHAZADO",
};

export const BONO_STATE_CONFIG = {
  [BONO_STATES.ACTIVO]: {
    label: "Activo",
    backgroundColor: "#d4edda",
    color: "#155724",
    backgroundColorAlpha: "#10b98120", // Para usar con theme
  },
  [BONO_STATES.USADO]: {
    label: "Usado",
    backgroundColor: "#fff3cd",
    color: "#856404",
    backgroundColorAlpha: "#f5940820", // Para usar con theme
  },
  [BONO_STATES.VENCIDO]: {
    label: "Vencido",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    backgroundColorAlpha: "#ef444420", // Para usar con theme
  },
  [BONO_STATES.PENDIENTE]: {
    label: "Pendiente",
    backgroundColor: "#e2e8f0",
    color: "#6b7280",
    backgroundColorAlpha: "#6b728020",
  },
  [BONO_STATES.RECHAZADO]: {
    label: "Rechazado",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    backgroundColorAlpha: "#dc262620",
  },
};

/**
 * Obtiene la configuración de un estado de bono
 * @param {string} estado - El estado del bono
 * @returns {object} Configuración del estado
 */
export const getBonoStateConfig = (estado) => {
  return (
    BONO_STATE_CONFIG[estado] || {
      label: estado || "Desconocido",
      backgroundColor: "#e2e3e5",
      color: "#6c757d",
      backgroundColorAlpha: "#6c757d20",
    }
  );
};

/**
 * Obtiene el label de un estado de bono
 * @param {string} estado - El estado del bono
 * @returns {string} Label del estado
 */
export const getBonoStateLabel = (estado) => {
  return getBonoStateConfig(estado).label;
};

/**
 * Obtiene el color de fondo de un estado de bono
 * @param {string} estado - El estado del bono
 * @param {boolean} useAlpha - Si debe usar la versión con transparencia
 * @returns {string} Color de fondo
 */
export const getBonoStateBackgroundColor = (estado, useAlpha = false) => {
  const config = getBonoStateConfig(estado);
  return useAlpha ? config.backgroundColorAlpha : config.backgroundColor;
};

/**
 * Obtiene el color de texto de un estado de bono
 * @param {string} estado - El estado del bono
 * @returns {string} Color de texto
 */
export const getBonoStateColor = (estado) => {
  return getBonoStateConfig(estado).color;
};
