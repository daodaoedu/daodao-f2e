import React from 'react';
import styled from '@emotion/styled';
// import { css } from "@emotion/react";
import { Box, Paper, Typography, Stack, Avatar, Button } from '@mui/material';

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
        加入島島阿學團隊，一起改變教育現況！！
      </Typography>
      <Stack sx={{ margin: '10px 20px' }}>
        <LineWrapper variant="p" sx={{ fontWeight: 'bold' }}>
          🕴 發揮所長 x 教育共好 - 你 就是教育影響力！
        </LineWrapper>
      </Stack>
      <Stack sx={{ margin: '10px 20px' }}>
        <LineWrapper variant="p">
          如果你具有濃厚的教育議題熱忱，那這邊很適合你！
        </LineWrapper>
        <LineWrapper variant="p">
          如果你是一位自學生（不限於高中體制外）或是不滿教育現況的學習者，那這邊很適合你！
        </LineWrapper>
        <LineWrapper variant="p">
          島島阿學多元學習團隊
          <Typography sx={{ fontWeight: 'bold' }}> 長期徵求 </Typography>
          具有任何技能的夥伴加入我們！
        </LineWrapper>
        <LineWrapper variant="p">
          我們很歡迎願意貢獻技能的你，或是擁有自主解決問題且熱忱的你，儘管僅僅有一週內的幾分鐘寶貴時間，我們也很珍惜你在社群上的貢獻！
        </LineWrapper>
        <LineWrapper>
          <Typography>
            有興趣的人都歡迎來和我們聯絡，可先加入{' '}
            <Typography
              component="a"
              href="http://join.g0v.tw/"
              target="_blank"
              rel="noreferrer"
              sx={{
                color: 'black',
                textDecoration: 'underline',
                fontWeight: 'bold',
              }}
            >
              g0v slack 搜尋 #edu-daodao 追蹤我們
            </Typography>{' '}
          </Typography>
          之後會有小天使和你聊聊唷，也可以主動在上面和大家開話題！
        </LineWrapper>
        <LineWrapper>
          <Typography sx={{ fontWeight: 'bold' }}>
            或是點擊以下的了解更多
          </Typography>
        </LineWrapper>
        <Button
          variant="outlined"
          onClick={() =>
            window.open(
              'https://g0v.hackmd.io/@daodaoedu/HydZGAUYc/https%3A%2F%2Fg0v.hackmd.io%2Fc%2FHydZGAUYc%2Fedit%3Fedit',
              '_blank',
            )
          }
          sx={{
            height: '40px',
            width: '120px',
            margin: '0 10px',
          }}
        >
          <Typography variant="p">🏃‍♂️ 了解更多</Typography>
        </Button>
      </Stack>
      <Stack sx={{ margin: '20px' }}>
        <LineWrapper variant="h3">🛫 解決與洞察教育議題</LineWrapper>
        <LineWrapper variant="p">
          如果你不止想要參與島島阿學社群的相關活動，也想要一起加入島島阿學團隊解決與洞察教育議題的話，那麼我們很歡迎你的加入！
        </LineWrapper>
      </Stack>
      <Stack sx={{ margin: '20px' }}>
        <LineWrapper variant="h3">💫 協作多元學習資源</LineWrapper>
        <LineWrapper variant="p">
          學習資源雖然豐富，但是資源四散各地，僅靠夥伴成員收錄實在是心有餘而力不足。
          且每一位夥伴皆是用空餘時間以志工型態共工，因此我們需要更多人的力量一起共編。
          如果你接觸過各類資源，在擅長的領域累積許多學習資源，也喜歡與陌生人哈啦，歡迎你一同加入島島阿學團隊。
        </LineWrapper>
      </Stack>

      {/* <Stack sx={{ margin: '20px' }}>
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
      </Stack> */}
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
