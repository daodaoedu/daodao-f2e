import { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { Button } from '@mui/material';
import { ROLE } from '@/constants/member';
import chatSvg from '@/public/assets/icons/chat.svg';
import useMutation from '@/hooks/useMutation';
import { mapToTable } from '@/utils/helper';
import ContactPopup from './ContactPopup';
import FeedbackPopup from './FeedbackPopup';
import LoginPopup from './LoginPopup';

const ROLE_LIST = mapToTable(ROLE);

const StyledButton = styled(Button)`
  padding: 8px 36px;
  line-height: 1.5;
  border-radius: 20px;
  color: #ffff;
  background-color: #16b9b3;
  font-size: 16px;

  &:disabled img {
    mix-blend-mode: difference;
    opacity: 0.3;
  }
`;

function ContactButton({
  user,
  label,
  activityTitle,
  description,
  descriptionPlaceholder,
  isLoading,
}) {
  const me = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const isLogin = !!me?._id;

  const handleClose = () => {
    setOpen(false);
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

  const handleSubmit = ({ message, contact }) => {
    mutate({
      userId: me._id,
      url: window.location.origin,
      name: me.name,
      roleList:
        me.roleList.length > 0
          ? me.roleList.map((roleKey) => ROLE_LIST[roleKey])
          : [''],
      photoUrl: me.photoURL,
      from: me.email,
      to: user.email,
      subject: '【島島阿學】點開 Email，揪團有新消息',
      activityTitle,
      title: '你發起的揪團有人來信！',
      text: message,
      information: [me.email, contact],
    });
  };

  return (
    <div>
      <StyledButton variant="contained" onClick={() => setOpen(true)}>
        <img
          src={chatSvg.src}
          alt="contact icon"
          style={{ marginRight: '8px' }}
        />
        {label}
      </StyledButton>
      {isLogin ? (
        <ContactPopup
          open={open}
          user={user}
          label={label}
          description={description}
          descriptionPlaceholder={descriptionPlaceholder}
          isLoading={isLoading}
          onClose={handleClose}
          onSubmit={handleSubmit}
        />
      ) : (
        <LoginPopup open={open} onClose={() => setOpen(false)} />
      )}
      <FeedbackPopup type={feedback} onClose={() => setFeedback('')} />
    </div>
  );
}

export default ContactButton;
