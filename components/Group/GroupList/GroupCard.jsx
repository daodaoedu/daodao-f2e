import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import Image from '@/shared/components/Image';
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
}) {
  return (
    <StyledGroupCard>
      <Image alt={photoAlt} src={photoURL} />
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
          <div>揪團中</div>
        </StyledFooter>
      </StyledContainer>
    </StyledGroupCard>
  );
}

export default GroupCard;
