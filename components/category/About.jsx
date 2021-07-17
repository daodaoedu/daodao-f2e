import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import TagList from '../../shared/components/TagList';
import CardList from './CardList';

const AboutWrapper = styled.div`
`;

const About = ({
  tagList, cardList, isLoading, length,
}) => {
  const router = useRouter();
  const { route } = router;

  const onSearch = useCallback((name) => {
    router.push(`${route}?tags=${name}`);
  }, [route]);

  return (
    <AboutWrapper>
      <h1>數學與邏輯</h1>
      <p>這個分類下的所有標籤：</p>
      <TagList
        list={tagList}
        onSearch={onSearch}
      />
      <p>
        搜尋結果
        {' '}
        {isLoading ? '-' : length}
        {' '}
        筆：
      </p>
      <CardList
        list={cardList}
        loading={isLoading}
      />
    </AboutWrapper>
  );
};

export default About;
