import React, { useState, useMemo } from 'react';
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
  /* width: 80%; */
  max-width: 1200px;
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
    height: 50px;
  }
`;

const LinkListWrapper = styled.ul`
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: relative;
  /* max-width: 500px; */
  li {
    margin: 10px 15px;
    cursor: pointer;
  }
  @media (max-width: 767px) {
    display: none;
  }
`;

const MobileLinkListWrapper = styled.ul`
  display: none;
  @media (max-width: 767px) {
    display: block;
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
      border-bottom: solid 1px white;
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

const UserStatusWrapper = styled.div`
    color: rgba(255,255,255,0.7);
    .login, .logout {
      cursor: pointer;
    }
    .icon {
      width: 32px;
      border-radius: 50%;
    }

    .coin-field {
      display: flex;
      align-items: center;
      span {
        margin: 10px;
      }
    }

    @media (max-width: 767px) {
      display: none;
    }
`;

const GroupWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MainNav = ({
  linkList, onLogin, onLogout// , userData,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const avatar = useMemo(() => userData.avatar, [userData]);
  // const isUserLogin = useMemo(() => userData.googleId, [userData]);
  const avatar = '';
  const isUserLogin = false;
  return (
    <MainNavWrapper>
      <FixWrapper>
        <GroupWrapper>
          <Link href="/">
            <LogoWrapper>
              <img src="/logo.png" alt="logo" />
            </LogoWrapper>
          </Link>
          <LinkListWrapper>
            {linkList.map(({ name, link }) => <li key={name}><a href={link} target="_blank" rel="noopener noreferrer">{name}</a></li>)}
          </LinkListWrapper>
        </GroupWrapper>
        <GroupWrapper>
          <UserStatusWrapper>
            <LinkListWrapper>
              <li>
                <p className="login" role="presentation">新增資源</p>
              </li>
            </LinkListWrapper>
            {/* {
              isUserLogin
                ? (
                  <LinkListWrapper>
                    <li>
                      <p className="logout" onClick={onLogout} onKeyPress={onLogout} role="presentation">登出</p>
                    </li>
                    <li>
                      <img className="icon" src={avatar} alt="avatar" />
                    </li>
                    <li className="coin-field">
                      <img className="icon" src="/coin.png" alt="coin" />
                      <span>0</span>
                    </li>
                  </LinkListWrapper>
                )
                : (
                  <LinkListWrapper>
                    <li>
                      <p className="login" onClick={onLogin} onKeyPress={onLogin} role="presentation">登入</p>
                    </li>
                  </LinkListWrapper>
                )
            } */}
          </UserStatusWrapper>
          <MobileLinkListWrapper>
            <MenuList
              isUserLogin={isUserLogin}
              // onLogin={onLogin}
              // onLogout={onLogout}
              avatar={avatar}
              open={isMenuOpen}
              onClick={() => setIsMenuOpen(false)}
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
