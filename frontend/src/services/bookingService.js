import api from "./api";

export const getBookings = async (params) => {
    const response = await api.get("/bookings",{ params });
    return response.data;
};
export const getBookingById = async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
};
export const updateBookingStatus = async (id,status
    ) => {
        const response = await api.put(`/bookings/${id}/status`,{ status });
        return response.data;
};
export const exportBookingsExcel = async () => {
    const response = await api.get("/bookings/export/excel",{responseType: "blob"});
    return response;
};