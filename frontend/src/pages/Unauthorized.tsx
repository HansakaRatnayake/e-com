import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ShieldX } from 'lucide-react';

export const Unauthorized: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                <ShieldX className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Access Denied
                </h1>
                <p className="text-gray-600 mb-6">
                    You don't have permission to access this page. Please contact an administrator if you believe this is an error.
                </p>
                <Button onClick={() => navigate('/')}>
                    Go to Home
                </Button>
            </div>
        </div>
    );
};