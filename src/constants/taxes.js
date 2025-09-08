// Constantes para impuestos y tasas
export const TAXES = {
  // IVA (Impuesto al Valor Agregado) - porcentaje
  IVA_PERCENTAGE: 15,
  
  // Otros impuestos que puedan necesitarse en el futuro
  // RETENTION_PERCENTAGE: 2,
  // CONSUMPTION_TAX_PERCENTAGE: 8,
};

// Función helper para calcular IVA
export const calculateIVA = (amount, percentage = TAXES.IVA_PERCENTAGE) => {
  return amount * (percentage / 100);
};

// Función helper para calcular precio con IVA incluido
export const calculatePriceWithIVA = (amount, percentage = TAXES.IVA_PERCENTAGE) => {
  return amount * (1 + percentage / 100);
};

// Función helper para calcular precio sin IVA
export const calculatePriceWithoutIVA = (amount, percentage = TAXES.IVA_PERCENTAGE) => {
  return amount / (1 + percentage / 100);
}; 