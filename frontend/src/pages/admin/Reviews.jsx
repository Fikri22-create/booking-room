import { useEffect, useMemo, useState, useCallback } from "react"
import { getAllReviews, deleteReview, hideReview } from "../../services/reviewService"
import { Search, MessageSquare, Star, Trash2, Loader2, EyeOff, Eye, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { toast } from "../../components/Toast"
import StatCard from "../../components/StatCard"
import ConfirmModal from "../../components/ConfirmModal"

export default function AdminReviews() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterRating, setFilterRating] = useState("")
    const [filterHidden, setFilterHidden] = useState("")
    const [page, setPage] = useState(1)
    const [totalPage, setTotalPage] = useState(1)
    const [totalData, setTotalData] = useState(0)
    const [processingId, setProcessingId] = useState(null)
    const LIMIT = 15

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true)
            const params = { page, limit: LIMIT }
            if (filterRating) params.rating = filterRating
            if (filterHidden !== "") params.isHidden = filterHidden
            const res = await getAllReviews(params)
            setReviews(res.data || [])
            setTotalPage(res.totalPage || 1)
            setTotalData(res.totalData || 0)
        } catch {
            toast.error("Failed to fetch reviews")
        } finally {
            setLoading(false)
        }
    }, [page, filterRating, filterHidden])

    useEffect(() => {
        fetchReviews()
    }, [fetchReviews])

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteTargetId, setDeleteTargetId] = useState(null)

    const handleDeleteClick = (id) => {
        setDeleteTargetId(id)
        setShowDeleteConfirm(true)
    }

    const confirmDelete = async () => {
        if (!deleteTargetId) return
        try {
            setProcessingId(deleteTargetId)
            await deleteReview(deleteTargetId)
            toast.success("Review deleted successfully")
            fetchReviews()
        } catch {
            toast.error("Failed to delete review")
        } finally {
            setProcessingId(null)
            setShowDeleteConfirm(false)
            setDeleteTargetId(null)
        }
    }

    const handleToggleHide = async (review) => {
        try {
            setProcessingId(review.id)
            await hideReview(review.id)
            toast.success(review.isHidden ? "Review is now visible to guests" : "Review hidden from guests")
            fetchReviews()
        } catch {
            toast.error("Failed to update review visibility")
        } finally {
            setProcessingId(null)
        }
    }

    const filteredReviews = useMemo(() => {
        if (!search) return reviews
        const kw = search.toLowerCase()
        return reviews.filter(r =>
            r.user?.name?.toLowerCase().includes(kw) ||
            r.user?.email?.toLowerCase().includes(kw) ||
            r.room?.room_number?.toLowerCase().includes(kw) ||
            r.comment?.toLowerCase().includes(kw) ||
            r.title?.toLowerCase().includes(kw)
        )
    }, [reviews, search])

    const totalReviews = totalData
    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
        return Number((sum / reviews.length).toFixed(1))
    }, [reviews])

    const hiddenCount = reviews.filter(r => r.isHidden).length

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Reviews & Moderation</h1>
                <p className="text-sm text-slate-500 mt-1">Manage and moderate guest reviews.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Reviews" value={totalReviews} icon={<MessageSquare size={20} />} color="blue" />
                <StatCard title="Average Rating" value={`${averageRating} / 5`} icon={<Star size={20} className="fill-amber-400 text-amber-400" />} color="amber" />
                <StatCard title="Hidden Reviews" value={hiddenCount} icon={<EyeOff size={20} />} color="rose" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative sm:col-span-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, room, comment..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]/20"
                    />
                </div>
                <div className="relative">
                    <Star size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        value={filterRating}
                        onChange={e => { setFilterRating(e.target.value); setPage(1) }}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#003580] appearance-none cursor-pointer"
                    >
                        <option value="">All Ratings</option>
                        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                    </select>
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        value={filterHidden}
                        onChange={e => { setFilterHidden(e.target.value); setPage(1) }}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#003580] appearance-none cursor-pointer"
                    >
                        <option value="">All Status</option>
                        <option value="false">Visible</option>
                        <option value="true">Hidden</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="space-y-0">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 animate-pulse">
                                <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                                </div>
                                <div className="w-12 h-6 bg-slate-200 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="py-20 text-center">
                        <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500 font-semibold">No reviews found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting search or filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-left">Guest</th>
                                    <th className="px-6 py-4 text-left">Room</th>
                                    <th className="px-6 py-4 text-left">Rating</th>
                                    <th className="px-6 py-4 text-left">Review</th>
                                    <th className="px-6 py-4 text-left">Status</th>
                                    <th className="px-6 py-4 text-left">Date</th>
                                    <th className="px-6 py-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredReviews.map(review => (
                                    <tr key={review.id} className={`hover:bg-slate-50 transition-colors ${review.isHidden ? "opacity-60" : ""}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {review.user?.avatar ? (
                                                    <img
                                                        src={`http://localhost:3000/uploads/${review.user.avatar}`}
                                                        alt={review.user.name}
                                                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-[#003580] flex items-center justify-center text-white text-xs font-bold">
                                                        {review.user?.name?.[0]?.toUpperCase() || "U"}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-800">{review.user?.name || "Deleted User"}</p>
                                                    <p className="text-xs text-slate-400">{review.user?.email || "-"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-800">Room {review.room?.room_number || "Deleted"}</p>
                                            <p className="text-xs text-slate-400 capitalize">{review.room?.room_type || "-"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={13}
                                                        className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                                                    />
                                                ))}
                                                <span className="ml-1 text-xs font-semibold text-slate-600">{review.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 max-w-xs">
                                            {review.title && (
                                                <p className="font-semibold text-slate-800 text-xs mb-0.5">{review.title}</p>
                                            )}
                                            <p className="text-xs line-clamp-2" title={review.comment}>{review.comment}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${review.isHidden
                                                ? "bg-slate-100 text-slate-500"
                                                : "bg-emerald-100 text-emerald-700"
                                            }`}>
                                                {review.isHidden ? "Hidden" : "Visible"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString("id-ID") : "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleToggleHide(review)}
                                                    disabled={processingId === review.id}
                                                    title={review.isHidden ? "Make visible" : "Hide review"}
                                                    className={`p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${review.isHidden
                                                        ? "text-emerald-600 hover:bg-emerald-50"
                                                        : "text-slate-500 hover:bg-slate-100"
                                                    }`}
                                                >
                                                    {processingId === review.id
                                                        ? <Loader2 size={15} className="animate-spin" />
                                                        : review.isHidden
                                                            ? <Eye size={15} />
                                                            : <EyeOff size={15} />
                                                    }
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(review.id)}
                                                    disabled={processingId === review.id}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {totalPage > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">Page {page} of {totalPage}</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPage, p + 1))}
                            disabled={page === totalPage}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false)
                    setDeleteTargetId(null)
                }}
                onConfirm={confirmDelete}
                title="Delete Review"
                message="Are you sure you want to permanently delete this review? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    )
}
