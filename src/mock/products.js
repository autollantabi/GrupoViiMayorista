// Importar logos de empresas
import AutollantaLight from "../assets/enterprises/AutollantaLight.png";
import AutollantaDark from "../assets/enterprises/AutollantaDark.png";
import MaxximundoLight from "../assets/enterprises/MaxximundoLight.png";
import MaxximundoDark from "../assets/enterprises/MaxximundoDark.png";
import StoxLight from "../assets/enterprises/StoxLight.png";
import StoxDark from "../assets/enterprises/StoxDark.png";
import IkonixLight from "../assets/enterprises/IkonixLight.png";
import IkonixDark from "../assets/enterprises/IkonixDark.png";

// Definir primero las empresas y sus marcas asociadas
export const empresas = [
  {
    id: "AUTOLLANTA",
    nombre: "AUTOLLANTA",
    descripcion: "Especialistas en neumáticos de alta calidad",
    logoLight: AutollantaLight,
    logoDark: AutollantaDark,
    color: "#0056b3",
    marcas: ["Fortune", "Roadcruza"],
    products: 210,
  },
  {
    id: "MAXXIMUNDO",
    nombre: "MAXXIMUNDO",
    descripcion: "Neumáticos y lubricantes de calidad superior",
    logoLight: MaxximundoLight,
    logoDark: MaxximundoDark,
    color: "#28a745",
    marcas: ["Maxxis", "Shell", "Roadcruza", "Aplus"],
    products: 312,
  },
  {
    id: "STOX",
    nombre: "STOX",
    descripcion: "Neumáticos de la mejor calidad",
    logoLight: StoxLight,
    logoDark: StoxDark,
    color: "#dc3545",
    marcas: ["CST", "Farroad", "Ansu", "Bayi-Rubber"],
    products: 240,
  },
  {
    id: "IKONIX",
    nombre: "IKONIX",
    descripcion: "Herramientas y maquinaria",
    logoLight: IkonixLight,
    logoDark: IkonixDark,
    color: "#6610f2",
    marcas: ["Uyustools", "FSL"],
    products: 347,
  },
];

// Función helper para obtener el logo según el tema
export const getEmpresaLogo = (empresa, isDarkMode) => {
  return isDarkMode ? empresa.logoDark : empresa.logoLight;
};
