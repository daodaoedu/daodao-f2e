import React from 'react';
import { Title, Text } from '@/components/ui/typography';

const ActivitiesResource = () => (
  <div>
    <div className="my-5">
      <Title
        as="h2"
        size="lg"
        className="mt-10 mb-2.5"
      >
        二、島島活動消息
      </Title>
      <Text>
        島島活動消息以學習相關活動為主，期盼整合「具有學習意義、提倡以學習者為中心、不違反人權、不包含血腥及暴力」等活動、課程、計畫、競賽、提案。
      </Text>
    </div>
    <div className="mt-10 mb-5">
      {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
      <iframe
        src="https://docs.google.com/forms/d/e/1FAIpQLSeMg55q91VIdvNOmqqkzhqJGCKG4106YM0cVidzX6wHS9AJIA/viewform?embedded=true"
        width="100%"
        height="2600"
        frameBorder="0"
        marginHeight="0"
        marginWidth="0"
      >
        載入中 . . .
      </iframe>
    </div>
  </div>
);

export default ActivitiesResource;
