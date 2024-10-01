import { Skeleton } from '@mui/material';
import {
  StyledContainer,
  StyledFooter,
  StyledGroupCard,
  StyledInfo,
  StyledText,
} from './GroupCard.styled';

function SkeletonGroupCard({ _id }) {
  return (
    <StyledGroupCard href={`/group/detail?id=${_id}`}>
      <Skeleton variant="rounded" width="100%" height={122} animation="wave" />
      <StyledContainer>
        <Skeleton
          variant="text"
          width="100%"
          fontSize="14px"
          animation="wave"
        />
        <StyledInfo>
          <StyledText>
            <Skeleton
              variant="text"
              width="60%"
              fontSize="64px"
              animation="wave"
            />
          </StyledText>
          <StyledText>
            <Skeleton
              variant="text"
              width="52.8%"
              fontSize="12px"
              animation="wave"
            />
          </StyledText>
        </StyledInfo>
        <StyledText lineClamp="2" fontSize="14px" style={{ minHeight: '28px' }}>
          <Skeleton
            variant="text"
            fontSize="12px"
            width="100%"
            animation="wave"
          />
          <Skeleton
            variant="text"
            fontSize="12px"
            width="100%"
            animation="wave"
          />
        </StyledText>
        <StyledFooter>
          <Skeleton
            sx={{
              height: '32px',
              width: '52.8%',
              marginLeft: 'auto',
            }}
            variant="text"
            fontSize="12px"
            width="27.2%"
            animation="wave"
          />
        </StyledFooter>
      </StyledContainer>
    </StyledGroupCard>
  );
}

export default SkeletonGroupCard;
