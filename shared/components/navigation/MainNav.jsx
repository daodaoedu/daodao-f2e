import styled from '@emotion/styled';
import Link from 'next/link';

const MainNavWrapper = styled.nav`
  height: 80px;
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

const TitleWrapper = styled.p`
    color: rgba(255,255,255,0.7);
`;

const MainNav = ({ linkList }) => {
  return (
    <MainNavWrapper>
      <Link href="/">
        <LogoWrapper>
          <img src="/logo.png" alt="daodao" />
        </LogoWrapper>
      </Link>
      <TitleWrapper>
        學習資源平台 – Daodao Online Learning Platform
      </TitleWrapper>
      <LinkListWrapper>
        {linkList.map((link) => <li key={link.title}><Link href={link.link}>{link.title}</Link></li>)}
      </LinkListWrapper>
    </MainNavWrapper>
  );
};

export default MainNav;
