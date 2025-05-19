import type { LoginData, RegisterData, User } from "@/types"
import { httpClient } from "./httpClient"
import { AxiosError } from "axios";

export const onSignIn = async (data: LoginData) => {
    try {
        const result = await httpClient.post("/login", data);
        return result.data;
    } catch(error) {
        return { errors: { general: "Algo salió mal..." } }
    }
}

export const onSignUp = async (data: RegisterData & User) => {
    if(data.password != data.confirm_password) return { errors: { "password": "Las contraseñas no coinciden" } }
    
    try {
        const result = await httpClient.post("/register", data);
        return result.data;
    } catch(error) {
        if(error instanceof AxiosError) {
            return error.response?.data
        }
        return { errors: { general: "Algo salió mal..." } }
    }
}