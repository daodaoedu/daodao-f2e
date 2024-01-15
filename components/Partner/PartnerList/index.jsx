import { Fragment } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Grid, Box } from '@mui/material';
import PartnerCard from './PartnerCard';

function PartnerList() {
  const router = useRouter();

  const partners = useSelector((state) => state.partners);

  const lists = partners.items || [];
  const mobileScreen = useMediaQuery('(max-width: 900px)');

  return (
    <Grid
      container
      columnSpacing={2}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {lists.map((item, idx) => (
        <Fragment key={`${item._id}`}>
          <Grid
            onClick={() => router.push(`partner/detail?id=${item._id}`)}
            item
            width="100%"
            md={6}
            mb={mobileScreen && '12px'}
          >
            <PartnerCard
              image={item.photoURL}
              date={item.date}
              name={item.name}
              educationStage={item.educationStage}
              share={item.share}
              roleList={item.roleList}
              tagList={item.tagList}
              wantToDoList={item.wantToDoList}
              location={item.location}
              updatedDate={item.updatedDate}
            />
          </Grid>
          {!mobileScreen && (idx + 1) % 2 === 0 && idx + 1 !== lists.length && (
            <Grid item xs={12} py="12px">
              <Box height={1} width="100%" border="1px solid #E5E5E5" />
            </Grid>
          )}
        </Fragment>
      ))}
    </Grid>
  );
}

export default PartnerList;
