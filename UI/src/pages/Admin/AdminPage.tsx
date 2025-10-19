import React from 'react';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Navigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    // Double check if user is admin, otherwise redirect
    if (!user || !user.roles.includes('ADMIN')) {
        return <Navigate to="/" replace />;
    }

    return <AdminLayout />;
};

export default AdminPage;
