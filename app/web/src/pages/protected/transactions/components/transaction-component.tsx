import { performTransaction } from "@/api/transactionApi"
import { getAvailableWallets } from "@/api/walletsApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "@/contexts/session-context"
import type { Wallet } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm, useFormContext } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const transactionSchema = z.object({
    origin_cvu: z.string().min(1, 'El CVU de origen de identidad es requerido'),
    destination_cvu: z.string().min(1, 'El CVU de destino es requerido'),
    amount: z.number().min(1, "La cantidad debe ser mayor a 0"),
    description: z.string().optional()
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export const TransactionComponent = () => {
    const form = useForm({
        mode: 'onTouched',
        resolver: zodResolver(transactionSchema),
    });
    const { setError } = form;
    const [loading, setLoading] = useState(false)
    const onSubmit = async (values: z.infer<typeof transactionSchema>) => {
        setLoading(true);
        const result = await performTransaction(values)
        setLoading(false);
        if (result.errors) {
            if(result.errors.general) {
                toast.error(`Hubo un error al procesar la transferencia.`);
                return;
            }
            Object.entries(result.errors).forEach(([field, message]) => {
                setError(field as any, {
                    type: "server",
                    message: message as string,
                });
            });
        } else {
            toast.success(`La transferencia se realizó con éxito.`)
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex gap-8">
                    <TransactionForm />
                    <TransactionDetails loading={loading} />
                </div>
            </form>
        </Form>
    )
}
export const TransactionForm = () => {
    const { user } = useSession();
    const {
        control,
        register,
    } = useFormContext<TransactionFormValues>();

    const [options, setOptions] = useState<Partial<Wallet>[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const result = await getAvailableWallets(user!.dni, "cvu");
                setOptions(result);
            } catch (err) {
                console.error("Error fetching options:", err);
            }
        };

        fetchOptions();
    }, []);


    return (
        <Card className="w-1/2 text-left">
            <CardHeader>
                <CardTitle>Transferencia</CardTitle>
                <CardDescription>Ingresa los datos de la transferencia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <FormField
                    control={control}
                    name="origin_cvu"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>CVU de origen</FormLabel>
                            <FormControl>
                                <Select {...field} value={field.value} {...register("origin_cvu")} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona una opción" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {options.map((option: Partial<Wallet>) => (
                                            <SelectItem key={option.cvu} value={option.cvu!}>
                                                {option.cvu!}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormDescription>De esta caja se extraerán los fondos.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="destination_cvu"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>CVU destino</FormLabel>
                            <FormControl>

                                <Input placeholder="shadcn" {...register("destination_cvu")} {...field} />

                            </FormControl>
                            <FormDescription>A esta caja se le enviarán los fondos.</FormDescription>
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
                                    placeholder="shadcn" {...field}
                                    {...register("amount", { valueAsNumber: true })}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                />
                            </FormControl>
                            <FormDescription>Montof a enviar.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nota</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Adjunta una nota"
                                    {...field}
                                    {...register("description")}
                                />
                            </FormControl>
                            <FormDescription>Adjunta una nota (opcional).</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    )
}

/**
 * Falta añadir que haga un fetch tras ingresar el cvu destino, si la solicitud fue correcta trae consigo algunos datos de la Caja a la que se
 * realiza la transferencia, esos datos se mostrarian acá para que la persona pueda confirmar que la está enviando al lugar correcto.
 */
export const TransactionDetails = ({ loading }: { loading: boolean }) => {
    const {
        watch,
    } = useFormContext<TransactionFormValues>();
    return (
        <Card className="w-1/2 text-left h-full">
            <CardHeader>
                <CardTitle>Detalles</CardTitle>
                <CardDescription>Detalles de la transferencia</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Caja destino:</p>
                <CardDescription>CVU: {watch("destination_cvu")}</CardDescription>
            </CardContent>
            <CardContent>
                <p>No confirmes la transferencia hasta estar seguro de que la cuenta destino sea la correcta!</p>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button type="submit" className="w-1/3" disabled={loading}>{loading ? "Procesando..." : "Continuar"}</Button>
            </CardFooter>
        </Card>
    )
}