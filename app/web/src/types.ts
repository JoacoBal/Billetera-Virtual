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

export interface Wallet {
    cvu: string,
    dni_owner: string,
    alias: string,
    balance: number,
    type: string
}

export interface Transaction {
    origin_cvu: string;
    destination_cvu: string;
    amount: number;
    description?: string;
}