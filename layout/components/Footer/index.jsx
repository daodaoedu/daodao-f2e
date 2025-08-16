import React from 'react';
import SubFooter from './SubFooter';
import MainFooter from './MainFooter';

const Footer = () => (
  <footer className="bg-[#536166] min-h-[270px] flex flex-col justify-center">
    <MainFooter />
    <SubFooter />
  </footer>
);

export default Footer;
