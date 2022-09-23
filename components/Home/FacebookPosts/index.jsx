import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import { useSelector, useDispatch } from 'react-redux';
import CardList from './CardList';
import {
  getFacebookFansPagePost,
  getFacebookGroupPost,
} from '../../../redux/actions/shared';

const GuideWrapper = styled.div`
  width: 90%;
  /* height: calc(var(--section-height) + var(--section-height-offset)); */
  margin: 0 auto;
  padding-top: 80px;
  padding-bottom: 80px;
  .guide-title {
    color: #536166;
    font-weight: bold;
    font-size: 36px;
    line-height: 50px;
    letter-spacing: 0.08em;
  }

  @media (max-width: 767px) {
    padding-top: 40px;
    padding-bottom: 20px;
  }
`;

const Guide = () => {
  const dispatch = useDispatch();
  const {
    groupPosts,
    fanpagesPosts,
    isLoadingFanpagesPosts,
    isLoadingGroupPosts,
  } = useSelector((state) => state?.shared);

  useEffect(() => {
    dispatch(getFacebookFansPagePost(7));
    dispatch(getFacebookGroupPost(7));
  }, [dispatch]);

  return (
    <GuideWrapper>
      <h2 className="guide-title">最新貼文</h2>
      <Box sx={{ marginTop: '20px' }}>
        <CardList
          title="📌 粉絲專頁"
          list={fanpagesPosts}
          isLoading={isLoadingFanpagesPosts}
          direction="left"
        />
      </Box>
      <Box sx={{ marginTop: '20px' }}>
        <CardList
          title="📌 社群貼文"
          list={groupPosts}
          isLoading={isLoadingGroupPosts}
          direction="right"
        />
      </Box>
    </GuideWrapper>
  );
};

export default Guide;
