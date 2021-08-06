import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../../shared/components/Header';
import Footer from '../../../shared/components/footer';
import PageContainer from '../../../shared/containers/Page';
import Navigation from '../../../shared/components/navigation';
import { loadNotionPage } from '../../../redux/actions/category';
import Content from '../../../components/learn/Content';

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

const LearingPage = ({ router, SEOConfig }) => {
  const dispatch = useDispatch();

  const { page } = useSelector((state) => state.category);
  const { query } = router;
  const { name, intro, link } = page;
  useEffect(() => {
    if (router.isReady) {
      dispatch(loadNotionPage(query.pageId));
    }
  }, [query]);
  return (
    <BodyWrapper>
      <Header config={SEOConfig} />
      <Navigation />
      <PageContainer>
        <Content
          title={name}
          intro={intro}
          link={link}
        />
      </PageContainer>
      <Footer text="Tomorrow will be fine. 島島阿學 © 2021." />
    </BodyWrapper>
  );
};

export default LearingPage;
