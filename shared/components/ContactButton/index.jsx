import { useState } from 'react';
import styled from '@emotion/styled';
import { Button } from '@mui/material';
import { useAuth } from '@/contexts/Auth';
import { ROLE } from '@/constants/member';
import ChatSvg from '@/public/assets/icons/chat.svg';
import useMutation from '@/hooks/useMutation';
import { mapToTable } from '@/utils/helper';
import InfoCompletionGuard from '@/shared/components/InfoCompletionGuard';
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
  activityTitle,
  className,
  description,
  descriptionPlaceholder,
  dialogTitle,
  emailSubject,
  emailTitle,
  isLoading,
  user,
}) {
  const { user: me, isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

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
      title: emailTitle,
      subject: emailSubject,
      activityTitle,
      text: message,
      information: [me.email, contact],
    });
  };

  return (
    <div>
      <InfoCompletionGuard>
        <StyledButton
          variant="contained"
          className={className}
          onClick={() => setOpen(true)}
        >
          <ChatSvg className="mr-2" />
          {dialogTitle}
        </StyledButton>
      </InfoCompletionGuard>
      {isLoggedIn ? (
        <ContactPopup
          open={open}
          user={user}
          title={dialogTitle}
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
