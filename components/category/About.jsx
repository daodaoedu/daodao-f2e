import React from 'react';
import styled from '@emotion/styled';
import TagList from '../../shared/components/TagList';
import CardList from './CardList';

const AboutWrapper = styled.div`
  margin: 0 auto;
  width: 90%;
  padding: 10px;
`;

const MainAboutWrapper = styled.div`
  margin-left: 20px;
`;

const About = ({
  tagList, cardList, isLoading, length, onSearch,
}) => {
  return (
    <AboutWrapper>
      <MainAboutWrapper>
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
      </MainAboutWrapper>
      <CardList
        list={cardList}
        isLoading={isLoading}
      />
    </AboutWrapper>
  );
};

export default About;
