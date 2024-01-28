import { Modal, Box, Typography, Button } from '@mui/material';

function ContactErrorModal() {
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
        <Box sx={{ mt: '68px', mb: '21px' }}>
          <img
            src="/assets/contacterror.png"
            alt="nobody-land"
            width="212px"
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
          哎呀！有不明錯誤
        </Typography>
        <Button
          sx={{
            color: 'white',
            width: '100%',
            borderRadius: '20px',
            mt: '173px ',
          }}
          variant="contained"
        >
          再試一次
        </Button>
      </Box>
    </Modal>
  );
}

export default ContactErrorModal;
