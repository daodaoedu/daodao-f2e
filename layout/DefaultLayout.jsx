import React from 'react';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';
import { NavigationProvider } from '@/contexts/Navigation';

const DefaultLayout = ({ children }) => {
  return (
    <>
      <NavigationProvider>
        <Navigation />
      </NavigationProvider>
      {children}
      <Footer />
    </>
  );
};

export default DefaultLayout;
