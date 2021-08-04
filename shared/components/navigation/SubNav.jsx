import styled from '@emotion/styled';
import Link from 'next/link';

const MainNavWrapper = styled.nav`
  height: 60px;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 100px;
  padding-right: 10px;
  color: #222222;
  overflow-x: scroll;
  overflow-y: hidden;
`;

const NavTagWrapper = styled.div`
    background-color: #F0F0F0;
    border-radius: 20px;
    padding: 10px 15px;
    margin: auto 10px;
    cursor: pointer;
`;

const SubNav = ({ list }) => {
  return (
    <MainNavWrapper>
      {
        list.map((cat) => (
          <Link key={cat.title} href={cat.link}>
            <NavTagWrapper>
              {cat.title}
            </NavTagWrapper>
          </Link>
        ))
    }
    </MainNavWrapper>
  );
};

export default SubNav;
