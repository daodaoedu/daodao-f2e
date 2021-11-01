import React, { useMemo } from "react";
import styled from "@emotion/styled";
import TagList from "../../shared/components/TagList";
import CardList from "./CardList";
import { SEARCH_TAGS, CATEGORY_NAME } from "../../constants/category";

const AboutWrapper = styled.div`
  margin: 0 auto;
  width: 90%;
  padding: 10px;
`;

const MainAboutWrapper = styled.div`
  h1 {
    font-size: 24px;
    font-weight: 500;
  }
`;

const TagsWrapper = styled.div`
  margin: 20px auto;
`;

const About = ({ categoryType, cardList, isLoading, onSearch }) => {
  const tagList = useMemo(() => SEARCH_TAGS[categoryType], [categoryType]);
  const categoryTitle = useMemo(
    () => CATEGORY_NAME[categoryType],
    [categoryType]
  );
  console.log("tagList ", tagList);
  return (
    <AboutWrapper>
      <MainAboutWrapper>
        <h1>{categoryTitle}</h1>
        {Array.isArray(tagList) && tagList.length > 0 && (
          <TagsWrapper>
            <p>這個分類下的所有標籤：</p>
            <TagList list={tagList} onSearch={onSearch} />
          </TagsWrapper>
        )}
      </MainAboutWrapper>
      <p>
        搜尋結果
        {isLoading ? "-" : cardList.length}
        筆：
      </p>
      <CardList list={cardList} isLoading={isLoading} />
    </AboutWrapper>
  );
};

export default About;
