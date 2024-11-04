import styled from '@emotion/styled';
import Skeleton from '@mui/material/Skeleton';
import { timeDuration } from '@/utils/date';
import TextWithLinks from '@/shared/components/TextWithLinks';

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

const StyledText = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: #536166;
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledTime = styled.time`
  display: flex;
  justify-content: flex-end;
  font-size: 12px;
  color: #92989a;
`;

function NoticeCard({ data = {}, isLoading }) {
  return (
    <>
      <StyledTitle>
        {isLoading ? (
          <div style={{ width: '100%' }}>
            <Skeleton width="60%" animation="wave" />
          </div>
        ) : (
          '注意事項'
        )}
      </StyledTitle>
      <StyledText style={{ margin: '10px 0' }}>
        {isLoading ? (
          <div style={{ width: '100%' }}>
            <Skeleton width="60%" animation="wave" />
          </div>
        ) : (
          <div>
            <TextWithLinks>{data?.notice}</TextWithLinks>
          </div>
        )}
      </StyledText>
      <StyledTime>
        {isLoading ? (
          <Skeleton width={36} animation="wave" />
        ) : (
          timeDuration(data?.updatedDate)
        )}
      </StyledTime>
    </>
  );
}

export default NoticeCard;
