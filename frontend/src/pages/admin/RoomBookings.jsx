import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getRoomBookings, getRoomById } from "../../services/roomService";
import {
    ArrowLeft,
    Calendar,
    User,
    Hash,
    DoorOpen,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
} from "lucide-react";
import { toast } from "../../components/Toast";
import StatCard from "../../components/StatCard";

const STATUS_CONFIG = {
    pending: {
        label: "Pending",
        icon: Clock,
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        dot: "bg-amber-400",
    },
    approved: {
        label: "Approved",
        icon: CheckCircle2,
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-400",
    },
    rejected: {
        label: "Rejected",
        icon: XCircle,
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        dot: "bg-red-400",
    },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
                <td key={n} className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                </td>
            ))}
        </tr>
    );
}



export default function RoomBookings() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [roomRes, bookingsRes] = await Promise.all([
                    getRoomById(id),
                    getRoomBookings(id),
                ]);
                setRoom(roomRes.data);
                setBookings(bookingsRes.data || []);
            } catch (err) {
                toast.error("Failed to load room bookings");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const filtered = bookings.filter((b) => {
        const matchStatus = filterStatus === "all" || b.status === filterStatus;
        const q = search.toLowerCase();
        const matchSearch =
            !search ||
            String(b.id).includes(q) ||
            (b.User?.name || "").toLowerCase().includes(q) ||
            (b.User?.email || "").toLowerCase().includes(q) ||
            b.status.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const stats = {
        total: bookings.length,
        pending: bookings.filter((b) => b.status === "pending").length,
        approved: bookings.filter((b) => b.status === "approved").length,
        rejected: bookings.filter((b) => b.status === "rejected").length,
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount || 0);

    const getDuration = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return "-";
        const diff = Math.round(
            (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
        );
        return `${diff} night${diff !== 1 ? "s" : ""}`;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate("/admin/rooms")}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-3 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Rooms
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <DoorOpen size={22} className="text-[#003580]" />
                            Room Bookings
                        </h1>
                        {room && (
                            <p className="text-slate-500 text-sm mt-1">
                                Room <span className="font-semibold text-slate-700">#{room.room_number}</span>{" "}
                                — {room.room_type}
                            </p>
                        )}
                    </div>
                    {room && (
                        <div className="flex items-center gap-2">
                            <Link
                                to={`/admin/rooms/gallery/${id}`}
                                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                            >
                                Gallery
                            </Link>
                            <Link
                                to={`/admin/rooms/edit/${id}`}
                                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 bg-[#003580] text-white rounded-xl hover:bg-[#002a6b] transition"
                            >
                                Edit Room
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total Bookings" value={stats.total}   icon={<FileText size={18}/>}    color="blue" />
                <StatCard title="Pending"        value={stats.pending}  icon={<Clock size={18}/>}       color="amber" />
                <StatCard title="Approved"       value={stats.approved} icon={<CheckCircle2 size={18}/>} color="emerald" />
                <StatCard title="Rejected"       value={stats.rejected} icon={<XCircle size={18}/>}    color="rose" />
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="relative w-full sm:w-64">
                        <Hash
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            placeholder="Search by ID or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580]"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {["all", "pending", "approved", "rejected"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition border ${
                                    filterStatus === s
                                        ? "bg-[#003580] text-white border-[#003580]"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                                    #
                                </th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                                    Guest
                                </th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                                    Check In
                                </th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                                    Check Out
                                </th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                                    Duration
                                </th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <SkeletonRow key={i} />
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 rounded-full bg-slate-100">
                                                <AlertCircle size={32} className="text-slate-300" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-700">
                                                    No bookings found
                                                </p>
                                                <p className="text-slate-400 text-sm mt-1">
                                                    {search || filterStatus !== "all"
                                                        ? "Try adjusting your filters"
                                                        : "This room has no booking history yet"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-4 py-4">
                                            <div>
                                                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded block">
                                                    #{booking.id}
                                                </span>
                                                {booking.booking_code && (
                                                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                                                        {booking.booking_code}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-[#003580]/10 flex items-center justify-center shrink-0">
                                                    <User size={13} className="text-[#003580]" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800 text-xs leading-tight">
                                                        {booking.User?.name || "Guest"}
                                                    </p>
                                                    <p className="text-slate-400 text-[11px]">
                                                        {booking.User?.email || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-700 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={13} className="text-slate-400" />
                                                {formatDate(booking.check_in)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-700 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={13} className="text-slate-400" />
                                                {formatDate(booking.check_out)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600 text-xs">
                                            {getDuration(booking.check_in, booking.check_out)}
                                        </td>
                                        <td className="px-4 py-4 text-slate-800 font-semibold text-xs">
                                            {formatCurrency(booking.total_price)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <Link
                                                to={`/admin/bookings/${booking.id}`}
                                                className="text-xs text-[#003580] font-medium hover:underline"
                                            >
                                                View →
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {!loading && filtered.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
                        Showing {filtered.length} of {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
                    </div>
                )}
            </div>
        </div>
    );
}
