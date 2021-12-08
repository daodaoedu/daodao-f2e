import React from "react";
// import styled from "@emotion/styled";
import PageContainer from "../../../../shared/containers/Page";
import About from "../../../../components/Category/About";

const Content = ({ currentCategory, category, isLoading }) => {
  return (
    <PageContainer>
      <About
        categoryType={currentCategory}
        cardList={category}
        isLoading={isLoading}
      />
    </PageContainer>
  );
};

export default Content;
