/**
 * Remueve el código interno de la condición de pago (ej. "V.8.0.2", "V.2.", "Z")
 * y deja solo la descripción legible.
 * Funciona con cualquier cantidad de segmentos (V.7, V.7.1, V.8.0.2, V.9.02, etc.)
 * porque no depende del contenido exacto sino de la ESTRUCTURA: una letra seguida
 * de bloques ".número" y un espacio final.
 */
export const stripPaymentConditionCode = (text) => {
  if (!text) return "";
  return text.replace(/^[A-Z](\.\d+)*\.?\s+/, "").trim();
};