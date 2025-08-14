import { useState } from 'react';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import { MapPin, EllipsisVertical } from 'lucide-react';
import Image from '@/shared/components/Image';
import { useAuth } from '@/contexts/Auth';
import emptyCoverImg from '@/public/assets/empty-cover.png';
import useMutation from '@/hooks/useMutation';
import { timeDuration } from '@/utils/date';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import {
  StyledAreas,
  StyledContainer,
  StyledFooter,
  StyledGroupCard,
  StyledText,
  StyledTitle,
  StyledTime,
  StyledFlex,
  StyledStatus,
  StyledMenuItem,
  StyledImageWrapper,
} from './GroupCard.styled';

function GroupCard({
  _id,
  photoURL,
  photoAlt,
  title = '未定義主題',
  content,
  area,
  isGrouping,
  userId,
  updatedDate,
  onUpdateGrouping,
  onDeleteGroup,
}) {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const isEnabledMutation = user?._id === userId;

  const apiUpdateGrouping = useMutation(`/circles/${_id}`, {
    method: 'PUT',
    enabled: isEnabledMutation,
    onSuccess: onUpdateGrouping,
  });

  const apiDeleteGroup = useMutation(`/circles/${_id}`, {
    method: 'DELETE',
    enabled: isEnabledMutation,
    onSuccess: onDeleteGroup,
  });

  const handleMenu = (event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGrouping = () => {
    handleClose();
    apiUpdateGrouping.mutate({ isGrouping: !isGrouping });
  };

  const handleDeleteGroup = () => {
    handleClose();
    apiDeleteGroup.mutate();
  };

  const formatToString = (data, defaultValue = '') => (Array.isArray(data) && data.length ? data.join('、') : data || defaultValue);

  return (
    <>
      <StyledGroupCard href={`/circles/${_id}`}>
        <StyledImageWrapper>
          <Image
            alt={photoAlt || '未放封面'}
            src={photoURL || emptyCoverImg.src}
          />
        </StyledImageWrapper>
        <StyledContainer>
          <StyledTitle>{title}</StyledTitle>
          <StyledText lineClamp="2" style={{ height: '42px' }}>
            <MarkdownEditor
              readOnly
              value={content?.split('\n')[0]}
              disabledProse
              suppressLinkDefaultPrevent
            />
          </StyledText>
          <StyledAreas>
            <MapPin size={16} color="#536166" />
            <StyledText>{formatToString(area, '待討論')}</StyledText>
          </StyledAreas>
          <StyledFooter>
            <StyledTime>{timeDuration(updatedDate)}</StyledTime>
            <StyledFlex>
              {!!user && user?._id === userId && (
                <StyledStatus isGrouping={isGrouping} onClick={handleGrouping}>
                  {isGrouping ? '進行中' : '暫停中'}
                </StyledStatus>
              )}
              {user?._id === userId && (
                <>
                  <IconButton onClick={handleMenu}>
                    <EllipsisVertical />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <StyledMenuItem onClick={handleGrouping}>
                      {isGrouping ? '暫停進行' : '開始進行'}
                    </StyledMenuItem>
                    <StyledMenuItem onClick={handleDeleteGroup}>刪除揪團</StyledMenuItem>
                  </Menu>
                </>
              )}
            </StyledFlex>
          </StyledFooter>
        </StyledContainer>
      </StyledGroupCard>
    </>
  );
}

export default GroupCard;
