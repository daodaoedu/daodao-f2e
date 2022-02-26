import React, { useMemo } from "react";
import styled from "@emotion/styled";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Button, Fab } from "@mui/material";
import useScrollPosition from "@react-hook/window-scroll";
import { scrollToTop } from "../../../utils/ux";
// import { Navigation } from "@mui/icons-material";

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
      // <ScrollToTopWrapper>
      //   <Button
      //     variant="contained"
      //     onClick={scrollToTop}
      //     sx={{
      //       width: "64px",
      //       height: "64px",
      //       borderRadius: "20px",
      //       color: "white",
      //       fontWeight: "bold",
      //       borderRadius: "50%",
      //     }}
      //   >
      //     <ArrowUpwardIcon />
      //   </Button>
      // </ScrollToTopWrapper>
      <ScrollToTopWrapper>
        <Fab
          variant="extended"
          onClick={scrollToTop}
          sx={{
            backgroundColor: "#16b9b3",
            color: "white",
            fontWeight: "500",
            "&:focus": {
              backgroundColor: "#16b9b3",
            },
          }}
        >
          <ArrowUpwardIcon sx={{ marginRight: "6px" }} />
          置頂
        </Fab>
      </ScrollToTopWrapper>
    );
  }
  return <></>;
};

export default ScrollToTop;
