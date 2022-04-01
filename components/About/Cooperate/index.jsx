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
          flexWrap: 'wrap'
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
              src="https://scontent.ftpe7-1.fna.fbcdn.net/v/t39.30808-6/240526492_5275758315786731_8370468695684185354_n.png?_nc_cat=100&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=hnRAHh3JjJIAX8Ddsyz&_nc_ht=scontent.ftpe7-1.fna&oh=00_AT_IowAP0zz6LHeQ6VQ8mBPR4hvXBN_xrxaiyzVf0G3rQw&oe=624B6E46"
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
              src="https://scontent.ftpe7-2.fna.fbcdn.net/v/t39.30808-6/275292567_337143075096566_3344158783595716236_n.png?_nc_cat=104&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=qMtww4eYP5MAX-CsnTw&_nc_ht=scontent.ftpe7-2.fna&oh=00_AT_y9ZHvEdCHzpLx07s63elkrc41zGLkL_94SEqfC4gt3A&oe=624A5BCA"
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
