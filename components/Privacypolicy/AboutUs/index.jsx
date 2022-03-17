import React from "react";
import styled from "@emotion/styled";
import { Box, Typography, Stack } from "@mui/material";

const LineWrapper = styled(Typography)`
  margin: 5px 0;
`;

const AboutUs = () => {
  return (
    <Box>
      <Typography
        variant="h1"
        sx={{
          margin: "10px 0",
        }}
      >
        關於我們
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "20px 0",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={"https://i.imgur.com/1nhGPPR.png"}
          width="100%"
          alt="daodao"
        />
      </Box>
      <Stack>
        <LineWrapper variant="p">
          在島島阿學裡，每個人都是一座獨一無二的「島」，對於學習／生命擁有不同的渴望與資源，因為互相、互助學習，成為一片獨立又連結的群島。
        </LineWrapper>
        <LineWrapper variant="p">
          而島島阿學也希望能有台語「沓沓仔學Ta̍uh-ta̍uh-á
          o̍h」，「慢慢學不用急」之意涵，道出組織的教育價值觀是以人為本，尊重每人學習步調與方向。
        </LineWrapper>
        <LineWrapper variant="p">
          ｜島島阿學｜學習資源平台由一群學生、老師、家長共創。我們期盼以集體智慧，打造沒有天花板的學習環境，一個以自主學習為主的民主社群。邀請所有學習者一同解決彼此在學習時遇到的困境，例如找不到學習目標、合適資源、學習夥伴等問題。因此平台提供資源分享與整合，以及社群的服務，包含各領域各種形式的資源、教育活動、學習場域、學習經驗等等。我們認為社群即資源、支援，讓學習者在民主教育的社群中，以共好的概念，解決彼此學習的問題，支持彼此成為自己想成為的人。
        </LineWrapper>
      </Stack>
    </Box>
  );
};

export default AboutUs;
