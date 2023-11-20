import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllPartners } from '../../../redux/actions/partners';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Grid, Box } from '@mui/material';
import PartnerCard from './PartnerCard';
import mockData from './mock-data';

function PartnerList() {
  const partners = useSelector((state) => state.partners);
  const dispatch = useDispatch();

  // TODO: ADD PAGE
  const handleFetchData = () => {
    dispatch(fetchAllPartners());
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const lists = partners.items || [];
  // const lists = mockData;
  const mobileScreen = useMediaQuery('(max-width: 767px)');

  return (
    <Grid
      container
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {lists.map((item, idx) => (
        <>
          <Grid item md={6} width="100%" mb={mobileScreen && '12px'}>
            <PartnerCard
              key={`${item.id}-${item.name}`}
              id={item.id}
              image={item.photoURL}
              date={item.date}
              name={item.name}
              subTitle={item.subTitle}
              share={item.share}
              roleList={item.roleList}
              tagList={item.tagList}
              wantToDoList={item.wantToDoList}
              location={item.location}
            />
          </Grid>
          {!mobileScreen && (idx + 1) % 2 == 0 && idx + 1 !== lists.length && (
            <Grid item xs={12} py={'12px'}>
              <Box height={1} width={'100%'} border={'1px solid #E5E5E5'} />
            </Grid>
          )}
        </>
      ))}
    </Grid>
  );
}

export default PartnerList;
