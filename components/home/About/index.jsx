import React from "react";
import styled from "@emotion/styled";
import Box from "@mui/material/Box";
import { Typography, Button } from "@mui/material";
import { FacebookRounded } from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import { useRouter } from "next/router";
import { COLOR_TABLE } from "../../../constants/notion";

const CATEGORIES = [
  {
    key: "language",
    value: "語言與文學",
  },
  {
    key: "math",
    value: "數學與邏輯",
  },
  {
    key: "comsci",
    value: "資訊與工程",
  },
  {
    key: "humanity",
    value: "人文社會",
  },
  {
    key: "natusci",
    value: "自然科學",
  },
  {
    key: "art",
    value: "藝術",
  },
  {
    key: "education",
    value: "教育",
  },
  {
    key: "life",
    value: "生活",
  },
  {
    key: "health",
    value: "運動/心理/醫學",
  },
  {
    key: "business",
    value: "商業與社會創新",
  },
  {
    key: "multires",
    value: "綜合型學習資源",
  },
];

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
          fontSize: "40px",
          lineHeight: "50px",
          letterSpacing: "0.08em",
          textAlign: "left",
          marginLeft: "20px",
        }}
      >
        今天來一點島島阿學的資源吧
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
          <Typography variant="p">
            我們是島島阿學學習社群，努力搭起互助學習的橋梁
          </Typography>
          <Typography variant="p">
            期盼以集體智慧，打造沒有天花板的學習環境，一個以自主學習為主的民主社群。
          </Typography>
          <Typography variant="p">
            平台提供資源分享與整合，以及社群的服務，包含各領域各種形式的資源、教育活動、學習場域、學習經驗等等。
          </Typography>
          <Typography variant="p">
            我們認為社群即資源、支援，讓學習者在民主教育的社群中，以共好的概念，解決彼此學習的問題，支持彼此成為自己想成為的人。
          </Typography>
          <Box
            sx={{
              margin: "20px 0",
            }}
          >
            <Typography
              variant="p"
              sx={{
                fontWeight: "500",
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
    </GuideWrapper>
  );
};

export default About;
