import { Fragment } from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { GROUP_API_URL } from '@/redux/actions/group';
import useFetch from '@/hooks/useFetch';
import GroupCard from './GroupCard';
import LoadingCard from './LoadingCard';
import { StyledDivider } from './GroupCard.styled';

const MyGroup = () => {
  const { data, isFetching, refetch } = useFetch(
    `${GROUP_API_URL}/user/${'65a7e0300604d7c3f4641bf9'}`,
  );

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        width: '672px',
        borderRadius: '16px',
        padding: '36px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography sx={{ fontSize: '22px', color: '#536166', fontWeight: 700 }}>
        我的揪團
      </Typography>
      <Box width="560px">
        {isFetching ? (
          <LoadingCard />
        ) : (
          Array.isArray(data?.data) &&
          data.data.map((item, index) => (
            <Fragment key={item._id}>
              {index > 0 && <StyledDivider />}
              <GroupCard {...item} refetch={refetch} />
            </Fragment>
          ))
        )}
      </Box>
    </Box>
  );
};

export default MyGroup;
