import api from "./api";

export const createBooking = async (data) => {
    const response = await api.post("/bookings", data);
    return response.data;
};
export const getMyBookings = async (params = {}) => {
    const response = await api.get("/bookings/me", { params });
    return response.data;
};
export const cancelBooking = async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
};