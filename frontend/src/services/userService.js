import api from "./api";

export const getUsers = async () => {
    const response = await api.get("/users");
    return response.data;
};

export const getUserById = async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

export const getMyProfile = async () => {
    const response = await api.get("/users/profile");
    return response.data;
};

export const updateMyProfile = async (formData) => {
    const response = await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};

export const changePassword = async (data) => {
    const response = await api.put("/users/profile/password", data);
    return response.data;
};
export const exportUsersExcel = async () => {
    const response = await api.get("/users/export/excel", { responseType: "blob" });
    return response;
};