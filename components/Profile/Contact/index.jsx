import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  TextareaAutosize,
  Avatar,
} from '@mui/material';

function ContactModal({ onClose, onOk, isLoadingSubmit, open }) {
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
            }}
          >
            <Avatar />
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
                黃芊宇
              </Typography>
              <Typography
                sx={{
                  color: ' #536166',
                  fontWeight: 400,
                  fontSize: '10px',
                  lineHeight: '140%',
                }}
              >
                實驗教育學生
              </Typography>
            </Box>
          </Box>
          <Typography
            id="keep-mounted-modal-subtitle"
            sx={{
              color: ' #293A3D',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '140%',
              margin: '16px 0 11px 0',
            }}
          >
            邀請訊息
          </Typography>
          <TextareaAutosize
            sx={{
              color: '#DBDBDB',
              width: '100%',
              minHeight: '200px',
              padding: '10px',
            }}
            placeholder="想要和新夥伴交流什麼呢？可以簡單的自我介紹，寫下想認識夥伴的原因。"
          />

          <Typography
            id="keep-mounted-modal-description"
            sx={{
              mt: 2,
              color: ' #293A3D',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '140%',
              margin: '16px 0 11px 0',
            }}
          >
            聯繫資訊
          </Typography>
          <TextareaAutosize
            sx={{
              color: '#DBDBDB',
              width: '100%',
              minHeight: '200px',
              padding: '10px',
            }}
            placeholder="ex.  自學申請、學習方法、學習資源，或各種學習領域的知識"
          />

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
