import { useState } from 'react';
import { useRouter } from 'next/router';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import Image from '@/shared/components/Image';
import emptyCoverImg from '@/public/assets/empty-cover.png';
import useMutation from '@/hooks/useMutation';
import { GROUP_API_URL } from '@/redux/actions/group';
import { timeDuration } from '@/utils/date';
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
} from './GroupCard.styled';

function GroupCard({
  _id,
  photoURL,
  photoAlt,
  title = '未定義主題',
  description,
  area,
  isGrouping,
  updatedDate,
  refetch,
}) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);

  const apiGrouping = useMutation(
    () =>
      fetch(`${GROUP_API_URL}/${_id}`, {
        method: 'PUT',
        body: JSON.stringify({ isGrouping: !isGrouping }),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    { onSuccess: refetch },
  );

  const apiDeleteGroup = useMutation(
    () =>
      fetch(`${GROUP_API_URL}/${_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    { onSuccess: refetch },
  );

  const handleMenu = (event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGrouping = () => {
    handleClose();
    apiGrouping.mutate();
  };

  const handleDeleteGroup = () => {
    handleClose();
    apiDeleteGroup.mutate();
  };

  return (
    <>
      <StyledGroupCard href={`/group/detail?id=${_id}`}>
        <Image
          width="240px"
          alt={photoAlt || '未放封面'}
          src={photoURL || emptyCoverImg.src}
        />
        <StyledContainer>
          <StyledTitle>{title}</StyledTitle>
          <StyledText lineClamp="2" style={{ minHeight: '32px' }}>
            {description}
          </StyledText>
          <StyledAreas>
            <LocationOnOutlinedIcon fontSize="16px" sx={{ color: '#536166' }} />
            <StyledText>{area}</StyledText>
          </StyledAreas>
          <StyledFooter>
            <StyledTime>{timeDuration(updatedDate)}</StyledTime>
            <StyledFlex>
              {isGrouping ? (
                <StyledStatus>揪團中</StyledStatus>
              ) : (
                <StyledStatus className="finished">已結束</StyledStatus>
              )}
              <IconButton size="small" onClick={handleMenu}>
                <MoreVertOutlinedIcon />
              </IconButton>
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
