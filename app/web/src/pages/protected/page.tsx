import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/session-context";
import { useNavigate } from "react-router";


export const HomePage = () => {
    const { user, onSignOut } = useSession();
    const navigate = useNavigate();
    if (!user)
        return (
            <div className="flex items-center justify-center h-screen">
                Algo salió mal
            </div>
        );
    const signOut = () => {
        onSignOut();
        navigate(0);
    }
    return <>
    usuario op
    <Button onClick={signOut}>Cerrar sesión</Button>
    </>;
};
