import { useCallback, useContext, useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getRoomById } from "../../services/roomService"
import { getRoomReviews, createReview, updateReview, deleteReview, toggleLike, toggleDislike } from "../../services/reviewService"
import { getRoomAmenities } from "../../services/amenityService"
import WishlistButton from "../../components/WishlistButton"
import SkeletonLoader from "../../components/SkeletonLoader"
import AvailabilityCalendar from "../../components/AvailabilityCalendar"
import { AuthContext } from "../../context/AuthContext"
import { toast } from "../../components/Toast"
import ConfirmModal from "../../components/ConfirmModal"

import {
    Home as BedDouble,
    CreditCard as Wallet,
    Users,
    Box as Hotel,
    ArrowLeft,
    ThumbsUp,
    ThumbsDown,
    Star,
    CheckCircle,
    Wifi,
    Monitor,
    Shield,
    Wind,
    Coffee,
    Settings,
    MessageSquare,
    Pencil,
    Trash2,
    X,
    Loader2,
    Check
} from "lucide-react"

const AMENITY_ICON_MAP = {
    FiWifi: Wifi,
    wifi: Wifi,
    FiTv: Monitor,
    tv: Monitor,
    FiWind: Wind,
    wind: Wind,
    FiCoffee: Coffee,
    coffee: Coffee,
    FiShield: Shield,
    shield: Shield,
    lock: Shield,
    FiSettings: Settings,
}

function AmenityIcon({ name, size = 16 }) {
    const Icon = AMENITY_ICON_MAP[name] || Hotel
    return <Icon size={size} />
}

function InfoItem({ icon, label, value }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-500">
                {icon}
                <span>{label}</span>
            </div>
            <span className="font-semibold text-slate-900">{value}</span>
        </div>
    )
}

function RatingBar({ stars, count, total }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-3 text-slate-500 font-medium text-right">{stars}</span>
            <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="w-5 text-slate-400 text-right">{count}</span>
        </div>
    )
}

export default function RoomDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)

    const [selectedImage, setSelectedImage] = useState(0)
    const [room, setRoom] = useState(null)
    const [loading, setLoading] = useState(true)

    const [reviews, setReviews] = useState([])
    const [reviewsLoading, setReviewsLoading] = useState(true)
    const [rating, setRating] = useState(5)
    const [hoverRating, setHoverRating] = useState(0)
    const [title, setTitle] = useState("")
    const [comment, setComment] = useState("")
    const [submittingReview, setSubmittingReview] = useState(false)
    const [editingReview, setEditingReview] = useState(null)
    const [editForm, setEditForm] = useState({ rating: 5, title: "", comment: "" })
    const [savingEdit, setSavingEdit] = useState(false)
    const [deletingReviewId, setDeletingReviewId] = useState(null)
    const [confirmDeleteReviewId, setConfirmDeleteReviewId] = useState(null)

    const [reacting, setReacting] = useState(false)

    const [amenities, setAmenities] = useState([])
    const [amenitiesLoading, setAmenitiesLoading] = useState(true)

    const fetchRoom = useCallback(async () => {
        try {
            setLoading(true)
            const res = await getRoomById(id)
            setRoom(res?.data || null)
        } catch {
            toast.error("Failed to load room details")
        } finally {
            setLoading(false)
        }
    }, [id])

    const fetchReviews = useCallback(async () => {
        try {
            setReviewsLoading(true)
            const res = await getRoomReviews(id)
            setReviews(res?.data || [])
        } catch {
            console.error("Failed to load reviews")
        } finally {
            setReviewsLoading(false)
        }
    }, [id])

    const fetchAmenities = useCallback(async () => {
        try {
            setAmenitiesLoading(true)
            const res = await getRoomAmenities(id)
            setAmenities(res?.data || [])
        } catch {
            console.error("Failed to load amenities")
        } finally {
            setAmenitiesLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchRoom()
        fetchReviews()
        fetchAmenities()
    }, [fetchRoom, fetchReviews, fetchAmenities])

    const handleReaction = async (type) => {
        if (!user) { toast.warning("Please login to react"); return }
        if (reacting) return
        try {
            setReacting(true)
            if (type === "like") await toggleLike(id)
            else await toggleDislike(id)
            const res = await getRoomById(id)
            setRoom(res?.data || null)
        } catch {
            toast.error("Failed to update reaction")
        } finally {
            setReacting(false)
        }
    }

    const handleReviewSubmit = async (e) => {
        e.preventDefault()
        if (!comment.trim()) return
        try {
            setSubmittingReview(true)
            await createReview(id, { rating, title: title.trim() || undefined, comment })
            toast.success("Review submitted successfully!")
            setComment("")
            setTitle("")
            setRating(5)
            await Promise.all([fetchReviews(), fetchRoom()])
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit review")
        } finally {
            setSubmittingReview(false)
        }
    }

    const startEditReview = (review) => {
        setEditingReview(review)
        setEditForm({ rating: review.rating, title: review.title || "", comment: review.comment })
    }

    const handleUpdateReview = async (e) => {
        e.preventDefault()
        if (!editForm.comment.trim()) { toast.warning("Comment cannot be empty"); return }
        try {
            setSavingEdit(true)
            await updateReview(editingReview.id, editForm)
            toast.success("Review updated!")
            setEditingReview(null)
            await Promise.all([fetchReviews(), fetchRoom()])
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update review")
        } finally {
            setSavingEdit(false)
        }
    }

    const executeDeleteReview = async (reviewId) => {
        try {
            setDeletingReviewId(reviewId)
            await deleteReview(reviewId)
            toast.success("Review deleted")
            setConfirmDeleteReviewId(null)
            await Promise.all([fetchReviews(), fetchRoom()])
        } catch {
            toast.error("Failed to delete review")
        } finally {
            setDeletingReviewId(null)
        }
    }

    const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
        stars,
        count: reviews.filter(r => r.rating === stars).length
    }))

    const userHasReviewed = user && reviews.some(r => r.userId === user.id)

    if (loading) return <SkeletonLoader type="detail" />

    if (!room) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600">
                Room not found.
            </div>
        )
    }


    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-3 cursor-pointer transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900">Room {room.room_number}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm mt-2 text-slate-500">
                        <span className="capitalize">{room.room_type}</span>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                            <Star className="fill-amber-400 text-amber-400" size={15} />
                            <span className="font-semibold text-slate-800">{room.averageRating || 0}</span>
                            <span>({room.reviewCount || 0} reviews)</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${room.status === "available" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                            {room.status}
                        </span>
                    </div>
                </div>
                <WishlistButton roomId={room.id} size={24} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <img
                            src={
                                room.gallery?.length
                                    ? `http://localhost:3000/uploads/${room.gallery[selectedImage]?.image}`
                                    : "https://placehold.co/1200x700/f1f5f9/94a3b8?text=No+Image"
                            }
                            alt={`Room ${room.room_number}`}
                            className="w-full h-[420px] object-cover"
                        />
                        {room.gallery?.length > 1 && (
                            <div className="p-4 flex gap-3 overflow-x-auto">
                                {room.gallery.map((image, index) => (
                                    <button
                                        key={image.id}
                                        onClick={() => setSelectedImage(index)}
                                        className={`border-2 rounded-xl overflow-hidden shrink-0 transition cursor-pointer ${selectedImage === index ? "border-[#003580]" : "border-slate-200 hover:border-slate-400"}`}
                                    >
                                        <img
                                            src={`http://localhost:3000/uploads/${image.image}`}
                                            alt=""
                                            className="w-24 h-20 object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h2 className="font-bold text-lg text-slate-900 mb-4">Description</h2>
                        <p className="text-slate-600 leading-relaxed">{room.description || "No description available."}</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">What do you think of this room?</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Let other guests know your feedback</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleReaction("like")}
                                disabled={reacting}
                                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-semibold transition active:scale-95 cursor-pointer ${room.userReaction === "like"
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                            >
                                <ThumbsUp className={room.userReaction === "like" ? "fill-emerald-700" : ""} />
                                <span>{room.likesCount || 0}</span>
                            </button>
                            <button
                                onClick={() => handleReaction("dislike")}
                                disabled={reacting}
                                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-semibold transition active:scale-95 cursor-pointer ${room.userReaction === "dislike"
                                    ? "bg-rose-50 border-rose-500 text-rose-700"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                            >
                                <ThumbsDown className={room.userReaction === "dislike" ? "fill-rose-700" : ""} />
                                <span>{room.dislikesCount || 0}</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Guest Reviews</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                            </div>
                            {room.reviewCount > 0 && (
                                <div className="shrink-0 text-right">
                                    <p className="text-3xl font-black text-slate-900">{room.averageRating}</p>
                                    <div className="flex items-center gap-0.5 justify-end mt-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={12}
                                                className={i < Math.round(room.averageRating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5">out of 5</p>
                                </div>
                            )}
                        </div>

                        {room.reviewCount > 0 && (
                            <div className="space-y-1.5 bg-slate-50 rounded-2xl p-4">
                                {ratingDistribution.map(({ stars, count }) => (
                                    <RatingBar key={stars} stars={stars} count={count} total={reviews.length} />
                                ))}
                            </div>
                        )}

                        {reviewsLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-slate-50 animate-pulse space-y-2">
                                        <div className="flex gap-3 items-start">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 bg-slate-200 rounded w-1/4" />
                                                <div className="h-3 bg-slate-200 rounded w-3/4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl">
                                <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-sm text-slate-500 font-medium">No reviews yet</p>
                                <p className="text-xs text-slate-400 mt-1">Be the first to review this room!</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                                {reviews.map(rev => {
                                    const isOwn = user && rev.userId === user.id
                                    return (
                                    <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3.5 items-start">
                                        {rev.user?.avatar ? (
                                            <img
                                                src={`http://localhost:3000/uploads/${rev.user.avatar}`}
                                                alt={rev.user.name}
                                                className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[#003580] flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                {rev.user?.name?.[0]?.toUpperCase() || "U"}
                                            </div>
                                        )}
                                        <div className="flex-1 space-y-1 min-w-0">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-800 text-sm">{rev.user?.name || "Deleted User"}</span>
                                                    {rev.isVerified && (
                                                        <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                            <CheckCircle size={10} />
                                                            Verified Booker
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[11px] text-slate-400">
                                                        {new Date(rev.createdAt).toLocaleDateString("id-ID")}
                                                    </span>
                                                    {isOwn && (
                                                        <>
                                                            <button
                                                                onClick={() => startEditReview(rev)}
                                                                className="p-1.5 text-slate-400 hover:text-[#003580] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                                title="Edit review"
                                                            >
                                                                <Pencil size={12} />
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmDeleteReviewId(rev.id)}
                                                                disabled={deletingReviewId === rev.id}
                                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                                title="Delete review"
                                                            >
                                                                {deletingReviewId === rev.id
                                                                    ? <Loader2 size={12} className="animate-spin" />
                                                                    : <Trash2 size={12} />}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={13}
                                                        className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                                                    />
                                                ))}
                                            </div>
                                            {rev.title && (
                                                <p className="font-semibold text-slate-800 text-sm">{rev.title}</p>
                                            )}
                                            <p className="text-slate-600 text-xs leading-relaxed mt-0.5">{rev.comment}</p>
                                        </div>
                                    </div>
                                    )
                                })}
                            </div>
                        )}

                        {user && !userHasReviewed && (
                            <form onSubmit={handleReviewSubmit} className="pt-4 border-t border-slate-100 space-y-4">
                                <h4 className="font-bold text-slate-800 text-sm">Write a Review</h4>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-500 font-semibold block">Your Rating</label>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="transition-transform hover:scale-110 cursor-pointer"
                                            >
                                                <Star
                                                    size={24}
                                                    className={star <= (hoverRating || rating)
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-slate-300"
                                                    }
                                                />
                                            </button>
                                        ))}
                                        <span className="ml-2 text-xs font-semibold text-slate-500">
                                            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hoverRating || rating]}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-500 font-semibold block">Title (optional)</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="e.g. Great stay, loved the room!"
                                        className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-slate-400 bg-slate-50/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-500 font-semibold block" htmlFor="comment">Your Comment *</label>
                                    <textarea
                                        id="comment"
                                        rows={3}
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        placeholder="Tell us about your stay and experience..."
                                        className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-slate-400 bg-slate-50/50"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submittingReview || !comment.trim()}
                                    className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold px-5 py-2.5 rounded-2xl transition disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
                                >
                                    {submittingReview ? "Submitting..." : "Submit Review"}
                                </button>
                            </form>
                        )}

                        {user && userHasReviewed && (
                            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-2xl p-3">
                                <CheckCircle size={16} />
                                <span className="font-medium">You've already reviewed this room.</span>
                            </div>
                        )}

                        {!user && (
                            <div className="pt-4 border-t border-slate-100 text-center py-4">
                                <p className="text-sm text-slate-500">
                                    <button onClick={() => navigate("/login")} className="text-[#003580] font-semibold hover:underline cursor-pointer">
                                        Login
                                    </button>
                                    {" "}to write a review
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-24">
                        <p className="text-sm text-slate-500">Price Per Night</p>
                        <h2 className="text-3xl font-bold text-emerald-600 mt-1">
                            Rp {Number(room.price_per_night).toLocaleString("id-ID")}
                        </h2>
                        <button
                            onClick={() => navigate(`/user/book/${room.id}`)}
                            disabled={room.status !== "available"}
                            className="w-full mt-5 bg-[#003580] hover:bg-[#00224f] disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-2xl font-semibold transition cursor-pointer text-sm"
                        >
                            {room.status === "available" ? "Book Now" : "Unavailable"}
                        </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Room Information</h3>
                        <div className="space-y-4">
                            <InfoItem icon={<Hotel size={18} />} label="Room Number" value={room.room_number} />
                            <InfoItem icon={<BedDouble size={18} />} label="Room Type" value={<span className="capitalize">{room.room_type}</span>} />
                            <InfoItem icon={<Wallet size={18} />} label="Price" value={`Rp ${Number(room.price_per_night).toLocaleString("id-ID")}`} />
                            <InfoItem icon={<Users size={18} />} label="Capacity" value={room.capacity ? `${room.capacity} Guests` : "-"} />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Room Amenities</h3>
                        {amenitiesLoading ? (
                            <div className="grid grid-cols-2 gap-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-12 bg-slate-200 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : amenities.length === 0 ? (
                            <div className="text-center py-6">
                                <Settings size={24} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-sm text-slate-400">No amenities listed</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {amenities.map(amenity => (
                                    <div key={amenity.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs flex items-center gap-2 font-medium text-slate-700">
                                        <span className="text-[#003580]">
                                            <AmenityIcon name={amenity.icon} size={15} />
                                        </span>
                                        {amenity.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Settings size={16} className="text-[#003580]" />
                            Availability Calendar
                        </h3>
                        <div className={`flex items-center gap-2 text-xs font-semibold mb-3 ${room.status === "available" ? "text-emerald-600" : "text-rose-600"}`}>
                            <div className={`w-2 h-2 rounded-full ${room.status === "available" ? "bg-emerald-500" : "bg-rose-500"} animate-pulse`} />
                            {room.status === "available" ? "Available for Booking" : "Currently Unavailable"}
                        </div>
                        <AvailabilityCalendar roomId={id} compact />
                        {room.status === "available" && (
                            <button
                                onClick={() => navigate(`/user/book/${room.id}`)}
                                className="w-full mt-3 bg-[#003580] hover:bg-[#00224f] text-white py-2.5 rounded-xl font-semibold transition text-sm cursor-pointer"
                            >
                                Book Now
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Inline Edit Review Modal */}
            {editingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="font-bold text-slate-900">Edit Your Review</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Room {room.room_number}</p>
                            </div>
                            <button onClick={() => setEditingReview(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateReview} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Rating</label>
                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} type="button" onClick={() => setEditForm(f => ({ ...f, rating: star }))} className="transition-transform hover:scale-110 cursor-pointer">
                                            <Star size={24} className={star <= editForm.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-xs font-semibold text-slate-500">
                                        {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][editForm.rating]}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Title (optional)</label>
                                <input type="text" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Great stay!" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#003580]" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Comment *</label>
                                <textarea value={editForm.comment} onChange={e => setEditForm(f => ({ ...f, comment: e.target.value }))} rows={4} placeholder="Share your experience..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#003580] resize-none" required />
                            </div>
                            <div className="flex items-center gap-3 pt-1">
                                <button type="button" onClick={() => setEditingReview(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
                                <button type="submit" disabled={savingEdit} className="flex-1 py-2.5 rounded-xl bg-[#003580] text-white text-sm font-semibold hover:bg-[#00224f] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
                                    {savingEdit ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Check size={14} /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDeleteReviewId !== null}
                title="Delete Review"
                message="Are you sure you want to delete your review? This action cannot be undone."
                onConfirm={() => executeDeleteReview(confirmDeleteReviewId)}
                onCancel={() => setConfirmDeleteReviewId(null)}
                confirmText="Yes, Delete"
                type="danger"
            />
        </div>
    )
}