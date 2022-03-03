import React from "react";
import styled from "@emotion/styled";
import { AppBar } from "@mui/material";
import MainNav from "./MainNav";

const NavigationWrapper = styled(AppBar)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  padding-left: 5%;
  padding-right: 5%;
  .MuiToolbar-root {
    padding: 0;
  }
`;

// const ToolbarWrapper = styled(Toolbar)`
//   margin: 0 auto;
// `;
// 問卷 https://docs.google.com/forms/d/e/1FAIpQLSeyU9-Q-kIWp5uutcik3h-RO4o5VuG6oG0m-4u1Ua18EOu3aw/viewform
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
