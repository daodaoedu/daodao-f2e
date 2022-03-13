import React from "react";
import styled from "@emotion/styled";
import { Paper, Box, Typography, Divider, Tooltip } from "@mui/material";
import useFirebase from "../../hooks/useFirebase";
import dayjs from "dayjs";
import { getFirestore, collection, doc } from "firebase/firestore";
import { useDocument, useCollection } from "react-firebase-hooks/firestore";
import ResourceCard from "./ResourceCard";
import { HelpOutline } from "@mui/icons-material";

const MyIslandWrapper = styled.section`
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

const MyIsland = () => {
  const { user, isLoading, firebaseApp } = useFirebase();

  const [
    userCollection,
    // , loading, error
  ] = useCollection(collection(getFirestore(firebaseApp), "users"), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  //   const [
  //     favoriteCollection,
  //     // , loading, error
  //   ] = useCollection(
  //     collection(getFirestore(firebaseApp), "favoriteCollection"),
  //     {
  //       snapshotListenOptions: { includeMetadataChanges: true },
  //     }
  //   );
  //   const userfFvoriteCollectionId =
  //     userCollection?.docs.find((doc) => user?.uid === doc.id)?.data()
  //       ?.favoriteCollectionId ?? "";

  //   const userFavoriteCollection =
  //     favoriteCollection?.docs
  //       .find((doc) => userfFvoriteCollectionId === doc.id)
  //       ?.data() ?? [];
  //   console.log("userfFvoriteCollectionId", userfFvoriteCollectionId);
  //   console.log("favoriteCollection", favoriteCollection);

  if (isLoading) {
    return (
      <MyIslandWrapper>
        <Paper
          sx={{
            width: "95%",
            margin: "0 auto",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://media.giphy.com/media/tmTgVXwzTSI1wehwnh/giphy.gif"
            alt="loading"
            width={300}
            height={300}
          />
          <Typography
            sx={{ margin: "20px 0", fontWeight: "500", fontSize: "20px" }}
          >
            載入中 . . .
          </Typography>
        </Paper>
      </MyIslandWrapper>
    );
  }
  if (!user) {
    return (
      <MyIslandWrapper>
        <Paper
          sx={{
            width: "95%",
            margin: "0 auto",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <Typography
            sx={{ margin: "20px 0", fontWeight: "500", fontSize: "20px" }}
          >
            看起來你還沒有登入會員唷，點擊右上角登入吧！
          </Typography>
        </Paper>
      </MyIslandWrapper>
    );
  }
  return (
    <MyIslandWrapper>
      <Paper
        sx={{
          width: "95%",
          margin: "0 auto",
          padding: "10px",
          minHeight: "60vh",
        }}
      >
        <Box sx={{ margin: "20px 0", fontWeight: "500", fontSize: "20px" }}>
          島主大名：{user.displayName}
        </Box>
        <Box
          sx={{
            margin: "20px 0",
            fontWeight: "500",
            fontSize: "20px",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          島主身份：VIP體驗會員
          <Box sx={{ margin: "0 5px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/vip.png" alt="vip" width={20} height={20} />
          </Box>
          <Tooltip title="提早成為島島會員，搶先體驗最新功能與回報使用體驗，你就是我們的VIP！">
            <HelpOutline sx={{ color: "#16b9b3", marginLeft: "10px" }} />
          </Tooltip>
        </Box>
        <Box sx={{ margin: "20px 0", fontWeight: "500", fontSize: "20px" }}>
          島主信箱：{user.email}
        </Box>
        <Box sx={{ margin: "20px 0", fontWeight: "500", fontSize: "20px" }}>
          創島時間：
          {dayjs(user?.metadata?.creationTime).format("YYYY / MM / DD")}
        </Box>
        <Box
          sx={{
            margin: "20px 0",
            fontWeight: "500",
            fontSize: "20px",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          島島 Points：
          <Box sx={{ margin: "0 10px" }}> 0</Box>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/point.png" alt="point" width={20} height={20} />
          <Tooltip title="鼓勵學習者學習的小獎勵">
            <HelpOutline sx={{ color: "#16b9b3", marginLeft: "10px" }} />
          </Tooltip>
        </Box>
        <Box sx={{ margin: "20px 0", fontSize: "18px" }}>
          歡迎加入島島的行列，您期待島島未來有什麼功能可以使用嗎？
          歡迎來信：contact@daoedu.tw
        </Box>
        {/* <Divider /> */}
        {/* <Box sx={{ margin: "20px 0" }}>
          <Box sx={{ fontSize: "22px", fontWeight: "500" }}>我的收藏</Box> */}
        {/* <Box sx={{ margin: "10px 0" }}>
            {userFavoriteCollection.map((doc, index) => (
              <ResourceCard key={index} data={doc.data()} />
            ))}
          </Box> */}
        {/* </Box> */}
      </Paper>
    </MyIslandWrapper>
  );
};

export default MyIsland;
