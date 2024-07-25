import React, { useState } from 'react';
import { keyframes, css } from '@emotion/react';
import styled from '@emotion/styled';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useDispatch } from 'react-redux';
import { userLogout } from '@/redux/actions/user';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Avatar, Box, MenuItem, Typography } from '@mui/material';
import { useRouter } from 'next/router';

const slideInFrames = keyframes`
  0% {
    transform: translateX(-2%);
  }
  100% {
    transform: translateX(0);
  }
`;

const StyledMenuItem = styled(MenuItem)`
  animation: 0.5s ${slideInFrames} forwards;
  transition: color 0.2s ease-in-out;
  color: #536166;
  border-radius: 4px;
  ${(props) => css`
    animation-delay: ${props.delay};
    padding: ${props.isPadScreen} ? 12px : 12px 52px;
    font-size: ${props.isPadScreen} ? 18px : 16px;
    magrin: ${props.isPadScreen} ? 8px 0; : '0';
    &:hover {
      background-color: #DEF5F5;
    }
  `}
`;

const UserAvatar = ({ onCloseMenu = () => {}, user }) => {
  const dispatch = useDispatch();
  const isPadScreen = useMediaQuery('(max-width: 767px)');

  const { push } = useRouter();

  const [isOpenMenu, setIsOpenMenu] = useState(null);

  const logout = () => {
    dispatch(userLogout());
    setIsOpenMenu(false);
    onCloseMenu();
    push('/');
  };

  return (
    <Box sx={{ margin: '8px 32px', cursor: 'pointer', position: 'relative' }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center' }}
        onClick={() => setIsOpenMenu(!isOpenMenu)}
      >
        {user.name && (
          <Avatar alt={user?.displayName ?? ''} src={user?.photoURL ?? ''} />
        )}
        {isPadScreen && (
          <>
            <Typography
              sx={{
                flexGrow: 1,
                marginLeft: '12px',
                fontWeight: 'bold',
                fontSize: '18px',
                color: '#536166',
              }}
            >
              {user.name}
            </Typography>
            {isOpenMenu ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </>
        )}
      </Box>
      <Box
        sx={{
          display: isOpenMenu ? 'block' : 'none',
          position: isPadScreen ? 'relative' : 'absolute',
          top: isPadScreen ? 0 : '60px',
          borderRadius: '8px',
          backgroundColor: 'white',
          right: '0',
          zIndex: 1,
        }}
      >
        <Box as="ul" sx={{ padding: !isPadScreen && '12px' }}>
          {[
            { name: '個人資料', id: 'person-setting' },
            { name: '我的揪團', id: 'my-group' },
            { name: '帳號設定', id: 'account-setting' },
          ].map((v, i) => (
            <StyledMenuItem
              key={v.id}
              delay={`${i * 0.1}s`}
              isPadScreen={isPadScreen}
              onClick={() => {
                setIsOpenMenu(false);
                onCloseMenu();
                push('/profile?id=' + v.id);
              }}
            >
              {v.name}
            </StyledMenuItem>
          ))}

          <StyledMenuItem onClick={logout}>登出</StyledMenuItem>
        </Box>
      </Box>
    </Box>
  );
};

export default UserAvatar;
