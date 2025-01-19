import Link from 'next/link';
import styled from '@emotion/styled';
import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';
import { EDUCATION, ROLE } from '@/constants/member';
import locationSvg from '@/public/assets/icons/location.svg';
import Chip from '@/shared/components/Chip';
import MarkdownEditor from '@/shared/components/MarkdownEditor';

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: start;
  }
`;

export const StyledTitle = styled.h2`
  font-weight: bold;
  font-size: 22px;
  line-height: 140%;
  color: #536166;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
`;

const StyledFlex = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledText = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: #536166;
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledTag = styled.div`
  line-height: 1;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 400;
  background: #f3f3f3;
  color: #293a3d;
`;

const StyledTags = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;

  @media (max-width: 480px) {
    margin-top: 0;
    margin-bottom: 10px;
  }

  > div {
    margin: 0;
  }
`;

function OrganizerCard({ data = {}, isLoading }) {
  const educationStage =
    EDUCATION.find(({ key }) => key === data?.user?.educationStage)
      ?.label || '暫無資料';
  const role =
    ROLE.find(({ key }) => data?.user?.roleList?.includes(key))?.label ||
    '暫無資料';
  const location =
    data?.user?.location === 'tw'
      ? '台灣'
      : data?.user?.location.replace('台灣', '').split('@').join(' ');

  return (
    <>
      <StyledHeader>
        <Link href={`/partner/detail?id=${data?.userId}`}>
          <StyledFlex style={{ marginBottom: '10px', gap: 12 }}>
            <Avatar
              src={data?.user?.photoURL}
              alt={`${data?.user?.name} avatar`}
            />
            <div>
              <StyledFlex style={{ gap: 10 }}>
                <StyledText>
                  {isLoading ? (
                    <Skeleton width={80} animation="wave" />
                  ) : (
                    data?.user?.name
                  )}
                </StyledText>
                <StyledTag>
                  {isLoading ? (
                    <Skeleton width={80} animation="wave" />
                  ) : (
                    educationStage
                  )}
                </StyledTag>
              </StyledFlex>
              <StyledText style={{ color: '#92989A' }}>
                {isLoading ? <Skeleton width={88} animation="wave" /> : role}
              </StyledText>
            </div>
          </StyledFlex>
        </Link>
        <StyledText style={{ alignSelf: 'flex-start', gap: 1 }}>
          <img src={locationSvg.src} alt="location icon" />
          {isLoading ? <Skeleton width={48} animation="wave" /> : location}
        </StyledText>
      </StyledHeader>
      <StyledTitle style={{ alignSelf: 'flex-start', gap: 1 }}>
        揪團內容與進行方式
      </StyledTitle>
      <StyledText style={{ margin: '10px 0' }}>
        {isLoading ? (
          <div style={{ width: '100%' }}>
            <Skeleton width="60%" animation="wave" />
            <Skeleton width="75%" animation="wave" />
            <Skeleton width="40%" animation="wave" />
          </div>
        ) : (
          <MarkdownEditor readOnly value={data?.content} />
        )}
      </StyledText>
      <StyledTags>
        {Array.isArray(data?.tagList) &&
          data.tagList.map((tag) => <Chip key={tag} value={tag} isActive />)}
      </StyledTags>
    </>
  );
}

export default OrganizerCard;
