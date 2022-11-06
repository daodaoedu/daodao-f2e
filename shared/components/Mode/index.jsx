import { DarkMode, LightMode } from '@mui/icons-material';
import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { changeMode } from '../../../redux/actions/theme';

const Mode = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state?.theme?.mode ?? 'light');
  return (
    <Box
      sx={{
        position: 'fixed',
        right: 0,
        bottom: 200,
        width: '35px',
        height: '35px',
        backgroundColor: mode === 'light' ? 'black' : 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: 1,
      }}
      onClick={() => dispatch(changeMode())}
    >
      {mode === 'light' ? (
        <DarkMode
          sx={{
            color: 'white',
          }}
        />
      ) : (
        <LightMode
          sx={{
            color: 'black',
          }}
        />
      )}
    </Box>
  );
};

export default Mode;
