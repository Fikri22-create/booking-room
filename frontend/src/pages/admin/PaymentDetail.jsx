import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft, CheckCircle2, XCircle, Clock, CreditCard,
    User, Hash, CalendarDays, Loader2, AlertCircle, RefreshCw,
    ExternalLink
} from "lucide-react";
import { getPaymentById, verifyPayment, refundPayment } from "../../services/paymentService";
import { toast } from "../../components/Toast";

const STATUS_CONFIG = {
    pending:  { label: "Pending",  bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400",   icon: Clock },
    paid:     { label: "Paid",     bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400", icon: CheckCircle2 },
    failed:   { label: "Failed",   bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-400",     icon: XCircle },
    refunded: { label: "Refunded", bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400",   icon: RefreshCw },
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

function InfoRow({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <div className="text-sm font-semibold text-slate-800">{value || "—"}</div>
        </div>
    );
}

export default function PaymentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);
    const [imageZoom, setImageZoom] = useState(false);

    const fetchPayment = async () => {
        try {
            setLoading(true);
            const response = await getPaymentById(id);
            setPayment(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch payment details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayment();
    }, [id]);

    const handleVerify = async () => {
        try {
            setActionLoading("verify");
            await verifyPayment(id);
            toast.success("Payment verified successfully");
            setConfirmModal(null);
            fetchPayment();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to verify payment");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRefund = async () => {
        try {
            setActionLoading("refund");
            await refundPayment(id);
            toast.success("Payment refunded successfully");
            setConfirmModal(null);
            fetchPayment();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to refund payment");
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount || 0);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-8 h-8 border-2 border-[#003580] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Loading payment details...</p>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                <div className="p-4 rounded-full bg-slate-100">
                    <AlertCircle size={32} className="text-slate-300" />
                </div>
                <p className="font-semibold text-slate-700">Payment not found</p>
                <Link to="/admin/payments" className="text-sm text-[#003580] hover:underline">← Back to Payments</Link>
            </div>
        );
    }

    const user = payment.booking?.user;

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/admin/payments")}
                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Payment Detail</h1>
                        <p className="text-sm text-slate-500 mt-0.5 font-mono">{payment.payment_code}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={payment.status} />
                    {payment.status === "pending" && (
                        <button
                            onClick={() => setConfirmModal("verify")}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition shadow-sm"
                        >
                            <CheckCircle2 size={15} />
                            Verify Payment
                        </button>
                    )}
                    {payment.status === "paid" && (
                        <button
                            onClick={() => setConfirmModal("refund")}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition shadow-sm"
                        >
                            <RefreshCw size={15} />
                            Refund
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Transaction + Proof */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Transaction details */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                            <CreditCard size={16} className="text-[#003580]" />
                            <h2 className="font-semibold text-slate-800">Transaction Details</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-5">
                            <InfoRow label="Payment Code" value={<span className="font-mono">{payment.payment_code}</span>} />
                            <InfoRow label="Status" value={<StatusBadge status={payment.status} />} />
                            <InfoRow label="Amount" value={<span className="text-[#003580] font-bold">{formatCurrency(payment.amount)}</span>} />
                            <InfoRow label="Payment Method" value={payment.payment_method} />
                            <InfoRow label="Booking Code" value={
                                payment.booking?.id ? (
                                    <Link to={`/admin/bookings/${payment.booking.id}`} className="text-[#003580] hover:underline flex items-center gap-1">
                                        {payment.booking.booking_code}
                                        <ExternalLink size={11} />
                                    </Link>
                                ) : payment.booking?.booking_code
                            } />
                            <InfoRow label="Room" value={
                                payment.booking?.room ? `Room ${payment.booking.room.room_number}` : "—"
                            } />
                            <InfoRow label="Check In" value={payment.booking?.check_in} />
                            <InfoRow label="Check Out" value={payment.booking?.check_out} />
                            <InfoRow label="Submitted At" value={formatDate(payment.createdAt)} />
                            <InfoRow label="Last Updated" value={formatDate(payment.updatedAt)} />
                        </div>
                    </div>

                    {/* Payment proof */}
                    {payment.proof_image && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Hash size={16} className="text-[#003580]" />
                                    <h2 className="font-semibold text-slate-800">Payment Proof</h2>
                                </div>
                                <a
                                    href={`http://localhost:3000/uploads/${payment.proof_image}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-[#003580] font-medium hover:underline"
                                >
                                    <ExternalLink size={12} />
                                    Open Full Size
                                </a>
                            </div>
                            <div
                                className="cursor-zoom-in"
                                onClick={() => setImageZoom(true)}
                            >
                                <img
                                    src={`http://localhost:3000/uploads/${payment.proof_image}`}
                                    alt="Payment proof"
                                    className="max-h-96 w-auto rounded-xl border border-slate-200 shadow-sm hover:opacity-95 transition"
                                />
                                <p className="text-xs text-slate-400 mt-2">Click to view fullscreen</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Payer info */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                            <User size={16} className="text-[#003580]" />
                            <h2 className="font-semibold text-slate-800">Payer</h2>
                        </div>
                        <div className="flex flex-col items-center text-center pb-4 mb-4 border-b border-slate-100">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center mb-3">
                                {user?.avatar ? (
                                    <img
                                        src={`http://localhost:3000/uploads/${user.avatar}`}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#003580] flex items-center justify-center text-white text-xl font-bold">
                                        {user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>
                            <h3 className="font-bold text-slate-900">{user?.name || "—"}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{user?.email || "—"}</p>
                            {user?.id && (
                                <Link
                                    to={`/admin/users/${user.id}`}
                                    className="mt-2 text-xs text-[#003580] hover:underline"
                                >
                                    View Profile →
                                </Link>
                            )}
                        </div>
                        <div className="space-y-4">
                            <InfoRow label="Phone" value={user?.phone} />
                            <InfoRow label="Address" value={user?.address} />
                        </div>
                    </div>

                    {/* Booking quick link */}
                    {payment.booking?.id && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                <CalendarDays size={16} className="text-[#003580]" />
                                <h2 className="font-semibold text-slate-800">Related Booking</h2>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Booking Code</p>
                                    <p className="font-mono text-sm font-bold text-slate-800">{payment.booking.booking_code}</p>
                                </div>
                                <Link
                                    to={`/admin/bookings/${payment.booking.id}`}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-white bg-[#003580] rounded-xl hover:bg-[#002a6b] transition"
                                >
                                    <ExternalLink size={13} />
                                    View Booking Detail
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                            confirmModal === "verify" ? "bg-emerald-100" : "bg-slate-100"
                        }`}>
                            {confirmModal === "verify"
                                ? <CheckCircle2 size={24} className="text-emerald-600" />
                                : <RefreshCw size={24} className="text-slate-600" />
                            }
                        </div>
                        <h3 className="font-bold text-slate-900 text-center text-lg mb-2">
                            {confirmModal === "verify" ? "Verify Payment?" : "Refund Payment?"}
                        </h3>
                        <p className="text-slate-500 text-sm text-center mb-6">
                            {confirmModal === "verify"
                                ? "Mark this payment as verified and paid. The guest will be notified."
                                : "Mark this payment as refunded. This action cannot be undone."
                            }
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                disabled={!!actionLoading}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition text-sm disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmModal === "verify" ? handleVerify : handleRefund}
                                disabled={!!actionLoading}
                                className={`flex-1 py-2.5 rounded-xl text-white font-medium transition text-sm disabled:opacity-50 flex items-center justify-center gap-2 ${
                                    confirmModal === "verify"
                                        ? "bg-emerald-500 hover:bg-emerald-600"
                                        : "bg-slate-600 hover:bg-slate-700"
                                }`}
                            >
                                {actionLoading ? (
                                    <><Loader2 size={14} className="animate-spin" /> Processing...</>
                                ) : confirmModal === "verify" ? (
                                    "Yes, Verify"
                                ) : (
                                    "Yes, Refund"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Zoom Modal */}
            {imageZoom && payment.proof_image && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out p-4"
                    onClick={() => setImageZoom(false)}
                >
                    <img
                        src={`http://localhost:3000/uploads/${payment.proof_image}`}
                        alt="Payment proof fullscreen"
                        className="max-h-full max-w-full rounded-xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition"
                        onClick={() => setImageZoom(false)}
                    >
                        <XCircle size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}