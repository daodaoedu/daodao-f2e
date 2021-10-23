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
  margin-left: 20px;
`;

const About = ({ categoryType, cardList, isLoading, length, onSearch }) => {
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
          <>
            <p>這個分類下的所有標籤：</p>
            <TagList list={tagList} onSearch={onSearch} />
            <p>
              搜尋結果
              {isLoading ? "-" : length}
              筆：
            </p>
          </>
        )}
      </MainAboutWrapper>
      <CardList list={cardList} isLoading={isLoading} />
    </AboutWrapper>
  );
};

export default About;
