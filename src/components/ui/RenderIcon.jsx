import * as FiIcons from "react-icons/fi";
import * as AiIcons from "react-icons/ai";
import * as MdIcons from "react-icons/md";
import * as FaIcons from "react-icons/fa";
import * as RiIcons from "react-icons/ri";
import * as BsIcons from "react-icons/bs";
import * as LuIcons from "react-icons/lu";
import { FiHelpCircle } from "react-icons/fi";
import { useAppTheme } from "../../context/AppThemeContext";

const iconLibraries = {
  "Fi": FiIcons, // Feather
  "Ai": AiIcons, // Ant Design
  "Md": MdIcons, // Material Design
  "Fa": FaIcons, // FontAwesome
  "Ri": RiIcons, // Remix
  "Bs": BsIcons, // Bootstrap
  "Lu": LuIcons, // Lucide
};

export default function RenderIcon({
  name = "",
  size = 24,
  color,
  style,
  ...props
}) {
  const { colors } = useAppTheme();

  // Si no hay nombre, mostramos el icono de ayuda
  if (!name) {
    return <FiHelpCircle size={size} style={{ color: "red" }} {...props} />;
  }

  // Extraemos el prefijo (primeros 2 caracteres del nombre)
  const prefix = name.substring(0, 2);
  
  // Buscamos la biblioteca correspondiente al prefijo
  const iconLibrary = iconLibraries[prefix];

  if (!iconLibrary) {
    return <FiHelpCircle size={size} style={{ color: "red" }} {...props} />;
  }

  // Obtenemos el componente del icono de la biblioteca
  const IconComponent = iconLibrary[name];

  if (IconComponent) {
    return (
      <IconComponent
        size={size}
        style={{
          color: color || colors?.text, // Color personalizado o del tema
          stroke: color || "currentColor", // Forzar stroke
          cursor: props.onClick ? "pointer" : undefined,
          ...style, // Estilos adicionales
        }}
        {...props}
      />
    );
  }

  return <FiHelpCircle size={size} style={{ color: "red" }} {...props} />;
}
