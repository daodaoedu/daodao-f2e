import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import CardList from './CardList';
import ImageCardList from './ImageCardList';
import StoryCardList from './StoryCardList';

import {
  getFacebookFansPagePost,
  getFacebookGroupPost,
  getInstagramPost,
  getInstagramStory,
} from '../../../redux/actions/shared';

const GuideWrapper = styled.div`
  width: 90%;
  /* height: calc(var(--section-height) + var(--section-height-offset)); */
  margin: 0 auto;
  padding-top: 40px;
  padding-bottom: 40px;
  .guide-title {
    color: #536166;
    font-weight: bold;
    font-size: 26px;
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
    // fanpagesPosts,
    instagramPosts,
    instagramStories,
    // isLoadingFanpagesPosts,
    isLoadingGroupPosts,
    isLoadingInstagramPosts,
    isLoadingInstagramStories,
  } = useSelector(({ shared }) => {
    return {
      groupPosts: shared?.groupPosts,
      // fanpagesPosts: shared?.fanpagesPosts,
      instagramPosts: shared?.instagramPosts.filter(
        (item) => item?.media_type === 'IMAGE',
      ),
      instagramStories: shared?.instagramStories,
      // isLoadingFanpagesPosts: shared?.isLoadingFanpagesPosts,
      isLoadingGroupPosts: shared?.isLoadingGroupPosts,
      isLoadingInstagramPosts: shared?.isLoadingInstagramPosts,
      isLoadingInstagramStories: shared?.isLoadingInstagramStories,
    };
  }, shallowEqual);

  useEffect(() => {
    // dispatch(getFacebookFansPagePost(7));
    dispatch(getFacebookGroupPost(7));
    dispatch(getInstagramPost());
    dispatch(getInstagramStory());
  }, [dispatch]);

  return (
    <GuideWrapper>
      <h2 className="guide-title">最新貼文</h2>
      <StoryCardList
        title="🧸 Instagram 限時動態"
        list={instagramStories}
        isLoading={isLoadingInstagramStories}
        direction="left"
      />
      <ImageCardList
        title="🧸 Instagram 近期貼文"
        list={instagramPosts}
        isLoading={isLoadingInstagramPosts}
        direction="right"
      />
      <CardList
        title="📌 FaceBook 社團貼文"
        list={groupPosts}
        isLoading={isLoadingGroupPosts}
        direction="left"
      />
    </GuideWrapper>
  );
};

export default Guide;
