import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import { MapPin, EllipsisVertical } from 'lucide-react';
import {
  StyledAreas,
  StyledContainer,
  StyledFooter,
  StyledGroupCard,
  StyledText,
  StyledTitle,
  StyledTime,
  StyledFlex,
  StyledImageWrapper,
} from './GroupCard.styled';

function LoadingCard() {
  return (
    <StyledGroupCard href="#">
      <StyledImageWrapper>
        <Skeleton
          variant="rounded"
          width="100%"
          height={122}
          animation="wave"
        />
      </StyledImageWrapper>
      <StyledContainer>
        <StyledTitle>
          <Skeleton width="60%" animation="wave" />
        </StyledTitle>
        <StyledText lineClamp="2" style={{ minHeight: '32px' }}>
          <Skeleton animation="wave" />
          <Skeleton width="50%" animation="wave" />
        </StyledText>
        <StyledAreas>
          <MapPin size={16} color="#536166" />
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
              height={24}
              animation="wave"
            />
            <IconButton size="small" disabled>
              <EllipsisVertical />
            </IconButton>
          </StyledFlex>
        </StyledFooter>
      </StyledContainer>
    </StyledGroupCard>
  );
}

export default LoadingCard;
