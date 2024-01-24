import styled from '@emotion/styled';
import Avatar from '@mui/material/Avatar';
import locationSvg from '@/public/assets/icons/location.svg';
import Chip from '@/shared/components/Chip';
import { timeDuration } from '@/utils/date';

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
`;

const StyledTag = styled.div`
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 400;
  background: #f3f3f3;
  color: #293a3d;
`;

const StyledTags = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;

  > div {
    margin: 0;
  }
`;

const StyledTime = styled.time`
  display: block;
  text-align: right;
  font-size: 12px;
  color: #92989a;
`;

function OrganizerCard({ data = {} }) {
  return (
    <>
      <StyledFlex>
        <StyledFlex style={{ gap: 12 }}>
          <Avatar src={data?.user?.photoURL} alt={`${data?.user?.name} avatar`} />
          <div>
            <StyledFlex style={{ gap: 10 }}>
              <StyledText>{data?.user?.name}</StyledText>
              <StyledTag>{data?.user?.educationStage}</StyledTag>
            </StyledFlex>
            <StyledText style={{ color: '#92989A' }}>{data?.user?.roleList}</StyledText>
          </div>
        </StyledFlex>
        <StyledText style={{ alignSelf: 'flex-start', gap: 1 }}>
          <img src={locationSvg.src} alt="location icon" />
          {data?.user?.location}
        </StyledText>
      </StyledFlex>
      <StyledText style={{ margin: '20px 0' }}>
        {data?.description}
      </StyledText>
      <StyledTags>
        {Array.isArray(data?.tagList) && data.tagList.map(tag => (
          <Chip key={tag} value={tag} isActive />
        ))}
      </StyledTags>
      <StyledTime>{timeDuration(data?.updatedDate)}</StyledTime>
    </>
  );
}

export default OrganizerCard;
