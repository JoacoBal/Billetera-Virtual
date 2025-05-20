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