import { useEffect, useState, useContext, createContext } from 'react';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within an NavigationProvider');
  }
  return context;
}
export const NavigationProvider = ({ children }) => {
  const [showPromotionBar, setShowPromotionBar] = useState(true);
  const [headerHeight, setHeaderHeight] = useState('128px');
  useEffect(() => {
    setHeaderHeight(showPromotionBar ? '128px' : '64px');
  }, [showPromotionBar]);
  return (
    <NavigationContext.Provider value={{ 
      showPromotionBar, 
      setShowPromotionBar,
      headerHeight 
    }}>
      {children}
    </NavigationContext.Provider>
  );
};