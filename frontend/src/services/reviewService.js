import api from "./api";

export const getRoomReviews = async (roomId) => {
    const response = await api.get(`/rooms/${roomId}/reviews`);
    return response.data;
};

export const createReview = async (roomId, data) => {
    const response = await api.post(`/rooms/${roomId}/reviews`, data);
    return response.data;
};

export const updateReview = async (reviewId, data) => {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
};

export const toggleLike = async (roomId) => {
    const response = await api.post(`/rooms/${roomId}/like`);
    return response.data;
};

export const toggleDislike = async (roomId) => {
    const response = await api.post(`/rooms/${roomId}/dislike`);
    return response.data;
};

export const deleteReview = async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
};

export const getAllReviews = async (params = {}) => {
    const response = await api.get("/reviews", { params });
    return response.data;
};

export const hideReview = async (reviewId) => {
    const response = await api.patch(`/reviews/${reviewId}/hide`);
    return response.data;
};

export const getUserReviews = async () => {
    const response = await api.get("/my-reviews");
    return response.data;
};
