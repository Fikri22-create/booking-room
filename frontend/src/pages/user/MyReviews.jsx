import { useCallback, useEffect, useState } from "react"
import { getUserReviews, updateReview, deleteReview } from "../../services/reviewService"
import { Star, Pencil, Trash2, Loader2, MessageSquare, X, Check } from "lucide-react"
import { toast } from "../../components/Toast"
import ConfirmModal from "../../components/ConfirmModal"

export default function MyReviews() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingReview, setEditingReview] = useState(null)
    const [editForm, setEditForm] = useState({ rating: 5, title: "", comment: "" })
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true)
            const res = await getUserReviews()
            setReviews(res.data || [])
        } catch {
            toast.error("Failed to load your reviews")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchReviews()
    }, [fetchReviews])

    const startEdit = (review) => {
        setEditingReview(review)
        setEditForm({
            rating: review.rating,
            title: review.title || "",
            comment: review.comment
        })
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        if (!editForm.comment.trim()) {
            toast.warning("Comment cannot be empty")
            return
        }
        try {
            setSaving(true)
            await updateReview(editingReview.id, editForm)
            toast.success("Review updated successfully!")
            setEditingReview(null)
            fetchReviews()
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update review")
        } finally {
            setSaving(false)
        }
    }

    const executeDelete = async (id) => {
        try {
            setDeletingId(id)
            await deleteReview(id)
            toast.success("Review deleted")
            setReviews(prev => prev.filter(r => r.id !== id))
            setConfirmDelete(null)
        } catch {
            toast.error("Failed to delete review")
        } finally {
            setDeletingId(null)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                    <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-72 bg-slate-200 rounded mt-2 animate-pulse" />
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
                            <div className="flex-1 space-y-3">
                                <div className="h-4 bg-slate-200 rounded w-1/3" />
                                <div className="h-3 bg-slate-200 rounded w-1/4" />
                                <div className="h-3 bg-slate-200 rounded w-2/3" />
                                <div className="h-3 bg-slate-200 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">My Reviews</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Manage reviews you've submitted for your stays.
                </p>
            </div>

            {reviews.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-20 text-center">
                    <MessageSquare size={40} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="font-semibold text-slate-600 text-base">No reviews yet</h3>
                    <p className="text-xs text-slate-400 mt-1">
                        After completing a stay, you can write a review from the Room Detail page.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div
                            key={review.id}
                            className={`bg-white border rounded-2xl p-6 shadow-sm transition-all ${review.isHidden ? "border-amber-200 opacity-70" : "border-slate-200"}`}
                        >
                            <div className="flex items-start gap-4">
                                {review.room?.image ? (
                                    <img
                                        src={`http://localhost:3000/uploads/${review.room.image}`}
                                        alt={`Room ${review.room?.room_number}`}
                                        className="w-20 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                                    />
                                ) : (
                                    <div className="w-20 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                        <MessageSquare size={20} className="text-slate-400" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-slate-800">
                                                Room {review.room?.room_number || "Deleted"}
                                            </p>
                                            <p className="text-xs text-slate-400 capitalize">{review.room?.room_type}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {review.isHidden && (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                                                    Hidden by Admin
                                                </span>
                                            )}
                                            <button
                                                onClick={() => startEdit(review)}
                                                className="p-2 text-slate-500 hover:text-[#003580] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                                                title="Edit review"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(review.id)}
                                                disabled={deletingId === review.id}
                                                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                                title="Delete review"
                                            >
                                                {deletingId === review.id
                                                    ? <Loader2 size={15} className="animate-spin" />
                                                    : <Trash2 size={15} />
                                                }
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5 mt-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                                            />
                                        ))}
                                        <span className="ml-1.5 text-xs text-slate-500">
                                            {new Date(review.createdAt).toLocaleDateString("id-ID", {
                                                day: "numeric", month: "long", year: "numeric"
                                            })}
                                        </span>
                                    </div>
                                    {review.title && (
                                        <p className="font-semibold text-slate-800 text-sm mt-2">{review.title}</p>
                                    )}
                                    <p className="text-slate-600 text-sm mt-1 leading-relaxed">{review.comment}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="font-bold text-slate-900">Edit Review</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Room {editingReview.room?.room_number}</p>
                            </div>
                            <button
                                onClick={() => setEditingReview(null)}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                    Rating
                                </label>
                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setEditForm(f => ({ ...f, rating: star }))}
                                            className="transition-transform hover:scale-110 cursor-pointer"
                                        >
                                            <Star
                                                size={24}
                                                className={star <= editForm.rating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-slate-300"
                                                }
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm font-semibold text-slate-600">
                                        {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][editForm.rating]}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                                    Title (optional)
                                </label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="e.g. Great stay, loved the room!"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                                    Comment *
                                </label>
                                <textarea
                                    value={editForm.comment}
                                    onChange={e => setEditForm(f => ({ ...f, comment: e.target.value }))}
                                    rows={4}
                                    placeholder="Share your experience..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]/20 resize-none"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setEditingReview(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl bg-[#003580] text-white text-sm font-semibold hover:bg-[#00224f] transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {saving
                                        ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                                        : <><Check size={14} /> Save Changes</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={confirmDelete !== null}
                title="Delete Review"
                message="Are you sure you want to delete this review? This action cannot be undone."
                onConfirm={() => executeDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
                confirmText="Yes, Delete"
                type="danger"
            />
        </div>
    )
}
