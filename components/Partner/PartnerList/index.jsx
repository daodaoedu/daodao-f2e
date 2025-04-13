import { Fragment } from 'react';
import { useRouter } from 'next/router';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Grid, Box } from '@mui/material';
import PartnerCard from './PartnerCard';
import PartnerSkeltonCard from './PartnerCard/PartnerSkeltonCard';

function PartnerList({ items }) {
  const router = useRouter();

  const partners = Array.isArray(items) ? items : [];
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
      {partners.length === 0 ? (
        <PartnerSkeltonCard
          number={mobileScreen ? 2 : 4}
          mobileScreen={mobileScreen}
        />
      ) : (
        <>
          {partners.map((item, idx) => (
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
              {!mobileScreen &&
                (idx + 1) % 2 === 0 &&
                idx + 1 !== partners.length && (
                  <Grid item xs={12} py="12px">
                    <Box height={1} width="100%" border="1px solid #E5E5E5" />
                  </Grid>
                )}
            </Fragment>
          ))}
        </>
      )}
    </Grid>
  );
}

export default PartnerList;
