import { Modal, Box, Typography, Button } from '@mui/material';

function ContactDoneModal({ onClose, onOk, isLoadingSubmit, open }) {
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
          width: '480px',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: '16px',
          p: 5,
        }}
      >
        <img
          src="/assets/partner-popup.png"
          alt="nobody-land"
          width="360"
          height="280"
        />
        <Typography
          id="keep-mounted-modal-title"
          variant="h3"
          component="h2"
          textAlign="center"
          sx={{
            color: ' #536166',
            fontWeight: 700,
            fontWize: '18px',
            lineHeight: '120%',
          }}
        >
          已送出邀請
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
          請耐心等候夥伴的回應
        </Typography>
        <Button
          sx={{ width: '100%', borderRadius: '20px', mr: '4px' }}
          variant="outlined"
          disabled={isLoadingSubmit}
          onClick={onClose}
        >
          關閉
        </Button>
      </Box>
    </Modal>
  );
}

export default ContactDoneModal;
