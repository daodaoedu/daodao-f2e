import React from 'react';
import styled from '@emotion/styled';
// import { css } from "@emotion/react";
import { Box, Paper, Typography, Stack, Avatar } from '@mui/material';

const LinkWrapper = styled.a`
  color: black;
  &:hover {
    opacity: 100%;
    transition: color 0.5s ease;
    color: #16b9b3;
  }
`;

const SectionWrapper = styled.section`
  margin: 20px 0;
`;
const LineWrapper = styled(Typography)`
  margin: 5px 0;
`;

const NeedYou = () => {
  return (
    <SectionWrapper>
      <Typography
        variant="h2"
        sx={{
          margin: '40px 0 10px 0',
        }}
      >
        我們需要你！
      </Typography>
      <Stack sx={{ margin: '20px' }}>
        <LineWrapper variant="h3">
          🚀 「一個人可以走得快，但一群人可以走得遠」
        </LineWrapper>
        <LineWrapper variant="p">
          學習資源雖然豐富，但是資源四散各地，僅靠夥伴成員收錄實在是心有餘而力不足。
          且每一位夥伴皆是用空餘時間以志工型態共工，因此我們需要更多人的力量一起共編。
          如果你接觸過各類資源，在擅長的領域累積許多學習資源，也喜歡與陌生人哈啦，歡迎你一同加入島島阿學。
        </LineWrapper>
      </Stack>
      <Stack sx={{ margin: '20px' }}>
        <Typography variant="h3">🎁 協助新增資源</Typography>
        <LineWrapper variant="p">
          <LinkWrapper
            target="_blank"
            href="/contribute/resource"
            rel="noopener noreferrer"
          >
            請點選連結進行新增
          </LinkWrapper>
        </LineWrapper>
      </Stack>
      <Stack sx={{ margin: '20px' }}>
        <Typography variant="h3">🔍 資源審核編輯</Typography>
        <LineWrapper variant="p">
          <LinkWrapper
            target="_blank"
            href="https://join.slack.com/t/daodaoedu/shared_invite/zt-ob6ey3gh-FcP2g_IXgK6D3KRAGruaKQ"
            rel="noopener noreferrer"
          >
            我們需要各領域的夥伴加入我們的資源審核編輯團隊，審核及優化使用者新增的資源。
            若您有興趣，歡迎點選下方連結加入我們的slack，進去後請到主頻道和大家打招呼唷！
          </LinkWrapper>
        </LineWrapper>
      </Stack>
    </SectionWrapper>
  );
};

export default NeedYou;
