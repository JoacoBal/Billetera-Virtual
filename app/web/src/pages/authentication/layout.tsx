import { useSession } from "@/contexts/session-context";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export const AuthLayout = () => {
    const { isAuthenticated } = useSession();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated]);

    return (
        <Outlet/>
    );
};