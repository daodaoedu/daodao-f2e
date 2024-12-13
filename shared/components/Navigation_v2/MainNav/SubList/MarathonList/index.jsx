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
    min-width: 126px;
    padding: ${props.isPadScreen ? '12px 52px' : '12px'};
    font-size: ${props.isPadScreen ? '18px' : '16px'};
    margin-top: ${props.isPadScreen ? '18px' : '0'};
    &:hover {
      background-color: #def5f5;
    }
  `}
`;

const MarathonList = ({ onCloseMenu = () => {}, user }) => {
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
       島島盃2025<br/>春季學習馬拉松
        {isOpenMenu ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </Box>
      <Box
        sx={{
          display: isOpenMenu ? 'block' : 'none',
          position: isPadScreen ? 'relative' : 'absolute',
          top: isPadScreen ? 0 : '55px',
          borderRadius: '8px',
          backgroundColor: 'white',
          right: '0',
          zIndex: 1,
        }}
      >
        <Box sx={{ padding: !isPadScreen && '12px' }}>
          {[
            { name: '活動詳情', id: 'marathon-detail' },
            { name: '學習計畫分享區', id: 'marathon-sharing' },
            { name: '活動公告', id: 'marathon-announcement' },
            { name: '報名資料修改', id: 'marathon-edit' },
            { name: '成果分享（暫不公開）', id: 'project-sharing' },
          ].map((v, i) => (
            <StyledMenuItem
              as="div"
              key={v.id}
              delay={`${i * 0.1}s`}
              isPadScreen={isPadScreen}
              onClick={() => {
                setIsOpenMenu(false);
                onCloseMenu();
                push('/learning-marathon?id=' + v.id);
              }}
            >
              {v.name}
            </StyledMenuItem>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default MarathonList;
