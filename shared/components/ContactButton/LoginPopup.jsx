import { useId } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Typography,
  useMediaQuery,
} from '@mui/material';
import partnerPopupImg from '@/public/assets/partner-popup.png';
import openLoginWindow from '@/utils/openLoginWindow';
import TransitionSlide from './TransitionSlide';

function LoginPopup({ open, onClose }) {
  const id = useId();
  const isMobileScreen = useMediaQuery('(max-width: 560px)');
  const titleId = `modal-title-${id}`;
  const descriptionId = `modal-description-${id}`;

  return (
    <Dialog
      keepMounted
      scroll="body"
      fullScreen={isMobileScreen}
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      TransitionComponent={TransitionSlide}
      sx={{
        '.MuiPaper-root': {
          marginTop: isMobileScreen ? 'calc(100vh - 430px)' : undefined,
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
        請先登入或註冊
      </DialogTitle>
      <Typography
        variant="subtitle1"
        id={descriptionId}
        sx={{
          mb: '16px',
          color: '#536166',
          fontWeight: 400,
          fontSize: '14px',
          textAlign: 'center',
        }}
      >
        登入後才可以使用聯繫夥伴功能唷！
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <img src={partnerPopupImg.src} alt="登入" height="224px" />
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
          sx={{
            borderRadius: '20px',
            color: '#ffff',
            bgcolor: '#16B9B3',
            boxShadow: '0 4px 10px #C4C2C166',
          }}
          size="large"
          variant="contained"
          onClick={() => openLoginWindow()}
          fullWidth
        >
          登入/註冊
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
          onClick={onClose}
          fullWidth
        >
          取消
        </Button>
      </Box>
    </Dialog>
  );
}

export default LoginPopup;
