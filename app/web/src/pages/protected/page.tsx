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
    return <div>
    usuario op
    </div>;
};
