import React from "react";
import styled from "@emotion/styled";
import { SWRConfig } from "swr";
import Footer from "../../../shared/components/Footer";
import logger from "../../../utils/logger";
import Content from './Content';

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

// export const getStaticPaths = async () => {
//   const paths = Object.keys(CATEGORY_NAME).map((name) => ({ params: { category: name } }));
//   return {
//     props: {
//       isDev: process.env.NODE_ENV === "development",
//       paths,
//       fallback: true,
//     },
//   };
// };

// export async function getStaticProps() {
//   return {
//     props: {
//       paths: [],
//       fallback: true,
//     },
//   };
// }

const CategoryPage = ({ isDev, fallback }) => {
  // const router = useRouter();
  // const dispatch = useDispatch();
  // const { isLoading, category } = useSelector((state) => state.category);
  // const currentCategory = useMemo(() => router.query.category, [router.query]);
  // useEffect(() => {
  //   if (router.isReady) {
  //     dispatch(loadNotionTable(CATEGORY_ID[currentCategory], router.query));
  //   }
  // }, [router.query]);

  // const SEOData = useMemo(() => ({
  //   title: '島島阿學 - 學習資源平台 - Daodao Online Learning Platform',
  //   description: '「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
  //   keywords: '島島阿學',
  //   author: '島島阿學',
  //   copyright: '島島阿學',
  //   imgLink: '/preview.webp',
  //   link: `https://test-page.notion.dev.daoedu.tw${router.asPath}`,
  // }), [router]);

  return (
    <BodyWrapper>
      {/* <SEOConfig config={SEOData} /> */}
      {/* <Navigation /> */}
      <SWRConfig value={{ fallback, use: isDev ? [logger] : [] }}>
        <Content />
      </SWRConfig>
      <Footer text="Tomorrow will be fine. 島島阿學 © 2021." />
    </BodyWrapper>
  );
};

export default CategoryPage;
