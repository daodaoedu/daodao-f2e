import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { MapPin, EllipsisVertical } from 'lucide-react';
import { Image } from '@/shared/ui/image';
import { useAuth } from '@/contexts/Auth';
import emptyCoverImg from '@/public/assets/images/empty-cover.png';
import { timeDuration } from '@/utils/date';
import { MarkdownEditor } from '@/shared/ui/markdown-editor';
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
  StyledImageWrapper,
} from './GroupCard.styled';

function GroupCard({
  id,
  photoURL,
  photoAlt,
  title = '未定義主題',
  content,
  area,
  isGrouping,
  userId,
  updatedDate,
}) {
  const { user } = useAuth();

  const handleGrouping = () => {
    // apiUpdateGrouping.mutate({ isGrouping: !isGrouping });
  };

  const handleDeleteGroup = () => {
    // apiDeleteGroup.mutate();
  };

  const formatToString = (data, defaultValue = '') => (Array.isArray(data) && data.length ? data.join('、') : data || defaultValue);

  return (
    <>
      <StyledGroupCard href={`/circles/${id}`}>
        <StyledImageWrapper>
          <div className="relative h-full w-full">
            <Image
              alt={photoAlt || '未放封面'}
              src={photoURL || emptyCoverImg.src}
              fill
              className="object-cover"
            />
          </div>
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
            <MapPin size={16} color="#536166" />
            <StyledText>{formatToString(area, '待討論')}</StyledText>
          </StyledAreas>
          <StyledFooter>
            <StyledTime>{timeDuration(updatedDate)}</StyledTime>
            <StyledFlex>
              {!!user && user?.id === userId && (
                <StyledStatus isGrouping={isGrouping} onClick={handleGrouping}>
                  {isGrouping ? '進行中' : '暫停中'}
                </StyledStatus>
              )}
              {user?.id === userId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <EllipsisVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleGrouping}>
                      {isGrouping ? '暫停進行' : '開始進行'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeleteGroup}>
                      刪除揪團
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </StyledFlex>
          </StyledFooter>
        </StyledContainer>
      </StyledGroupCard>
    </>
  );
}

export default GroupCard;
