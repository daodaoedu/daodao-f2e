import { Box } from '@mui/material';
import {
  WANT_TO_DO_WITH_PARTNER,
  ROLE,
  EDUCATION_STEP,
} from '@/constants/member';
import moment from 'moment';
import { mapToTable } from '@/utils/helper';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PartnerCardAvator from './PartnerCardAvator';
import PartnerCardDescription from './PartnerCardDescription';
import PartnerCardTag from './PartnerCardTag';

import {
  StyledCard,
  StyledCardContainer,
  StyledCardTitle,
  StyledCardLabel,
  StyledCardSubtitle,
  StyledTypoCaption,
  FlexSBAlignCenter,
  FlexAlignCenter,
  FlexColCenterSB,
} from './PartnerCard.styled';

const WANT_TO_DO_WITH_PARTNER_TABLE = mapToTable(WANT_TO_DO_WITH_PARTNER);
const ROLELIST = mapToTable(ROLE);
const EDUCATION_STEP_TABLE = mapToTable(EDUCATION_STEP);

function PartnerCard({
  image,
  name,
  share,
  tagList = [],
  wantToDoList = [],
  roleList = [],
  location,
  educationStage,
  updatedDate,
}) {
  const wantTodo = wantToDoList
    .map((item) => WANT_TO_DO_WITH_PARTNER_TABLE[item])
    .join('、');

  const role = roleList.length > 0 && ROLELIST[roleList[0]];
  const edu = educationStage && EDUCATION_STEP_TABLE[educationStage];

  return (
    <StyledCard>
      <StyledCardContainer>
        <FlexAlignCenter mb="8px">
          <PartnerCardAvator image={image} />
          <FlexColCenterSB ml="12px">
            <FlexAlignCenter>
              <StyledCardTitle>{name}</StyledCardTitle>
              {edu && <StyledCardLabel>{edu}</StyledCardLabel>}
            </FlexAlignCenter>
            {role && <StyledCardSubtitle>{role}</StyledCardSubtitle>}
          </FlexColCenterSB>
        </FlexAlignCenter>
        <Box mb="20px">
          <PartnerCardDescription mb="2px" title="可分享" content={share} />
          <PartnerCardDescription title="想一起" content={wantTodo} />
        </Box>
        <PartnerCardTag tagList={tagList} />
        <FlexSBAlignCenter mt="12px">
          <StyledTypoCaption>
            <FlexAlignCenter>
              {location && (
                <>
                  <LocationOnOutlinedIcon sx={{ marginRight: '10px' }} />
                  {location}
                </>
              )}
            </FlexAlignCenter>
          </StyledTypoCaption>
          <StyledTypoCaption fontWeight={300}>
            {updatedDate
              ? moment(updatedDate).fromNow()
              : moment(new Date() - 500 * 60 * 60).fromNow()}
          </StyledTypoCaption>
        </FlexSBAlignCenter>
      </StyledCardContainer>
    </StyledCard>
  );
}

export default PartnerCard;
