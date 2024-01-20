import dayjs from 'dayjs';
import styled from '@emotion/styled';
import bachelorCapSvg from '@/public/assets/icons/bachelorCap.svg';
import categorySvg from '@/public/assets/icons/category.svg';
import clockSvg from '@/public/assets/icons/clock.svg';
import locationSvg from '@/public/assets/icons/location.svg';
import personSvg from '@/public/assets/icons/person.svg';

const StyledItem = styled.div`
  padding: 7px 0;
  display: flex;

  h3 {
    display: flex;
    align-items: center;
    flex: 0 0 140px;
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
`;

const labels = [
  {
    key: 'category',
    icon: categorySvg.src,
    text: '學習領域',
    format: (v) => (Array.isArray(v) ? v.join('、') : v),
  },
  { key: 'area', icon: locationSvg.src, text: '地點' },
  {
    key: 'time',
    icon: clockSvg.src,
    text: '時間',
    format: (v) => dayjs(v).format('YYYY/MM/DD'),
  },
  { key: 'partnerStyle', icon: personSvg.src, text: '想找的夥伴' },
  {
    key: 'partnerEducationStep',
    icon: bachelorCapSvg.src,
    text: '適合的教育階段',
  },
];

function TeamInfoCard({ data }) {
  return (
    <div style={{ margin: '-7px 0' }}>
      {labels.map(
        ({ key, icon, text, format }) =>
          data[key] && (
            <StyledItem key={key}>
              <h3>
                <img src={icon} alt={`${text} icon`} />
                {text}
              </h3>
              <p>
                {typeof format === 'function' ? format(data[key]) : data[key]}
              </p>
            </StyledItem>
          ),
      )}
    </div>
  );
}

export default TeamInfoCard;
