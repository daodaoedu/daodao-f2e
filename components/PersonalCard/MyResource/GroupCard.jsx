import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MapPin, EllipsisVertical } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useAuth } from '@/contexts/Auth';
import emptyCoverImg from '@/public/assets/empty-cover.png';
import useMutation from '@/hooks/useMutation';
import { timeDuration } from '@/utils/date';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
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
  _id,
  photoURL,
  photoAlt,
  title = '未定義主題',
  content,
  area,
  isGrouping,
  userId,
  updatedDate,
  onUpdateGrouping,
  onDeleteGroup,
}) {
  const { user } = useAuth();
  const router = useRouter();

  const isEnabledMutation = user?._id === userId;

  const apiUpdateGrouping = useMutation(`/circles/${_id}`, {
    method: 'PUT',
    enabled: isEnabledMutation,
    onSuccess: onUpdateGrouping,
  });

  const apiDeleteGroup = useMutation(`/circles/${_id}`, {
    method: 'DELETE',
    enabled: isEnabledMutation,
    onSuccess: onDeleteGroup,
  });

  const handleGrouping = () => {
    apiUpdateGrouping.mutate({ isGrouping: !isGrouping });
  };

  const handleDeleteGroup = () => {
    apiDeleteGroup.mutate();
  };

  const formatToString = (data, defaultValue = '') => (Array.isArray(data) && data.length ? data.join('、') : data || defaultValue);

  return (
    <>
      <StyledGroupCard href={`/circles/${_id}`}>
        <StyledImageWrapper>
          <div className="relative w-full h-full">
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
              {isGrouping ? (
                <StyledStatus>揪團中</StyledStatus>
              ) : (
                <StyledStatus className="finished">已結束</StyledStatus>
              )}
              {isEnabledMutation && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <EllipsisVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => router.push(`/circles/${_id}/edit`)}>
                      編輯
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleGrouping}>
                      {isGrouping ? '結束揪團' : '開放揪團'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeleteGroup}>
                      刪除
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
