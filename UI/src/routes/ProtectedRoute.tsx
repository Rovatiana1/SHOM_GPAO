
// import React, { ReactNode } from "react";
// import { Navigate, useLocation } from "react-router-dom";
// import { useAuthContext } from "../context/AuthContext";

// interface ProtectedRouteProps {
//   children: ReactNode;
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
//   const { isAuthenticated, loading } = useAuthContext();
//   const location = useLocation();

//   if (loading) {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }
  
//   return children;
// };

// export default ProtectedRoute;


import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

export default ProtectedRoute;
