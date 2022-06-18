import React, { useState } from "react";
import styled from "@emotion/styled";
import Box from "@mui/material/Box";
import { Button, Typography } from "@mui/material";
import { FacebookRounded } from "@mui/icons-material";
import { useRouter } from "next/router";
import WramModal from "../../../shared/components/WarmModal";
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
  const [open, setOpen] = useState(false);

  return (
    <GroupWrapper>
      <Typography
        variant="h2"
        sx={{
          color: "#536166",
          fontWeight: "bold",
          fontSize: "36px",
          lineHeight: "50px",
          letterSpacing: "0.08em",
          textAlign: "right",
          marginRight: "20px",
          "@media(max-width: 767px)": {
            textAlign: "left",
          },
        }}
      >
        加入島島阿學學習社群
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
          <Box sx={{ margin: "5px 0" }}>
            <Typography variant="p">
              我們是島島阿學學習社群，努力搭起互助學習的橋梁。
            </Typography>
          </Box>
          <Box sx={{ margin: "5px 0" }}>
            <Typography variant="p">
              期盼以集體智慧，打造沒有天花板的學習環境，一個以自主學習為主的民主社群。
            </Typography>
          </Box>
          <Box sx={{ margin: "5px 0" }}>
            <Typography variant="p">
              目前提供學習資源網以及社群的服務，包含各領域各種形式的資源、學習活動、學習經驗、教育新聞等等。
            </Typography>
          </Box>
          <Box sx={{ margin: "5px 0" }}>
            <Typography variant="p">
              我們認為社群即資源、支援，讓學習者在民主教育的社群中，以共好的概念，解決彼此學習的問題，支持彼此成為自己想成為的人。
            </Typography>
          </Box>
          <Box sx={{ margin: "10px 0" }}>
            <Typography variant="p" sx={{ fontWeight: "500" }}>
              社群中有許多有愛的島友即時地分享各種學習資源唷！快加入吧！
            </Typography>
          </Box>
          <Box
            sx={{
              margin: "20px 0 10px 0",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              onClick={() =>
                window.open(
                  "https://www.facebook.com/groups/2237666046370459",
                  "_blank"
                )
              }
              sx={{ margin: "0 10px" }}
            >
              <FacebookRounded sx={{ margin: "5px 0" }} />
              <Typography variant="p">加入社群</Typography>
            </Button>
            <Box>
              <Button
                variant="outlined"
                onClick={() => setOpen(true)}
                sx={{
                  height: "46px",
                  margin: "0 10px",
                }}
              >
                {/* <FacebookRounded sx={{ margin: "5px 0" }} /> */}
                <Typography variant="p">❤️ 送上祝福</Typography>
              </Button>
            </Box>
            <WramModal open={open} setOpen={setOpen} />
          </Box>
        </Box>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          // src="https://www.daoedu.tw/cdn-cgi/image/width=300,height=300,quality=80,format=webp/assets/group.gif"
          src="/assets/group.gif"
          width="200"
          height="200"
          alt="group"
        />
      </Box>
    </GroupWrapper>
  );
};

export default Group;
