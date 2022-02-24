import React from "react";
import styled from "@emotion/styled";
// import { css } from "@emotion/react";
import { Box, Paper, Typography, Stack } from "@mui/material";

const ResourceWrapper = styled.section`
  padding-top: 40px;
  padding-bottom: 40px;
  .title {
    font-size: 24px;
    font-weight: 500;
    margin: 0 10px 0 0;
    color: black;
    &:hover {
      cursor: pointer;
      color: #37b9eb;
      transition: 0.5s;
    }
  }
  @media (max-width: 767px) {
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }
`;

// const ImageWrapper = styled.div`
//   border-radius: 20px;
//   /* width: 100%;
//   height: 300px; */
//   ${({ image }) => css`
//     background-image: ${`url(${image})`};
//     background-size: cover;
//     background-repeat: no-repeat;
//     background-position: 50% 50%;
//     border-radius: 10px;
//     filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
//   `}
// `;

const ContributeResource = () => {
  return (
    <ResourceWrapper>
      <Paper
        sx={{
          width: "80%",
          margin: "0 auto",
          padding: "20px",
        }}
      >
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
              //   height={400}
              width="100%"
              alt="daodao"
            />
          </Box>
          <Stack>
            <Typography variant="p">
              在島島阿學裡，每個人都是一座獨一無二的「島」，對於學習／生命擁有不同的渴望與資源，因為互相、互助學習，成為一片獨立又連結的群島。
            </Typography>
            <Typography variant="p">
              而島島阿學也希望能有台語「沓沓仔學Ta̍uh-ta̍uh-á
              o̍h」，「慢慢學不用急」之意涵，道出組織的教育價值觀是以人為本，尊重每人學習步調與方向。
            </Typography>
            <Typography variant="p">
              ｜島島阿學｜學習資源平台由一群學生、老師、家長共創。我們期盼以集體智慧，打造沒有天花板的學習環境，一個以自主學習為主的民主社群。邀請所有學習者一同解決彼此在學習時遇到的困境，例如找不到學習目標、合適資源、學習夥伴等問題。因此平台提供資源分享與整合，以及社群的服務，包含各領域各種形式的資源、教育活動、學習場域、學習經驗等等。我們認為社群即資源、支援，讓學習者在民主教育的社群中，以共好的概念，解決彼此學習的問題，支持彼此成為自己想成為的人。
            </Typography>
          </Stack>
        </Box>
        <Box
          sx={{
            margin: "20px 0",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              margin: "40px 0 10px 0",
            }}
          >
            我們的第一步！創建一個「可共編的教育資源網站」！
          </Typography>
          <Stack
            sx={{
              margin: "20px",
            }}
          >
            <Typography variant="p">
              由108課綱的推動以及實驗教育的蓬勃發展，可以觀察到臺灣社會對於多元／自主學習的需求逐步提升。然而我們發現，在邁向自主學習的路上，不論學習者、教育工作者、家長時常苦於找不到合適資源。
            </Typography>
            <Typography variant="p">
              而這並非因為資源不夠充足，而是因為社經背景及資料查找能力的落差，以及對資源定義較狹義，使得資源無法透明化，此外也因資源太多太雜難以查找，故出現「學習資源遍地開花，卻無法與有需求者做連結」的現象。
            </Typography>
            <Typography variant="p">
              我們期盼能透過建置一個人人皆能共編的【島島阿學】學習資源平台，提供可以資源整合的服務，包含線上資源、組織、人、實體學習點、活動、教育場域等資源，成為促動人與人、需求與資源之間共好的橋樑，進一步解決資源不透明的問題，讓學習者更順利地完成自主學習。
            </Typography>
          </Stack>
        </Box>
        <Box
          sx={{
            margin: "20px 0",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              margin: "40px 0 10px 0",
            }}
          >
            想了解更多嗎？
          </Typography>
          <Stack
            sx={{
              margin: "20px",
            }}
          >
            <Typography variant="p">
              島島阿學｜如何透過集體智慧解決自主學習困境，推動民主教育？
              https://www.youtube.com/watch?v=7d8e-onHJfo&t=80s
            </Typography>
            <Typography variant="p">
              島島阿學發展歷程 https://www.behance.net/gallery/113709435/_
            </Typography>
          </Stack>
        </Box>
        <Box
          sx={{
            margin: "20px 0",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              margin: "40px 0 10px 0",
            }}
          >
            相關報導
          </Typography>
          <Stack
            sx={{
              margin: "20px",
            }}
          >
            <Typography variant="p">
              國立教育廣播電台 – 生活 In
              Design：青年打造理想國：《島島阿學》用科技及創意輔助學生線上自學
              https://www.ner.gov.tw/program/5a83f4eac5fd8a01e2df012b/602e2793b702e0000801cf6e
            </Typography>
            <Typography variant="p">
              零時小學校2020成果手冊：學生老師共創學習資源平台
              島島阿學開啟共學新時代
              https://drive.google.com/file/d/1rDerbtnV0Abk2QWRyRB_RTRDyKsvn48e/view
            </Typography>
            <Typography variant="p">
              OCF
              Lab開放實驗室：連結科技社群與教育界，透過開源解決方案弭平教育的數位落差
              https://lab.ocf.tw/2020/11/17/sch001/
            </Typography>
          </Stack>
        </Box>
        <Box
          sx={{
            margin: "20px 0",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              margin: "40px 0 10px 0",
            }}
          >
            我們需要你！
          </Typography>
          <Stack sx={{ margin: "20px" }}>
            <Typography variant="h3">
              「一個人可以走得快，但一群人可以走得遠」
            </Typography>
            <Typography variant="p">
              島島阿學的初步開發已經完成，然而豐富的資源四散各地，一一收錄實在是心有餘而力不足。
              且每一位夥伴皆適用空餘時間以志工型態共工，因此我們需要更多人的力量一起共編。
              如果你接觸過各類資源，在擅長的領域累積許多學習資源，也喜歡與陌生人哈啦，歡迎你一同加入島島阿學。
            </Typography>
          </Stack>
          <Stack sx={{ margin: "20px" }}>
            <Typography variant="h3">協助新增資源</Typography>
            <Typography variant="p">
              請點選下方連結進行新增。
              https://resources.daoedu.tw/%e6%96%b0%e5%a2%9e%e8%b3%87%e6%ba%90/
            </Typography>
          </Stack>
          <Stack sx={{ margin: "20px" }}>
            <Typography variant="h3">資源審核編輯</Typography>
            <Typography variant="p">
              我們需要各領域的夥伴加入我們的資源審核編輯團隊，審核及優化使用者新增的資源。
              若您有興趣，歡迎點選下方連結加入我們的slack，進去後請到主頻道和大家打招呼唷！
              https://join.slack.com/t/daodaoedu/shared_invite/zt-ob6ey3gh-FcP2g_IXgK6D3KRAGruaKQ
            </Typography>
          </Stack>
        </Box>
        <Box
          sx={{
            margin: "20px 0",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              margin: "40px 0 10px 0",
            }}
          >
            聯絡我們
          </Typography>
          <Stack
            sx={{
              margin: "20px",
            }}
          >
            <Typography variant="p">島島阿學的 Facebook</Typography>
            <Typography variant="p">島島阿學的 Instagram</Typography>
            <Typography variant="p">
              島島阿學的信箱 – contact@daoedu.tw
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </ResourceWrapper>
  );
};

export default ContributeResource;
