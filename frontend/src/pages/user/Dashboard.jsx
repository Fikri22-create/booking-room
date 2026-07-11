import { useEffect, useState } from "react";
import { getUserDashboardStats } from "../../services/dashboardService";
import { CalendarRange, Wallet, ArrowRight, BedDouble } from "lucide-react";
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip,
} from "recharts";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";

const BRAND = "#003580";
const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const STATUS_STYLE = {
    approved: "bg-emerald-100 text-emerald-700",
    pending:  "bg-amber-100 text-amber-700",
    rejected: "bg-rose-100 text-rose-700",
};

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const d = await getUserDashboardStats();
                setStats(d.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return (
        <div className="space-y-5 animate-pulse">
            <div className="grid grid-cols-2 gap-4">
                {[1,2].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
            </div>
            <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
    );

    if (!stats) return (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm border border-rose-100">
            Failed to load dashboard data.
        </div>
    );

    const bookingChartData = stats?.bookingChart?.map(i => ({
        month: MONTHS[i.month] || "-", total: Number(i.total || 0),
    })) || [];

    const today = new Date(); today.setHours(0,0,0,0);
    const upcomingBookings = (stats.recentBookings || []).filter(b =>
        b.status === "approved" && new Date(b.check_in) >= today
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Overview of your bookings and activity</p>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard
                    label="Total Bookings"
                    title="Total Bookings"
                    value={stats.totalBookings}
                    icon={<CalendarRange size={18} />}
                    color="blue"
                />
                <StatCard
                    label="Total Spent"
                    title="Total Spent"
                    value={`Rp ${(stats.totalSpent || 0).toLocaleString("id-ID")}`}
                    icon={<Wallet size={18} />}
                    color="emerald"
                />
            </div>

            {/* Upcoming Bookings Banner */}
            {upcomingBookings.length > 0 && (
                <div className="bg-gradient-to-r from-[#003580] to-[#0056b3] rounded-2xl p-5 text-white">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Upcoming Stays</p>
                            <p className="text-xl font-bold mt-0.5">
                                {upcomingBookings.length} booking{upcomingBookings.length > 1 ? "s" : ""} confirmed
                            </p>
                        </div>
                        <BedDouble size={28} className="text-white/30" />
                    </div>
                    <div className="space-y-2">
                        {upcomingBookings.slice(0, 2).map(b => (
                            <div key={b.id} className="bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between gap-2">
                                <div>
                                    <p className="font-semibold text-sm capitalize">
                                        {b.room?.room_type} — Room {b.room?.room_number}
                                    </p>
                                    <p className="text-xs text-white/60 mt-0.5">
                                        {new Date(b.check_in).toLocaleDateString("id-ID", { day:"numeric", month:"short" })}
                                        {" → "}
                                        {new Date(b.check_out).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" })}
                                    </p>
                                </div>
                                <p className="text-xs font-bold text-white/80 shrink-0 bg-white/10 px-2.5 py-1 rounded-lg">
                                    {Math.ceil((new Date(b.check_in) - today) / 86400000)}d left
                                </p>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => navigate("/user/my-bookings")}
                        className="mt-3 flex items-center gap-1 text-xs font-semibold text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                        View all bookings <ArrowRight size={12} />
                    </button>
                </div>
            )}

            {/* Charts */}
            <div className="grid lg:grid-cols-3 gap-4">
                {/* Line chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm font-semibold text-slate-800">My Booking Trend</p>
                    <p className="text-xs text-slate-400 mt-0.5 mb-5">Approved bookings per month</p>
                    <div className="h-48">
                        {bookingChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={bookingChartData} margin={{ top:4, right:8, left:-20, bottom:0 }}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:"#94a3b8" }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fill:"#94a3b8" }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius:"12px", border:"1px solid #e2e8f0", fontSize:12, boxShadow:"0 4px 16px rgba(0,0,0,.08)" }}
                                    />
                                    <Line type="monotone" dataKey="total" stroke={BRAND} strokeWidth={2.5} dot={{ r:3, fill:BRAND }} activeDot={{ r:5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                <CalendarRange size={32} className="mb-2" />
                                <p className="text-sm text-slate-400">No booking data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Booking status breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm font-semibold text-slate-800 mb-4">Booking Status</p>
                    <div className="space-y-3">
                        {[
                            { label:"Pending",  value:stats.pendingBookings,  dot:"bg-amber-400" },
                            { label:"Approved", value:stats.approvedBookings, dot:"bg-emerald-500" },
                            { label:"Rejected", value:stats.rejectedBookings, dot:"bg-rose-400" },
                        ].map(s => (
                            <div key={s.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                                    {s.label}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${s.dot}`}
                                            style={{ width: `${stats.totalBookings > 0 ? Math.round((s.value / stats.totalBookings) * 100) : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 w-5 text-right">{s.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payment + Recent Bookings */}
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Payment status */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm font-semibold text-slate-800 mb-4">Payment Status</p>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label:"Paid",     value:stats.paidPayments,     dot:"bg-emerald-500", bg:"bg-emerald-50",  text:"text-emerald-700" },
                            { label:"Pending",  value:stats.pendingPayments,  dot:"bg-amber-400",   bg:"bg-amber-50",    text:"text-amber-700" },
                            { label:"Failed",   value:stats.failedPayments,   dot:"bg-rose-400",    bg:"bg-rose-50",     text:"text-rose-700" },
                            { label:"Refunded", value:stats.refundedPayments, dot:"bg-slate-400",   bg:"bg-slate-50",    text:"text-slate-700" },
                        ].map(s => (
                            <div key={s.label} className={`p-3.5 rounded-xl ${s.bg} border border-slate-100`}>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                                    <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
                                </div>
                                <p className="text-xl font-bold text-slate-900">{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent bookings */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-slate-800">Recent Bookings</p>
                        <button
                            onClick={() => navigate("/user/my-bookings")}
                            className="text-xs text-[#003580] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                            View all <ArrowRight size={11} />
                        </button>
                    </div>
                    <div className="space-y-2.5">
                        {stats.recentBookings?.length > 0 ? (
                            stats.recentBookings.map(booking => (
                                <div
                                    key={booking.id}
                                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer"
                                    onClick={() => navigate("/user/my-bookings")}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate capitalize">
                                                {booking.room?.room_type} — Room {booking.room?.room_number}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {new Date(booking.check_in).toLocaleDateString("id-ID")}
                                                {" → "}
                                                {new Date(booking.check_out).toLocaleDateString("id-ID")}
                                            </p>
                                        </div>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold shrink-0 ${STATUS_STYLE[booking.status] || "bg-slate-100 text-slate-600"}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <CalendarRange size={32} className="mx-auto text-slate-200 mb-2" />
                                <p className="text-sm text-slate-400">No recent bookings</p>
                                <button
                                    onClick={() => navigate("/user/rooms")}
                                    className="mt-2 text-xs text-[#003580] font-semibold hover:underline cursor-pointer"
                                >
                                    Browse rooms →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
