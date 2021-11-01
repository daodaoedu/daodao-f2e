import React, { useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { useDispatch, useSelector } from "react-redux";
import Footer from "../../shared/components/footer";
import PageContainer from "../../shared/containers/Page";
import Navigation from "../../shared/components/navigation";
import About from "../../components/category/About";
import { CATEGORY_ID } from "../../constants/category";
import { loadNotionTable } from "../../redux/actions/category";
import Header from "../../shared/components/Header";

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

const SearchPage = ({ router, SEOConfig }) => {
  const dispatch = useDispatch();
  const { isLoading, category } = useSelector((state) => state.category);
  const { query, route } = router;

  const currentCategory = useMemo(() => query.category, [query]);

  const onSearch = useCallback(
    (name) => {
      const queryString = name ? `?tags=${name}` : "";
      router.push(`${route}${queryString}`);
    },
    [query]
  );

  useEffect(() => {
    if (router.isReady) {
      dispatch(loadNotionTable(CATEGORY_ID[currentCategory], query));
    }
  }, [query]);

  return (
    <BodyWrapper>
      <Header config={SEOConfig} />
      <Navigation />
      <PageContainer>
        <About
          categoryType={currentCategory}
          cardList={category}
          isLoading={isLoading}
          onSearch={onSearch}
        />
      </PageContainer>
      <Footer text="Tomorrow will be fine. 島島阿學 © 2021." />
    </BodyWrapper>
  );
};

export default SearchPage;
