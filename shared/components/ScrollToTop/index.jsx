import React, { useMemo } from "react";
import styled from "@emotion/styled";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Button from "@mui/material/Button";
import useScrollPosition from "@react-hook/window-scroll";
import { scrollToTop } from "../../../utils/ux";

const ScrollToTopWrapper = styled.div`
  position: fixed;
  right: 60px;
  top: 85vh;
  opacity: 60%;
  span {
    opacity: 80%;
    margin-left: 10px;
  }

  @media (max-width: 767px) {
    right: 40px;
  }
`;

const ScrollToTop = () => {
  const scrollY = useScrollPosition(30);
  const isScrollDown = useMemo(() => scrollY > 500, [scrollY]);
  if (isScrollDown) {
    return (
      <ScrollToTopWrapper>
        <Button
          variant="contained"
          onClick={scrollToTop}
          sx={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            color: "white",
            fontWeight: "bold",
            borderRadius: "50%",
          }}
        >
          <ArrowUpwardIcon />
        </Button>
      </ScrollToTopWrapper>
    );
  }
  return <></>;
};

export default ScrollToTop;
