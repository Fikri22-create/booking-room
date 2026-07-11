import { useEffect, useMemo, useState } from "react";
import { getPayments, verifyPayment, refundPayment, exportPaymentsExcel } from "../../services/paymentService";
import {
    Clock3,
    CheckCircle2,
    RotateCcw,
    Search,
    Eye,
    Download,
    Loader2
} from "lucide-react";
import { toast } from "../../components/Toast";
import { Link } from "react-router-dom";
import StatCard from "../../components/StatCard";

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedProof, setSelectedProof] = useState(null);
    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await getPayments();
            setPayments(response.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch payments");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPayments();
    }, []);
    const handleVerify = async (id) => {
        try {
            await verifyPayment(id);
            toast.success("Payment verified!");
            fetchPayments();
        } catch (error) {
            console.error(error);
            toast.error("Failed to verify payment");
        }
    };
    const handleRefund = async (id) => {
        try {
            await refundPayment(id);
            toast.success("Payment refunded!");
            fetchPayments();
        } catch (error) {
            console.error(error);
            toast.error("Failed to refund payment");
        }
    };

    const handleExportExcel = async () => {
        try {
            setExportingExcel(true);
            const response = await exportPaymentsExcel();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "payments.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Payments exported to Excel successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to export payments to Excel");
        } finally {
            setExportingExcel(false);
        }
    };
    const filteredPayments = useMemo(() => {
        return payments.filter((p) => {
            const keyword = search.toLowerCase();
            const matchSearch =
                p.payment_code?.toLowerCase().includes(keyword) ||
                p.Booking?.user?.name?.toLowerCase().includes(keyword) ||
                p.Booking?.Room?.room_number?.toLowerCase().includes(keyword);
            const matchStatus =
                !statusFilter || p.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [payments, search, statusFilter]);
    const pending = payments.filter(p => p.status === "pending").length;
    const paid = payments.filter(p => p.status === "paid").length;
    const refunded = payments.filter(p => p.status === "refunded").length;
    const getStatusBadge = (status) => {
        switch (status) {
            case "paid":
                return (
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">Paid</span>
                );
            case "refunded":
                return (
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-rose-100 text-rose-700">Refunded</span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700">Pending</span>
                );
        }
    };
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage customer payments and verification.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportExcel}
                        disabled={exportingExcel || payments.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm font-medium shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {exportingExcel ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        Export Excel
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard title="Pending" value={pending} icon={<Clock3 size={20} />} color="amber" />
                <StatCard title="Paid" value={paid} icon={<CheckCircle2 size={20} />} color="emerald" />
                <StatCard title="Refunded" value={refunded} icon={<RotateCcw size={20} />} color="rose" />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex gap-2.5 flex-col sm:flex-row">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search payment code, user, room..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580] cursor-pointer text-slate-700 transition-all"
                >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                </select>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Room</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Proof</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <SkeletonTableRows rows={5} cols={8} />
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-10">
                                        <EmptyState search={search} />
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium">{p.payment_code}</td>
                                        <td className="px-6 py-4">{p.booking?.user?.name}</td>
                                        <td className="px-6 py-4">Room {p.booking?.room?.room_number}</td>
                                        <td className="px-6 py-4 capitalize">{p.payment_method}</td>
                                        <td className="px-6 py-4 font-semibold">
                                            Rp {Number(p.amount).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4">
                                            {p.proof_image ? (
                                                <button
                                                    onClick={() => setSelectedProof(p.proof_image)}
                                                    className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs flex items-center gap-1"
                                                >
                                                    <Eye size={14} />
                                                    View
                                                </button>
                                            ) : "-"}
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(p.status)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 justify-center">
                                                <Link to={`/admin/payments/${p.id}`} className="px-3 py-1.5 text-xs bg-slate-700 text-white rounded-lg">Detail</Link>
                                                {p.status === "pending" && (
                                                    <button onClick={() => handleVerify(p.id)}className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg">Verify</button>
                                                )}
                                                {p.status === "paid" && (
                                                    <button onClick={() => handleRefund(p.id)}className="px-3 py-1.5 text-xs bg-rose-500 text-white rounded-lg"                                                    >Refund</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedProof && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-2xl max-w-2xl">
                        <img src={`http://localhost:3000/uploads/${selectedProof}`}className="rounded-xl max-h-[80vh]"/>
                        <button onClick={() => setSelectedProof(null)}className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-lg">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
function SkeletonTableRows({ rows, cols }) {
    return Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
            {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded w-full" />
                </td>
            ))}
        </tr>
    ));
}
function EmptyState({ search }) {
    return (
        <div className="text-center py-10">
            <p className="font-bold">No Payments Found</p>
            <p className="text-sm text-slate-500">
                {search ? `No match for "${search}"` : "No payment data available"}
            </p>
        </div>
    );
}