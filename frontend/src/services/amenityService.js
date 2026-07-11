import api from './api'

export const getAllAmenities = async () => {
    const response = await api.get('/amenities')
    return response.data
}

// Alias for backward compatibility with Amenities.jsx
export const getAmenities = getAllAmenities

export const getAmenityById = async (id) => {
    const response = await api.get(`/amenities/${id}`)
    return response.data
}

export const createAmenity = async (amenityData) => {
    const response = await api.post('/amenities', amenityData)
    return response.data
}

export const updateAmenity = async (id, amenityData) => {
    const response = await api.put(`/amenities/${id}`, amenityData)
    return response.data
}

export const deleteAmenity = async (id) => {
    const response = await api.delete(`/amenities/${id}`)
    return response.data
}

export const restoreAmenity = async (id) => {
    const response = await api.post(`/amenities/${id}/restore`)
    return response.data
}

export const permanentDeleteAmenity = async (id) => {
    const response = await api.delete(`/amenities/${id}/permanent`)
    return response.data
}

export const assignAmenityToRoom = async (roomId, amenityIds) => {
    const response = await api.post('/amenities/assign-to-room', { roomId, amenityIds })
    return response.data
}

export const getRoomAmenities = async (roomId) => {
    const response = await api.get(`/amenities/room/${roomId}`)
    return response.data
}