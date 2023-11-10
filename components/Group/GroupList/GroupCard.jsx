import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import Image from '@/shared/components/Image';
import { StyledGroupCard, StyledLabel, StyledText } from './GroupCard.styled';

function GroupItem({
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
      <div className="main">
        <h2>{title}</h2>
        <div>
          <div className="flex">
            <StyledLabel>學習領域</StyledLabel>
            <StyledText>|</StyledText>
            <StyledText>{category.join('、')}</StyledText>
          </div>
          <div className="flex">
            <StyledLabel>適合階段</StyledLabel>
            <StyledText>|</StyledText>
            <StyledText>{partnerEducationStep}</StyledText>
          </div>
        </div>
        <StyledText lineClamp="2" fontSize="14px">
          {description}
        </StyledText>
        <div className="areas">
          <LocationOnOutlinedIcon fontSize="16px" sx={{ color: '#536166' }} />
          <StyledText color="#92989A">{area}</StyledText>
        </div>
        <footer>
          <time>2天前更新</time>
          <div>揪團中</div>
        </footer>
      </div>
    </StyledGroupCard>
  );
}

export default GroupItem;
