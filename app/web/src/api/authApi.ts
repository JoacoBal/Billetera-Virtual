import type { LoginData, RegisterData, User } from "@/types"
import { httpClient } from "./httpClient"

export const onSignIn = async (data: LoginData) => {
    const result = await httpClient.post("/login", data);
    return result;
}

export const onSignUp = async (data: RegisterData & User) => {
    if(data.password != data.confirm_password) return { errors: { "password": "Las contraseñas no coinciden" } }
    
    try {
        const result = await httpClient.post("/register", data);
        return result.data;
    } catch(error) {
        return { errors: { general: "Algo salió mal..." } }
    }
}