import api from "../../../api/axios";

export async function logoutApi() {
    return api.post("/user/logout");
}