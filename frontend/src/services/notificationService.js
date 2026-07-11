import api from './api'

export const getMyNotifications = async (page = 1, limit = 10) => {
    const response = await api.get(`/notifications/me?page=${page}&limit=${limit}`)
    return response.data
}

export const getUnreadCount = async () => {
    const response = await api.get('/notifications/unread-count')
    return response.data
}

export const markAsRead = async (id) => {
    const response = await api.patch(`/notifications/${id}/read`)
    return response.data
}

export const markAllAsRead = async () => {
    const response = await api.patch('/notifications/mark-all-read')
    return response.data
}

export const deleteNotification = async (id) => {
    const response = await api.delete(`/notifications/${id}`)
    return response.data
}

export const clearAllNotifications = async () => {
    const response = await api.delete('/notifications')
    return response.data
}