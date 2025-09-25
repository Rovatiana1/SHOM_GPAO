import React, { createContext, useState, useContext, ReactNode } from "react";

interface AppContextProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  toggleCollapsed: () => void;
  titlePage: string;
  setTitlePage: (value: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsedState] = useState<boolean>(true);
  const [titlePage, setTitlePageState] = useState<string>("");

  const setCollapsed = (value: boolean) => setCollapsedState(value);
  const toggleCollapsed = () => setCollapsedState((prev) => !prev);
  const setTitlePage = (value: string) => setTitlePageState(value);

  return (
    <AppContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed, titlePage, setTitlePage }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook pratique pour accéder au context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
