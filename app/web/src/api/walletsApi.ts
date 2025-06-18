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

export const createWallet = async (type: 'secondary' | 'shared', alias: string | undefined) => {
    try {
        // Falsear 2 segundos de demora
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const result = await httpClient.post(
            `/wallets`,
            {
                type,
                alias
            }
        );
        return result.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return { errors: { general: error.response?.data } }
        }
        return { errors: { general: "Algo salió mal..." } }
    }
}