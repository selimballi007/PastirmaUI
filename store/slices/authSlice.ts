import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { User, AuthState } from "../../types"

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