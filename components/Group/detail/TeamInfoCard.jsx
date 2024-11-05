import styled from '@emotion/styled';
import Skeleton from '@mui/material/Skeleton';
import bachelorCapSvg from '@/public/assets/icons/bachelorCap.svg';
import activityCategorySvg from '@/public/assets/icons/activityCategory.svg';
import categorySvg from '@/public/assets/icons/category.svg';
import clockSvg from '@/public/assets/icons/clock.svg';
import locationSvg from '@/public/assets/icons/location.svg';
import personSvg from '@/public/assets/icons/person.svg';
import outcomeSvg from '@/public/assets/icons/outcome_icon.svg';
import motivationSvg from '@/public/assets/icons/motivation_icon.svg';

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

const format = (value) =>
  Array.isArray(value) ? value.filter(Boolean).join('、') : value;

const labels = [
  {
    key: 'category',
    icon: categorySvg.src,
    text: '學習領域',
  },
  {
    key: 'activityCategory',
    icon: activityCategorySvg.src,
    text: '揪團類型',
  },
  {
    key: 'area',
    icon: locationSvg.src,
    text: '地點',
  },
  { key: 'time', icon: clockSvg.src, text: '時間' },
  { key: 'participator', icon: personSvg.src, text: '徵求人數' },
  { key: 'partnerStyle', icon: personSvg.src, text: '想找的夥伴' },
  {
    key: 'partnerEducationStep',
    icon: bachelorCapSvg.src,
    text: '適合的教育階段',
  },
  {
    key: 'motivation',
    icon: motivationSvg.src,
    text: '揪團動機',
  },
  {
    key: 'outcome',
    icon: outcomeSvg.src,
    text: '期待成果',
  },
];

function TeamInfoCard({ data = {}, isLoading }) {
  return labels.map(
    ({ key, icon, text }) =>
      data[key] && (
        <StyledItem key={key}>
          <h3>
            <img src={icon} alt={`${text} icon`} />
            {text}
          </h3>
          <p>{isLoading ? <Skeleton animation="wave" /> : format(data[key])}</p>
        </StyledItem>
      ),
  );
}

export default TeamInfoCard;
