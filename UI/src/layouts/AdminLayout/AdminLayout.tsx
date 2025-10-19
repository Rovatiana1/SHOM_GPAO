import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
    return (
        <div className="flex h-full bg-gray-100">
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
