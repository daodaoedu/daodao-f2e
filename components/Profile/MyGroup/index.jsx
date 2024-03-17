import { Fragment, useState } from 'react';
import styled from '@emotion/styled';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { GROUP_API_URL } from '@/redux/actions/group';
import useFetch from '@/hooks/useFetch';
import GroupCard from './GroupCard';
import LoadingCard from './LoadingCard';
import { StyledDivider } from './GroupCard.styled';

const StyledGroupsWrapper = styled.div`
  background-color: #ffffff;
  max-width: 672px;
  border-radius: 16px;
  padding: 36px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (max-width: 767px) {
    padding: 16px 20px;
  }

  ${(props) => props.sx}
`;

const MyGroup = ({ hasTitle = true, sx }) => {
  const [response, setResponse] = useState(null);
  const me = useSelector((state) => state.user);
  const { isFetching } = useFetch(`${GROUP_API_URL}/user/${me?._id}`, {
    onSuccess: setResponse,
  });

  const getTargetIndexById = (data, id) => {
    if (!Array.isArray(data)) return -1;
    const targetIndex = data.findIndex((item) => item?._id === id);
    if (!(targetIndex > -1)) return -1;
    return targetIndex;
  };

  const handleUpdateGrouping = (id) => {
    setResponse((pre) => {
      const targetIndex = getTargetIndexById(pre.data, id);
      if (!(targetIndex > -1)) return pre;
      const target = pre.data[targetIndex];
      const updatedTarget = { ...target, isGrouping: !target.isGrouping };

      return {
        ...pre,
        data: [
          ...pre.data.slice(0, targetIndex),
          updatedTarget,
          ...pre.data.slice(targetIndex + 1),
        ],
      };
    });
  };

  const handleDeleteGroup = (id) => {
    setResponse((pre) => {
      const targetIndex = getTargetIndexById(pre.data, id);
      if (!(targetIndex > -1)) return pre;

      return {
        ...pre,
        data: [
          ...pre.data.slice(0, targetIndex),
          ...pre.data.slice(targetIndex + 1),
        ],
      };
    });
  };

  return (
    <StyledGroupsWrapper sx={sx}>
      {hasTitle && (
        <Typography
          sx={{ fontSize: '22px', color: '#536166', fontWeight: 700, mb: 1 }}
        >
          我的揪團
        </Typography>
      )}

      <Box maxWidth="560px" width="100%">
        {isFetching ? (
          <LoadingCard />
        ) : Array.isArray(response?.data) && response.data.length ? (
          response.data.map((item, index) => (
            <Fragment key={item._id}>
              {index > 0 && <StyledDivider />}
              <GroupCard
                {...item}
                onUpdateGrouping={() => handleUpdateGrouping(item._id)}
                onDeleteGroup={() => handleDeleteGroup(item._id)}
              />
            </Fragment>
          ))
        ) : (
          <Typography py={7.5}>趕快發起屬於你的揪團吧～</Typography>
        )}
      </Box>
    </StyledGroupsWrapper>
  );
};

export default MyGroup;
