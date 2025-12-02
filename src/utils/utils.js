import { toast } from "react-toastify";

/**
 * Funcion para copiar al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<void>}
 */
export const copyToClipboard = async (text) => {
  try {
    // Fallback para navegadores antiguos
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      toast.success("ID de pedido copiado");
    } catch (err) {
      toast.error("No se pudo copiar el ID");
    }
    document.body.removeChild(textarea);
  } catch (error) {
    console.error("Error al copiar al portapapeles:", error);
  }
};

/**
 * Funcion para cambiar la opacidad de un color hex a rgba
 * @param {string} color - Color hex
 * @param {number} opacity - Opacidad
 * @returns {string} Color rgba
 */
export const getRGBA = (color, opacity) => {
  return `rgba(${color
    .match(/\w\w/g)
    .map((x) => parseInt(x, 16))}, ${opacity})`;
};
