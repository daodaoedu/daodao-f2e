import React from "react";
import styled from "@emotion/styled";
import Box from "@mui/material/Box";
import { Button, Typography } from "@mui/material";
import { FacebookRounded } from "@mui/icons-material";
import { useRouter } from "next/router";

const GroupWrapper = styled.div`
  width: 90%;
  /* height: calc(var(--section-height) + var(--section-height-offset)); */
  margin: 0 auto;
  padding-top: 80px;
  padding-bottom: 80px;

  @media (max-width: 767px) {
    padding-top: 40px;
    padding-bottom: 20px;
  }
`;

const Group = () => {
  const router = useRouter();
  return (
    <GroupWrapper>
      <Typography
        variant="h2"
        sx={{
          color: "#536166",
          fontWeight: "bold",
          fontSize: "40px",
          lineHeight: "50px",
          letterSpacing: "0.08em",
          textAlign: "right",
          marginRight: "20px",
          "@media(max-width: 767px)": {
            textAlign: "left",
          },
        }}
      >
        加入島島社群
      </Typography>
      <Box
        sx={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          "@media(max-width: 767px)": {
            flexDirection: "column-reverse",
          },
        }}
      >
        <Box
          sx={{
            marginTop: "50px",
            marginLeft: "20px",
            fontSize: "18px",
          }}
        >
          <Typography variant="p">
            島島阿學學習社群努力搭起互助學習的橋梁
          </Typography>
          <Typography variant="p">
            期盼以集體智慧，打造沒有天花板的學習環境，一個以自主學習為主的民主社群
          </Typography>
          <Typography variant="p">
            平台提供資源分享與整合，以及社群的服務，包含各領域各種形式的資源、教育活動、學習場域、學習經驗等等
          </Typography>
          <Typography variant="p">
            我們認為社群即資源、支援，讓學習者在民主教育的社群中以共好的概念解決彼此學習的問題，支持彼此成為自己想成為的人。
          </Typography>
          <Box
            sx={{
              margin: "40px 0 10px 0",
            }}
          >
            <Button
              variant="outlined"
              onClick={() =>
                open(
                  "https://www.facebook.com/groups/2237666046370459",
                  "_blank"
                )
              }
            >
              <FacebookRounded sx={{ margin: "5px 0" }} />
              <Typography variant="p">加入社群</Typography>
            </Button>
          </Box>
        </Box>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/group.gif"
          alt="coffeeandlearning"
          width="300"
          height="300"
        />
      </Box>
    </GroupWrapper>
  );
};

export default Group;
