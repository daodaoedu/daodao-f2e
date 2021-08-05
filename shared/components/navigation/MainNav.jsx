import styled from '@emotion/styled';
import Link from 'next/link';

const MainNavWrapper = styled.div`
  height: 80px;
  background-color: #16b9b3;
`;

const FixWrapper = styled.div`
  width: 80%;
  height: 100%;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogoWrapper = styled.div`
  margin: 0 15px;
  cursor: pointer;
  & > img {
    width: 100px;
  }
`;

const LinkListWrapper = styled.ul`
  display: flex;
  justify-content: space-around;
  max-width: 500px;
  li {
    margin: 10px 15px;
  }
`;

const AddResourceWrapper = styled.p`
    color: rgba(255,255,255,0.7);
`;

const GroupWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MainNav = ({ linkList }) => {
  return (
    <MainNavWrapper>
      <FixWrapper>
        <GroupWrapper>
          <Link href="/">
            <LogoWrapper>
              <img src="/logo.png" alt="daodao" />
            </LogoWrapper>
          </Link>
          <LinkListWrapper>
            {linkList.map((link) => <li key={link.title}><Link href={link.link}>{link.title}</Link></li>)}
          </LinkListWrapper>
        </GroupWrapper>
        <GroupWrapper>
          <AddResourceWrapper>
            <Link href="/">新增資源</Link>
          </AddResourceWrapper>
        </GroupWrapper>
      </FixWrapper>
    </MainNavWrapper>
  );
};

export default MainNav;
