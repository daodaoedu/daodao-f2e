import { useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { fetchMarathonProfileById } from '@/redux/actions/marathon';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import Image from '@/shared/components/Image';
import emptyCoverImg from '@/public/assets/empty-cover.png';
import {
  IconButton,
  Menu,
} from '@mui/material';
import {
  StyledGroupCard,
  StyledImageWrapper,
  StyledContainer,
  StyledTitle,
  StyledText,
  StyledFooter,
  StyledFlex,
  StyledStatus,
  StyledMenuItem
} from "./MarathonCard.styled";

export default function MarathonCard({ marathon }) {
  const { title, isPublic } = marathon;
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const reduxDispatch = useDispatch();
  const handleMenu = (event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClickEdit = () => {
    setAnchorEl(null);
    window.localStorage.setItem('fromProfilePage', 'click_edit');
    reduxDispatch(fetchMarathonProfileById(marathon._id));
    router.push('/learning-marathon/signup');
  };
  const handleClickDetail = () => {
    setAnchorEl(null);
    window.localStorage.setItem('fromProfilePage', 'click_detail');
    reduxDispatch(fetchMarathonProfileById(marathon._id));
    router.push('/learning-marathon/signup');
  };
  return (
    <StyledGroupCard>
      <StyledImageWrapper>
        <Image
          alt="未放封面"
          src={emptyCoverImg.src}
        />
      </StyledImageWrapper>
      <StyledContainer>
        <StyledTitle>{title}</StyledTitle>
        <StyledText lineClamp="2" style={{ height: '42px' }}>
          2025 春季學習馬拉松
        </StyledText>
        <StyledFooter>
          <StyledFlex>
            <StyledStatus>{isPublic ? "公開" : "不公開"}</StyledStatus>
            <IconButton size="small" onClick={handleMenu}>
              <MoreVertOutlinedIcon />
            </IconButton>
          </StyledFlex>
        </StyledFooter>
      </StyledContainer>
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
        <StyledMenuItem onClick={handleClickDetail}>
          檢視學習計畫
        </StyledMenuItem>
        <StyledMenuItem onClick={handleClickEdit}>
          編輯學習計畫
        </StyledMenuItem>
      </Menu>

    </StyledGroupCard>
  );
};