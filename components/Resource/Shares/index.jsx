import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { Button, Box, Stack } from "@mui/material";
import { Share } from "@mui/icons-material";
import { CopyToClipboard } from "react-copy-to-clipboard";
import toast from "react-hot-toast";
import {
  FacebookShareButton,
  LineShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  LineIcon,
  TwitterIcon,
  TelegramIcon,
  WhatsappIcon,
  FacebookMessengerIcon,
  FacebookMessengerShareButton,
} from "react-share";

const Shares = ({ title }) => {
  const router = useRouter();
  const copyContent = useMemo(
    () =>
      `我在島島阿學發現了不錯的學習資源想與你一起分享。\n資源名稱：${title}\nhttps://test-page.notion.dev.daoedu.tw${router.asPath}?source=share`,
    [router.asPath, title]
  );
  return (
    <Box
      sx={{
        margin: "10px 0",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Box>
        <CopyToClipboard
          text={copyContent}
          onCopy={() => toast.success("已複製連結")}
        >
          <Button
            variant="outlined"
            sx={{
              borderRadius: "20px",
              fontWeight: 700,
              border: "1px solid #16b9b3",
              "white-space": "nowrap",
              // color:
            }}
          >
            <Share
              sx={{
                fontSize: "14px",
                marginRight: "10px",
              }}
            />
            分享資源
          </Button>
        </CopyToClipboard>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          marginLeft: "10px",
          paddingTop: "5px",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            margin: "5px",
          }}
        >
          <FacebookShareButton
            url={`https://test-page.notion.dev.daoedu.tw${router.asPath}?source=fb-btn`}
            quote={copyContent}
          >
            <FacebookIcon size={30} round />
          </FacebookShareButton>
        </Box>
        <Box
          sx={{
            margin: "5px",
          }}
        >
          <FacebookMessengerShareButton
            redirectUri={`https://test-page.notion.dev.daoedu.tw${router.asPath}`}
            to={`https://test-page.notion.dev.daoedu.tw${router.asPath}?source=fbm-btn`}
            quote={copyContent}
            appId="daodaoedu"
          >
            <FacebookMessengerIcon size={30} round />
          </FacebookMessengerShareButton>
        </Box>
        <Box
          sx={{
            margin: "5px",
          }}
        >
          <LineShareButton
            url={`https://test-page.notion.dev.daoedu.tw${router.asPath}?source=line-btn`}
            title={copyContent}
          >
            <LineIcon size={30} round />
          </LineShareButton>
        </Box>
        <Box
          sx={{
            margin: "5px",
          }}
        >
          <TwitterShareButton
            url={`https://test-page.notion.dev.daoedu.tw${router.asPath}?source=twitter-btn`}
            title={copyContent}
          >
            <TwitterIcon size={30} round />
          </TwitterShareButton>
        </Box>
        <Box
          sx={{
            margin: "5px",
          }}
        >
          <TelegramShareButton
            url={`https://test-page.notion.dev.daoedu.tw${router.asPath}?source=telegram-btn`}
            title={copyContent}
          >
            <TelegramIcon size={30} round />
          </TelegramShareButton>
        </Box>
        <Box
          sx={{
            margin: "5px",
          }}
        >
          <WhatsappShareButton
            url={`https://test-page.notion.dev.daoedu.tw${router.asPath}?source=whatapp-btn`}
            title={copyContent}
          >
            <WhatsappIcon size={30} round />
          </WhatsappShareButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Shares;
