import React from "react";
import styled from "@emotion/styled";
import { Toolbar } from "@mui/material";
import Box from "@mui/material/Box";
import Hamberger from "./Hamberger";
import List from "./List";
import SubList from "./SubList";
import Logo from "./Logo";

const MainNavWrapper = styled(Toolbar)`
  /* max-width: 1200px; */
  width: 100%;
`;

const BoxWrapper = styled(Box)`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: auto;
  @media (max-width: 767px) {
    width: 90%;
    /* flex-direction: column; */
  }
`;

const MainNav = () => {
  return (
    <MainNavWrapper>
      <BoxWrapper sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Logo />
        {/* main list */}
        <List />
        {/* right list */}
        <SubList />
        {/* mobile only */}
        <Hamberger />
      </BoxWrapper>
    </MainNavWrapper>
  );
};

export default MainNav;
