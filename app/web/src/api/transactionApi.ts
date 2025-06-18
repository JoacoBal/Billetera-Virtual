import { AxiosError } from "axios";
import { httpClient } from "./httpClient";
import type { Transaction } from "@/types";

export const performTransaction = async (data: Transaction) => {
    try {
        const result = await httpClient.post(
            `/transfer`,
            data
        );
        return result.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data
        }
        return { errors: { general: "Algo salió mal..." } }
    }
}

export const getTransactions = async (data: { page: number, per_page: number }) => {
    try {
        const response = await httpClient.get(
            `/transactions`,
            {
                params: {
                    page: data.page,
                    per_page: data.per_page,
                }
            }
        )
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data
        }
        return { errors: { general: "Algo salió mal..." } }
    }
}

export const performWithdraw = async (data : { cvu: string, amount: number}) => {
     try {
        // Falsear 2 segundos de demora
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const result = await httpClient.post(
            `/withdraw`,
            data
        );
        return result.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return { errors: { general: error.response?.data } }
        }
        return { errors: { general: "Algo salió mal..." } }
    }
}