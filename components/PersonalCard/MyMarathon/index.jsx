import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserByToken
} from '@/redux/actions/user';

import {
  Typography,
  Grid
} from '@mui/material';

import {
  StyledGroupsWrapper,
} from "./MarathonCard.styled";
import MarathonCard from './MarathonCard';

const MyMarathon = ({ title, sx }) => {
  const reduxDispatch = useDispatch();
  const userState = useSelector((state) => { return state.user; });
  const [marathons, setMarathons] = useState([]);
  const { apiState } = userState;

  useEffect(() => {
    if (userState.token) {
      setMarathons(userState.marathons);
      reduxDispatch(fetchUserByToken(userState.token));
    }
  }, []);

  useEffect(() => {
    if (userState.marathons.length) {
      setMarathons(userState.marathons);
    }
  }, [userState]);

  useEffect(() => {
    if (userState.apiState === 'Resolve' && userState.marathons.length) {
      setMarathons(userState.marathons);
    }
  }, [apiState]);

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
        {marathons.length > 0 && (
            marathons.map((marathon) => {
              return (
                <Grid item sx={{ width: '100%' }}>
                  <MarathonCard
                    key={marathon._id}
                    marathon={marathon}
                  />
                </Grid>
              );
            })
          )
        }
      </Grid>
    </StyledGroupsWrapper>
  );
};

export default MyMarathon;
