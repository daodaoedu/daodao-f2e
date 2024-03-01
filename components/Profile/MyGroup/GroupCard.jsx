import { useState } from 'react';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import Image from '@/shared/components/Image';
import emptyCoverImg from '@/public/assets/empty-cover.png';
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
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    setAnchorEl(null);
  };

  return (
    <StyledGroupCard>
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
              <StyledMenuItem onClick={handleClose}>編輯</StyledMenuItem>
              <StyledMenuItem onClick={handleClose}>
                {isGrouping ? '結束揪團' : '開放揪團'}
              </StyledMenuItem>
              <StyledMenuItem onClick={handleClose}>刪除</StyledMenuItem>
            </Menu>
          </StyledFlex>
        </StyledFooter>
      </StyledContainer>
    </StyledGroupCard>
  );
}

export default GroupCard;
