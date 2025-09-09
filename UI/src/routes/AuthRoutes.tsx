import AuthLayout from "../layouts/Auth/AuthLayout";

const AuthRoutes = {
    path: '/',
    element: <></>,
    children: [
      {
        path: "/login",
        element: <AuthLayout />, // ❌ PAS PROTÉGÉ
      }
    ]
};

export default AuthRoutes;