import { useId } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Typography,
  useMediaQuery,
} from '@mui/material';
import contractDoneImg from '@/public/assets/contactdone.png';
import contractErrorImg from '@/public/assets/contacterror.png';
import TransitionSlide from './TransitionSlide';

function FeedbackPopup({ type, onClose }) {
  const id = useId();
  const isMobileScreen = useMediaQuery('(max-width: 560px)');
  const titleId = `modal-title-${id}`;
  const descriptionId = `modal-description-${id}`;
  const contentMap = {
    success: {
      imgSrc: contractDoneImg.src,
      imgAlt: 'success cover',
      title: '已送出邀請',
      description: '請耐心等候夥伴的回應',
      buttonText: '關閉',
    },
    error: {
      imgSrc: contractErrorImg.src,
      imgAlt: 'error cover',
      title: '哎呀！有不明錯誤',
      buttonText: '再試一次',
    },
  };
  const content = contentMap[type] || {};

  return (
    <Dialog
      keepMounted
      scroll="body"
      fullScreen={isMobileScreen}
      open={!!type}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      TransitionComponent={TransitionSlide}
      sx={{
        '.MuiPaper-root': {
          marginTop: isMobileScreen ? '84px' : undefined,
        },
      }}
      PaperProps={{
        sx: {
          p: '112px 44px 44px',
          maxWidth: '480px',
          width: '100%',
          borderRadius: '16px',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <img src={content.imgSrc} alt={content.imgAlt} height="184px" />
      </Box>
      <DialogTitle
        id={titleId}
        sx={{
          pb: '8px',
          color: '#536166',
          fontWeight: 700,
          fontSize: '18px',
          textAlign: 'center',
          lineHeight: 1,
        }}
      >
        {content.title}
      </DialogTitle>
      <Typography
        id={descriptionId}
        sx={{
          display: 'block',
          textAlign: 'center',
          color: '#536166',
          fontWeight: 400,
          fontSize: '14px',
        }}
      >
        {content.description}
      </Typography>
      <Box sx={{ mt: '145px' }}>
        <Button
          sx={{
            borderRadius: '20px',
            color: '#ffff',
            bgcolor: '#16B9B3',
            boxShadow: '0 4px 10px #C4C2C166',
          }}
          variant="contained"
          onClick={onClose}
          fullWidth
        >
          {content.buttonText}
        </Button>
      </Box>
    </Dialog>
  );
}

export default FeedbackPopup;
