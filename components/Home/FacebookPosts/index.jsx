import React from 'react';
import styled from '@emotion/styled';
import {
  useMetaInstagramPost,
  useMetaInstagramStory,
} from '@/services/modules/metaPosts';

import ImageCardList from './ImageCardList';
import StoryCardList from './StoryCardList';

const GuideWrapper = styled.div`
  width: 90%;
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
  const { data: instagramPosts = [], isLoading: isLoadingInstagramPosts } = useMetaInstagramPost();
  const { data: instagramStories = [], isLoading: isLoadingInstagramStories } = useMetaInstagramStory();

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
    </GuideWrapper>
  );
};

export default Guide;
