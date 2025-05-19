"use client"
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm, useFormContext } from "react-hook-form";
import { defineStepper } from "@/components/ui/stepper";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { onSignUp } from "@/api/authApi";
import type { RegisterData, User } from "@/types";
import { useNavigate } from "react-router";

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .refine((val) => /[A-Z]/.test(val), {
    message: "Debe incluir al menos una letra mayúscula",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Debe incluir al menos una letra minúscula",
  })
  .refine((val) => /\d/.test(val), {
    message: "Debe incluir al menos un número",
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: "Debe incluir al menos un carácter especial",
  });

const dateSchema = z.coerce.date();

const credentialsSchema = z.object({
    email: z.string().min(1, 'El correo electrónico es requerido'),
    password: passwordSchema,
    confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
});

const detailsSchema = z.object({
    dni: z.string().min(1, 'El documento de identidad es requerido'),
    name: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'El apellido es requerido'),
    birthdate: dateSchema,
    phone: z.string().min(1, 'El teléfono es requerido'),
});

type CredentialsFormValues = z.infer<typeof credentialsSchema>;
type DetailsFormValues = z.infer<typeof detailsSchema>;

const { useStepper, steps, utils } = defineStepper(
    { id: 'credentials', label: 'Credentials', schema: credentialsSchema },
    { id: 'details', label: 'Details', schema: detailsSchema },
    { id: 'complete', label: 'Complete', schema: z.object({}) }
);

export const RegisterForm = () => {
    const stepper = useStepper();
    const navigate = useNavigate();

    const form = useForm({
        mode: 'onTouched',
        resolver: zodResolver(stepper.current.schema),
    });

    const onSubmit = async (values: z.infer<typeof stepper.current.schema>) => {
        console.log(`Form values for step ${stepper.current.id}:`, values);
        if (stepper.isLast) {
            const data = form.getValues() as RegisterData & User;
            const result = await onSignUp(data);
            if(result.errors) {
                stepper.reset();
                console.log(result.errors)
            } else {
                navigate("/auth/login");
            }
        } else {
            stepper.next();
        }
    };

    const currentIndex = utils.getIndex(stepper.current.id);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 p-6 border rounded-lg w-[450px]"
            >
                <div className="flex justify-between">
                    <h2 className="text-lg font-medium">Checkout</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Step {currentIndex + 1} of {steps.length}
                        </span>
                    </div>
                </div>
                <nav aria-label="Checkout Steps" className="group my-4">
                    <ol
                        className="flex items-center justify-between gap-2"
                        aria-orientation="horizontal"
                    >
                        {stepper.all.map((step, index, array) => (
                            <React.Fragment key={step.id}>
                                <li className="flex items-center gap-4 flex-shrink-0">
                                    <Button
                                        type="button"
                                        role="tab"
                                        variant={index <= currentIndex ? 'default' : 'secondary'}
                                        aria-current={
                                            stepper.current.id === step.id ? 'step' : undefined
                                        }
                                        aria-posinset={index + 1}
                                        aria-setsize={steps.length}
                                        aria-selected={stepper.current.id === step.id}
                                        className="flex size-10 items-center justify-center rounded-full"
                                        onClick={async () => {
                                            const valid = await form.trigger();
                                            if (!valid) return;
                                            if (index - currentIndex > 1) return;
                                            stepper.goTo(step.id);
                                        }}
                                    >
                                        {index + 1}
                                    </Button>
                                    <span className="text-sm font-medium">{step.label}</span>
                                </li>
                                {index < array.length - 1 && (
                                    <Separator
                                        className={`flex-1 ${index < currentIndex ? 'bg-primary' : 'bg-muted'
                                            }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </ol>
                </nav>
                <div className="space-y-4">
                    {stepper.switch({
                        credentials: () => <CredentialsComponent />,
                        details: () => <DetailsComponent />,
                        complete: () => <CompleteComponent />,
                    })}
                    {!stepper.isLast ? (
                        <div className="flex justify-end gap-4">
                            <Button
                                variant="secondary"
                                onClick={stepper.prev}
                                disabled={stepper.isFirst}
                            >
                                Back
                            </Button>
                            <Button type="submit">
                                {stepper.isLast ? 'Complete' : 'Next'}
                            </Button>
                        </div>
                    ) : (
                        <Button type="submit">Finalizar</Button>
                    )}
                </div>
            </form>
        </Form>
    );
}

function CredentialsComponent() {
    const {
        register,
        formState: { errors },
    } = useFormContext<CredentialsFormValues>();

    return (
        <div className="space-y-4 text-start">
            <div className="space-y-2">
                <label
                    htmlFor={register('email').name}
                    className="block text-sm font-medium text-primary"
                >
                    Correo electrónico
                </label>
                <Input
                    type="email"
                    placeholder="johndoe@example.com"
                    id={register('email').name}
                    {...register('email')}
                    className="block w-full p-2 border rounded-md"
                />
                {errors.email && (
                    <span className="text-sm text-destructive">
                        {errors.email.message}
                    </span>
                )}
            </div>
            <div className="space-y-2">
                <label
                    htmlFor={register('password').name}
                    className="block text-sm font-medium text-primary"
                >
                    Contraseña
                </label>
                <Input
                    type="password"
                    id={register('password').name}
                    {...register('password')}
                    className="block w-full p-2 border rounded-md"
                />
                {errors.password && (
                    <span className="text-sm text-destructive">
                        {errors.password.message}
                    </span>
                )}
            </div>
            <div className="space-y-2">
                <label
                    htmlFor={register('confirm_password').name}
                    className="block text-sm font-medium text-primary"
                >
                    Confirmación de contraseña
                </label>
                <Input
                    type="password"
                    id={register('confirm_password').name}
                    {...register('confirm_password')}
                    className="block w-full p-2 border rounded-md"
                />
                {errors.confirm_password && (
                    <span className="text-sm text-destructive">
                        {errors.confirm_password.message}
                    </span>
                )}
            </div>
        </div>
    );
}

function DetailsComponent() {
    const {
        register,
        formState: { errors },
    } = useFormContext<DetailsFormValues>();

    return (
        <div className="space-y-4 text-start">
            <div className="space-y-2">
                <label
                    htmlFor={register('dni').name}
                    className="block text-sm font-medium text-primary"
                >
                    DNI
                </label>
                <Input
                    id={register('dni').name}
                    {...register('dni')}
                    className="block w-full p-2 border rounded-md"
                />
                {errors.dni && (
                    <span className="text-sm text-destructive">
                        {errors.dni.message}
                    </span>
                )}
            </div>
            <div className="space-y-2">
                <label
                    htmlFor={register('name').name}
                    className="block text-sm font-medium text-primary"
                >
                    Nombre/s
                </label>
                <Input
                    id={register('name').name}
                    {...register('name')}
                    className="block w-full p-2 border rounded-md"
                />
                {errors.name && (
                    <span className="text-sm text-destructive">
                        {errors.name.message}
                    </span>
                )}
            </div>
            <div className="space-y-2">
                <label
                    htmlFor={register('lastName').name}
                    className="block text-sm font-medium text-primary"
                >
                    Apellido/s
                </label>
                <Input
                    id={register('lastName').name}
                    {...register('lastName')}
                    className="block w-full p-2 border rounded-md"
                />
                {errors.lastName && (
                    <span className="text-sm text-destructive">
                        {errors.lastName.message}
                    </span>
                )}
            </div>
            <div className="space-y-2">
                <label
                    htmlFor={register('birthdate').name}
                    className="block text-sm font-medium text-primary"
                >
                    Fecha de nacimiento
                </label>
                <Input
                    type="date"
                    id={register('birthdate').name}
                    {...register('birthdate')}
                    className="block w-full p-2 border rounded-md"
                />
                {errors.birthdate && (
                    <span className="text-sm text-destructive">
                        {errors.birthdate.message}
                    </span>
                )}
            </div>
            <div className="space-y-2">
                <label
                    htmlFor={register('phone').name}
                    className="block text-sm font-medium text-primary"
                >
                    Teléfono
                </label>
                <Input
                    id={register('phone').name}
                    {...register('phone')}
                    className="block w-full p-2 border rounded-md"
                />
                {errors.phone && (
                    <span className="text-sm text-destructive">{errors.phone.message}</span>
                )}
            </div>
        </div>
    );
}

function CompleteComponent() {
    return <div className="text-center">Now we are ready!</div>;
}

