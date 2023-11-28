import { Box, Typography, Skeleton } from '@mui/material';

import {
  StyledCard,
  StyledCardContainer,
  StyledImage,
  StyledCardTitle,
  StyledCardLabel,
  StyledCardSubtitle,
  StyledTypoCaption,
  StyledTagContainer,
  StyledTagText,
  StyledTypoEllipsis,
  FlexSBAlignCenter,
  FlexAlignCenter,
  FlexColCenterSB,
} from './PartnerCard.styled';

import { WANT_TO_DO_WITH_PARTNER } from '../../../../constants/member';

import { mapToTable } from '../../../../utils/helper';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

const WANT_TO_DO_WITH_PARTNER_TABLE = mapToTable(WANT_TO_DO_WITH_PARTNER);

// component
const PartnerAvator = ({ image }) => {
  return image ? (
    <StyledImage src={image} alt="avatar" effect="opacity" />
  ) : (
    <Skeleton
      sx={{
        height: '50px',
        width: '50px',
        background: 'rgba(240, 240, 240, .8)',
        marginTop: '4px',
      }}
      variant="circular"
      animation="wave"
    />
  );
};
const DescriptSection = ({ title, content, ...rest }) => {
  return (
    <StyledTypoEllipsis {...rest}>
      <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
        {title}
      </Typography>
      <Typography mx="5px" sx={{ color: '#536166', fontWeight: 400 }}>
        |
      </Typography>
      <Typography sx={{ color: '#536166', fontWeight: 400 }}>
        {content || '尚未填寫'}
      </Typography>
    </StyledTypoEllipsis>
  );
};
const TagSection = ({ tagList = [] }) => {
  const showItems = tagList.slice(0, 5);
  const hideItems = tagList.slice(5);
  return (
    <StyledTagContainer container gap={'8px'} mb={'12px'}>
      {showItems.map((tag, idx) => (
        <StyledTagText item key={idx + tag} fontWeight={'400'}>
          {tag}
        </StyledTagText>
      ))}
      {hideItems.length > 0 && (
        <StyledTagText fontWeight={'bold'}>{hideItems.length}</StyledTagText>
      )}
    </StyledTagContainer>
  );
};

function PartnerCard({ image, name, share, tagList = [], wantToDoList = [] }) {
  const wantTodo = wantToDoList
    .map((item) => WANT_TO_DO_WITH_PARTNER_TABLE[item])
    .join('、');

  return (
    <StyledCard>
      {/* TODO: href redirect */}
      <StyledCardContainer>
        <FlexAlignCenter mb="8px">
          <PartnerAvator image={image} />
          <FlexColCenterSB ml="12px">
            <FlexAlignCenter>
              <StyledCardTitle>{name}</StyledCardTitle>
              <StyledCardLabel>國中</StyledCardLabel>
            </FlexAlignCenter>
            <StyledCardSubtitle>實驗教育老師</StyledCardSubtitle>
          </FlexColCenterSB>
        </FlexAlignCenter>
        <Box mb="20px">
          <DescriptSection mb="2px" title="可分享" content={share} />
          <DescriptSection title="想一起" content={wantTodo} />
        </Box>
        <TagSection tagList={tagList} />
        <FlexSBAlignCenter mt="12px">
          <StyledTypoCaption>
            <FlexAlignCenter>
              <LocationOnOutlinedIcon sx={{ marginRight: '10px' }} />
              台北市松山區
            </FlexAlignCenter>
          </StyledTypoCaption>
          <StyledTypoCaption fontWeight={300}>兩天前更新</StyledTypoCaption>
        </FlexSBAlignCenter>
      </StyledCardContainer>
    </StyledCard>
  );
}

export default PartnerCard;
