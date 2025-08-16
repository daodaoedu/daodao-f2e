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
        <Skeleton className="w-full h-[122px] rounded" />
      </StyledImageWrapper>
      <StyledContainer>
        <StyledTitle>
          <Skeleton className="w-[60%] h-4" />
        </StyledTitle>
        <StyledText lineClamp="2" style={{ minHeight: '32px' }}>
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-[50%] h-4" />
        </StyledText>
        <StyledAreas>
          <MapPin size={16} color="#536166" />
          <StyledText>
            <Skeleton className="w-[42px] h-4" />
          </StyledText>
        </StyledAreas>
        <StyledFooter>
          <StyledTime>
            <Skeleton className="w-[52px] h-4" />
          </StyledTime>
          <StyledFlex>
            <Skeleton className="w-[68px] h-6 rounded" />
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
