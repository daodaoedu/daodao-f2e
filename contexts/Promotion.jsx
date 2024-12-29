import { useState, useContext, createContext } from 'react';

const PromotionContext = createContext();

export const usePromotion = () => {
  const context = useContext(PromotionContext);
  if (!context) {
    throw new Error('usePromotion must be used within an NavigationProvider');
  }
  return context;
};

export const PromotionProvider = ({ children }) => {
  const [showPromotionBar, setShowPromotionBar] = useState(true);
  return (
    <PromotionContext.Provider value={{
      showPromotionBar,
      setShowPromotionBar,
    }}
    >
      {children}
    </PromotionContext.Provider>
  );
};
