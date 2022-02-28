import React from "react";
import styled from "@emotion/styled";
import PageContainer from "../shared/containers/Page";
import Footer from "../shared/components/Footer_v2";
import Navigatin from "../shared/components/Navigation_v2";

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

const NotExistPage = () => {
  return (
    <BodyWrapper>
      <Navigatin />
      <PageContainer>
        <p>近期網站改版，可能有部分頁面無法使用</p>
        <p>可以參觀其他地方唷～</p>
      </PageContainer>
      <Footer />
    </BodyWrapper>
  );
};

export default NotExistPage;
