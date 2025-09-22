
import React from 'react';
import LoginPage from '../../components/Auth/LoginPage';

const AuthLayout: React.FC = () => {
    // FIX: Removed unused state and the `onLoginSuccess` prop from `LoginPage`.
    // The `LoginPage` component handles its own authentication logic using `AuthContext`
    // and does not accept an `onLoginSuccess` prop.
    return (
        <LoginPage />
    );
};

export default AuthLayout;
