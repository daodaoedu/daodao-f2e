import styled from '@emotion/styled';
import Skeleton from '@mui/material/Skeleton';
import BachelorCapSvg from '@/public/assets/icons/bachelorCap.svg';
import ActivityCategorySvg from '@/public/assets/icons/activityCategory.svg';
import CategorySvg from '@/public/assets/icons/category.svg';
import ClockSvg from '@/public/assets/icons/clock.svg';
import LocationSvg from '@/public/assets/icons/location.svg';
import PersonSvg from '@/public/assets/icons/person.svg';
import OutcomeSvg from '@/public/assets/icons/outcome_icon.svg';
import MotivationSvg from '@/public/assets/icons/motivation_icon.svg';
import { CATEGORIES, ACTIVITY_CATEGORIES } from '@/constants/category';
import { EDUCATION } from '@/constants/member';
import { mapToTable } from '@/utils/helper';
import { AREAS, ONLINE_OPTION, TBD_OPTION } from '@/constants/areas';

const ACTIVITY_CATEGORY_TABLE = mapToTable(ACTIVITY_CATEGORIES);
const CATEGORY_TABLE = mapToTable(CATEGORIES);
const EDU_TABLE = mapToTable(EDUCATION);
const AREA_TABLE = mapToTable(AREAS.concat(TBD_OPTION, ONLINE_OPTION));

const StyledItem = styled.div`
  padding: 7px 0;
  display: flex;

  @media (max-width: 480px) {
    padding: 12px 0;
    flex-direction: column;
  }

  h3 {
    display: flex;
    padding-bottom: 5px;
    align-items: center;
    min-width: 140px;
    font-size: 14px;
    font-weight: 500;
    color: #293a3d;
    gap: 5px;
  }

  p {
    flex: 1;
    font-size: 14px;
    font-weight: 400;
    color: #536166;
  }

  & + & {
    border-top: 1px solid #f3f3f3;
  }

  &:first-of-type {
    padding-top: 0;
  }

  &:last-of-type {
    padding-bottom: 0;
  }
`;

const format = (value, mapping = {}) =>
  Array.isArray(value)
    ? value
      .filter(Boolean)
      .map((item) => mapping[item] ?? item)
      .join('、')
    : mapping[value] ?? value;

const labels = [
  {
    key: 'category',
    Icon: CategorySvg,
    text: '學習領域',
    mapping: CATEGORY_TABLE,
  },
  {
    key: 'activityCategory',
    Icon: ActivityCategorySvg,
    text: '揪團類型',
    mapping: ACTIVITY_CATEGORY_TABLE,
  },
  {
    key: 'area',
    Icon: LocationSvg,
    text: '地點',
    mapping: AREA_TABLE,
  },
  { key: 'time', Icon: ClockSvg, text: '時間' },
  { key: 'participator', Icon: PersonSvg, text: '徵求人數' },
  { key: 'partnerStyle', Icon: PersonSvg, text: '想找的夥伴' },
  {
    key: 'partnerEducationStep',
    Icon: BachelorCapSvg,
    text: '適合的教育階段',
    mapping: EDU_TABLE,
  },
  {
    key: 'motivation',
    Icon: MotivationSvg,
    text: '揪團動機',
  },
  {
    key: 'outcome',
    Icon: OutcomeSvg,
    text: '期待成果',
  },
];

function TeamInfoCard({ data = {}, isLoading }) {
  return labels.map(
    ({ key, Icon, text, mapping }) =>
      data[key] && (
        <StyledItem key={key}>
          <h3>
            <Icon />
            {text}
          </h3>
          <p>{isLoading ? <Skeleton animation="wave" /> : format(data[key], mapping)}</p>
        </StyledItem>
      ),
  );
}

export default TeamInfoCard;
