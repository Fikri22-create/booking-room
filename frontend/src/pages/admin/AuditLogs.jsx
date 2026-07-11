import { useEffect, useState, useCallback } from "react"
import { getAllAuditLogs } from "../../services/auditLogService"
import { Activity, Search, Filter, ChevronLeft, ChevronRight, Clock, Eye } from "lucide-react"
import { toast } from "../../components/Toast"

const ACTION_COLORS = {
    CREATE: "bg-emerald-100 text-emerald-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
    LOGIN: "bg-purple-100 text-purple-700",
    LOGOUT: "bg-slate-100 text-slate-700",
    VERIFY: "bg-amber-100 text-amber-700",
    REFUND: "bg-orange-100 text-orange-700",
    REQUEST_RESET: "bg-indigo-100 text-indigo-700",
    RESET_PASSWORD: "bg-teal-100 text-teal-700",
}

const ENTITY_OPTIONS = ["User", "Room", "Booking", "Payment", "Amenity", "Review"]
const ACTION_OPTIONS = ["CREATE", "UPDATE", "DELETE", "LOGIN", "VERIFY", "REFUND", "REQUEST_RESET", "RESET_PASSWORD"]

export default function AuditLogs() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterAction, setFilterAction] = useState("")
    const [filterEntity, setFilterEntity] = useState("")
    const [page, setPage] = useState(1)
    const [totalPage, setTotalPage] = useState(1)
    const [totalData, setTotalData] = useState(0)
    const [selectedLog, setSelectedLog] = useState(null)
    const LIMIT = 20

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true)
            const params = { page, limit: LIMIT }
            if (filterAction) params.action = filterAction
            if (filterEntity) params.entity = filterEntity
            const res = await getAllAuditLogs(params)
            setLogs(res.data || [])
            setTotalPage(res.totalPage || 1)
            setTotalData(res.totalData || 0)
        } catch {
            toast.error("Failed to load audit logs")
        } finally {
            setLoading(false)
        }
    }, [page, filterAction, filterEntity])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    const filteredLogs = logs.filter(log => {
        if (!search) return true
        const kw = search.toLowerCase()
        return (
            log.user?.name?.toLowerCase().includes(kw) ||
            log.user?.email?.toLowerCase().includes(kw) ||
            log.action?.toLowerCase().includes(kw) ||
            log.entity?.toLowerCase().includes(kw) ||
            log.description?.toLowerCase().includes(kw)
        )
    })

    const formatDate = (dateStr) => {
        if (!dateStr) return "-"
        const d = new Date(dateStr)
        return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) +
            " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Track all important activities across the system
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm font-semibold text-slate-700">
                    <Activity size={16} className="text-[#003580]" />
                    {totalData.toLocaleString()} total records
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative sm:col-span-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search user, action, entity..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]/20"
                    />
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        value={filterAction}
                        onChange={e => { setFilterAction(e.target.value); setPage(1) }}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#003580] appearance-none cursor-pointer"
                    >
                        <option value="">All Actions</option>
                        {ACTION_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        value={filterEntity}
                        onChange={e => { setFilterEntity(e.target.value); setPage(1) }}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#003580] appearance-none cursor-pointer"
                    >
                        <option value="">All Entities</option>
                        {ENTITY_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="space-y-0">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                                </div>
                                <div className="w-16 h-6 bg-slate-200 rounded-full" />
                                <div className="w-24 h-3 bg-slate-200 rounded" />
                            </div>
                        ))}
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="py-20 text-center">
                        <Activity size={40} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500 font-semibold">No audit logs found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Entity</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">IP Address</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Time</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-[#003580] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                    {log.user?.name?.[0]?.toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-xs">{log.user?.name || "System"}</p>
                                                    <p className="text-[11px] text-slate-400">{log.user?.role || "-"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ACTION_COLORS[log.action] || "bg-slate-100 text-slate-600"}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="font-semibold text-slate-700 text-xs">{log.entity}</span>
                                        </td>
                                        <td className="px-6 py-3.5 text-slate-600 max-w-xs">
                                            <p className="truncate text-xs">{log.description || "-"}</p>
                                        </td>
                                        <td className="px-6 py-3.5 text-xs text-slate-500 font-mono">
                                            {log.ipAddress || "-"}
                                        </td>
                                        <td className="px-6 py-3.5 text-xs text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={12} />
                                                {formatDate(log.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="p-1.5 text-slate-400 hover:text-[#003580] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                title="View details"
                                            >
                                                <Eye size={15} />
                                            </button>
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
                    <p className="text-xs text-slate-500">
                        Page {page} of {totalPage} — {totalData} records
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: Math.min(5, totalPage) }, (_, i) => {
                            const pg = Math.max(1, Math.min(page - 2, totalPage - 4)) + i
                            return (
                                <button
                                    key={pg}
                                    onClick={() => setPage(pg)}
                                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${pg === page
                                        ? "bg-[#003580] text-white"
                                        : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                                    }`}
                                >
                                    {pg}
                                </button>
                            )
                        })}
                        <button
                            onClick={() => setPage(p => Math.min(totalPage, p + 1))}
                            disabled={page === totalPage}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-slate-900">Log Detail</h3>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer transition-colors"
                            >✕</button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <DetailRow label="User" value={`${selectedLog.user?.name || "System"} (${selectedLog.user?.email || "-"})`} />
                            <DetailRow label="Action" value={selectedLog.action} />
                            <DetailRow label="Entity" value={`${selectedLog.entity} #${selectedLog.entityId}`} />
                            <DetailRow label="Description" value={selectedLog.description || "-"} />
                            <DetailRow label="IP Address" value={selectedLog.ipAddress || "-"} />
                            <DetailRow label="User Agent" value={selectedLog.userAgent || "-"} />
                            <DetailRow label="Time" value={formatDate(selectedLog.createdAt)} />
                            {selectedLog.oldValues && (
                                <div>
                                    <p className="text-[11px] font-semibold uppercase text-slate-400 mb-1">Old Values</p>
                                    <pre className="bg-slate-50 rounded-lg p-3 text-xs overflow-auto max-h-32 text-slate-600">
                                        {JSON.stringify(selectedLog.oldValues, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {selectedLog.newValues && (
                                <div>
                                    <p className="text-[11px] font-semibold uppercase text-slate-400 mb-1">New Values</p>
                                    <pre className="bg-emerald-50 rounded-lg p-3 text-xs overflow-auto max-h-32 text-emerald-700">
                                        {JSON.stringify(selectedLog.newValues, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function DetailRow({ label, value }) {
    return (
        <div className="flex items-start gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 min-w-24">{label}</span>
            <span className="text-slate-700 break-all">{value}</span>
        </div>
    )
}
