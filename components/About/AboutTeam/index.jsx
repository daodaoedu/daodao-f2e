import React, { useState } from "react";
import styled from "@emotion/styled";
import {
  Box,
  Typography,
  Stack,
  Avatar,
  AvatarGroup,
  Button,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import WramModal from "../../../shared/components/WarmModal";

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
  {
    id: 21,
    name: "Pei",
    image: "https://cataas.com/cat/21",
  },
  {
    id: 22,
    name: "Sebastian",
    image: "https://cataas.com/cat/22",
  },
  {
    id: 23,
    name: "Grace",
    image: "https://cataas.com/cat/23",
  },
];

const AboutTeam = () => {
  const [open, setOpen] = useState(false);
  return (
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
                sx={{ margin: "4px", width: 50, height: 50 }}
                alt={name}
                src={`https://cataas.com/cat/${IMAGE_TAGS[id]}`}
              />
            </Tooltip>
          ))}
          <Tooltip title="志工夥伴">
            <AvatarGroup
              max={2}
              sx={{
                ".MuiAvatarGroup-avatar": {
                  width: 50,
                  height: 50,
                  marginLeft: "-12px",
                },
              }}
            >
              <Avatar
                sx={{ margin: "4px 0", width: 50, height: 50 }}
                alt="50+"
                src="https://media.giphy.com/media/bErElGdAHUmoE/giphy.gif"
              />
              {new Array(50).fill("").map((_, index) => (
                <Avatar
                  key={index}
                  alt={`dummy-${index}`}
                  src="https://media.giphy.com/media/bErElGdAHUmoE/giphy.gif"
                />
              ))}
              {/* https://media.giphy.com/media/7WH2eHCxpFcI0/giphy.gif */}
            </AvatarGroup>
          </Tooltip>
        </Stack>
        <LineWrapper variant="p">
          島島阿學團隊由一群國中生、高中生、大學生、教育工作者、家長、工程師、設計師等來自不同背景的夥伴組成，親身經歷自主學習的各種困境，並有感教育不平等之議題，故自主發起島島阿學學習社群計畫。
        </LineWrapper>
        <LineWrapper variant="p">
          包含：
          <Typography variant="span">🕵 內容部</Typography>
          <Typography variant="span">🧝 管理部</Typography>
          <Typography variant="span">🧑‍💻 IT部</Typography>
          <Typography variant="span">🧑‍💼 行銷公關部</Typography>
          <Typography variant="span">🧑‍🎨 設計部</Typography>
          <Typography variant="span">🧚 志工夥伴</Typography>
        </LineWrapper>
        {/* <LineWrapper variant="p">
              臺灣實驗教育推動中心, 唐光華 老師, 丁志仁 老師, 曲智鑛 老師,
              g0v零時小學校, 柯君翰, 高婷柔, 向恩霈, 詹喬智, 米苔目, 王玠堯, Ael
            </LineWrapper> */}
        <Typography
          variant="h3"
          sx={{
            margin: "10px 0",
          }}
        >
          來自IT夥伴的小彩蛋
        </Typography>
        <LineWrapper variant="p">
          你知道你的一句話能造成多大的引響力嗎？歡迎送上暖暖的祝福給夥伴們！
        </LineWrapper>
        <Box
          sx={{
            margin: "20px 0 10px 0",
          }}
        >
          <Button variant="outlined" onClick={() => setOpen(true)}>
            {/* <FacebookRounded sx={{ margin: "5px 0" }} /> */}
            <Typography variant="p">❤️ 送上祝福</Typography>
          </Button>
        </Box>
        <WramModal open={open} setOpen={setOpen} />
      </Stack>
    </Box>
  );
};

export default AboutTeam;
