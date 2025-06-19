import type { Wallet } from "@/types";
import { httpClient } from "./httpClient";
import { AxiosError } from "axios";

export const getAvailableWallets = async (dni: string, fields: string) => {
    const result = await httpClient.get<Partial<Wallet>[]>(
        `/wallets/${dni}`,
        {
            params: {
                fields,
            },
        },
    );
    return result.data;
};

export const createWallet = async (dni: string, type: 'secondary' | 'shared', alias: string | undefined) => {
    try {
        // Falsear 2 segundos de demora
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const result = await httpClient.post(
            `/wallets`,
            {
                dni_owner: dni,
                type,
                alias
            }
        );
        return result.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data
        }
        return { errors: { general: "Algo salió mal..." } }
    }
}

export const editWallet = async (cvu: string, alias: string | undefined, members: any) => {
    try {
        // Falsear 2 segundos de demora
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const result = await httpClient.post(
            `/wallets/edit`,
            {
                cvu,
                alias,
                members
            }
        );
        return result.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data
        }
        return { errors: { general: "Algo salió mal..." } }
    }
} 