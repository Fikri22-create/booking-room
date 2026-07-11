import api from './api'

export const getMyWishlist = async () => {
    const response = await api.get('/wishlist/me')
    return response.data
}

export const toggleWishlist = async (roomId) => {
    const response = await api.post('/wishlist/toggle', { roomId })
    return response.data
}

export const checkWishlistStatus = async (roomId) => {
    const response = await api.get(`/wishlist/check/${roomId}`)
    return response.data
}

export const clearWishlist = async () => {
    const response = await api.delete('/wishlist/clear')
    return response.data
}