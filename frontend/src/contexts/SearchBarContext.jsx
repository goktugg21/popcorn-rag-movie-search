import React, { createContext, useContext, useState } from 'react';

const SearchBarContext = createContext();

export const useSearchBar = () => {
  const context = useContext(SearchBarContext);
  if (!context) {
    throw new Error('useSearchBar must be used within a SearchBarProvider');
  }
  return context;
};

export const SearchBarProvider = ({ children }) => {
  const [aiMode, setAiMode] = useState(false);

  const value = {
    aiMode,
    setAiMode,
  };

  return (
    <SearchBarContext.Provider value={value}>
      {children}
    </SearchBarContext.Provider>
  );
};
