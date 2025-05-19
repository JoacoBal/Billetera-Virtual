export interface User {
    dni: string;
    name: string;
    lastName: string;
    email: string;
    phone: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    confirm_password: string;
}