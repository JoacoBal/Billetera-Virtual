import { performDeposit, performWithdraw } from "@/api/transactionApi";
import { getAvailableWallets } from "@/api/walletsApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/contexts/session-context";
import type { Wallet } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFormContext } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button";

const withdrawSchema = z.object({
    cvu: z.string().min(1, 'El CVU de origen de identidad es requerido'),
    amount: z.number().min(1, "La cantidad debe ser mayor a 0")
});

type WithdrawFormValues = z.infer<typeof withdrawSchema>;

export const WithdrawPage = ({ type } : { type: 'withdraw' | 'deposit' }) => {
    const form = useForm({
        mode: 'onTouched',
        resolver: zodResolver(withdrawSchema),
    });
    const { setError, watch } = form;
    const [loading, setLoading] = useState(false)
    const shouldWithdraw = type == 'withdraw';
    const onSubmit = async (values: z.infer<typeof withdrawSchema>) => {
        setLoading(true)
        const result = shouldWithdraw ? await performWithdraw(values) : await performDeposit(values);
        setLoading(false)
        if (result.errors) {
            if(result.errors.general) {
                toast.error(`Hubo un error al procesar el ${ shouldWithdraw ? 'retiro' : 'depósito' }.`);
                return;
            }
            Object.entries(result.errors).forEach(([field, message]) => {
                setError(field as any, {
                    type: "server",
                    message: message as string,
                });
            });
        } else {
            toast.success(`Se ${ shouldWithdraw ? 'retiró' : 'depositó' } ${watch("amount")} ARS`)
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex gap-8">
                    <WithdrawForm loading={loading} shouldWithdraw={shouldWithdraw}/>
                </div>
            </form>
        </Form>
    )
}

const WithdrawForm = ({ loading, shouldWithdraw } : { loading: boolean, shouldWithdraw: boolean }) => {
    const { user } = useSession();
    const {
        control,
        register,
    } = useFormContext<WithdrawFormValues>();
    const [wallets, setWallets] = useState<Wallet[]>([])

    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const res = await getAvailableWallets(user!.dni, "cvu,balance");
                setWallets(res as any)
            } catch (err) {
                toast.error('Error fetching wallets')
            }
        }
        fetchWallets()
    }, [])

    return (
        <Card className="w-1/2 text-left">
            <CardHeader>
                <CardTitle>{ shouldWithdraw ? "Retirar" : "Depositar" }</CardTitle>
                <CardDescription>Ingresa los datos para { shouldWithdraw ? 'retirar' : 'depositar' } fondos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

                <FormField
                    control={control}
                    name="cvu"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>CVU de origen</FormLabel>
                            <FormControl>
                                <Select {...field} value={field.value} {...register("cvu")} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona una opción" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {wallets.map((option: Partial<Wallet>) => (
                                            <SelectItem key={option.cvu} value={option.cvu!}>
                                                {option.cvu!} - $ {option.balance}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormDescription>{ shouldWithdraw ? 'De esta caja se extraerán los fondos' : 'En esta caja se depositarán los fondos' }.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monto</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="0.00" {...field}
                                    {...register("amount", { valueAsNumber: true })}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                />
                            </FormControl>
                            <FormDescription>Monto a { shouldWithdraw ? 'retirar' : 'depositar' }.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={loading}>{ loading ? "Procesando..." : "Continuar" }</Button>
            </CardContent>
        </Card>
    )
};