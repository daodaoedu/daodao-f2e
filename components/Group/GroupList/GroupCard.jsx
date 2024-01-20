import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import Image from '@/shared/components/Image';
import emptyCoverImg from '@/public/assets/empty-cover.png';
import { timeDuration } from '@/utils/date';
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
  return (
    <StyledGroupCard>
      <Image alt={photoAlt || '未放封面'} src={photoURL || emptyCoverImg.src} />
      <StyledContainer>
        <StyledTitle>{title}</StyledTitle>
        <StyledInfo>
          <StyledText>
            <StyledLabel>學習領域</StyledLabel>
            <span>{category.join('、')}</span>
          </StyledText>
          <StyledText>
            <StyledLabel>適合階段</StyledLabel>
            <span>{partnerEducationStep || '皆可'}</span>
          </StyledText>
        </StyledInfo>
        <StyledText lineClamp="2" fontSize="14px">
          {description}
        </StyledText>
        <StyledAreas>
          <LocationOnOutlinedIcon fontSize="16px" sx={{ color: '#536166' }} />
          <StyledText color="#92989A">{area}</StyledText>
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
