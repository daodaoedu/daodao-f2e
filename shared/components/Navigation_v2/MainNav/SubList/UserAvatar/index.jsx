import React, { useState } from "react";
import styled from "@emotion/styled";
import Link from "next/link";
import { Avatar } from "@mui/material";
import useFirebase from "../../../../../../hooks/useFirebase";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import { Group } from "@mui/icons-material";
const UserAvatar = () => {
  const { auth, signInWithGoogle, signOutWithGoogle, user } = useFirebase();
  const [isOpenMenu, setIsOpenMenu] = useState(null);
  if (!user) {
    return (
      <IconButton
        sx={{ margin: "0 10px", fontSize: "16px", color: "white" }}
        onClick={() => signInWithGoogle()}
      >
        <Group sx={{ fontSize: "30px" }} />
      </IconButton>
    );
  }
  return (
    <IconButton sx={{ margin: "0 10px" }}>
      <Avatar
        alt={user?.displayName ?? ""}
        src={user?.photoURL ?? ""}
        onClick={(event) => setIsOpenMenu(event.currentTarget)}
      />
      <Menu
        id="user-menu"
        anchorEl={isOpenMenu}
        open={Boolean(isOpenMenu)}
        onClose={() => setIsOpenMenu(false)}
      >
        <MenuItem
          onClick={() => {
            setIsOpenMenu(false);
          }}
        >
          我的島島
        </MenuItem>
        <MenuItem
          onClick={() => {
            signOutWithGoogle();
            setIsOpenMenu(false);
          }}
        >
          登出
        </MenuItem>
      </Menu>
    </IconButton>
  );
};

export default UserAvatar;
