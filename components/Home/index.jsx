import React, { useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import Banner from "./Banner";
import Guide from "./Guide";
import About from "./About";
import Group from "./Group";
import FacebookPosts from "./FacebookPosts";
import { Divider } from "@mui/material";
import WishResource from "./WishResource";
const HomeWrapper = styled.div``;

const Home = () => {
  const guideRef = useRef(null);
  return (
    <HomeWrapper>
      <Banner guideRef={guideRef} />
      <About />
      <Divider sx={{ margin: "10px 0" }} />
      <Group />
      <Divider sx={{ margin: "10px 0" }} />
      <FacebookPosts />
      <Divider sx={{ margin: "10px 0" }} />
      <WishResource />
      <Divider sx={{ margin: "10px 0" }} />
      <div ref={guideRef} />
      <Guide />
    </HomeWrapper>
  );
};

export default Home;
