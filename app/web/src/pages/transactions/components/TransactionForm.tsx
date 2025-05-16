import { performTransaction } from "@/api/transactionApi"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"

export const TransactionForm = () => {
    const form = useForm()

    const onSubmit = async () => {
        const result = await performTransaction()
        console.log(result)
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
                control={form.control}
                name="origcvu"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>CVU de origen</FormLabel>
                        <FormControl>
                            <Input placeholder="shadcn" {...field} />
                        </FormControl>
                        <FormDescription>De esta caja se extraerán los fondos.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="destcvu"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>CVU destino</FormLabel>
                        <FormControl>
                            <Input placeholder="shadcn" {...field} />
                        </FormControl>
                        <FormDescription>A esta caja se le enviarán los fondos.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Monto</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="shadcn" {...field} 
                                type="number"
                                step="0.01"
                                min="0"
                            />
                        </FormControl>
                        <FormDescription>Monto a enviar.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
             <Button type="submit">Continuar</Button>
                </form>
        </Form>

    )
}