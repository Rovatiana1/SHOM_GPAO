import AuthLayout from "../components/Layouts/Auth/AuthLayout";

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