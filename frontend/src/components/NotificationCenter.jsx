import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react'
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../services/notificationService'
import { toast } from './Toast'
import EmptyState from './EmptyState'
import SkeletonLoader from './SkeletonLoader'

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const dropdownRef = useRef(null)

    const fetchUnreadCount = async () => {
        try {
            const response = await getUnreadCount()
            setUnreadCount(response.count)
        } catch (error) {
            console.error('Failed to fetch unread count:', error)
        }
    }

    const fetchNotifications = async (pageNum = 1, append = false) => {
        try {
            setLoading(true)
            const response = await getMyNotifications(pageNum, 10)
            if (append) {
                setNotifications(prev => [...prev, ...response.data])
            } else {
                setNotifications(response.data)
            }
            setHasMore(pageNum < response.totalPage)
            setPage(pageNum)
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
            toast.error('Failed to fetch notifications')
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id)
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === id ? { ...notif, isRead: true } : notif
                )
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Failed to mark as read:', error)
            toast.error('Failed to mark as read')
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead()
            setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
            setUnreadCount(0)
            toast.success('All notifications marked as read')
        } catch (error) {
            console.error('Failed to mark all as read:', error)
            toast.error('Failed to mark all as read')
        }
    }

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id)
            setNotifications(prev => prev.filter(notif => notif.id !== id))
            toast.success('Notification deleted')
        } catch (error) {
            console.error('Failed to delete notification:', error)
            toast.error('Failed to delete notification')
        }
    }

    useEffect(() => {
        fetchUnreadCount()
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (isOpen && notifications.length === 0) {
            fetchNotifications()
        }
    }, [isOpen, notifications.length])

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const loadMore = () => {
        if (hasMore && !loading) {
            fetchNotifications(page + 1, true)
        }
    }

    const getNotificationIcon = (type) => {
        const icons = {
            booking: '📅',
            payment: '💳',
            system: '🔔',
            review: '⭐'
        }
        return icons[type] || '🔔'
    }

    const formatRelativeTime = (date) => {
        const now = new Date()
        const notifDate = new Date(date)
        const diffInHours = Math.floor((now - notifDate) / (1000 * 60 * 60))
        
        if (diffInHours < 1) return 'Just now'
        if (diffInHours < 24) return `${diffInHours}h ago`
        
        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 7) return `${diffInDays}d ago`
        
        return notifDate.toLocaleDateString()
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-96 flex flex-col">
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    <CheckCheck size={12} />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-4">
                                <SkeletonLoader type="table" rows={3} columns={1} />
                            </div>
                        ) : notifications.length === 0 ? (
                            <EmptyState
                                icon="notifications"
                                title="No notifications"
                                description="You're all caught up! New notifications will appear here."
                                className="py-8"
                            />
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-slate-50 transition-colors ${
                                            !notification.isRead ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-lg">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <p className="font-medium text-slate-900 text-sm">
                                                        {notification.title}
                                                    </p>
                                                    <div className="flex items-center gap-1 ml-2">
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                className="text-blue-600 hover:text-blue-700 p-1"
                                                                title="Mark as read"
                                                            >
                                                                <Check size={12} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(notification.id)}
                                                            className="text-red-600 hover:text-red-700 p-1"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-2">
                                                    {formatRelativeTime(notification.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {hasMore && (
                                    <div className="p-4 text-center">
                                        <button
                                            onClick={loadMore}
                                            disabled={loading}
                                            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-slate-400"
                                        >
                                            {loading ? 'Loading...' : 'Load more'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}