import React, { useState } from "react";
import styled from "@emotion/styled";
import Box from "@mui/material/Box";
import { Typography, Button } from "@mui/material";
import { FacebookRounded } from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import { useRouter } from "next/router";
import { COLOR_TABLE } from "../../../constants/notion";
import { CATEGORIES } from "../../../constants/category";
import SurveyModal from "../../../shared/components/SurveyModal";
const GuideWrapper = styled.div`
  width: 90%;
  /* height: calc(var(--section-height) + var(--section-height-offset)); */
  margin: 0 auto;
  padding-top: 80px;
  padding-bottom: 80px;
  .guide-title {
    color: #536166;
    font-weight: bold;
    font-size: 40px;
    line-height: 50px;
    letter-spacing: 0.08em;
    marginleft: "20px";
  }

  @media (max-width: 767px) {
    padding-top: 40px;
    padding-bottom: 20px;
  }
`;

const WishResource = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <GuideWrapper>
      <Typography
        variant="h2"
        sx={{
          color: "#536166",
          fontWeight: "bold",
          fontSize: "36px",
          lineHeight: "50px",
          letterSpacing: "0.08em",
          textAlign: "left",
          marginLeft: "20px",
        }}
      >
        找不到你要的資源嗎？
      </Typography>
      <Box
        sx={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          "@media(max-width: 767px)": {
            flexDirection: "column",
          },
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/floating-dog.gif"
          alt="floating-dog"
          width="200"
          height="200"
        />
        <Box
          sx={{
            marginTop: "20px",
            marginLeft: "auto",
            fontSize: "18px",
          }}
        >
          <Box sx={{ margin: "5px 0", fontWeight: "500", fontSize: "20px" }}>
            <Typography>
              如果你有想找的資源，歡迎大膽告訴我們！我們很想知道你的需求，島島的夥伴一直以來皆有在持續關注大家的意見，我們很歡迎樂於分享意見與反饋的你！也歡迎持續關注我們
            </Typography>
          </Box>
          {/* <Box
            sx={{
              margin: "20px 0",
            }}
          >
            <Typography
              variant="p"
              sx={{
                fontWeight: "bold",
              }}
            >
              快速反饋：
            </Typography>
          </Box> */}
          <Box
            sx={{
              margin: "20px 0 10px 0",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setOpen(true)}
              sx={{
                height: "46px",
                margin: "0 10px",
              }}
            >
              {/* <FacebookRounded sx={{ margin: "5px 0" }} /> */}
              <Typography variant="p">🏃‍♂️ 快速反饋</Typography>
            </Button>
          </Box>
        </Box>
        <SurveyModal open={open} setOpen={setOpen} />
      </Box>
    </GuideWrapper>
  );
};

export default WishResource;
