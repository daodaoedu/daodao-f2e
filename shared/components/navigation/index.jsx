import styled from '@emotion/styled';
// import Link from 'next/link';
import MainNav from './MainNav';
import SubNav from './SubNav';

const NavigationWrapper = styled.nav`
  /* height: 100px;
  background-color: #16b9b3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 100px;
  padding-right: 10px; */
`;

// 舊版
const linkList = [
  {
    title: '新增資源',
    link: '/',
  },
  {
    title: '島島學習資源',
    link: '/',
  },
  {
    title: '島島學習社群',
    link: '/',
  },
  {
    title: '島島活動消息',
    link: '/',
  },
  {
    title: '島島教育場域',
    link: '/',
  },
  {
    title: '關於我們',
    link: '/',
  },
];

const CATEGORY_LINK = [
  {
    title: '語言與文學',
    link: '/category/learn/langlit',
    image: '/assets/images/cat1.jpeg',
  },
  {
    title: '數學與邏輯',
    link: '/category/learn/mathlog',
    image: '/assets/images/cat2.jpeg',
  },
  {
    title: '電腦科學',
    link: '/category/learn/infoeng',
    image: '/assets/images/cat3.jpeg',
  },
  {
    title: '自然科學',
    link: '/category/learn/natusci',
    image: '/assets/images/cat4.jpeg',
  },
  {
    title: '人文社會',
    link: '/category/learn/hum',
    image: '/assets/images/cat5.jpeg',
  },
  {
    title: '藝術',
    link: '/category/learn/art',
    image: '/assets/images/cat6.jpeg',
  },
  {
    title: '教育',
    link: '/category/learn/edu',
    image: '/assets/images/cat7.jpeg',
  },
  {
    title: '生活',
    link: '/category/learn/life',
    image: '/assets/images/cat8.jpeg',
  },
  {
    title: '運動/心理/醫學',
    link: '/category/learn/health',
    image: '/assets/images/cat9.jpeg',
  },
  {
    title: '商業與社會創新',
    link: '/category/learn/businv',
    image: '/assets/images/cat10.jpeg',
  },
  {
    title: '綜合型學習資源',
    link: '/category/learn/multi-res',
    image: '/assets/images/cat11.jpeg',
  },
];

const Navigation = () => {
  return (
    <NavigationWrapper>
      <MainNav linkList={linkList} />
      <SubNav list={CATEGORY_LINK} />
    </NavigationWrapper>
  );
};

export default Navigation;
