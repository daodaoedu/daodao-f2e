import { useId, useState, forwardRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  Slide,
  Typography,
  TextareaAutosize,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ROLE } from '@/constants/member';
import chatSvg from '@/public/assets/icons/chat.svg';
import useMutation from '@/hooks/useMutation';
import { mapToTable } from '@/utils/helper';
import Feedback from './Feedback';

const ROLELIST = mapToTable(ROLE);

const StyledTitle = styled.label`
  display: block;
  color: var(--black-white-gray-dark, #293a3d);
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 140%; /* 22.4px */
  margin-bottom: 11px;
`;
const StyledTextArea = styled(TextareaAutosize)`
  display: block;
  padding: 12px 16px;
  background: var(--black-white-white, #fff);
  border-radius: 8px;
  border: 1px solid var(--black-white-gray-very-light, #dbdbdb);
  width: 100%;
  min-height: 128px;
`;

const Transition = forwardRef((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

function ContactButton({
  user,
  label,
  activityTitle,
  description,
  descriptionPlaceholder,
  isLoading,
}) {
  const id = useId();
  const router = useRouter();
  const me = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [feedback, setFeedback] = useState('');
  const isMobileScreen = useMediaQuery('(max-width: 560px)');
  const titleId = `modal-title-${id}`;
  const descriptionId = `modal-description-${id}`;
  const messageId = `message-${id}`;
  const contactId = `contact-${id}`;
  const role =
    ROLE.find(({ key }) => user?.roleList?.includes(key))?.label || '暫無資料';

  const handleClose = () => {
    setOpen(false);
    setMessage('');
    setContact('');
  };
  const { mutate } = useMutation(`/email`, {
    method: 'POST',
    onSuccess: () => {
      handleClose();
      setFeedback('success');
    },
    onError: () => {
      handleClose();
      setFeedback('error');
    },
  });

  const handleSubmit = () => {
    mutate({
      userId: me._id,
      url: window.location.origin,
      name: me.name,
      roleList:
        me.roleList.length > 0
          ? me.roleList.map((roleKey) => ROLELIST[roleKey])
          : [''],
      photoUrl: me.photoURL,
      from: me.email,
      to: user.email,
      subject: '【島島阿學】點開 Email，認識新夥伴',
      activityTitle,
      title: '你發起的揪團有人來信！',
      text: message,
      information: [me.email, contact],
    });
  };

  useEffect(() => {
    if (!me?._id && open) router.push('/login');
  }, [me, open, router]);

  return (
    <>
      <Button
        variant="contained"
        sx={{
          p: '8px 36px',
          lineHeight: 1.5,
          borderRadius: '20px',
          color: '#ffff',
          bgcolor: '#16B9B3',
          fontSize: '16px',
        }}
        disabled={isLoading}
        onClick={() => setOpen(true)}
      >
        <img
          src={chatSvg.src}
          alt="contact icon"
          style={{ marginRight: '8px' }}
        />
        {label}
      </Button>
      <Dialog
        keepMounted
        scroll="body"
        fullScreen={isMobileScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        TransitionComponent={Transition}
        sx={{
          '.MuiPaper-root': {
            marginTop: isMobileScreen ? '84px' : undefined,
          },
        }}
        PaperProps={{
          sx: {
            p: '16px 40px 32px',
            borderRadius: '16px',
          },
        }}
      >
        <DialogTitle
          id={titleId}
          sx={{
            color: '#536166',
            fontWeight: 700,
            fontSize: '18px',
            textAlign: 'center',
          }}
        >
          {label}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 32,
            top: 24,
            color: '#536166',
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          sx={{
            width: isMobileScreen ? '100%' : '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <Box
            sx={{
              p: '12px',
              backgroundColor: '#DEF5F5',
              display: 'flex',
              borderRadius: '16px',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Avatar
              src={user?.photoURL}
              alt={`${user?.name} avatar`}
              sx={{ width: '60px', height: '60px' }}
            />
            <div>
              <Typography
                sx={{
                  display: 'block',
                  color: ' #293A3D',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '140%',
                }}
              >
                {user?.name || '名稱'}
              </Typography>
              <Typography
                sx={{
                  display: 'block',
                  color: ' #536166',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '140%',
                }}
              >
                {role}
              </Typography>
            </div>
          </Box>

          <div>
            <StyledTitle id={descriptionId} htmlFor={messageId}>
              {description}
            </StyledTitle>
            <StyledTextArea
              id={messageId}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={descriptionPlaceholder}
            />
          </div>

          <div>
            <StyledTitle htmlFor={contactId}>聯絡資訊</StyledTitle>
            <StyledTextArea
              id={contactId}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="寫下您的聯絡資訊，初次聯繫建議提供「想公開的社群媒體帳號、email」即可。"
            />
          </div>

          <Box
            sx={{
              display: 'flex',
              gap: '16px',
            }}
          >
            <Button
              color="inherit"
              sx={{
                flex: 1,
                borderRadius: '20px',
                borderColor: 'transparent',
                boxShadow: '0 4px 10px #C4C2C166',
              }}
              variant="outlined"
              disabled={isLoading}
              onClick={handleClose}
            >
              取消
            </Button>
            <Button
              sx={{
                flex: 1,
                borderRadius: '20px',
                color: '#ffff',
                bgcolor: '#16B9B3',
                boxShadow: '0 4px 10px #C4C2C166',
              }}
              variant="contained"
              disabled={isLoading || !message || !contact}
              onClick={handleSubmit}
            >
              送出
            </Button>
          </Box>
        </Box>
      </Dialog>
      <Feedback type={feedback} onClose={() => setFeedback('')} />
    </>
  );
}

export default ContactButton;
