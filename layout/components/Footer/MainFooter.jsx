import React from 'react';
import { Image } from '@/components/ui/image';
import FacebookIconPng from '@/public/email/fecebook-icon.png';
import InstagramIconPng from '@/public/email/instagram-icon.png';
import IntroList from './IntroList';
import IconList from './IconList';
import { FOOTER_LINK } from '../../../constants/category';

const aboutDaoConfig = [
  {
    name: '關於島島',
    link: '/about',
    target: '_self',
  },
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

const SubFooter = () => (
  <div className="flex h-full items-start justify-around bg-[#536166] text-base tracking-[0.08em] text-white max-md:flex max-md:flex-col max-md:items-center max-md:justify-around">
    <div className="mt-[30px] flex justify-around">
      <div className="mx-2.5 cursor-pointer">
        <img src="/new-logo-vertical.png" alt="daodao" width="120" height="123" />
      </div>
    </div>
    <div className="mt-[30px] flex justify-around">
      <IntroList title="關於島島阿學" list={aboutDaoConfig} />
      <IntroList title="找資源" list={FOOTER_LINK} />
      <IntroList title="訂閱電子報" list={socialConfig} />
    </div>
    <div className="mt-[30px] flex justify-around">
      <IconList title="追蹤島島" list={iconListConfig} />
    </div>
  </div>
);

export default SubFooter;
