import type { Wallet } from "@/types";
import { httpClient } from "./httpClient";

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