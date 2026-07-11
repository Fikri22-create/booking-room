import { 
    Calendar, 
    Heart, 
    Bell, 
    CreditCard, 
    Home, 
    Users, 
    FileText, 
    Star,
    Search,
    AlertCircle
} from 'lucide-react'

const icons = {
    bookings: Calendar,
    wishlist: Heart,
    notifications: Bell,
    payments: CreditCard,
    rooms: Home,
    users: Users,
    reviews: Star,
    audit: FileText,
    search: Search,
    default: AlertCircle
}

export default function EmptyState({ 
    icon = "default",
    title = "No data found",
    description = "There's nothing to show here yet.",
    actionLabel,
    onAction,
    className = ""
}) {
    const IconComponent = icons[icon] || icons.default

    return (
        <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <IconComponent className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 mb-6 max-w-md">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    )
}