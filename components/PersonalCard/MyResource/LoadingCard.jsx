import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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
            <Button size="sm" disabled>
              <EllipsisVertical />
            </Button>
          </StyledFlex>
        </StyledFooter>
      </StyledContainer>
    </StyledGroupCard>
  );
}

export default LoadingCard;
