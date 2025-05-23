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
        console.log(response)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data
        }
        return { errors: { general: "Algo salió mal..." } }
    }
}