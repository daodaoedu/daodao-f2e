/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import MenuButton from './MenuButton';
import MenuList from './MenuList';
// import { GiHamburgerMenu } from 'react-icons/gi';

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
  @media (max-width: 767px) {
    /* flex-direction: column; */
  }
`;

const LogoWrapper = styled.div`
  margin: 0 15px;
  cursor: pointer;
  z-index: 100;
  & > img {
    width: 100px;
  }
`;

const LinkListWrapper = styled.ul`
  display: flex;
  justify-content: space-around;
  position: relative;
  /* max-width: 500px; */
  li {
    margin: 10px 15px;
  }
  @media (max-width: 767px) {
    display: none;
  }
`;

const MobileLinkListWrapper = styled.ul`
  /* display: none; */
  @media (max-width: 767px) {
    position: relative;
    ul {
      display: none; 
      box-shadow: 0 0 5px rgba(0,0,0, .7); 
      position: absolute; 
      top:0;
    }

    li {
      flex: none; 
      width: 100%;
      border-bottom: solid 1px #777;
    } 

    svg[type="menu"]:checked + ul{
      display: block;
      width: 100%;
      background: #999;          
    }

    label {
      display: block;
    }  

    svg[type="menu"]:checked + ul li:nth-child(1){
      background: #777; 
      color: #fff;
    }  
  }
`;

const AddResourceWrapper = styled.p`
    color: rgba(255,255,255,0.7);
    @media (max-width: 767px) {
      display: none;
    }
`;

const GroupWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MainNav = ({ linkList }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
          <MobileLinkListWrapper>
            <MenuList
              open={isMenuOpen}
              list={linkList}
            />
            <MenuButton
              open={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              color="white"
            />
          </MobileLinkListWrapper>
        </GroupWrapper>
      </FixWrapper>
    </MainNavWrapper>
  );
};

export default MainNav;
