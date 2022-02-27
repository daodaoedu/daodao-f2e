import React from "react";
import styled from "@emotion/styled";
// import { css } from "@emotion/react";
import { Box, Paper, Typography, Stack, Avatar } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";

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

const LinkWrapper = styled.a`
  color: black;
  &:hover {
    opacity: 100%;
    transition: color 0.5s ease;
    color: #16b9b3;
  }
`;

const LineWrapper = styled(Typography)`
  margin: 5px 0;
`;

const IMAGE_TAGS = [
  "howcanihelp",
  "hug",
  "huge",
  "hulu",
  "hunger",
  "icecream",
  "jellybean toes toe beans grey gray mauve",
  "jellybean toes toebeans squished beans",
  "judgemental",
  "jump",
  "jumping",
  "kick",
  "kiss",
  "kitler",
  "kitten",
  "kittenleg",
  "kittens",
  "kitty",
  "knocknoc",
  "kucing",
  "kuro",
  "laying",
  "lazy fuck",
  "legs",
  "lights",
  "loaf",
  "logan",
  "lolcat",
  "long",
  "long-cat",
  "looking",
  "lustful",
  "lying down",
  "macCat",
  "mackerel tabby",
  "mad",
  "mama",
  "marine",
  "mask",
  "meme",
  "metal",
  "misty",
  "mixed",
  "money",
  "moody",
  "morrigan",
  "morrigan witch of the wilds",
  "mousecat",
  "multi",
  "multiple_colors",
  "munchkin",
  "nasty",
  "nelly",
  "nelut",
  "newyear",
  "nicecat",
  "no",
  "nope",
  "nyancat",
  "nyancat-gif",
  "old",
  "ominous",
  "orange",
  "orange cat",
  "ovni",
  "pain",
  "party",
  "patoka",
  "paw",
  "pebba",
  "peppa",
  "pepper",
  "petting",
  "piano",
  "pic",
  "pippin",
  "pirate",
  "playful",
  "please",
  "plot",
  "portrait-worthy",
  "pretty",
  "professional",
  "programmer",
  "puffy",
  "quality",
  "reading",
  "resting",
  "rich",
  "roll",
  "rolling",
  "running",
  "russia",
  "russian blue",
  "sad",
  "sad catto",
  "samurai",
  "sara",
  "sassy",
  "sauna cat",
  "savannah",
  "scared",
  "screm",
  "seeya!",
  "selfie",
  "serious",
];

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

const Members = [
  {
    id: 0,
    name: "Tiff",
    image: "https://cataas.com/cat/0",
  },
  {
    id: 1,
    name: "小許",
    image: "https://cataas.com/cat/1",
  },
  {
    id: 2,
    name: "小貝",
    image: "https://cataas.com/cat/2",
  },
  {
    id: 3,
    name: "葦",
    image: "https://cataas.com/cat/3",
  },
  {
    id: 4,
    name: "羊",
    image: "https://cataas.com/cat/4",
  },
  {
    id: 5,
    name: "Sucre",
    image: "https://cataas.com/cat/5",
  },
  {
    id: 6,
    name: "東玉",
    image: "https://cataas.com/cat/6",
  },
  {
    id: 7,
    name: "百戰不殆",
    image: "https://cataas.com/cat/7",
  },
  {
    id: 8,
    name: "Yvonne",
    image: "https://cataas.com/cat/8",
  },
  {
    id: 9,
    name: "珮珮",
    image: "https://cataas.com/cat/9",
  },
  {
    id: 10,
    name: "袋鼠",
    image: "https://cataas.com/cat/10",
  },
  {
    id: 11,
    name: "Karen",
    image: "https://cataas.com/cat/11",
  },
  {
    id: 12,
    name: "預知",
    image: "https://cataas.com/cat/12",
  },
  {
    id: 13,
    name: "Yu",
    image: "https://cataas.com/cat/13",
  },
  {
    id: 14,
    name: "阿樂",
    image: "https://cataas.com/cat/14",
  },
  {
    id: 15,
    name: "姵璇",
    image: "https://cataas.com/cat/15",
  },
  {
    id: 16,
    name: "Trixie",
    image: "https://cataas.com/cat/16",
  },
  {
    id: 17,
    name: "何廢料",
    image: "https://cataas.com/cat/17",
  },
  {
    id: 18,
    name: "一路",
    image: "https://cataas.com/cat/18",
  },
  {
    id: 19,
    name: "Yumi",
    image: "https://cataas.com/cat/19",
  },
  {
    id: 20,
    name: "芳芳",
    image: "https://cataas.com/cat/20",
  },
];

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
            <LineWrapper variant="p">
              由108課綱的推動以及實驗教育的蓬勃發展，可以觀察到臺灣社會對於多元／自主學習的需求逐步提升。然而我們發現，在邁向自主學習的路上，不論學習者、教育工作者、家長時常苦於找不到合適資源。
            </LineWrapper>
            <LineWrapper variant="p">
              而這並非因為資源不夠充足，而是因為社經背景及資料查找能力的落差，以及對資源定義較狹義，使得資源無法透明化，此外也因資源太多太雜難以查找，故出現「學習資源遍地開花，卻無法與有需求者做連結」的現象。
            </LineWrapper>
            <LineWrapper variant="p">
              我們期盼能透過建置一個人人皆能共編的【島島阿學】學習資源平台，提供可以資源整合的服務，包含線上資源、組織、人、實體學習點、活動、教育場域等資源，成為促動人與人、需求與資源之間共好的橋樑，進一步解決資源不透明的問題，讓學習者更順利地完成自主學習。
            </LineWrapper>
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
            <LineWrapper variant="p">
              <LinkWrapper
                target="_blank"
                href={"https://www.youtube.com/watch?v=7d8e-onHJfo&t=80s"}
                rel="noopener noreferrer"
              >
                🤔 島島阿學｜如何透過集體智慧解決自主學習困境，推動民主教育？
              </LinkWrapper>
            </LineWrapper>
            <LineWrapper variant="p">
              <LinkWrapper
                target="_blank"
                href={"https://www.behance.net/gallery/113709435/_"}
                rel="noopener noreferrer"
              >
                🏃 島島阿學發展歷程
              </LinkWrapper>
            </LineWrapper>
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
            <LineWrapper variant="p">
              <LinkWrapper
                target="_blank"
                href={
                  "https://www.ner.gov.tw/program/5a83f4eac5fd8a01e2df012b/602e2793b702e0000801cf6e"
                }
                rel="noopener noreferrer"
              >
                📌 國立教育廣播電台 – 生活 In
                Design：青年打造理想國：《島島阿學》用科技及創意輔助學生線上自學
              </LinkWrapper>
            </LineWrapper>
            <LineWrapper variant="p">
              <LinkWrapper
                target="_blank"
                href={
                  "https://drive.google.com/file/d/1rDerbtnV0Abk2QWRyRB_RTRDyKsvn48e/view"
                }
                rel="noopener noreferrer"
              >
                📌 零時小學校2020成果手冊：學生老師共創學習資源平台
                島島阿學開啟共學新時代
              </LinkWrapper>
            </LineWrapper>
            <LineWrapper variant="p">
              <LinkWrapper
                target="_blank"
                href={"https://lab.ocf.tw/2020/11/17/sch001/"}
                rel="noopener noreferrer"
              >
                📌 OCF
                Lab開放實驗室：連結科技社群與教育界，透過開源解決方案弭平教育的數位落差
              </LinkWrapper>
            </LineWrapper>
            <LineWrapper variant="p">
              <LinkWrapper
                target="_blank"
                href={"https://edu100.parenting.com.tw/2021/detail/37#loaded"}
                rel="noopener noreferrer"
              >
                📌 親子天下教育創新
              </LinkWrapper>
            </LineWrapper>
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
            獲獎資訊
          </Typography>
          <Stack
            sx={{
              margin: "20px",
            }}
          >
            <LineWrapper variant="p">
              <LinkWrapper
                target="_blank"
                href={"https://lab.ocf.tw/2020/11/17/sch001/"}
                rel="noopener noreferrer"
              >
                📌 g0v零時小學校 demo day - 前五名
              </LinkWrapper>
            </LineWrapper>
            <LineWrapper variant="p">
              <LinkWrapper
                target="_blank"
                href={"https://edu100.parenting.com.tw/2021/detail/37#loaded"}
                rel="noopener noreferrer"
              >
                📌 親子天下教育創新100 - 入選
              </LinkWrapper>
            </LineWrapper>
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
            感謝名單
          </Typography>
          <Stack
            sx={{
              margin: "20px",
            }}
          >
            <LineWrapper variant="p" sx={{ fontWeight: "500" }}>
              「島島阿學－學習資源平台」是從一個人到一群人，並透過自學從無到有的過程。
              這一路上，感謝每一位曾經參與其中的夥伴，論是針對組織、平台給予建議，又或者協助新增資源，都讓我們由衷的感謝，島島阿學是在每一位橋樑互助共好下誕生的。
            </LineWrapper>
            <LineWrapper variant="p">
              臺灣實驗教育推動中心, 唐光華 老師, 丁志仁 老師, 曲智鑛 老師,
              g0v零時小學校, 柯君翰, 高婷柔, 向恩霈, 詹喬智, 米苔目, 王玠堯, Ael
            </LineWrapper>
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
            團隊組成
          </Typography>
          <Stack
            sx={{
              margin: "20px",
            }}
          >
            <Stack
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                flexWrap: "wrap",
                flexDirection: "row",
              }}
            >
              {Members.map(({ id, name, image }) => (
                <Tooltip key={id} title={name}>
                  <Avatar
                    sx={{ margin: "10px", width: 38, height: 38 }}
                    alt={name}
                    src={`https://cataas.com/cat/${IMAGE_TAGS[id]}`}
                  />
                </Tooltip>
              ))}
            </Stack>
            <LineWrapper variant="p">
              島島阿學團隊由一群高中生、大學生、教育工作者、家長、工程師、設計師等來自不同背景的夥伴組成，親身經歷自主學習的各種困境，並有感教育不平等之議題，故自主發起島島阿學學習社群計畫。
            </LineWrapper>
            <LineWrapper variant="p">
              包含：內容部, 管理部, IT部, 行銷公關部與設計部
            </LineWrapper>
            {/* <LineWrapper variant="p">
              臺灣實驗教育推動中心, 唐光華 老師, 丁志仁 老師, 曲智鑛 老師,
              g0v零時小學校, 柯君翰, 高婷柔, 向恩霈, 詹喬智, 米苔目, 王玠堯, Ael
            </LineWrapper> */}
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
            <LineWrapper variant="h3">
              🚀 「一個人可以走得快，但一群人可以走得遠」
            </LineWrapper>
            <LineWrapper variant="p">
              島島阿學的初步開發已經完成，然而豐富的資源四散各地，一一收錄實在是心有餘而力不足。
              且每一位夥伴皆適用空餘時間以志工型態共工，因此我們需要更多人的力量一起共編。
              如果你接觸過各類資源，在擅長的領域累積許多學習資源，也喜歡與陌生人哈啦，歡迎你一同加入島島阿學。
            </LineWrapper>
          </Stack>
          <Stack sx={{ margin: "20px" }}>
            <Typography variant="h3">🎁 協助新增資源</Typography>
            <LineWrapper variant="p">
              <LinkWrapper
                target="_blank"
                href={
                  "https://resources.daoedu.tw/%e6%96%b0%e5%a2%9e%e8%b3%87%e6%ba%90/"
                }
                rel="noopener noreferrer"
              >
                請點選連結進行新增
              </LinkWrapper>
            </LineWrapper>
          </Stack>
          <Stack sx={{ margin: "20px" }}>
            <Typography variant="h3">🔍 資源審核編輯</Typography>
            <LineWrapper variant="p">
              <LinkWrapper
                target="_blank"
                href={
                  "https://join.slack.com/t/daodaoedu/shared_invite/zt-ob6ey3gh-FcP2g_IXgK6D3KRAGruaKQ"
                }
                rel="noopener noreferrer"
              >
                我們需要各領域的夥伴加入我們的資源審核編輯團隊，審核及優化使用者新增的資源。
                若您有興趣，歡迎點選下方連結加入我們的slack，進去後請到主頻道和大家打招呼唷！
              </LinkWrapper>
            </LineWrapper>
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
            <LineWrapper variant="p">
              <LinkWrapper
                target="_blank"
                href={"https://www.facebook.com/daodao.edu"}
                rel="noopener noreferrer"
              >
                🏝️ 島島阿學的 Facebook
              </LinkWrapper>
            </LineWrapper>
            <LineWrapper variant="p">
              <LinkWrapper
                target="_blank"
                href={"https://www.instagram.com/daodao_edu/"}
                rel="noopener noreferrer"
              >
                🏝️ 島島阿學的 Instagram
              </LinkWrapper>
            </LineWrapper>
            <LineWrapper variant="p">
              <LinkWrapper
                target="_blank"
                href={"mailto:contact@daoedu.tw"}
                rel="noopener noreferrer"
              >
                🏝️ 島島阿學的信箱 – contact@daoedu.tw
              </LinkWrapper>
            </LineWrapper>
          </Stack>
        </Box>
      </Paper>
    </ResourceWrapper>
  );
};

export default ContributeResource;
