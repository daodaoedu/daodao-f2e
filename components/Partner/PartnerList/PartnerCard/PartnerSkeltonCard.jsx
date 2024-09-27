import { Fragment } from 'react';
import { Grid, Box } from '@mui/material';
import PartnerSkelton from './PartnerSkelton';

const PartnerSkeltonCard = ({ number, mobileScreen }) => {
  const array = new Uint32Array(1);
  return new Array(number).fill(0).map((_, idx) => (
    <Fragment
      key={`partnerSkeltonCard-${Math.floor(crypto.getRandomValues(array)[0])}`}
    >
      <Grid item md={6} mb={mobileScreen && '12px'} width="100%">
        <PartnerSkelton />
      </Grid>

      {!mobileScreen && (idx + 1) % 2 === 0 && idx + 1 !== number && (
        <Grid item xs={12} py="12px">
          <Box height={1} width="100%" border="1px solid #E5E5E5" />
        </Grid>
      )}
    </Fragment>
  ));
};

export default PartnerSkeltonCard;
