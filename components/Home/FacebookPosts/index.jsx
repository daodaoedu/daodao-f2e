import React from 'react';
import {
  useMetaInstagramPost,
  useMetaInstagramStory,
} from '@/services/metaPosts';

import ImageCardList from './ImageCardList';
import StoryCardList from './StoryCardList';

const Guide = () => {
  const { data: instagramPosts = [], isLoading: isLoadingInstagramPosts } = useMetaInstagramPost();
  const { data: instagramStories = [], isLoading: isLoadingInstagramStories } = useMetaInstagramStory();

  return (
    <div className="w-[90%] mx-auto pt-10 pb-10 max-md:pt-10 max-md:pb-5">
      <h2 className="text-[#536166] font-bold text-[26px] leading-[50px] tracking-[0.08em]">最新貼文</h2>
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
    </div>
  );
};

export default Guide;
