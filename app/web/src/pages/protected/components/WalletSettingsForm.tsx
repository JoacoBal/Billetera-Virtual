import { editWallet } from "@/api/walletsApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSession } from "@/contexts/session-context";
import type { Wallet } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Settings, X } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const walletCreationSchema = z.object({
  alias: z.string().optional(),
  people: z
    .array(
      z.object({
        email: z.string().email('Email inválido'),
      })
    )
    .optional(),
});

type WalletCreationFormValues = z.infer<typeof walletCreationSchema>;

export const WalletSettingsDialog = ({ wallet }: { wallet: Partial<Wallet> }) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="ml-2">
          <Settings className="w-4 h-4"/>
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
    defaultValues: {
      people: (wallet as any).members ? ((wallet as any).members as string[]).map(email => ({ email })) : []
    }
  });
  const { setError } = form;
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();

  const onSubmit = async (values: z.infer<typeof walletCreationSchema>) => {
    setLoading(true)
    const emails = values.people?.map((person) => person.email) ?? [];
    const result = await editWallet(wallet.cvu!, values.alias, wallet.type != "shared" ? undefined : emails);
    setLoading(false)   
    if (result.errors) {
      if (result.errors.general) {
        toast.error(result.errors.general);
        return;
      }
      Object.entries(result.errors).forEach(([field, message]) => {
        setError(field as any, {
          type: "server",
          message: message as string,
        });
      });
    } else {
      toast.success(`Se modificó la caja con éxito.`);
      navigate(0);
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'people',
  })

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
    {isOwner && wallet.type == "shared" ?
      <div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold">Personas autorizadas</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ email: '' })}
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </div>

          {fields.map((field: any, index: any) => (
            <div key={field.id} className="flex gap-4 items-end">
              <div className="flex-1">
                <FormField
                  control={control}
                  name={`people.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="correo@ejemplo.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
              >
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div> : undefined
    }

    <Button type="submit" className="w-full" disabled={loading}>{loading ? "Procesando..." : isOwner ? "Guardar" : "Abandonar"}</Button>
  </div>
  )
}