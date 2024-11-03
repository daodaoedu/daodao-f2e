import { useState, forwardRef, useId, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  Box,
  Button,
  Slide,
  Typography,
  useMediaQuery,
} from '@mui/material';
import illustrationImg from '@/public/assets/illustration.png';

const TransitionSlide = forwardRef((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CompleteInfoReminderDialog({ isOpen, onClose }) {
  const id = useId();
  const isMobileScreen = useMediaQuery('(max-width: 560px)');
  const titleId = `modal-title-${id}`;
  const descriptionId = `modal-description-${id}`;

  return (
    <Dialog
      keepMounted
      scroll="body"
      fullScreen={isMobileScreen}
      open={isOpen}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      TransitionComponent={TransitionSlide}
      sx={{
        '.MuiPaper-root': {
          marginTop: isMobileScreen ? 'calc(100vh - 580px)' : undefined,
        },
      }}
      PaperProps={{
        sx: {
          p: '32px 24px',
          maxWidth: '400px',
          width: '100%',
          borderRadius: '16px',
        },
      }}
    >
      <DialogTitle
        id={titleId}
        sx={{
          p: 0,
          mb: '8px',
          color: '#536166',
          fontWeight: 700,
          fontSize: '22px',
          textAlign: 'center',
        }}
      >
        島主廣播
      </DialogTitle>
      <Typography id={descriptionId} component="p">
        Hello
        為了讓其他島民能更認識你，要先請你至個人資料頁面完成填寫哦！(,,・ω・,,)
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', m: '41px 0 81px' }}>
        <img
          src={illustrationImg.src}
          alt="填寫完能享有更完善的功能"
          height="204px"
        />
      </Box>
      <Box
        sx={{
          mt: '16px',
          display: 'flex',
          flexDirection: 'row-reverse',
          gap: '8px',
        }}
      >
        <Button
          LinkComponent={Link}
          sx={{
            borderRadius: '20px',
            color: '#ffff',
            bgcolor: '#16B9B3',
            boxShadow: '0 4px 10px #C4C2C166',
          }}
          size="large"
          variant="contained"
          fullWidth
          href="/profile?id=person-setting&check=1"
          onClick={onClose}
        >
          去填寫資料
        </Button>
        <Button
          sx={{
            borderRadius: '20px',
            bgcolor: '#ffffff',
            color: '#1f4645',
            boxShadow: '0 4px 10px #C4C2C166',
            '&:hover': {
              bgcolor: '#dddddd',
            },
          }}
          variant="contained"
          size="large"
          fullWidth
          onClick={onClose}
        >
          再等等
        </Button>
      </Box>
    </Dialog>
  );
}
