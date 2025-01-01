import React from 'react';
import Navigation from '@/shared/components/Header';
import Footer from '@/shared/components/Footer_v2';
import { NavigationProvider } from '@/contexts/Navigation';
import { PromotionProvider } from '@/contexts/Promotion';

const DefaultLayout = ({ children }) => {
  return (
    <>
      <PromotionProvider>
        <NavigationProvider>
          <Navigation />
          {children}
        </NavigationProvider>
      </PromotionProvider>
      <Footer />
    </>
  );
};

export default DefaultLayout;
