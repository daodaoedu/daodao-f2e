import React from "react";
import styled from "@emotion/styled";
import PageContainer from "../shared/containers/Page";
import Footer from "../shared/components/Footer_v2";
import Navigatin from "../shared/components/Navigation_v2";
import Box from "@mui/material/Box";
import { Typography, Button, Paper } from "@mui/material";
import { FacebookRounded } from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import { useRouter } from "next/router";
import { COLOR_TABLE } from "../constants/notion";
import { CATEGORIES } from "../constants/category";

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

const NotExistPage = () => {
  return (
    <BodyWrapper>
      <Navigatin />
      <Paper
        sx={{
          width: "90%",
          margin: "20px auto",
          padding: "20px",
          minHeight: "60vh",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: "#536166",
            fontWeight: "bold",
            fontSize: "30px",
            lineHeight: "50px",
            letterSpacing: "0.08em",
            textAlign: "center",
            marginRight: "20px",
          }}
        >
          這座島已經沉入海裡了
        </Typography>
        <Typography
          variant="p"
          sx={{
            // fontWeight: "bold",
            fontSize: "20px",
            margin: "10px",
            textAlign: "center",
            width: "100%",
          }}
        >
          近期網站改版，可能有部分頁面無法使用，可以參觀其他地方唷～
        </Typography>
        <Typography
          variant="p"
          sx={{
            // fontWeight: "bold",
            fontSize: "20px",
            margin: "10px",
            textAlign: "center",
            width: "100%",
          }}
        >
          要不要試試我們新版的資源搜尋或是參觀其他地方呢？
        </Typography>
        <Box
          sx={{
            margin: "20px 0",
          }}
        >
          <Typography
            variant="p"
            sx={{
              fontWeight: "bold",
            }}
          >
            豐富的學習類別
          </Typography>
          <Box sx={{ margin: "10px 0" }}>
            {CATEGORIES.map(({ key, value }) => (
              <Chip
                key={key}
                label={value}
                value={value}
                onClick={() => router.push(`/search?cats=${value}`)}
                sx={{
                  backgroundColor: COLOR_TABLE.green,
                  opacity: "60%",
                  cursor: "pointer",
                  margin: "5px",
                  whiteSpace: "nowrap",
                  fontWeight: 500,
                  fontSize: "16px",
                  "&:hover": {
                    opacity: "100%",
                    backgroundColor: COLOR_TABLE.green,
                    transition: "transform 0.4s",
                  },
                }}
              />
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            margin: "40px 0 10px 0",
          }}
        >
          <Typography
            variant="p"
            sx={{
              fontWeight: "bold",
            }}
          >
            加入島島社群
          </Typography>
          <Box
            sx={{
              margin: "20px 0",
            }}
          >
            <Button
              variant="outlined"
              onClick={() =>
                open(
                  "https://www.facebook.com/groups/2237666046370459",
                  "_blank"
                )
              }
            >
              <FacebookRounded sx={{ margin: "5px 0" }} />
              <Typography variant="p">加入社群</Typography>
            </Button>
          </Box>
        </Box>
      </Paper>
      <Footer />
    </BodyWrapper>
  );
};

export default NotExistPage;
