import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { Group } from '@mui/icons-material';
import { useRouter } from 'next/router';

const UserAvatar = () => {
  const { push } = useRouter();
  const user = useSelector((state) => state.user);

  const [isOpenMenu, setIsOpenMenu] = useState(null);

  const handleSignOut = () => {
    console.log('handleSignOut');
  };

  if (!user._id) {
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
        // onClick={(event) => setIsOpenMenu(event.currentTarget)}
        onClick={() => {
          setIsOpenMenu(false);
          push('/profile');
        }}
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
            handleSignOut();
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
