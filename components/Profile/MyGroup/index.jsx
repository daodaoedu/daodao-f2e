import { Fragment } from 'react';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { GROUP_API_URL } from '@/redux/actions/group';
import useFetch from '@/hooks/useFetch';
import GroupCard from './GroupCard';
import LoadingCard from './LoadingCard';
import { StyledDivider } from './GroupCard.styled';

const MyGroup = () => {
  const me = useSelector((state) => state.user);
  const { data, isFetching, refetch } = useFetch(
    `${GROUP_API_URL}/user/${me?._id}`,
  );

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        maxWidth: '672px',
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
      <Box maxWidth="560px">
        {isFetching ? (
          <LoadingCard />
        ) : Array.isArray(data?.data) && data.data.length ? (
          data.data.map((item, index) => (
            <Fragment key={item._id}>
              {index > 0 && <StyledDivider />}
              <GroupCard {...item} refetch={refetch} />
            </Fragment>
          ))
        ) : (
          <Typography py={7.5}>趕快發起屬於你的揪團吧～</Typography>
        )}
      </Box>
    </Box>
  );
};

export default MyGroup;
