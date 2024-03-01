import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
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
} from './GroupCard.styled';

function LoadingCard() {
  return (
    <StyledGroupCard href="#">
      <Skeleton variant="rounded" width={240} height={122} animation="wave" />
      <StyledContainer>
        <StyledTitle>
          <Skeleton width="60%" animation="wave" />
        </StyledTitle>
        <StyledText lineClamp="2" style={{ minHeight: '32px' }}>
          <Skeleton animation="wave" />
          <Skeleton width="50%" animation="wave" />
        </StyledText>
        <StyledAreas>
          <LocationOnOutlinedIcon fontSize="16px" sx={{ color: '#536166' }} />
          <StyledText>
            <Skeleton width={42} animation="wave" />
          </StyledText>
        </StyledAreas>
        <StyledFooter>
          <StyledTime>
            <Skeleton width={52} animation="wave" />
          </StyledTime>
          <StyledFlex>
            <Skeleton
              variant="rounded"
              width={68}
              height={34}
              animation="wave"
            />
            <IconButton size="small" disabled>
              <MoreVertOutlinedIcon />
            </IconButton>
          </StyledFlex>
        </StyledFooter>
      </StyledContainer>
    </StyledGroupCard>
  );
}

export default LoadingCard;
