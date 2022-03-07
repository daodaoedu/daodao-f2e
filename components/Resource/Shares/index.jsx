import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { Button, Box, Stack } from "@mui/material";
import { Share, DirectionsRun } from "@mui/icons-material";
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

const Shares = ({ title, link }) => {
  const router = useRouter();
  const copyContent = useMemo(
    () =>
      `我在島島阿學發現了不錯的學習資源想與你一起分享。\n資源名稱：${title}\n${process.env.HOSTNAME}${router.asPath}?source=share`,
    [router.asPath, title]
  );
  return (
    <Box
      sx={{
        margin: "10px 0 10px 10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <Box
        sx={{
          margin: "5px 0",
        }}
      >
        <Button
          variant="outlined"
          sx={{
            borderRadius: "20px",
            fontWeight: 700,
            border: "1px solid #16b9b3",
            "white-space": "nowrap",
            marginRight: "10px",
          }}
          onClick={() => open(link, "_blank")}
        >
          <DirectionsRun
            sx={{
              fontSize: "14px",
              marginRight: "10px",
            }}
          />
          查看資源
        </Button>
        <CopyToClipboard
          text={copyContent}
          onCopy={() =>
            toast.success("已複製資源分享", {
              style: {
                color: "#16b9b3",
                border: "1px solid #16b9b3",
                marginTop: "70px",
              },
              iconTheme: {
                primary: "#16b9b3",
              },
            })
          }
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
          paddingTop: "5px",
          flexWrap: "wrap",
          margin: "5px 0",
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
              "source=fb-share"
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
                "source=fbm-share"
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
              "source=line-share"
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
            // url={appendQuery(
            //   `${process.env.HOSTNAME}${router.asPath}`,
            //   "source=twitter-share"
            // )}
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
              "source=telegram-share"
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
              "source=whatapp-share"
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
