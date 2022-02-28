import React from "react";
import styled from "@emotion/styled";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import IntroList from "./IntroList";
import IconList from "./IconList";
import { FOOTER_LINK } from "../../../constants/category";

const MainFooterWrapper = styled.div`
  height: 100%;
  background-color: #536166;
  color: white;
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  font-size: 16px;
  letter-spacing: 0.08em;

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }
`;

const LogoWrapper = styled.div`
  width: 127.5px;
  margin: 0 10px;
  cursor: pointer;
  & > img {
    width: 100%;
  }
`;

const BlockWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 60px;
`;

const aboutDaoConfig = [
  {
    name: "關於島島",
    link: "/about",
    target: "_self",
  },
  {
    name: "體驗問卷",
    link: "https://docs.google.com/forms/d/e/1FAIpQLSeyU9-Q-kIWp5uutcik3h-RO4o5VuG6oG0m-4u1Ua18EOu3aw/viewform",
    target: "_blank",
  },
];

const iconListConfig = [
  {
    icon: <FaInstagram size="18" />,
    link: "https://www.instagram.com/daodao_edu/",
    alt: "instagram",
  },
  {
    icon: <FaFacebook size="18" />,
    link: "https://www.facebook.com/daodao.edu",
    alt: "facebook",
  },
];

const SubFooter = () => {
  return (
    <MainFooterWrapper>
      <BlockWrapper>
        {/* //img */}
        <LogoWrapper>
          <img src="/logo.png" alt="daodao" />
        </LogoWrapper>
      </BlockWrapper>
      <BlockWrapper>
        {/* 連結 */}
        <IntroList title="關於島島阿學" list={aboutDaoConfig} />
        <IntroList title="找資源" list={FOOTER_LINK} />
      </BlockWrapper>
      <BlockWrapper>
        {/* 追蹤島島 */}
        <IconList title="追蹤島島" list={iconListConfig} />
      </BlockWrapper>
    </MainFooterWrapper>
  );
};

export default SubFooter;
