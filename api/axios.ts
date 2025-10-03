import axios from "axios";
import { store } from "../store";
import { setCredentials, logout } from "../store/slices/authSlice";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true
});

//If there is an access token, add it to the header
api.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: 401 → Get new access token with refresh token
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshRes = await axios.post(
                    process.env.NEXT_PUBLIC_API_URL + "user/refresh-token",
                    {},
                    {
                        withCredentials: true,
                        headers: { Authorization: `Bearer ${store.getState().auth.accessToken}` }
                    }
                );
                const newAccessToken = refreshRes.data.accessToken;
                store.dispatch(setCredentials(newAccessToken));
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch {
                store.dispatch(logout());
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default api;