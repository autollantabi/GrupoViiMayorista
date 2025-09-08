import React from "react";
import FlexBoxComponent from "../components/common/FlexBox";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const NotFound = () => {
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
        404 | Page Not Found
      </FlexBoxComponent>
      <Button onClick={handleClick} text={"Home"} />
    </FlexBoxComponent>
  );
};

export default NotFound;
