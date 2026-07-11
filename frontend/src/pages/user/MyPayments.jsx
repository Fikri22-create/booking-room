import { useCallback, useEffect, useMemo, useState } from "react"
import { getMyPayments, downloadInvoice } from "../../services/paymentService"
import { CreditCard, Clock3, CheckCircle2, RotateCcw, Search, Eye, Download, X } from "lucide-react"
import { toast } from "../../components/Toast"
import SkeletonLoader from "../../components/SkeletonLoader"
import EmptyState from "../../components/EmptyState"
import StatCard from "../../components/StatCard"

const STATUS_BADGE = {
    paid:     <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-700">Paid</span>,
    refunded: <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-700">Refunded</span>,
    pending:  <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-700">Pending</span>,
}

export default function MyPayments() {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [selectedProof, setSelectedProof] = useState(null)
    const [downloadingInvoice, setDownloadingInvoice] = useState(null)

    const fetchPayments = useCallback(async () => {
        try {
            setLoading(true)
            const response = await getMyPayments()
            setPayments(response.data || [])
        } catch {
            toast.error("Failed to load payments")
        } finally {
            setLoading(false)
        }
    }, [])

    const handleDownloadInvoice = async (bookingId, paymentCode) => {
        try {
            setDownloadingInvoice(bookingId)
            const response = await downloadInvoice(bookingId)
            const blob = new Blob([response.data], { type: "application/pdf" })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `invoice-${paymentCode}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            toast.success("Invoice downloaded successfully!")
        } catch {
            toast.error("Failed to download invoice. Invoice is only available for verified payments.")
        } finally {
            setDownloadingInvoice(null)
        }
    }

    useEffect(() => { fetchPayments() }, [fetchPayments])

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const keyword = search.toLowerCase()
            const matchSearch = p.payment_code?.toLowerCase().includes(keyword)
            const matchStatus = !statusFilter || p.status === statusFilter
            return matchSearch && matchStatus
        })
    }, [payments, search, statusFilter])

    const pending  = payments.filter(p => p.status === "pending").length
    const paid     = payments.filter(p => p.status === "paid").length
    const refunded = payments.filter(p => p.status === "refunded").length

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Payments</h1>
                <p className="text-sm text-slate-500 mt-1">View payment history and download invoices.</p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total"    value={payments.length} icon={<CreditCard size={18} />}    color="blue" />
                <StatCard title="Pending"  value={pending}         icon={<Clock3 size={18} />}         color="amber" />
                <StatCard title="Paid"     value={paid}            icon={<CheckCircle2 size={18} />}   color="emerald" />
                <StatCard title="Refunded" value={refunded}        icon={<RotateCcw size={18} />}      color="rose" />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[180px]">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search payment code..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm bg-slate-50 transition"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20 cursor-pointer text-slate-700"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-6 py-4 text-left">Code</th>
                                <th className="px-6 py-4 text-left">Method</th>
                                <th className="px-6 py-4 text-left">Amount</th>
                                <th className="px-6 py-4 text-left">Proof</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-left">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-6">
                                        <SkeletonLoader type="table" rows={5} columns={7} />
                                    </td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-6">
                                        <EmptyState
                                            icon="payments"
                                            title="No payments found"
                                            description="You haven't made any payments yet."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-medium text-xs text-slate-700">
                                            {payment.payment_code}
                                        </td>
                                        <td className="px-6 py-4 capitalize text-slate-600">
                                            {payment.payment_method?.replace(/_/g, " ")}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                            Rp {Number(payment.amount).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.proof_image ? (
                                                <button
                                                    onClick={() => setSelectedProof(payment.proof_image)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#003580] hover:bg-[#002a66] text-white rounded-lg text-xs font-medium transition cursor-pointer"
                                                >
                                                    <Eye size={12} /> View
                                                </button>
                                            ) : <span className="text-slate-300 text-xs">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {STATUS_BADGE[payment.status] || STATUS_BADGE.pending}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">
                                            {new Date(payment.createdAt).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.status === "paid" && payment.Booking ? (
                                                <button
                                                    onClick={() => handleDownloadInvoice(payment.Booking.id, payment.payment_code)}
                                                    disabled={downloadingInvoice === payment.Booking.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap"
                                                >
                                                    {downloadingInvoice === payment.Booking.id ? (
                                                        <><div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> Downloading...</>
                                                    ) : (
                                                        <><Download size={12} /> Invoice PDF</>
                                                    )}
                                                </button>
                                            ) : (
                                                <span className="text-slate-300 text-xs">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Proof Modal */}
            {selectedProof && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedProof(null)}
                >
                    <div
                        className="bg-white p-4 rounded-2xl max-w-2xl w-full shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-slate-800">Payment Proof</p>
                            <button
                                onClick={() => setSelectedProof(null)}
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <img
                            src={`http://localhost:3000/uploads/${selectedProof}`}
                            alt="Payment Proof"
                            className="rounded-xl max-h-[70vh] w-full object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}