import React from 'react';
import { Outlet } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Admin Portal</h1>
                <Outlet />
            </div>
        </div>
    );
};

