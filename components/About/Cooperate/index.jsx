/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import styled from "@emotion/styled";
// import { css } from "@emotion/react";
import { Box, Paper, Typography, Stack, Avatar } from "@mui/material";

const LineWrapper = styled(Typography)`
  margin: 5px 0;
`;

const Cooperate = () => {
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
        合作夥伴
      </Typography>
      <Box
        sx={{
          margin: "20px",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            backgroundColor: "black",
            padding: "5px",
            width: "210px",
            borderRadius: "5px",
            margin: "10px",
          }}
        >
          <a
            href="https://grants.g0v.tw/power/?from=daoedu.tw"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://grants.g0v.tw/power/images/g0v-logo.svg"
              width={200}
              height={32}
              alt="g0v零時政府"
            />
          </a>
        </Box>
        <Box
          sx={{
            padding: "5px",
            height: "120px",
            borderRadius: "5px",
            margin: "10px",
          }}
        >
          <a
            href="https://sch001.g0v.tw/?from=daoedu.tw"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://sch001.g0v.tw/assets/img/main_new.jpg"
              height={120}
              alt="g0v零時小學校"
            />
          </a>
        </Box>
        <Box
          sx={{
            padding: "5px",
            height: "130px",
            borderRadius: "5px",
            margin: "10px",
          }}
        >
          <a
            href="https://zashare.org/?from=daoedu.tw"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://i.imgur.com/QpMVwqe.png"
              height={120}
              alt="雜學校"
            />
          </a>
        </Box>
        <Box
          sx={{
            padding: "5px",
            height: "130px",
            borderRadius: "5px",
            margin: "10px",
          }}
        >
          <a
            href="https://www.parenting.com.tw/?from=daoedu.tw"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://www.parenting.com.tw/files/images/fb_share.png"
              height={120}
              alt="親子天下"
            />
          </a>
        </Box>
        <Box
          sx={{
            padding: "5px",
            height: "130px",
            borderRadius: "5px",
            margin: "10px",
          }}
        >
          <a
            href="https://codingbar.ai/?from=daoedu.tw"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://i.imgur.com/n6GG0vF.png"
              height={120}
              alt="Coding bar"
            />
          </a>
        </Box>
      </Box>
    </Box>
  );
};

export default Cooperate;
