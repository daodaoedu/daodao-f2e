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
  const router = useRouter();
  const [isOpenMenu, setIsOpenMenu] = useState(true);

  const sections = [
    {
      name: '活動詳情',
      id: 'marathon-intro',
      path: '/learning-marathon#marathon-intro'
    },
    {
      name: '活動公告（未公開）',
      id: 'marathon-announcement',
      path: '/marathon-announcement',
      disabled: true
    },
    {
      name: '學習計畫分享區（未公開）',
      id: 'marathon-sharing',
      path: '/marathon-sharing',
      disabled: true
    },
    {
      name: '成果分享（未公開）',
      id: 'project-sharing',
      path: '/project-sharing',
      disabled: true
    }
  ];
  const handleNavigation = (section) => {
    if (section.disabled) return;

    setIsOpenMenu(false);
    onCloseMenu();

    router.push(section.path);
  };

  return (
    <Box sx={{ margin: '8px 32px 8px 24px', cursor: 'pointer', position: 'relative' }}>
      <Box
        sx={{
          fontSize: '18px',
          display: 'flex',
          color: '#16b9b3',
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
          {sections.map((section, i) => (
            <StyledMenuItem
              as="div"
              key={section.id}
              delay={`${i * 0.1}s`}
              isDisabled={section.disabled === true}
              onClick={() => handleNavigation(section)}
            >
              {section.name}
            </StyledMenuItem>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default MarathonList;
