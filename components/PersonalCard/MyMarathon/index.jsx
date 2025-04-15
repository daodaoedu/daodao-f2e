import { useAuth } from '@/contexts/Auth';
import { useMarathonByUserEvent } from '@/services/modules/marathons';

import {
  Typography,
  Grid
} from '@mui/material';

import {
  StyledGroupsWrapper,
} from "./MarathonCard.styled";
import MarathonCard from './MarathonCard';

const MyMarathon = ({ title, sx }) => {
  const { token } = useAuth();
  const { data: marathons } = useMarathonByUserEvent(token);

  return (
    <StyledGroupsWrapper sx={sx}>
      {title && (
        <Typography
          sx={{ fontSize: '22px', color: '#536166', fontWeight: 700, mb: 3 }}
        >
          {title}
        </Typography>
      )}
      <Grid container spacing={1} rowGap={2}>
        {Array.isArray(marathons) && (
          marathons.map((marathon) => (
            <Grid key={marathon._id} item sx={{ width: '100%' }}>
              <MarathonCard
                marathon={marathon}
              />
            </Grid>
          ))
        )}
      </Grid>
    </StyledGroupsWrapper>
  );
};

export default MyMarathon;
