
// import React, { createContext, useContext, useState, useEffect, ReactNode, use } from "react";
// import { User, UserRole } from "../types/Users";
// import AuthService, { LoginResponse } from '../services/AuthService';

// const getHardcodedUser = (userConnected: LoginResponse): User => ({
//   userId: userConnected.userId,
//   userName: userConnected.userName,
//   roles: userConnected.roles,
// });

// type AuthContextType = {
//   user: User | null;
//   isAuthenticated: boolean;
//   loading: boolean;
//   login: (username: string, password: string) => Promise<void>;
//   logout: () => void;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const [loading, setLoading] = useState(true);

//   // useEffect(() => {
//   //   const checkAuth = () => {
//   //     const authenticated = AuthService.isAuthenticated();
//   //     setIsAuthenticated(authenticated);
//   //     if (authenticated) {
//   //       setUser(getHardcodedUser());
//   //     }
//   //     setLoading(false);
//   //   };
//   //   checkAuth();
//   // }, []);

//   const login = async (username: string, password: string) => {
//     const userConnected = await AuthService.login(username, password);
//     setIsAuthenticated(true);
//     setUser(getHardcodedUser(userConnected));
//   };

//   const logout = () => {
//     AuthService.logout();
//     setUser(null);
//     setIsAuthenticated(false);
//   };

//   return (
//     <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuthContext = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuthContext must be used within an AuthProvider");
//   }
//   return context;
// };



import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types/Users";
import AuthService from '../services/AuthService';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthService.isAuthenticated();
      if (authenticated) {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
        } else {
            // Token exists, but user data is missing/corrupt. Clean up.
            AuthService.logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    await AuthService.login(username, password);
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};