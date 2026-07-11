import api from './api'

export const getAllAuditLogs = async (params) => {
    const response = await api.get('/audit-logs', { params })
    return response.data
}

export const getAuditLogById = async (id) => {
    const response = await api.get(`/audit-logs/${id}`)
    return response.data
}

export const getMyAuditLogs = async (params) => {
    const response = await api.get('/audit-logs/me', { params })
    return response.data
}

export const getAuditStats = async () => {
    const response = await api.get('/audit-logs/stats')
    return response.data
}