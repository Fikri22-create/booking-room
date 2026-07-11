import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft, CheckCircle2, XCircle, Clock, CreditCard,
    User, DoorOpen, CalendarDays, Loader2, AlertCircle
} from "lucide-react";
import { getBookingById, updateBookingStatus } from "../../services/bookingService";
import { toast } from "../../components/Toast";

const STATUS_CONFIG = {
    pending:  { label: "Pending",  bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400",   icon: Clock },
    approved: { label: "Approved", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400", icon: CheckCircle2 },
    rejected: { label: "Rejected", bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-400",     icon: XCircle },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function InfoRow({ label, value, mono = false }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-sm font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
        </div>
    );
}

export default function BookingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [confirmModal, setConfirmModal] = useState(null); // 'approved' | 'rejected' | null

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const response = await getBookingById(id);
            setBooking(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch booking details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const handleUpdateStatus = async (status) => {
        try {
            setUpdating(true);
            await updateBookingStatus(id, status);
            toast.success(`Booking ${status === "approved" ? "approved" : "rejected"} successfully`);
            setConfirmModal(null);
            fetchBooking();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to update booking status");
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "2-digit", month: "long", year: "numeric"
        });
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount || 0);

    const getNights = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 0;
        return Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-8 h-8 border-2 border-[#003580] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Loading booking details...</p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                <div className="p-4 rounded-full bg-slate-100">
                    <AlertCircle size={32} className="text-slate-300" />
                </div>
                <p className="font-semibold text-slate-700">Booking not found</p>
                <Link to="/admin/bookings" className="text-sm text-[#003580] hover:underline">← Back to Bookings</Link>
            </div>
        );
    }

    const nights = getNights(booking.check_in, booking.check_out);

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/admin/bookings")}
                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Booking Detail</h1>
                        <p className="text-sm text-slate-500 mt-0.5 font-mono">{booking.booking_code}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge status={booking.status} />
                    {booking.status === "pending" && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setConfirmModal("approved")}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition shadow-sm"
                            >
                                <CheckCircle2 size={15} />
                                Approve
                            </button>
                            <button
                                onClick={() => setConfirmModal("rejected")}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition shadow-sm"
                            >
                                <XCircle size={15} />
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Main info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Reservation */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                            <CalendarDays size={16} className="text-[#003580]" />
                            <h2 className="font-semibold text-slate-800">Reservation Details</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-5">
                            <InfoRow label="Booking Code" value={booking.booking_code} mono />
                            <InfoRow label="Status" value={<StatusBadge status={booking.status} />} />
                            <InfoRow label="Room" value={`Room ${booking.room?.room_number}`} />
                            <InfoRow label="Room Type" value={booking.room?.room_type} />
                            <InfoRow label="Check In" value={formatDate(booking.check_in)} />
                            <InfoRow label="Check Out" value={formatDate(booking.check_out)} />
                            <InfoRow label="Duration" value={`${nights} night${nights !== 1 ? "s" : ""}`} />
                            <InfoRow label="Guests" value={`${booking.guest_count} guest${booking.guest_count !== 1 ? "s" : ""}`} />
                            <InfoRow label="Price / Night" value={formatCurrency(booking.room?.price_per_night)} />
                            <InfoRow label="Total Price" value={<span className="text-[#003580] font-bold">{formatCurrency(booking.total_price)}</span>} />
                            {booking.special_request && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Special Request</p>
                                    <p className="text-sm text-slate-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 italic">
                                        "{booking.special_request}"
                                    </p>
                                </div>
                            )}
                            <InfoRow label="Booking Date" value={formatDate(booking.createdAt)} />
                        </div>
                    </div>

                    {/* Payment */}
                    {booking.Payment && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                                <CreditCard size={16} className="text-[#003580]" />
                                <h2 className="font-semibold text-slate-800">Payment Information</h2>
                                <Link
                                    to={`/admin/payments/${booking.Payment.id}`}
                                    className="ml-auto text-xs text-[#003580] font-medium hover:underline"
                                >
                                    View Detail →
                                </Link>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-5">
                                <InfoRow label="Payment Code" value={booking.Payment.payment_code} mono />
                                <InfoRow label="Payment Status" value={booking.Payment.status} />
                                <InfoRow label="Method" value={booking.Payment.payment_method} />
                                <InfoRow label="Amount" value={formatCurrency(booking.Payment.amount)} />
                            </div>
                            {booking.Payment.proof_image && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Payment Proof</p>
                                    <a
                                        href={`http://localhost:3000/uploads/${booking.Payment.proof_image}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block"
                                    >
                                        <img
                                            src={`http://localhost:3000/uploads/${booking.Payment.proof_image}`}
                                            alt="Payment proof"
                                            className="h-32 rounded-xl object-cover border border-slate-200 hover:opacity-90 transition shadow-sm"
                                        />
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Guest info */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                            <User size={16} className="text-[#003580]" />
                            <h2 className="font-semibold text-slate-800">Guest Information</h2>
                        </div>
                        <div className="flex flex-col items-center text-center pb-4 mb-4 border-b border-slate-100">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 mb-3">
                                {booking.user?.avatar ? (
                                    <img
                                        src={`http://localhost:3000/uploads/${booking.user.avatar}`}
                                        alt={booking.user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#003580] flex items-center justify-center text-white text-xl font-bold">
                                        {booking.user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>
                            <h3 className="font-bold text-slate-900">{booking.user?.name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{booking.user?.email}</p>
                            {booking.user?.id && (
                                <Link
                                    to={`/admin/users/${booking.user.id}`}
                                    className="mt-2 text-xs text-[#003580] hover:underline"
                                >
                                    View Profile →
                                </Link>
                            )}
                        </div>
                        <div className="space-y-4">
                            <InfoRow label="Phone" value={booking.user?.phone} />
                            <InfoRow label="Address" value={booking.user?.address} />
                        </div>
                    </div>

                    {/* Room quick actions */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <DoorOpen size={16} className="text-[#003580]" />
                            <h2 className="font-semibold text-slate-800">Room</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            {(booking.room?.image || booking.room?.gallery?.[0]?.image) && (
                                <img
                                    src={`http://localhost:3000/uploads/${booking.room.image || booking.room?.gallery?.[0]?.image}`}
                                    alt="Room"
                                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                                />
                            )}
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">Room {booking.room?.room_number}</p>
                                <p className="text-xs text-slate-400 capitalize">{booking.room?.room_type}</p>
                            </div>
                        </div>
                        {booking.room?.id && (
                            <div className="flex gap-2 mt-4">
                                <Link
                                    to={`/admin/rooms/${booking.room.id}/bookings`}
                                    className="flex-1 text-center text-xs py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition font-medium"
                                >
                                    All Bookings
                                </Link>
                                <Link
                                    to={`/admin/rooms/edit/${booking.room.id}`}
                                    className="flex-1 text-center text-xs py-2 bg-[#003580] text-white rounded-xl hover:bg-[#002a6b] transition font-medium"
                                >
                                    Edit Room
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                            confirmModal === "approved" ? "bg-emerald-100" : "bg-red-100"
                        }`}>
                            {confirmModal === "approved"
                                ? <CheckCircle2 size={24} className="text-emerald-600" />
                                : <XCircle size={24} className="text-red-600" />
                            }
                        </div>
                        <h3 className="font-bold text-slate-900 text-center text-lg mb-2">
                            {confirmModal === "approved" ? "Approve Booking?" : "Reject Booking?"}
                        </h3>
                        <p className="text-slate-500 text-sm text-center mb-6">
                            {confirmModal === "approved"
                                ? "The guest will be notified that their booking has been approved."
                                : "The guest will be notified that their booking has been rejected."
                            }
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                disabled={updating}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition text-sm disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(confirmModal)}
                                disabled={updating}
                                className={`flex-1 py-2.5 rounded-xl text-white font-medium transition text-sm disabled:opacity-50 flex items-center justify-center gap-2 ${
                                    confirmModal === "approved"
                                        ? "bg-emerald-500 hover:bg-emerald-600"
                                        : "bg-red-500 hover:bg-red-600"
                                }`}
                            >
                                {updating ? (
                                    <><Loader2 size={14} className="animate-spin" /> Processing...</>
                                ) : (
                                    confirmModal === "approved" ? "Yes, Approve" : "Yes, Reject"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}