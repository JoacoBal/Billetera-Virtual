import { onSignIn } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSession } from "@/contexts/session-context";
import type { LoginData } from "@/types";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const LoginForm = () => {
    const form = useForm<LoginData>()
    const { setError } = form;
    const { onSignIn: signIn } = useSession();

    const onSubmit = async (data: LoginData) => {
        const result = await onSignIn(data);
        if(result.errors) {
            Object.entries(result.errors).forEach(([field, message]) => {
                setError(field as any, {
                type: "server",
                message: message as string,
                });
            });
            if(result.errors.general) {
                toast(result.errors.general);
            }
        } else {
            signIn(result.token); // Guarda el token en localStorage
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                            <Input type="email" required placeholder="m@example.com" {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                            <Input type="password" required {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
             <Button type="submit">Iniciar sesión</Button>
                </form>
        </Form>
    )
}