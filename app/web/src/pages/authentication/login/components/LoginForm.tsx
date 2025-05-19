
import { onSignIn } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSession } from "@/contexts/session-context";
import type { LoginData } from "@/types";
import { useForm } from "react-hook-form";

export const LoginForm = () => {
    const form = useForm<LoginData>()
    const { onSignIn: signIn } = useSession();
    const onSubmit = async (data: LoginData) => {
        try {
            const res = await onSignIn(data);
            console.log(res)
            if(res.data)
                signIn(res.data.token); // Guarda el token en localStorage
        } catch (err) {
            console.error('Login failed', err);
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