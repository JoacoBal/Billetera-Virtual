
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useSession } from '@/contexts/session-context';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { SidebarComponent } from './components/Sidebar';

export const ProtectedLayout = () => {
    const { isAuthenticated } = useSession();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth/login');
        }
    }, [isAuthenticated]);

    return (
        <SidebarProvider>
            <SidebarComponent />
            <SidebarTrigger />
            <main className='w-full p-8'>
                <Outlet/>
            </main>
        </SidebarProvider>
    );
};
