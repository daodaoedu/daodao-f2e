/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import styled from '@emotion/styled';
// import { css } from "@emotion/react";
import { Box, Paper, Typography, Stack, Avatar } from '@mui/material';

const LineWrapper = styled(Typography)`
  margin: 5px 0;
`;

const SectionWrapper = styled.section`
  margin: 20px 0;
`;
const Thanks = () => {
  return (
    <SectionWrapper>
      <Typography
        variant="h2"
        sx={{
          margin: '40px 0 10px 0',
        }}
      >
        開發技術
      </Typography>
      <Stack
        sx={{
          margin: '20px',
        }}
      >
        <LineWrapper variant="p">
          <p float="left" margin="10px">
            <img
              src="https://media.giphy.com/media/I2Gobnade5rqM/giphy.gif"
              height="80px"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png"
              height="80px"
            />
            <img
              src="https://seeklogo.com/images/N/next-js-logo-8FCFF51DD2-seeklogo.com.png"
              height="100px"
            />
            <img src="https://mui.com/static/logo.png" height="80px" />
            {/* <img
              src="https://redux-saga.js.org/img/Redux-Saga-Logo.png"
              height="100px"
            /> */}
            <img
              src="https://raw.githubusercontent.com/emotion-js/emotion/main/emotion.png"
              height="80px"
            />
            <img
              src="https://www.cloudflare.com/resources/images/slt3lc6tev37/CHOl0sUhrumCxOXfRotGt/9bf83d4ca877bb8f0f917c8d379a84ce/cloudflare-icon-color_3x.png"
              height="80px"
            />
            <img
              src="https://repository-images.githubusercontent.com/175043545/92352780-93a7-11ea-805a-0e76ca033a94"
              height="80px"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
              height="80px"
            />
          </p>
        </LineWrapper>
        <LineWrapper variant="p" sx={{ fontWeight: '500' }}>
          目前專案技術包含：React 18, NEXT.JS 12, MUI, emotion, cloudflare
          services, 🤠 wrangler, Notion, Slack bot
        </LineWrapper>
        <LineWrapper variant="p" sx={{ fontWeight: '500' }}>
          島島社群的IT部夥伴從國中生到工程師都有，我們是一群夢想的追尋者，我們認為開發不應該只是開發一個產品，而是實現夢想的一種方式。
        </LineWrapper>
        <LineWrapper variant="p" sx={{ fontWeight: '500' }}>
          夥伴們不定期會觀察最近有哪些新出的beta技術適合用在專案上，由於考量到開發夥伴的多樣性，因此我們的設計與技術會盡可能的親民化與保持開發彈性。選擇親民化的設計與彈性一直以來都是難以平衡的課題，因此不定期的技術研究是一件蠻重要的議題。
        </LineWrapper>
        <LineWrapper variant="p" sx={{ fontWeight: '500' }}>
          為了讓非開發的夥伴也能參與修改網站部分內容或功能，目前也有設計slack聊天機器人指令執行簡單的動作。
        </LineWrapper>
        {/* <LineWrapper variant="p" sx={{ fontWeight: "500" }}>
          <img
            src="https://media.giphy.com/media/l0MYFwjgTKh5X4jew/giphy.gif"
            alt="bear"
            width={100}
            height={100}
          />
        </LineWrapper> */}
      </Stack>
    </SectionWrapper>
  );
};

export default Thanks;
