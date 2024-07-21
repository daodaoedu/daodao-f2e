import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  TextareaAutosize,
  Avatar,
} from '@mui/material';
import styled from '@emotion/styled';

const StyledGroup = styled(Box)`
  margin-bottom: 16px;
`;

const StyledTitle = styled(Typography)`
  color: var(--black-white-gray-dark, #293a3d);
  /* desktop/body-M-Medium */
  font-family: Noto Sans TC;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 140%; /* 22.4px */
  margin-bottom: 11px;
`;
const StyledTextArea = styled(TextareaAutosize)`
  border-radius: 8px;
  border: 1px solid var(--black-white-gray-very-light, #dbdbdb);
  background: var(--black-white-white, #fff);
  padding: 12px 16px;
  width: 100%;
  min-height: 128px;
`;

function ContactModal({
  title,
  descipt,
  avatar,
  onClose,
  onOk,
  isLoadingSubmit,
  open,
}) {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');

  const handleSubmit = () => {
    onOk({ message, contact });
    setMessage('');
    setContact('');
  };

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
          聯繫夥伴
        </Typography>
        <Box
          sx={{
            width: '400px',
            display: 'flex',
            flexDirection: 'column',
            padding: '22px 0px 0px 0px ',
          }}
        >
          <Box
            sx={{
              width: '100%',
              backgroundColor: '#DEF5F5',
              display: 'flex',
              justifyContent: 'flex-start',
              borderRadius: '16px',
              p: 2,
              mb: '16px',
            }}
          >
            <Avatar alt={title} src={avatar} />
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                ml: '12px',
              }}
            >
              <Typography
                id="keep-mounted-modal-subtitle"
                sx={{
                  color: ' #293A3D',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '140%',
                }}
              >
                {title}
              </Typography>
              <Typography
                sx={{
                  color: ' #536166',
                  fontWeight: 400,
                  fontSize: '10px',
                  lineHeight: '140%',
                }}
              >
                {descipt}
              </Typography>
            </Box>
          </Box>

          <StyledGroup>
            <StyledTitle id="keep-mounted-modal-subtitle">邀請訊息</StyledTitle>
            <StyledTextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="想要和新夥伴交流什麼呢？可以簡單的自我介紹，寫下想認識夥伴的原因。"
            />
          </StyledGroup>
          <StyledGroup>
            <StyledTitle id="keep-mounted-modal-description">
              聯絡資訊
            </StyledTitle>
            <StyledTextArea
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="寫下您的聯絡資訊，初次聯繫建議提供「想公開的社群媒體帳號、email」即可。"
            />
          </StyledGroup>

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
              取消
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
              disabled={isLoadingSubmit}
              onClick={() => handleSubmit({ message, contact })}
            >
              送出
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default ContactModal;
