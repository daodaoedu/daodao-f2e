import { Typography } from '@mui/material';
import { StyledTypoEllipsis } from './PartnerCard.styled';

const PartnerCardDescription = ({ title, content, ...rest }) => {
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

export default PartnerCardDescription;
