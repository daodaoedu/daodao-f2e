import styled from "@emotion/styled";
// import Link from 'next/link';
import MainNav from "./MainNav";
import SubNav from "./SubNav";
import { NAV_LINK, CATEGORY_LINK } from "../../../constants/category";

const NavigationWrapper = styled.nav`
  white-space: nowrap;
`;

const Navigation = () => {
  return (
    <NavigationWrapper>
      <MainNav linkList={NAV_LINK} />
      <SubNav list={CATEGORY_LINK} />
    </NavigationWrapper>
  );
};

export default Navigation;
