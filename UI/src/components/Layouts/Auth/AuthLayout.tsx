
import React, { useState, useEffect } from 'react';
import LoginPage from '../../Auth/LoginPage';

const AuthLayout: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    return (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
    );
};

export default AuthLayout;
