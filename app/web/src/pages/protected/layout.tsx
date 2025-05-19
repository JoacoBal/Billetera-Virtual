
import { useSession } from '@/contexts/session-context';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

export const ProtectedLayout = () => {
    const { user, isAuthenticated } = useSession();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth/login');
        }
    }, [isAuthenticated]);

    return (
        <div>
            <Outlet />
        </div>
    );
};
