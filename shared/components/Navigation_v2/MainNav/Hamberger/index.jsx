import React, { useState } from "react";
import styled from "@emotion/styled";
import MenuButton from "../MenuButton";
import MenuList from "../MenuList";
import { NAV_LINK_MOBILE } from "../../../../../constants/category";

const MobileLinkListWrapper = styled.ul`
  display: none;
  @media (max-width: 767px) {
    display: block;
    position: relative;
    ul {
      display: none;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
      position: absolute;
      top: 0;
    }

    li {
      flex: none;
      width: 100%;
      border-bottom: solid 1px white;
    }

    svg[type="menu"]:checked + ul {
      display: block;
      width: 100%;
      background: #999;
    }

    label {
      display: block;
    }

    svg[type="menu"]:checked + ul li:nth-of-type(1) {
      background: #777;
      color: #fff;
    }
  }
`;

const MainNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const avatar = "";
  const isUserLogin = false;
  return (
    <MobileLinkListWrapper>
      <MenuList
        isUserLogin={isUserLogin}
        avatar={avatar}
        open={isMenuOpen}
        onClick={() => setIsMenuOpen(false)}
        list={NAV_LINK_MOBILE}
      />
      <MenuButton
        open={isMenuOpen}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        color="white"
      />
    </MobileLinkListWrapper>
  );
};

export default MainNav;
