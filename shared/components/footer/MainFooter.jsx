import React from 'react';
import styled from '@emotion/styled';
import {
  FaFacebook, FaInstagram,
} from 'react-icons/fa';
import IntroList from './IntroList';
import IconList from './IconList';

const MainFooterWrapper = styled.div`
  height: 100%;
  background-color:#536166;
  color: white;
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  font-size: 16px;
  letter-spacing: 0.08em;
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
    name: '關於我們',
    link: '/',
  },
  {
    name: '體驗問卷',
    link: '/',
  },
];

const aboutResourceConfig = [
  {
    name: '找學習資源',
    link: '/',
  },
  {
    name: '找課程活動',
    link: '/',
  },
  {
    name: '找學習空間',
    link: '/',
  },
  {
    name: '加入學習社群',
    link: '/',
  },
];

const iconListConfig = [
  {
    icon: <FaInstagram />,
    link: '/',
    alt: 'instagram',
  },
  {
    icon: <FaFacebook />,
    link: '/',
    alt: 'facebook',
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
        <IntroList
          title="關於島島阿學"
          list={aboutDaoConfig}
        />
        <IntroList
          title="找資源"
          list={aboutResourceConfig}
        />
      </BlockWrapper>
      <BlockWrapper>
        {/* 追蹤島島 */}
        <IconList
          title="追蹤島島"
          list={iconListConfig}
        />
      </BlockWrapper>
    </MainFooterWrapper>
  );
};

export default SubFooter;
