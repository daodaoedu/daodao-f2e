import React from "react";
import styled from "@emotion/styled";
import PageContainer from "../shared/containers/Page";
import Navigation from "../shared/components/navigation";
import Footer from "../shared/components/footer";
import Header from "../shared/components/Header";
import CardList from "../components/home/CardList";
import Banner from "../components/home/Banner";
import { CATEGORY_LINK } from "../constants/category";

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

const Home = ({ SEOConfig }) => {
  return (
    <BodyWrapper>
      <Header config={SEOConfig} />
      <Navigation />
      <PageContainer>
        <Banner />
        <CardList list={CATEGORY_LINK} />
      </PageContainer>
      <Footer />
    </BodyWrapper>
  );
};

export default Home;
