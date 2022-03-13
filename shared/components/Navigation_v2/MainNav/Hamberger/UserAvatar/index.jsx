import React, { useState } from "react";
import styled from "@emotion/styled";
import Link from "next/link";
import { Avatar } from "@mui/material";
import useFirebase from "../../../../../../hooks/useFirebase";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import { Group } from "@mui/icons-material";
import { useRouter } from "next/router";

const UserAvatar = ({ onCloseMenu }) => {
  const { push } = useRouter();
  const { auth, user, signInWithFacebook, signOutWithFacebook } = useFirebase();
  const [isOpenMenu, setIsOpenMenu] = useState(null);
  if (!user) {
    return (
      <IconButton
        sx={{ margin: "0 10px", fontSize: "16px", color: "white" }}
        onClick={() => signInWithFacebook()}
      >
        <Group sx={{ fontSize: "30px" }} />
      </IconButton>
    );
  }
  return (
    <IconButton
      sx={{
        margin: "0 10px",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
      onClick={() => {
        onCloseMenu();
        push("/myisland");
      }}
    >
      <Avatar
        alt={user?.displayName ?? ""}
        src={user?.photoURL ?? ""}
        // onClick={(event) => setIsOpenMenu(event.currentTarget)}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          marginLeft: "20px",
        }}
      >
        <Box
          sx={{
            margin: "0 10px",
            fontSize: "26px",
            color: "white",
            fontWeight: "500",
          }}
        >
          Points: 0
        </Box>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/point.png" alt="point" width={26} height={26} />
      </Box>
      {/* <Menu
        id="user-menu"
        anchorEl={isOpenMenu}
        open={Boolean(isOpenMenu)}
        onClose={() => setIsOpenMenu(false)}
      >
        <MenuItem
          onClick={() => {
            setIsOpenMenu(false);
            push("/myisland");
          }}
        >
          我的島島
        </MenuItem>
        <MenuItem
          onClick={() => {
            signOutWithFacebook();
            setIsOpenMenu(false);
          }}
        >
          登出
        </MenuItem> */}
      {/* </Menu> */}
    </IconButton>
  );
};

export default UserAvatar;
