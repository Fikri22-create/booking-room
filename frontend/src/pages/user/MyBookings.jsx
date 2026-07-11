import { useCallback, useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../../services/userBookingService";
import { Clock3, CheckCircle2, XCircle, Search, X, QrCode } from "lucide-react";
import { toast } from "../../components/Toast";
import Pagination from "../../components/Pagination";
import StatCard from "../../components/StatCard";
import { AuthContext } from "../../context/AuthContext";

export default function MyBookings() {
    const { user } = useContext(AuthContext);
    const [selectedQrBooking, setSelectedQrBooking] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [cancelModal, setCancelModal] = useState(null);
    const navigate = useNavigate();

    const load = useCallback(async (page = 1, status = "") => {
        try {
            setLoading(true);
            const res = await getMyBookings({ page, limit: 10, status: status || undefined });
            setBookings(res.data || []);
            setTotalPage(res.totalPage || 1);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadStats = useCallback(async () => {
        try {
            const [p, a, r] = await Promise.all([
                getMyBookings({ status: "pending", limit: 1 }),
                getMyBookings({ status: "approved", limit: 1 }),
                getMyBookings({ status: "rejected", limit: 1 })
            ]);
            setStats({ pending: p.totalData || 0, approved: a.totalData || 0, rejected: r.totalData || 0 });
        } catch (error) { console.error(error); }
    }, []);

    useEffect(() => {
        load(1, statusFilter);
        loadStats();
    }, [load, loadStats]);

    const handleStatusFilter = (val) => {
        setStatusFilter(val);
        setCurrentPage(1);
        load(1, val);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        load(page, statusFilter);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancel = async (id) => {
        try {
            await cancelBooking(id);
            toast.success("Booking cancelled successfully");
            setCancelModal(null);
            load(currentPage, statusFilter);
            loadStats();
        } catch (error) {
            console.error(error);
            toast.error("Failed to cancel booking");
        }
    };

    const filteredBookings = useMemo(() => {
        if (!search) return bookings;
        const kw = search.toLowerCase();
        return bookings.filter(b => b.booking_code?.toLowerCase().includes(kw));
    }, [bookings, search]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your booking history.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Pending" value={stats.pending} icon={<Clock3 size={18} />} color="amber" />
                <StatCard title="Approved" value={stats.approved} icon={<CheckCircle2 size={18} />} color="emerald" />
                <StatCard title="Rejected" value={stats.rejected} icon={<XCircle size={18} />} color="rose" />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[180px]">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by booking code..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm bg-slate-50 transition"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => handleStatusFilter(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20 cursor-pointer text-slate-700"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-6 py-4 text-left">Booking Code</th>
                                <th className="px-6 py-4 text-left">Room</th>
                                <th className="px-6 py-4 text-left">Check In</th>
                                <th className="px-6 py-4 text-left">Check Out</th>
                                <th className="px-6 py-4 text-left">Total</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <SkeletonRows />
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <p className="font-semibold text-slate-600">No Bookings Found</p>
                                        <p className="text-sm text-slate-400 mt-1">You don't have any bookings yet.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-semibold text-[#003580] text-xs">
                                            {booking.booking_code}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">
                                            {booking.room ? `Room ${booking.room.room_number}` : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{booking.check_in}</td>
                                        <td className="px-6 py-4 text-slate-500">{booking.check_out}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                            Rp {Number(booking.total_price).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 justify-center">
                                                {booking.status === "approved" ? (
                                                    <div className="flex flex-col gap-1.5 items-center">
                                                        {!booking.payment ? (
                                                            <button
                                                                onClick={() => navigate(`/user/payment/${booking.id}`)}
                                                                className="w-24 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition cursor-pointer"
                                                            >
                                                                Pay Now
                                                            </button>
                                                        ) : (
                                                            <div className="flex flex-col gap-1 items-center">
                                                                <span className={`w-24 py-1.5 text-xs rounded-lg font-medium text-center ${booking.payment.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                                                    {booking.payment.status === "paid" ? "✓ Paid" : "Verifying"}
                                                                </span>
                                                                {booking.payment.status === "paid" && (
                                                                    <button
                                                                        onClick={() => setSelectedQrBooking(booking)}
                                                                        className="w-24 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition cursor-pointer flex items-center justify-center gap-1 shadow-sm mt-0.5"
                                                                    >
                                                                        <QrCode size={10} /> QR Code
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={() => setCancelModal(booking.id)}
                                                            className="w-24 py-1.5 text-xs text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-lg font-medium transition cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : booking.status === "pending" ? (
                                                    <button
                                                        onClick={() => setCancelModal(booking.id)}
                                                        className="w-24 py-1.5 text-xs text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-lg font-medium transition cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-300">—</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPage={totalPage} onPageChange={handlePageChange} />
            </div>

            {/* Cancel Modal */}
            {cancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900">Cancel Booking</h3>
                            <button onClick={() => setCancelModal(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to cancel this booking? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setCancelModal(null)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition text-sm"
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={() => handleCancel(cancelModal)}
                                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium transition text-sm"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {selectedQrBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedQrBooking(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-slate-100 shadow-2xl text-center animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Booking QR Code</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Show this at check-in</p>
                            </div>
                            <button onClick={() => setSelectedQrBooking(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-2xl flex flex-col items-center justify-center border border-slate-100 mb-4">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                    JSON.stringify({
                                        bookingCode: selectedQrBooking.booking_code,
                                        roomNumber: selectedQrBooking.room?.room_number,
                                        checkIn: selectedQrBooking.check_in,
                                        checkOut: selectedQrBooking.check_out,
                                        guestName: user?.name || "Guest"
                                    })
                                )}`}
                                alt="Booking QR Code"
                                className="w-44 h-44 bg-white p-2 rounded-xl shadow-sm"
                            />
                            <p className="text-xs font-mono font-bold text-slate-800 mt-3 uppercase tracking-wider">{selectedQrBooking.booking_code}</p>
                        </div>
                        <div className="space-y-1.5 text-left text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
                            <div className="flex justify-between"><span>Room:</span><span className="font-semibold text-slate-800">Room {selectedQrBooking.room?.room_number} ({selectedQrBooking.room?.room_type})</span></div>
                            <div className="flex justify-between"><span>Check-in:</span><span className="font-semibold text-slate-800">{selectedQrBooking.check_in}</span></div>
                            <div className="flex justify-between"><span>Check-out:</span><span className="font-semibold text-slate-800">{selectedQrBooking.check_out}</span></div>
                            <div className="flex justify-between"><span>Guest:</span><span className="font-semibold text-slate-800">{user?.name}</span></div>
                        </div>
                        <button
                            onClick={() => setSelectedQrBooking(null)}
                            className="w-full mt-3 py-2.5 bg-[#003580] hover:bg-[#002760] text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }) {
    const map = {
        approved: "bg-emerald-100 text-emerald-700",
        rejected: "bg-rose-100 text-rose-700",
        pending:  "bg-amber-100 text-amber-700",
    };
    return (
        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${map[status] || map.pending}`}>
            {status}
        </span>
    );
}

function SkeletonRows() {
    return Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
            {Array.from({ length: 7 }).map((__, j) => (
                <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-slate-100 rounded-lg" />
                </td>
            ))}
        </tr>
    ));
}