import React from "react";
import styled from "@emotion/styled";
import Box from "@mui/material/Box";
import { Typography, Button } from "@mui/material";
import { FacebookRounded } from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import { useRouter } from "next/router";
import { COLOR_TABLE } from "../../../constants/notion";
import { CATEGORIES } from "../../../constants/category";
import RelatedResources from "../../../shared/components/RelatedResources";

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

const About = () => {
  const router = useRouter();
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
        來點島島阿學的資源吧！
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
          src="/assets/coffeeandlearning.gif"
          alt="coffeeandlearning"
          width="200"
          height="200"
        />
        <Box
          sx={{
            marginTop: "20px",
            marginLeft: "20px",
            fontSize: "18px",
          }}
        >
          <Box sx={{ margin: "5px 0", fontWeight: "500", fontSize: "20px" }}>
            <Typography>
              「學習資源爆炸多，卻常常找不到適合自己的？」
            </Typography>
          </Box>
          <Box sx={{ margin: "5px 0" }}>
            <Typography>✅ 由各領域資深學習者分享及彙整</Typography>
          </Box>
          <Box sx={{ margin: "5px 0" }}>
            <Typography>✅ 免費資源百百種</Typography>
          </Box>
          <Box sx={{ margin: "5px 0" }}>
            <Typography>✅ 資源跨領域跨年齡跨國</Typography>
          </Box>
          <Box sx={{ margin: "5px 0" }}>
            <Typography>✅ 三鍵篩選出合適資源</Typography>
          </Box>
          <Box sx={{ margin: "5px 0" }}>
            <Typography>✅ 人人都可以分享資源</Typography>
          </Box>
          <Box
            sx={{
              margin: "10px 0",
            }}
          >
            自主學習的時代，用共好共享成為彼此學習路上的橋樑吧！
          </Box>
          <Box
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
              豐富的學習類別
            </Typography>
            <Box sx={{ margin: "10px 0" }}>
              {CATEGORIES.map(({ key, value }) => (
                <Chip
                  key={key}
                  label={value}
                  value={value}
                  onClick={() => router.push(`/search?cats=${value}`)}
                  sx={{
                    backgroundColor: COLOR_TABLE.green,
                    opacity: "60%",
                    cursor: "pointer",
                    margin: "5px",
                    whiteSpace: "nowrap",
                    fontWeight: 500,
                    fontSize: "16px",
                    "&:hover": {
                      opacity: "100%",
                      backgroundColor: COLOR_TABLE.green,
                      transition: "transform 0.4s",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
      <RelatedResources
        title="👀 瞧瞧最新資源"
        searchScheme={{
          filter: { or: [] },
          page_size: 10,
        }}
      />
    </GuideWrapper>
  );
};

export default About;
