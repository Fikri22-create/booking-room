import api from "./api";

export const getRooms = async (params = {}) => {
    const response = await api.get("/rooms", { params });
    return response.data;
};
export const createRoom = async (formData) => {
    const response = await api.post("/rooms", formData, { headers: { "Content-Type": "multipart/form-data" } });
    return response.data;
};
export const getRoomById = async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
};
export const updateRoom = async (id, formData) => {
    const response = await api.put(`/rooms/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    return response.data;
};
export const deleteRoom = async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
};
export const getRoomGallery = async (roomId) => {
    const response = await api.get(`/rooms/${roomId}/gallery`);
    return response.data;
};
export const uploadRoomGallery = async (roomId, formData) => {
    const response = await api.post(`/rooms/${roomId}/gallery`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    return response.data;
};
export const deleteGalleryImage = async (galleryId) => {
    const response = await api.delete(`/rooms/gallery/${galleryId}`);
    return response.data;
};
export const getAvailableRooms = async (check_in, check_out) => {
    const response = await api.get("/rooms/available", { params: { check_in, check_out } });
    return response.data;
};
export const getRoomBookedDates = async (roomId) => {
    const response = await api.get(`/rooms/${roomId}/booked-dates`);
    return response.data;
};
export const exportRoomsExcel = async () => {
    const response = await api.get("/rooms/export/excel", { responseType: "blob" });
    return response;
};
export const getRoomBookings = async (roomId) => {
    const response = await api.get(`/rooms/${roomId}/bookings`);
    return response.data;
};
export const getDeletedRooms = async () => {
    const response = await api.get("/rooms/deleted");
    return response.data;
};
export const restoreRoom = async (id) => {
    const response = await api.post(`/rooms/${id}/restore`);
    return response.data;
};
export const permanentDeleteRoom = async (id) => {
    const response = await api.delete(`/rooms/${id}/permanent`);
    return response.data;
};