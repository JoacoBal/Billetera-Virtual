import { Button } from '@/components/ui/button';
import { Outlet } from 'react-router';

export const UsersLayout = () => {

    return (
        <div className="bg-auth-pattern p-9.5 flex justify-end items-center bg-no-repeat h-full">
            <Button>BUENAS</Button>
            <Outlet/>
        </div>
    );
};
