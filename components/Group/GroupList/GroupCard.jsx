import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import Image from '@/shared/components/Image';
import { timeDuration } from '@/utils/date';
import emptyCoverWithBackgroundImg from '@/public/assets/empty-cover-with-background.png';
import {
  StyledAreas,
  StyledContainer,
  StyledFooter,
  StyledGroupCard,
  StyledInfo,
  StyledLabel,
  StyledText,
  StyledTitle,
  StyledStatus,
} from './GroupCard.styled';

function GroupCard({
  _id,
  photoURL,
  photoAlt,
  title = '未定義主題',
  category = [],
  partnerEducationStep,
  description,
  area,
  isGrouping,
  updatedDate,
}) {
  const formatToString = (data, defaultValue = '') =>
    Array.isArray(data) && data.length ? data.join('、') : data || defaultValue;

  return (
    <StyledGroupCard href={`/group/detail?id=${_id}`}>
      <Image
        alt={photoAlt || '未放封面'}
        src={photoURL || emptyCoverWithBackgroundImg.src}
      />
      <StyledContainer>
        <StyledTitle>{title}</StyledTitle>
        <StyledInfo>
          <StyledText>
            <StyledLabel>學習領域</StyledLabel>
            <span>{formatToString(category, '不拘')}</span>
          </StyledText>
          <StyledText>
            <StyledLabel>適合階段</StyledLabel>
            <span>{formatToString(partnerEducationStep, '皆可')}</span>
          </StyledText>
        </StyledInfo>
        <StyledText lineClamp="2" fontSize="14px" style={{ minHeight: '28px' }}>
          {description}
        </StyledText>
        <StyledAreas>
          <LocationOnOutlinedIcon fontSize="16px" sx={{ color: '#536166' }} />
          <StyledText color="#92989A">
            {formatToString(area, '待討論')}
          </StyledText>
        </StyledAreas>
        <StyledFooter>
          <time>{timeDuration(updatedDate)}</time>
          {isGrouping ? (
            <StyledStatus>揪團中</StyledStatus>
          ) : (
            <StyledStatus className="finished">已結束</StyledStatus>
          )}
        </StyledFooter>
      </StyledContainer>
    </StyledGroupCard>
  );
}

export default GroupCard;
