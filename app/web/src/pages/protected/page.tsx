import { getAvailableWallets } from "@/api/walletsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/contexts/session-context";
import type { Wallet } from "@/types";
import { Badge, Bitcoin, Loader2, PiggyBank, Plus, WalletIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { WalletDialog } from "./components/WalletCreationForm";
import { WalletSettingsDialog } from "./components/WalletSettingsForm";
import { WalletQrDialog } from "./components/WalletQrDialog";


// Función para elegir ícono según tipo de wallet
const getIcon = (type: Wallet['type']) => {
    switch (type) {
        case 'principal':
            return <WalletIcon className="h-6 w-6 text-muted-foreground" />
        case 'crypto':
            return <Bitcoin className="h-6 w-6 text-muted-foreground" />
        case 'secondary':
            return <PiggyBank className="h-6 w-6 text-muted-foreground" />
        default:
            return null
    }
}

const WalletsDisplay = () => {
    const { user } = useSession();
    const [wallets, setWallets] = useState<Wallet[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const res = await getAvailableWallets(user!.dni, "cvu,balance,type,dni_owner,alias,members");
                const ordered = (res as any[]).sort((a, b) => {
                    const typePriority: Record<string, number> = {
                        principal: 0,
                        secondary: 1,
                        shared: 2,
                    }

                    return typePriority[a.type] - typePriority[b.type]
                })
                setWallets(ordered)
            } catch (err: any) {
                setError(err.message || 'Error fetching wallets')
            } finally {
                setLoading(false)
            }
        }

        fetchWallets()
    }, [])
    return (
        <main className="p-6">

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Cajas disponibles</h1>
                <WalletDialog />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                </div>
            ) : error ? (
                <p className="text-red-500">Error: {error}</p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {wallets.map((wallet) => (
                        <Card key={wallet.cvu} className="rounded-2xl shadow-md">
                            <CardHeader className="space-y-1 pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold">
                                        {wallet.type}
                                        <WalletSettingsDialog wallet={wallet}/>
                                        <WalletQrDialog wallet={wallet}/>
                                    </CardTitle>
                                    {getIcon(wallet.type)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <div>CVU: {wallet.cvu}</div>
                                    {wallet.alias ? <div>Alias: {wallet.alias}</div> : <div>-</div>}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">
                                    {wallet.balance.toLocaleString()} ARS
                                </p>
                                <Badge className="mt-2">
                                    {"ARS"}
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    )
}

export const HomePage = () => {
    const { user, onSignOut } = useSession();
    const navigate = useNavigate();
    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                Algo salió mal
            </div>
        );
    }

    return <WalletsDisplay />;
};
