import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import Image from '@/shared/components/Image';
import emptyCoverImg from '@/public/assets/empty-cover.png';
import {
  StyledAreas,
  StyledContainer,
  StyledFooter,
  StyledGroupCard,
  StyledInfo,
  StyledLabel,
  StyledText,
  StyledTitle,
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
            <span>{partnerEducationStep}</span>
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
          <time>2天前更新</time>
          {isGrouping ? (
            <div>揪團中</div>
          ) : (
            <div className="finished">已結束</div>
          )}
        </StyledFooter>
      </StyledContainer>
    </StyledGroupCard>
  );
}

export default GroupCard;
