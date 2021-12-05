import React from "react";
import styled from "@emotion/styled";
import MainNav from "./MainNav";
import { NAV_LINK } from "../../../constants/category";

const NavigationWrapper = styled.nav`
  white-space: nowrap;
`;

const Navigation = () => {
  return (
    <NavigationWrapper>
      <MainNav linkList={NAV_LINK} />
    </NavigationWrapper>
  );
};

export default Navigation;
