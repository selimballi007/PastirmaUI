export type User = {
    id: string;
    username: string;
    email: string;
    role: string;
    lastLoginAt: string;
};

export type AuthState = {
    accessToken: string | null;
    isLoggedIn: boolean;
    user: User | null;
}

export type Product = {
    id: string;
    name: string;
};