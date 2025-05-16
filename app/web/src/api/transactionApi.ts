import { httpClient } from "./httpClient";

export const performTransaction = async () => {
    await httpClient.post(
            `/transactions`
    );
}