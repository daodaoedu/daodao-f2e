import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import BodyWrapper from "../styles/PageBody";
import Footer from "../components/footer";
import PageContainer from "./Page";
import Navigation from "../components/navigation";
import About from "../../components/category/About";
import { SEARCH_TAGS, CATEGORY_ID } from "../../constants/category";
import Header from "../components/Header";
import { loadNotionTable } from "../../redux/actions/category";

const HumPage = ({ router, SEOConfig }) => {
  const dispatch = useDispatch();
  const { loading, category } = useSelector((state) => state.category);
  const { query, route } = router;
  const isLoading = loading?.category;

  const onSearch = useCallback(
    (name) => {
      const queryString = name ? `?tags=${name}` : "";
      router.push(`${route}${queryString}`);
    },
    [query]
  );

  useEffect(() => {
    if (router.isReady) {
      dispatch(loadNotionTable(CATEGORY_ID.businv, query));
    }
  }, [query]);

  return (
    <BodyWrapper>
      <Header config={SEOConfig} />
      <Navigation />
      <PageContainer>
        <About
          tagList={SEARCH_TAGS.businv}
          cardList={category}
          isLoading={isLoading}
          length={category.length}
          onSearch={onSearch}
        />
      </PageContainer>
      <Footer text="Tomorrow will be fine. 島島阿學 © 2021." />
    </BodyWrapper>
  );
};

export default HumPage;
