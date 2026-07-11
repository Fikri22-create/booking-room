import api from "./api";

export const getDashboardStats = async () => {
    const response = await api.get("/dashboard");
    return response.data;
};
export const getBookingsPerMonth = async () => {
    const response = await api.get("/dashboard/bookings-per-month");
    return response.data;
};
export const getTopRooms = async () => {
    const response = await api.get("/dashboard/top-rooms");
    return response.data;
};
export const getRevenuePerMonth =
    async () => {
        const response = await api.get("/dashboard/revenue-per-month");
        return response.data;
    };
export const getUserDashboardStats = async () => {
    const response = await api.get("/dashboard/user");
    return response.data;
};