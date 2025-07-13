import React from 'react';
import styled from '@emotion/styled';
import { Image } from '@/components/ui/image';
import FacebookIconPng from '@/public/email/fecebook-icon.png';
import InstagramIconPng from '@/public/email/instagram-icon.png';
import IntroList from './IntroList';
import IconList from './IconList';
import { FOOTER_LINK } from '../../../constants/category';

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
  margin: 0 10px;
  cursor: pointer;
`;

const BlockWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
`;

const aboutDaoConfig = [
  {
    name: '關於島島',
    link: '/about',
    target: '_self',
  },
  // {
  //   name: '體驗問卷',
  //   link: 'https://docs.google.com/forms/d/e/1FAIpQLSeyU9-Q-kIWp5uutcik3h-RO4o5VuG6oG0m-4u1Ua18EOu3aw/viewform',
  //   target: '_blank',
  // },
  {
    name: '隱私權政策',
    link: '/terms/privacypolicy',
    target: '_self',
  },
  {
    name: '服務條款',
    link: '/terms/service',
    target: '_self',
  },
  {
    name: '智慧財產權',
    link: '/terms/ipr',
    target: '_self',
  },
];

const iconListConfig = [
  {
    icon: <Image src={InstagramIconPng} alt="instagram" width={18} height={18} />,
    link: 'https://www.instagram.com/daodao_edu/',
    alt: 'instagram',
  },
  {
    icon: <Image src={FacebookIconPng} alt="facebook" width={18} height={18} />,
    link: 'https://www.facebook.com/daodao.edu',
    alt: 'facebook',
  },
];

const socialConfig = [
  {
    name: '訂閱電子報',
    link: 'https://daoda.kit.com/newsletter',
    target: '_self',
  },
  {
    name: '加入社群',
    link: '/join',
    target: '_self',
  },
];

const SubFooter = () => {
  return (
    <MainFooterWrapper>
      <BlockWrapper>
        {/* //img */}
        <LogoWrapper>
          <img src="/new-logo-vertical.png" alt="daodao" width="120" height="123" />
        </LogoWrapper>
      </BlockWrapper>
      <BlockWrapper>
        {/* 連結 */}
        <IntroList title="關於島島阿學" list={aboutDaoConfig} />
        <IntroList title="找資源" list={FOOTER_LINK} />
        <IntroList title="訂閱電子報" list={socialConfig} />
      </BlockWrapper>
      <BlockWrapper>
        {/* 追蹤島島 */}
        <IconList title="追蹤島島" list={iconListConfig} />
      </BlockWrapper>
    </MainFooterWrapper>
  );
};

export default SubFooter;
