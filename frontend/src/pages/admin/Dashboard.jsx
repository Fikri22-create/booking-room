import { useEffect, useState } from "react";
import { getDashboardStats, getTopRooms, getRevenuePerMonth } from "../../services/dashboardService";
import { BedDouble, Users, CalendarRange, Wallet, Clock3, CheckCircle2, XCircle, Star, TrendingUp } from "lucide-react";
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, BarChart, Bar, AreaChart, Area
} from "recharts";

const BLUE = "#003580";
const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Dashboard() {
    const [stats, setStats]       = useState(null);
    const [topRooms, setTopRooms] = useState([]);
    const [revenue, setRevenue]   = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [d, r, rev] = await Promise.all([
                    getDashboardStats(),
                    getTopRooms(),
                    getRevenuePerMonth()
                ]);
                setStats(d.data);
                setTopRooms(r.data || []);
                setRevenue(rev.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return (
        <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl" />)}
            </div>
            <div className="h-64 bg-slate-100 rounded-xl" />
        </div>
    );
    if (!stats) return (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">
            Failed to load dashboard data.
        </div>
    );

    const bookingChartData = stats?.bookingChart?.map(i => ({
        month: MONTHS[i.month] || "-", total: Number(i.total || 0),
    })) || [];

    const revenueChartData = revenue.map(i => ({
        month: MONTHS[i.month] || "-",
        revenue: Number(i.revenue || 0),
    }));

    const topRoomsData = topRooms?.map(r => ({
        room: `#${r.room?.room_number || r.roomId}`,
        bookings: Number(r.bookingsCount || 0),
    })) || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Overview of your hotel performance</p>
            </div>

            {/* KPI Row 1 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    label="Total Revenue"
                    value={`Rp ${(stats.totalRevenue||0).toLocaleString("id-ID")}`}
                    icon={<Wallet size={18}/>}
                    color="blue"
                    trend={null}
                />
                <KpiCard label="Total Rooms"      value={stats.totalRooms}    icon={<BedDouble size={18}/>}    color="gray" />
                <KpiCard label="Registered Users"  value={stats.totalUsers}    icon={<Users size={18}/>}        color="gray" />
                <KpiCard label="Total Bookings"    value={stats.totalBookings} icon={<CalendarRange size={18}/>} color="gray" />
            </div>

            {/* KPI Row 2 — new analytics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    label="Occupancy Rate"
                    value={`${stats.occupancyRate ?? 0}%`}
                    icon={<TrendingUp size={18}/>}
                    color={stats.occupancyRate >= 70 ? "green" : stats.occupancyRate >= 40 ? "amber" : "gray"}
                    sublabel="Last 30 days"
                />
                <KpiCard
                    label="Avg Review Rating"
                    value={stats.avgReviewRating ? `${stats.avgReviewRating} / 5` : "—"}
                    icon={<Star size={18}/>}
                    color="amber"
                    sublabel={`${stats.totalReviews ?? 0} reviews`}
                />
                <KpiCard label="Pending Bookings"  value={stats.pendingBookings}  icon={<Clock3 size={18}/>}      color="amber" />
                <KpiCard label="Approved Bookings" value={stats.approvedBookings} icon={<CheckCircle2 size={18}/>} color="green" />
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm font-semibold text-slate-800 mb-0.5">Booking Trend</p>
                    <p className="text-xs text-slate-400 mb-5">Approved bookings per month</p>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={bookingChartData} margin={{ top:4, right:8, left:-20, bottom:0 }}>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:"#9ca3af" }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fill:"#9ca3af" }} />
                                <Tooltip contentStyle={{ borderRadius:"8px", border:"1px solid #e5e7eb", fontSize:12, boxShadow:"0 2px 8px rgba(0,0,0,.08)" }} />
                                <Line type="monotone" dataKey="total" stroke={BLUE} strokeWidth={2.5} dot={{ r:3, fill:BLUE }} activeDot={{ r:5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm font-semibold text-slate-800 mb-0.5">Top Rooms</p>
                    <p className="text-xs text-slate-400 mb-5">Most booked rooms</p>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topRoomsData} margin={{ top:4, right:8, left:-20, bottom:0 }}>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="room" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:"#9ca3af" }} dy={8} />
                                <Tooltip contentStyle={{ borderRadius:"8px", border:"1px solid #e5e7eb", fontSize:12 }} cursor={{ fill:"#f9fafb" }} />
                                <Bar dataKey="bookings" fill={BLUE} radius={[4,4,0,0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            {revenueChartData.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm font-semibold text-slate-800 mb-0.5">Revenue per Month</p>
                    <p className="text-xs text-slate-400 mb-5">Total paid revenue (IDR)</p>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueChartData} margin={{ top:4, right:8, left:10, bottom:0 }}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={BLUE} stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor={BLUE} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:"#9ca3af" }} dy={8} />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize:10, fill:"#9ca3af" }}
                                    tickFormatter={v => v >= 1_000_000 ? `${(v/1_000_000).toFixed(0)}M` : v >= 1_000 ? `${(v/1_000).toFixed(0)}K` : v}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius:"8px", border:"1px solid #e5e7eb", fontSize:12, boxShadow:"0 2px 8px rgba(0,0,0,.08)" }}
                                    formatter={v => [`Rp ${Number(v).toLocaleString("id-ID")}`, "Revenue"]}
                                />
                                <Area type="monotone" dataKey="revenue" stroke={BLUE} strokeWidth={2} fill="url(#revGrad)" dot={{ r:3, fill:BLUE }} activeDot={{ r:5 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Status Cards Row */}
            <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm font-semibold text-slate-800 mb-4">Booking Status</p>
                    <div className="space-y-3">
                        {[
                            { label:"Pending",  value:stats.pendingBookings,  icon:<Clock3 size={15}/>,      dot:"bg-amber-400" },
                            { label:"Approved", value:stats.approvedBookings, icon:<CheckCircle2 size={15}/>, dot:"bg-emerald-500" },
                            { label:"Rejected", value:stats.rejectedBookings, icon:<XCircle size={15}/>,     dot:"bg-rose-400" },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                                    {s.label}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${s.dot}`}
                                            style={{ width: `${stats.totalBookings > 0 ? Math.round((s.value / stats.totalBookings) * 100) : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 w-8 text-right">{s.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm font-semibold text-slate-800 mb-4">Payment Analytics</p>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label:"Paid",     value:stats.totalPaidPayments,     dot:"bg-emerald-500", bg:"bg-emerald-50",  text:"text-emerald-700" },
                            { label:"Pending",  value:stats.totalPendingPayments,  dot:"bg-amber-400",   bg:"bg-amber-50",    text:"text-amber-700" },
                            { label:"Failed",   value:stats.totalFailedPayments,   dot:"bg-rose-400",    bg:"bg-rose-50",     text:"text-rose-700" },
                            { label:"Refunded", value:stats.totalRefundedPayments, dot:"bg-slate-400",   bg:"bg-slate-50",    text:"text-slate-700" },
                        ].map((s) => (
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
            </div>
        </div>
    );
}

function KpiCard({ label, value, icon, color, sublabel }) {
    const colorMap = {
        blue:  "bg-[#003580]/8 text-[#003580]",
        gray:  "bg-slate-100 text-slate-500",
        amber: "bg-amber-50 text-amber-600",
        green: "bg-emerald-50 text-emerald-600",
    };
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
                <p className="text-lg font-bold text-slate-900">{value}</p>
                {sublabel && <p className="text-[10px] text-slate-400 mt-0.5">{sublabel}</p>}
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color] || colorMap.gray}`}
                style={color === "blue" ? { background:"rgba(0,53,128,0.08)" } : {}}
            >
                {icon}
            </div>
        </div>
    );
}
