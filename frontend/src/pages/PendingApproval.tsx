import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Button } from '../components/ui/button';
import { Clock } from 'lucide-react';

export const PendingApproval: React.FC = () => {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Account Pending Approval
                </h1>
                <p className="text-gray-600 mb-6">
                    Your vendor account has been created successfully and is currently pending admin approval.
                    You'll receive an email notification once your account is approved.
                </p>
                <Button onClick={logout} variant="outline">
                    Sign Out
                </Button>
            </div>
        </div>
    );
};