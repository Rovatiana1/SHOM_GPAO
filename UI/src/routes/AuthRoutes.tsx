import { Outlet } from "react-router-dom";
import AuthLayout from "../layouts/Auth/AuthLayout";

const AuthRoutes = {
    path: '/',
    element: <Outlet />,
    children: [
      {
        path: "/login",
        element: <AuthLayout />, // ❌ PAS PROTÉGÉ
      }
    ]
};

export default AuthRoutes;