import { Modal, Box, Typography, Button } from '@mui/material';

function ContactDoneModal() {
  return (
    <Modal
      keepMounted
      open
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
          height: '602px',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: '16px',
          p: '45px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ mt: '77px', mb: '16px' }}>
          <img
            src="/assets/contactdone.png"
            alt="nobody-land"
            width="312px"
            height="184px"
          />
        </Box>
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
            mt: '8px',
          }}
        >
          請耐心等候夥伴的回應
        </Typography>
        <Button
          sx={{
            color: 'white',
            width: '100%',
            borderRadius: '20px',
            mt: '145px',
          }}
          variant="contained"
        >
          關閉
        </Button>
      </Box>
    </Modal>
  );
}

export default ContactDoneModal;
