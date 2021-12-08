import React from "react";
import styled from "@emotion/styled";
import { AppBar } from "@material-ui/core";
import MainNav from "./MainNav";

const NavigationWrapper = styled(AppBar)`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: black;
  height: 80px;
`;

// const ToolbarWrapper = styled(Toolbar)`
//   margin: 0 auto;
// `;

const Navigation = () => {
  return (
    <NavigationWrapper position="sticky">
      {/* <Toolbar> */}
      <MainNav />
      {/* </Toolbar> */}
    </NavigationWrapper>
  );
};

export default Navigation;
