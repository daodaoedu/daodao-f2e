import { Modal, Box, Typography, Button } from '@mui/material';

function TipModal({ onClose, onOk, isLoadingSubmit, open }) {
  return (
    <Modal
      keepMounted
      open={open}
      onClose={onClose}
      aria-labelledby="keep-mounted-modal-title"
      aria-describedby="keep-mounted-modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: '16px',
          p: 4,
        }}
      >
        <Typography
          id="keep-mounted-modal-title"
          variant="h3"
          component="h2"
          textAlign="center"
          sx={{
            color: ' #536166',
            fontWeight: 700,
            fontWize: '22px',
            lineHeight: '140%',
          }}
        >
          想在平台上尋找夥伴嗎？
        </Typography>
        <Typography
          id="keep-mounted-modal-subtitle"
          variant="h6"
          component="h4"
          textAlign="center"
          sx={{
            color: ' #536166',
            fontWeight: 400,
            fontWize: '14px',
            lineHeight: '140%',
          }}
        >
          不論你是自學生、家長、教育工作者，都可以在平台上尋找志同道合的夥伴一起交流
        </Typography>
        <img
          src="/assets/partner-popup.png"
          alt="nobody-land"
          width="360"
          height="280"
        />
        <Typography
          id="keep-mounted-modal-description"
          textAlign="center"
          sx={{
            mt: 2,
            color: ' #536166',
            fontWeight: 400,
            fontWize: '14px',
            lineHeight: '140%',
          }}
        >
          我們會公開你的個人檔案，填寫完整的資料，才能讓其他夥伴們更了解你喔！
        </Typography>
        <Box
          sx={{
            mt: '40px',
            width: '100%',
            display: 'flex',
          }}
        >
          <Button
            sx={{ width: '100%', borderRadius: '20px', mr: '4px' }}
            variant="outlined"
            disabled={isLoadingSubmit}
            onClick={onClose}
          >
            暫時不需要
          </Button>
          <Button
            sx={{
              width: '100%',
              borderRadius: '20px',
              ml: '4px',
              color: '#ffff',
              bgcolor: '#16B9B3',
            }}
            variant="contained"
            onClick={onOk}
          >
            想，填寫資料
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default TipModal;
