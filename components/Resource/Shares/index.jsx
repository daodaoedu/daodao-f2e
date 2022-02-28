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
  // FacebookMessengerShareButton,
} from "react-share";
import appendQuery from "append-query";

const Shares = ({ title }) => {
  const router = useRouter();
  const copyContent = useMemo(
    () =>
      `我在島島阿學發現了不錯的學習資源想與你一起分享。\n資源名稱：${title}\n${process.env.HOSTNAME}${router.asPath}`,
    [title]
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
            url={appendQuery(
              `${process.env.HOSTNAME}${router.asPath}`,
              "source=fb-btn"
            )}
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
          <Box>
            {/* 可參考：https://developers.facebook.com/docs/sharing/reference/send-dialog#examples */}
            <a
              href={`http://www.facebook.com/dialog/send?app_id=374678340785771&link=${appendQuery(
                `${process.env.HOSTNAME}${router.asPath}`,
                "source=fbm-btn"
              )}&redirect_uri=${process.env.HOSTNAME}${router.asPath}`}
              target="_blank"
              rel="noreferrer"
            >
              <FacebookMessengerIcon size={30} round />
            </a>
          </Box>
        </Box>
        <Box
          sx={{
            margin: "5px",
          }}
        >
          <LineShareButton
            url={appendQuery(
              `${process.env.HOSTNAME}${router.asPath}`,
              "source=line-btn"
            )}
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
            url={appendQuery(
              `${process.env.HOSTNAME}${router.asPath}`,
              "source=twitter-btn"
            )}
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
            url={appendQuery(
              `${process.env.HOSTNAME}${router.asPath}`,
              "source=telegram-btn"
            )}
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
            url={appendQuery(
              `${process.env.HOSTNAME}${router.asPath}`,
              "source=whatapp-btn"
            )}
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
