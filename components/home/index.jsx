import React, { useMemo, useRef } from "react";
import styled from "@emotion/styled";
import Banner from "./Banner";
import Guide from "./Guide";
import About from "./About";
import Group from "./Group";

const HomeWrapper = styled.div``;

const Home = () => {
  const guideRef = useRef(null);
  return (
    <HomeWrapper>
      <Banner guideRef={guideRef} />
      <About />
      <Group />
      <div ref={guideRef} />
      <Guide />
    </HomeWrapper>
  );
};

export default Home;
