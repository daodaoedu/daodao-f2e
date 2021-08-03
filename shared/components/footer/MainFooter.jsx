import React from 'react';
import styled from '@emotion/styled';
import {
  FaFacebook, FaInstagram,
} from 'react-icons/fa';
import IntroList from './IntroList';

const MainFooterWrapper = styled.div`
  height: 100%;
  background-color:#536166;
  color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
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
`;

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
          list={['關於我們', '體驗問卷']}
        />
        <IntroList
          title="找資源"
          list={['找學習資源', '找課程活動', '找學習空間', '找課程活動', '加入學習社群']}
        />
      </BlockWrapper>
      <BlockWrapper>
        {/* 追蹤島島 */}
        <h2>追蹤島島</h2>
        <ul>
          <li>
            <FaFacebook />
          </li>
          <li>
            <FaInstagram />
          </li>
        </ul>
      </BlockWrapper>
    </MainFooterWrapper>
  );
};

export default SubFooter;
