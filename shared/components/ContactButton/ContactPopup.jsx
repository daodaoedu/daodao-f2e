import { useId, useState } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  Typography,
  TextareaAutosize,
  useMediaQuery,
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { X } from 'lucide-react';
import { ROLE } from '@/constants/member';
import TransitionSlide from './TransitionSlide';

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

const StyledDesc = styled.p`
  font-size: 14px;
  color: #92989a;

  a {
    color: #92989a;
    text-decoration: underline;
  }
`;

const desc = (
  <StyledDesc>
    您填的資訊將透過島島阿學 email
    給這位夥伴，請確認訊息未涉及個人隱私並符合本網站
    {' '}
    <Link href="/terms/service" target="_blank">
      使用者條款
    </Link>
  </StyledDesc>
);

function ContactPopup({
  open,
  user,
  title,
  description,
  descriptionPlaceholder,
  isLoading,
  onClose,
  onSubmit,
}) {
  const isMobileScreen = useMediaQuery('(max-width: 560px)');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const id = useId();
  const titleId = `modal-title-${id}`;
  const descriptionId = `modal-description-${id}`;
  const messageId = `message-${id}`;
  const contactId = `contact-${id}`;
  const role = ROLE.find(({ key }) => user?.roleList?.includes(key))?.label || '暫無資料';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={TransitionSlide}
      keepMounted
      tabIndex={-1}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      fullScreen={isMobileScreen}
      sx={{
        '& .MuiPaper-root': {
          maxWidth: '720px',
          width: '100%',
          position: 'relative',
          padding: '24px',
          borderRadius: '20px',
        },
      }}
    >
      <DialogTitle id={titleId} sx={{ p: 0, mb: 2 }}>
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <Avatar alt={user?.name} src={user?.photoURL} />
            <div className="flex flex-col gap-0">
              <span className="body-md font-bold text-basic-400">{title}</span>
              <span className="caption text-basic-300">{role}&nbsp;{user?.name}</span>
            </div>
          </div>
          <IconButton onClick={onClose} aria-label="close">
            <X />
          </IconButton>
        </div>
      </DialogTitle>

      <div id={descriptionId} className="mb-2 w-full">
        {desc}
      </div>

      <div className="flex w-full flex-col gap-4">
        <div>
          <StyledTitle htmlFor={messageId}>訊息</StyledTitle>
          <StyledTextArea
            id={messageId}
            value={message}
            onChange={(e) => setMessage(e?.target?.value)}
            placeholder={descriptionPlaceholder}
          />
        </div>

        <div>
          <StyledTitle htmlFor={contactId}>聯絡方式（Email 或手機）</StyledTitle>
          <StyledTextArea
            id={contactId}
            value={contact}
            onChange={(e) => setContact(e?.target?.value)}
            placeholder="請提供 Email 或手機"
          />
        </div>

        <FormControlLabel
          control={(
            <Checkbox
              checked={isChecked}
              onChange={(e) => setIsChecked(!!e?.target?.checked)}
            />
          )}
          label={(
            <span>
              我已閱讀並同意
              <Link href="/terms/service" className="text-primary-base underline" target="_blank">使用者條款</Link>
              與
              <Link href="/terms/privacy" className="text-primary-base underline" target="_blank">隱私權政策</Link>
            </span>
          )}
        />

        <Box className="flex flex-row gap-2">
          <Button variant="outlined" onClick={onClose} className="flex-1">取消</Button>
          <Button
            variant="default"
            className="flex-1"
            disabled={!message || !contact || !isChecked}
            onClick={() => onSubmit?.(message, contact)}
          >
            送出
          </Button>
        </Box>
      </div>
    </Dialog>
  );
}

export default ContactPopup;
