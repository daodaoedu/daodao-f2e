import { useState } from 'react';
import { useRouter } from 'next/router';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import Image from '@/shared/components/Image';
import { useAuth } from '@/contexts/Auth';
import emptyCoverImg from '@/public/assets/empty-cover.png';
import useMutation from '@/hooks/useMutation';
import { timeDuration } from '@/utils/date';
import MarkdownEditor from '@/shared/components/MarkdownEditor';
import { AREAS, ONLINE_OPTION, TBD_OPTION } from '@/constants/areas';
import { mapToTable } from '@/utils/helper';
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

const AREA_TABLE = mapToTable(AREAS.concat(TBD_OPTION, ONLINE_OPTION));

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
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const isEnabledMutation = user?._id === userId;

  const apiUpdateGrouping = useMutation(`/activity/${_id}`, {
    method: 'PUT',
    enabled: isEnabledMutation,
    onSuccess: onUpdateGrouping,
  });

  const apiDeleteGroup = useMutation(`/activity/${_id}`, {
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

  const formatToString = (mapping, data, defaultValue = '') =>
    Array.isArray(data) && data.length
      ? data.map((item) => mapping[item] ?? item).join('、')
      : mapping[data] ?? data ?? defaultValue;

  return (
    <>
      <StyledGroupCard href={`/group/detail?id=${_id}`}>
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
            <LocationOnOutlinedIcon fontSize="16px" sx={{ color: '#536166' }} />
            <StyledText>{formatToString(AREA_TABLE, area, TBD_OPTION.value)}</StyledText>
          </StyledAreas>
          <StyledFooter>
            <StyledTime>{timeDuration(updatedDate)}</StyledTime>
            <StyledFlex>
              {isGrouping ? (
                <StyledStatus>揪團中</StyledStatus>
              ) : (
                <StyledStatus className="finished">已結束</StyledStatus>
              )}
              {isEnabledMutation && (
                <IconButton size="small" onClick={handleMenu}>
                  <MoreVertOutlinedIcon />
                </IconButton>
              )}
            </StyledFlex>
          </StyledFooter>
        </StyledContainer>
      </StyledGroupCard>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <StyledMenuItem onClick={() => router.push(`/group/edit?id=${_id}`)}>
          編輯
        </StyledMenuItem>
        <StyledMenuItem onClick={handleGrouping}>
          {isGrouping ? '結束揪團' : '開放揪團'}
        </StyledMenuItem>
        <StyledMenuItem onClick={handleDeleteGroup}>刪除</StyledMenuItem>
      </Menu>
    </>
  );
}

export default GroupCard;
