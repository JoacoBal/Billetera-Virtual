import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSession } from "@/contexts/session-context"
import { Calendar, ChevronUp, Home, Inbox, Search, Settings, User2 } from "lucide-react"
import { useNavigate } from "react-router"

const items = [
    {
        title: "Inicio",
        url: "#",
        icon: Home,
    },
    {
        title: "Depositar",
        url: "#",
        icon: Inbox,
    },
    {
        title: "Transferir",
        url: "/transfer",
        icon: Calendar,
    },
    {
        title: "Movimientos",
        url: "#",
        icon: Search,
    },
    {
        title: "Retirar",
        url: "#",
        icon: Settings,
    },
]

export const SidebarComponent = () => {
    const navigate = useNavigate();
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild onClick={() => {
                                        navigate(item.url)
                                    }}>
                                        <a>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <FooterComponent />
        </Sidebar>
    )
}

const FooterComponent = () => {
    const { user, onSignOut } = useSession();
    const navigate = useNavigate();
    const signOut = async () => {
        onSignOut();
        navigate(0);
    }
    return (
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton>
                                <User2 /> {user?.name}
                                <ChevronUp className="ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="top"
                            className="w-[--radix-popper-anchor-width]"
                        >
                            <DropdownMenuItem>
                                <span>Configuración</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={signOut}>
                                <span>Cerrar sesión</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    )
}