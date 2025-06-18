import { createWallet } from "@/api/walletsApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/contexts/session-context";
import type { Wallet } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const walletCreationSchema = z.object({
    type: z.string().min(1, 'El tipo de caja es requerido'),
    alias: z.string().optional()
});

type WalletCreationFormValues = z.infer<typeof walletCreationSchema>;

export const WalletSettingsDialog = ({ wallet }: { wallet: Partial<Wallet> }) => {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Opciones
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Modificar opciones de la caja</DialogTitle>
                </DialogHeader>
                <WalletSettingsComponent wallet={wallet} />
            </DialogContent>
        </Dialog>
    )
}

const WalletSettingsComponent = ({ wallet }: { wallet: Partial<Wallet> }) => {
    const form = useForm({
        mode: 'onTouched',
        resolver: zodResolver(walletCreationSchema),
    });
    const { setError } = form;
    const [loading, setLoading] = useState(false)

    const onSubmit = async (values: z.infer<typeof walletCreationSchema>) => {
        setLoading(true)
        const result = await createWallet(values.type as any, values.alias);
        setLoading(false)
        if (result.errors) {
            if (result.errors.general) {
                toast.error(`Hubo un error al procesar la creación de la caja.`);
                return;
            }
            Object.entries(result.errors).forEach(([field, message]) => {
                setError(field as any, {
                    type: "server",
                    message: message as string,
                });
            });
        } else {
            toast.success(`Se creó la caja con éxito.`)
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex gap-8">
                    <WalletSettingsForm loading={loading} wallet={wallet} />
                </div>
            </form>
        </Form>
    )
}
const WalletSettingsForm = ({ loading, wallet }: { loading: boolean, wallet: Partial<Wallet> }) => {
    const {
        control,
        register,
    } = useFormContext<WalletCreationFormValues>();
    const { user } = useSession();
    const isOwner = wallet.dni_owner == user?.dni;
    return (<div className="space-y-8">
        {isOwner ?
            <FormField
                control={control}
                name="alias"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Alias</FormLabel>
                        <FormControl>

                            <Input placeholder={wallet.alias} {...register("alias")} {...field} />

                        </FormControl>
                        <FormDescription>El alias sirve para realizar y recibir transferencias de forma más simple (opcional).</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            /> : undefined
        }
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Procesando..." : "Guardar"}</Button>
    </div>
    )
}