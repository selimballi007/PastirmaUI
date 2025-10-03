import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    accessToken: string | null;
    isLoggedIn: boolean;
    user: User | null;
}

const initialState: AuthState = {
    accessToken: null,
    isLoggedIn: false,
    user: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ accessToken: string; user: User }>) => {
            state.accessToken = action.payload.accessToken
            state.user = action.payload.user
            state.isLoggedIn = true;
        },
        logout: (state) => {
            state.accessToken = null;
            state.user = null;
            state.isLoggedIn = false;
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;