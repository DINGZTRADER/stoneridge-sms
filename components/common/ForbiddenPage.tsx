import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';

const ForbiddenPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="mb-6">
                <span className="text-8xl font-black text-red-600">403</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Access Forbidden</h2>
            <p className="text-gray-600 mb-6 max-w-md">
                You do not have permission to access this page. This area is restricted based on your current role.
                Please contact your administrator if you believe this is an error.
            </p>
            <Button onClick={() => navigate('/')}>
                Return to Dashboard
            </Button>
        </div>
    );
};

export default ForbiddenPage;
