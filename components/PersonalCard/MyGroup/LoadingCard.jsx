import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
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
        <Skeleton className="h-[122px] w-full rounded" />
      </StyledImageWrapper>
      <StyledContainer>
        <StyledTitle>
          <Skeleton className="h-4 w-[60%]" />
        </StyledTitle>
        <StyledText lineClamp="2" style={{ minHeight: '32px' }}>
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-4 w-[50%]" />
        </StyledText>
        <StyledAreas>
          <MapPin size={16} color="#536166" />
          <StyledText>
            <Skeleton className="h-4 w-[42px]" />
          </StyledText>
        </StyledAreas>
        <StyledFooter>
          <StyledTime>
            <Skeleton className="h-4 w-[52px]" />
          </StyledTime>
          <StyledFlex>
            <Skeleton className="h-6 w-[68px] rounded" />
            <Button variant="ghost" size="sm" disabled>
              <EllipsisVertical />
            </Button>
          </StyledFlex>
        </StyledFooter>
      </StyledContainer>
    </StyledGroupCard>
  );
}

export default LoadingCard;
