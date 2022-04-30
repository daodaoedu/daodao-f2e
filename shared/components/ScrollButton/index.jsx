import React from "react";
import { Box } from "@mui/material";
import { ArrowDropDownCircle } from "@mui/icons-material";

const ScrollButton = ({ isShowScrollButton, onScrollEvent, type }) => {
  if (type === "left" && isShowScrollButton) {
    return (
      <Box
        sx={{
          position: "absolute",
          left: 15,
          top: "50%",
          transform: "rotate(90deg) translate(-60%, 50%)",
          zIndex: 2,
          opacity: 0.5,
        }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            width: 20,
            height: 20,
            position: "absolute",
            top: "25%",
            right: "25%",
            zIndex: -1,
          }}
        />
        <ArrowDropDownCircle
          color="white"
          sx={{
            fontSize: "40px",
            cursor: "pointer",
            color: "#16b9b3",
            zIndex: 1,
          }}
          onClick={onScrollEvent}
        />
      </Box>
    );
  }
  if (type === "right" && isShowScrollButton) {
    return (
      <Box
        sx={{
          position: "absolute",
          right: 15,
          top: "50%",
          transform: "rotate(-90deg) translate(60%, 50%)",
          zIndex: 2,
          opacity: 0.5,
        }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            width: 20,
            height: 20,
            position: "absolute",
            top: "25%",
            right: "25%",
            zIndex: -1,
          }}
        />
        <ArrowDropDownCircle
          color="white"
          sx={{
            fontSize: "40px",
            cursor: "pointer",
            color: "#16b9b3",
            zIndex: 1,
          }}
          onClick={onScrollEvent}
        />
      </Box>
    );
  }

  return <></>;
};

export default ScrollButton;
