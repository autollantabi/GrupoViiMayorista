import React from "react";
import FlexBoxComponent from "../components/common/FlexBox";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const Unauthorized = () => {
  const { navigateToHomeByRole } = useAuth();
  const handleClick = () => {
    navigateToHomeByRole();
  };
  return (
    <FlexBoxComponent
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <FlexBoxComponent justifyContent="center">
        No dispone de permisos para ingresar en esta seccion
      </FlexBoxComponent>
      <Button onClick={handleClick} text={"Regresar"} />
    </FlexBoxComponent>
  );
};

export default Unauthorized;
