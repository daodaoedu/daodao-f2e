import React, { useState } from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { Avatar, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { Group } from '@mui/icons-material';
import { useRouter } from 'next/router';
import useFirebase from '../../../../../../hooks/useFirebase';

const UserAvatar = () => {
  const { push } = useRouter();
  const { auth, user, signInWithFacebook, signOutWithGoogle } = useFirebase();
  const [isOpenMenu, setIsOpenMenu] = useState(null);
  if (!user) {
    return (
      <IconButton
        sx={{ margin: '0 10px', fontSize: '16px', color: 'white' }}
        onClick={() => {
          push('/login');
        }}
      >
        <Group sx={{ fontSize: '30px' }} />
      </IconButton>
    );
  }
  return (
    <IconButton sx={{ margin: '0 10px' }}>
      <Avatar
        alt={user?.displayName ?? ''}
        src={user?.photoURL ?? ''}
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
            push('/profile');
          }}
        >
          個人頁面
        </MenuItem>
        <MenuItem
          onClick={() => {
            setIsOpenMenu(false);
            push('/profile');
          }}
        >
          帳號設定
        </MenuItem>
        <MenuItem
          onClick={() => {
            signOutWithGoogle();
            push('/');
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
