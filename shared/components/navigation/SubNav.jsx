import styled from '@emotion/styled';
import Link from 'next/link';

const MainNavWrapper = styled.div`
  height: 60px;
  background-color: #ffffff;
  color: #222222;
`;

const TagListWrapper = styled.div`
  width: 70%;
  height: 100%;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow-x: scroll;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar:horizontal {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparentize(#ccc, 0.8);
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: transparentize(#ccc, 0.6);
    box-shadow: inset 0 0 6px rgba(0,0,0,0.6); 
  }
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
      <TagListWrapper>
        {
        list.map((cat) => (
          <Link key={cat.title} href={cat.link}>
            <NavTagWrapper>
              {cat.title}
            </NavTagWrapper>
          </Link>
        ))
    }
      </TagListWrapper>
    </MainNavWrapper>
  );
};

export default SubNav;
