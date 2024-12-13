import React, { useState } from 'react';
import { keyframes, css } from '@emotion/react';
import styled from '@emotion/styled';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, MenuItem } from '@mui/material';
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
  border-radius: 4px;
  ${(props) => css`
    color: ${props.isDisabled ? 'rgba(83, 97, 102, 0.5)' : '#536166'};
    cursor: ${props.isDisabled ? 'not-allowed' : 'pointer'};
    animation-delay: ${props.delay};
    min-width: 126px;
    padding: 12px;
    font-size: 18px;
    &:hover {
      background-color: #def5f5;
    }
  `}
`;

const MarathonList = ({ onCloseMenu = () => {} }) => {
  const { push } = useRouter();
  const [isOpenMenu, setIsOpenMenu] = useState(true);

  return (
    <Box sx={{ margin: '8px 32px 8px 24px', cursor: 'pointer', position: 'relative' }}>
      <Box
        sx={{
          fontSize: '18px',
          display: 'flex',
          color:  '#16b9b3',
          borderRadius: '4px',
          transition: 'background-color 0.3s ease, padding 0.3s ease',          
        }}        
        onClick={() => setIsOpenMenu(!isOpenMenu)}
      >
       島島盃-春季學習馬拉松
        {isOpenMenu ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </Box>
      <Box
        sx={{
          display: isOpenMenu ? 'block' : 'none',
          position: 'relative',
          borderRadius: '8px',
          backgroundColor: 'white',
          right: '0',
          zIndex: 1,
        }}
      >
        <Box sx={{ marginTop: '6px' }}>
          {[
            { name: '活動詳情', id: 'marathon-detail' },
            { name: '學習計畫分享區', id: 'marathon-sharing' },
            { name: '活動公告', id: 'marathon-announcement' },
            { name: '成果分享（暫不公開）', id: 'project-sharing' },
          ].map((v, i) => (
            <StyledMenuItem
              as="div"
              key={v.id}
              delay={`${i * 0.1}s`}
              isDisabled={v.id === 'project-sharing'}
              onClick={() => {
                setIsOpenMenu(!isOpenMenu);
                onCloseMenu();
                push('/learning-marathon?id=' + v.id)
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
