import React from 'react';
import SubFooter from './SubFooter';
import MainFooter from './MainFooter';

const Footer = () => (
  <footer className="flex min-h-[270px] flex-col justify-center bg-[#536166]">
    <MainFooter />
    <SubFooter />
  </footer>
);

export default Footer;
