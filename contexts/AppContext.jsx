import { createContext, useContext } from 'react';

const AppContext = createContext();

// context wrapper
export const AppProvider = ({ children }) => {
  const sharedState = {
    /* whatever you want */
  };

  return (
    <AppContext.Provider value={sharedState}>
      {children}
    </AppContext.Provider>
  );
};

// context hooks
export const useAppContext = () => {
  return useContext(AppContext);
};
