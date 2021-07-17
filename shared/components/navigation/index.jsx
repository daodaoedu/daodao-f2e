import styled from '@emotion/styled';
import Link from 'next/link';

const NavigationWrapper = styled.nav`
  height: 100px;
  background-color: #16b9b3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 100px;
  padding-right: 10px;
`;

const LogoWrapper = styled.div`
  width: 127.5px;
  margin: 0 10px;
  cursor: pointer;
  & > img {
    width: 100%;
  }
`;

const LinkListWrapper = styled.ul`
  display: flex;
  justify-content: space-around;
  a {
    color: rgba(255,255,255,0.7);
    text-decoration: none;
  }
  li {
    margin: 10px;
  }
`;

const DescWrapper = styled.p`
    color: rgba(255,255,255,0.7);
`;

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

const Navigation = () => {
  return (
    <NavigationWrapper>
      <Link href="/">
        <LogoWrapper>
          <img src="/logo.png" alt="daodao" />
        </LogoWrapper>
      </Link>
      <DescWrapper>
        學習資源平台 – Daodao Online Learning Platform
      </DescWrapper>
      <LinkListWrapper>
        {linkList.map((link) => <li key={link.title}><Link href={link.link}>{link.title}</Link></li>)}
      </LinkListWrapper>
    </NavigationWrapper>
  );
};

export default Navigation;
