import React, { useState, useRef, useEffect } from 'react';
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
    padding: ${props.isPadScreen ? '12px 52px' : '12px'};
    font-size: ${props.isPadScreen ? '18px' : '16px'};
    margin-top: ${props.isPadScreen ? '18px' : '0'};
    &:hover {
      background-color: #def5f5;
    }
  `}
`;

const MarathonList = ({ onCloseMenu = () => {}, user }) => {
  const isPadScreen = useMediaQuery('(max-width: 767px)');
  const [isOpenMenu, setIsOpenMenu] = useState(null);
  const router = useRouter();
  const buttonRef = useRef(null);
  const handleClickOutside = (event) => {
    if (buttonRef.current && !buttonRef.current.contains(event.target)) {
      setIsOpenMenu(!isOpenMenu);
    }
  };

  useEffect(() => {
    if (isOpenMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpenMenu]);

  const sections = [
    {
      name: '活動詳情',
      id: 'marathon-intro',
      path: '/learning-marathon#marathon-intro'
    },
    {
      name: '學習計畫分享區',
      id: 'marathon-sharing',
      path: '/marathon-sharing'
    },
    {
      name: '活動公告',
      id: 'marathon-announcement',
      path: '/marathon-announcement'
    },
    {
      name: '成果分享（暫不公開）',
      id: 'project-sharing',
      path: '/project-sharing',
      disabled: true
    }
  ];
  const handleNavigation = (section) => {
    if (section.disabled) return;

    setIsOpenMenu(false);
    onCloseMenu && onCloseMenu();

    router.push(section.path);
  };

  return (
    <Box
      ref={buttonRef}
      sx={{ margin: '8px 32px', cursor: 'pointer', position: 'relative' }}
    >
      <Box
        sx={{
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: isOpenMenu ? '#def5f5' : '#16b9b3',
          color: isOpenMenu ? '#16b9b3' : '#fff',
          padding: '8px',
          borderRadius: '8px',
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
          position: isPadScreen ? 'relative' : 'absolute',
          top: isPadScreen ? 0 : '50px',
          borderRadius: '8px',
          backgroundColor: 'white',
          right: '0',
          zIndex: 1,
        }}
      >
        <Box sx={{ padding: !isPadScreen && '12px' }}>
          {sections.map((section, i) => (
            <StyledMenuItem
              as="div"
              key={section.id}
              delay={`${i * 0.1}s`}
              isDisabled={section.id === 'project-sharing'}
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
