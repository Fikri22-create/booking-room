import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, Users, ArrowRight, Trash2 } from 'lucide-react'
import { getMyWishlist, clearWishlist } from '../../services/wishlistService'
import { toast } from '../../components/Toast'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'
import WishlistButton from '../../components/WishlistButton'
import ConfirmModal from '../../components/ConfirmModal'

export default function Wishlist() {
    const [wishlist, setWishlist] = useState([])
    const [loading, setLoading] = useState(true)
    const [clearing, setClearing] = useState(false)

    const [showConfirm, setShowConfirm] = useState(false)

    const fetchWishlist = async () => {
        try {
            setLoading(true)
            const response = await getMyWishlist()
            setWishlist(response.data)
        } catch (error) {
            console.error('Failed to fetch wishlist:', error)
            toast.error('Failed to fetch wishlist')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchWishlist() }, [])

    const handleClearAll = async () => {
        try {
            setClearing(true)
            await clearWishlist()
            setWishlist([])
            toast.success('Wishlist cleared')
        } catch (error) {
            console.error('Failed to clear wishlist:', error)
            toast.error('Failed to clear wishlist')
        } finally {
            setClearing(false)
            setShowConfirm(false)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Wishlist</h1>
                    <p className="text-sm text-slate-500 mt-1">
                         {loading ? 'Loading...' : `${wishlist.length} saved room${wishlist.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
                {!loading && wishlist.length > 0 && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={clearing}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50 border border-transparent hover:border-rose-100"
                    >
                        <Trash2 size={15} />
                        {clearing ? 'Clearing...' : 'Clear All'}
                    </button>
                )}
            </div>

            {/* Loading */}
            {loading ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonLoader key={i} type="card" />
                    ))}
                </div>
            ) : wishlist.length === 0 ? (
                <EmptyState
                    icon="wishlist"
                    title="Your wishlist is empty"
                    description="Browse rooms and tap the heart icon to save your favourites here."
                    actionLabel="Browse Rooms"
                    onAction={() => window.location.href = '/user/rooms'}
                />
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {wishlist.map((item) => (
                        <WishlistCard key={item.id} item={item} />
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleClearAll}
                title="Clear Wishlist"
                message="Are you sure you want to clear your entire wishlist? This action cannot be undone."
                confirmText="Clear All"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    )
}

function WishlistCard({ item }) {
    const { room } = item
    const image = room.gallery?.[0]?.image
        ? `http://localhost:3000/uploads/${room.gallery[0].image}`
        : room.image
        ? `http://localhost:3000/uploads/${room.image}`
        : null

    const typeColor = {
        standard: "bg-slate-100 text-slate-600",
        deluxe:   "bg-[#003580]/10 text-[#003580]",
        suite:    "bg-amber-100 text-amber-700",
    }[room.room_type] ?? "bg-slate-100 text-slate-600"

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            {/* Image */}
            <div className="h-48 bg-slate-100 overflow-hidden relative">
                {image ? (
                    <img
                        src={image}
                        alt={`Room ${room.room_number}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Heart size={40} className="text-slate-300" />
                    </div>
                )}
                <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize ${typeColor}`}>
                    {room.room_type}
                </span>
                <div className="absolute top-3 right-3">
                    <WishlistButton roomId={room.id} />
                </div>
            </div>

            {/* Body */}
            <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-bold text-slate-900">Room {room.room_number}</h2>
                    {(room.averageRating || room.reviewCount > 0) && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-slate-700">{room.averageRating || 0}</span>
                            <span>({room.reviewCount || 0})</span>
                        </div>
                    )}
                </div>

                {room.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                        {room.description}
                    </p>
                )}

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                    <Users size={13} />
                    <span>{room.capacity} guests max</span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400">Per night</p>
                        <p className="text-lg font-bold text-[#003580]">
                            Rp {Number(room.price_per_night).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <Link
                        to={`/user/rooms/${room.id}`}
                        className="flex items-center gap-1.5 bg-[#003580] hover:bg-[#002a66] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    >
                        View <ArrowRight size={13} />
                    </Link>
                </div>
            </div>
        </div>
    )
}