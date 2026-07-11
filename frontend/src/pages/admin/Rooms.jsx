import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms, deleteRoom, exportRoomsExcel, getDeletedRooms, restoreRoom, permanentDeleteRoom } from "../../services/roomService";
import {
    Plus, Search, BedDouble, Wrench, Users, Pencil, Trash2, Images, PackageOpen, CalendarDays, RotateCcw, X, ChevronDown, AlertTriangle, Download, Loader2
} from "lucide-react";
import { toast } from "../../components/Toast";
import StatCard from "../../components/StatCard";
import ConfirmModal from "../../components/ConfirmModal";

export default function Rooms() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({
        totalPage: 1,
        totalData: 0
    });

    // Confirm Modals states
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [confirmRestore, setConfirmRestore] = useState(null);
    const [confirmPermanentDelete, setConfirmPermanentDelete] = useState(null);

    const fetchRooms = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getRooms({
                page,
                limit: 9,
                search
            });
            setRooms(response.data);
            setPagination({
                totalPage: response.totalPage,
                totalData: response.totalData
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to load rooms data");
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    const executeDelete = async (id) => {
        try {
            await deleteRoom(id);
            toast.success("Room deleted successfully");
            setConfirmDelete(null);
            fetchRooms();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to delete room");
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchTerm);
    };

    const handleExportExcel = async () => {
        try {
            setExportingExcel(true);
            const response = await exportRoomsExcel();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "rooms.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Rooms exported to Excel successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to export rooms to Excel");
        } finally {
            setExportingExcel(false);
        }
    };
    const availableRooms = rooms.filter((room) => room.status === "available").length;
    const maintenanceRooms = rooms.filter((room) => room.status === "maintenance").length;

    // Deleted rooms section
    const [showDeleted, setShowDeleted] = useState(false);
    const [deletedRooms, setDeletedRooms] = useState([]);
    const [deletedLoading, setDeletedLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchDeletedRooms = useCallback(async () => {
        try {
            setDeletedLoading(true);
            const res = await getDeletedRooms();
            setDeletedRooms(res.data || []);
        } catch { toast.error("Failed to load deleted rooms"); }
        finally { setDeletedLoading(false); }
    }, []);

    useEffect(() => {
        if (showDeleted) fetchDeletedRooms();
    }, [showDeleted, fetchDeletedRooms]);

    const executeRestore = async (id) => {
        try {
            setActionLoading(id + "_restore");
            await restoreRoom(id);
            toast.success("Room restored successfully!");
            setConfirmRestore(null);
            fetchDeletedRooms();
            fetchRooms();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to restore room");
        } finally { setActionLoading(null); }
    };

    const executePermanentDelete = async (id) => {
        try {
            setActionLoading(id + "_perm");
            await permanentDeleteRoom(id);
            toast.success("Room permanently deleted");
            setConfirmPermanentDelete(null);
            fetchDeletedRooms();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to permanently delete room");
        } finally { setActionLoading(null); }
    };
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Rooms Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage hotel rooms, availability, and pricing</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleExportExcel}
                        disabled={exportingExcel || rooms.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm font-medium shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {exportingExcel ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        Export Excel
                    </button>
                    <button
                        onClick={() => navigate("/admin/rooms/add")}
                        className="bg-[#003580] hover:bg-[#002760] text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm font-medium shadow-sm cursor-pointer"
                    >
                        <Plus size={18} />
                        Add New Room
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard title="Total Rooms" value={pagination.totalData} icon={<BedDouble size={20} />} color="blue" />
                <StatCard title="Available" value={availableRooms} icon={<Users size={20} />} color="emerald" />
                <StatCard title="Maintenance" value={maintenanceRooms} icon={<Wrench size={20} />} color="amber" />
            </div>

            {/* Deleted Rooms Section (Trash) - Moved to Top */}
            <div className="border border-rose-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                    onClick={() => setShowDeleted(v => !v)}
                    className="w-full flex items-center justify-between p-4 bg-rose-50 hover:bg-rose-100 transition-colors text-left cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-rose-500" />
                        <span className="text-sm font-semibold text-rose-700">Deleted Rooms (Trash)</span>
                        <span className="text-xs text-rose-400">Soft-deleted rooms that can be restored</span>
                    </div>
                    <ChevronDown size={16} className={`text-rose-400 transition-transform ${showDeleted ? "rotate-180" : ""}`} />
                </button>
                {showDeleted && (
                    <div className="p-4 bg-white">
                        {deletedLoading ? (
                            <div className="space-y-2">
                                {[1, 2].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
                            </div>
                        ) : deletedRooms.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">No deleted rooms found.</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {deletedRooms.map(room => (
                                    <div key={room.id} className="flex items-center justify-between py-3 gap-3">
                                        <div className="flex items-center gap-3">
                                            {room.image ? (
                                                <img
                                                    src={`http://localhost:3000/uploads/${room.image}`}
                                                    alt={`Room ${room.room_number}`}
                                                    className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                                    <BedDouble size={16} className="text-slate-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Room {room.room_number}</p>
                                                <p className="text-xs text-slate-400 capitalize">{room.room_type} · Deleted {new Date(room.deletedAt).toLocaleDateString("id-ID")}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setConfirmRestore(room.id)}
                                                disabled={!!actionLoading}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                                            >
                                                <RotateCcw size={12} />
                                                Restore
                                            </button>
                                            <button
                                                onClick={() => setConfirmPermanentDelete(room.id)}
                                                disabled={!!actionLoading}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                                            >
                                                <X size={12} />
                                                Delete Forever
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Standardized Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
                <form onSubmit={handleSearch} className="flex gap-2.5">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search room number or type..."
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-[#003580] hover:bg-[#002760] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm cursor-pointer"
                    >
                        Search
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonRoomCard key={n} />)}
                </div>
            ) : rooms.length === 0 ? (
                <EmptyState search={search} />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <div
                                key={room.id}
                                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col"
                            >
                                <div className="h-48 bg-slate-100 relative overflow-hidden shrink-0">
                                    <img
                                        src={
                                            room.gallery?.[0]?.image
                                                ? `http://localhost:3000/uploads/${room.gallery[0].image}`
                                                : room.image
                                                ? `http://localhost:3000/uploads/${room.image}`
                                                : "https://placehold.co/600x400?text=No+Image"
                                        }
                                        alt={`Room ${room.room_number}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider backdrop-blur-md ${
                                            room.status === "available"
                                                ? "bg-emerald-500/90 text-white shadow-sm"
                                                : "bg-amber-500/90 text-white shadow-sm"
                                        }`}>
                                            {room.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">Room {room.room_number}</h3>
                                            <p className="text-sm text-slate-500 capitalize mt-0.5">
                                                {room.room_type} Room
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 mb-6 flex-1 border-t border-slate-100 pt-3">
                                        <p className="text-sm text-slate-600 flex items-center justify-between">
                                            <span>Capacity</span>
                                            <strong className="text-slate-900">{room.capacity} Guests</strong>
                                        </p>
                                        <p className="text-sm text-slate-600 flex items-center justify-between">
                                            <span>Price</span>
                                            <strong className="text-slate-900">
                                                Rp {Number(room.price_per_night).toLocaleString("id-ID")}
                                                <span className="text-xs text-slate-500 font-normal"> /night</span>
                                            </strong>
                                        </p>
                                    </div>
                                    <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => navigate(`/admin/rooms/gallery/${room.id}`)}
                                            className="flex-1 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-200 py-2 rounded-xl flex justify-center items-center transition-colors cursor-pointer"
                                            title="Manage Gallery"
                                        >
                                            <Images size={16} />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/admin/rooms/${room.id}/bookings`)}
                                            className="flex-1 bg-slate-50 hover:bg-purple-50 text-slate-500 hover:text-purple-600 border border-slate-200 hover:border-purple-200 py-2 rounded-xl flex justify-center items-center transition-colors cursor-pointer"
                                            title="View Bookings"
                                        >
                                            <CalendarDays size={16} />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/admin/rooms/edit/${room.id}`)}
                                            className="flex-1 bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-600 border border-slate-200 hover:border-amber-200 py-2 rounded-xl flex justify-center items-center transition-colors cursor-pointer"
                                            title="Edit Room"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(room.id)}
                                            className="flex-1 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 py-2 rounded-xl flex justify-center items-center transition-colors cursor-pointer"
                                            title="Delete Room"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {pagination.totalPage > 1 && (
                        <div className="flex justify-center items-center gap-2 pt-4">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            >
                                Previous
                            </button>
                            <div className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-sm">
                                Page {page} of {pagination.totalPage}
                            </div>
                            <button
                                disabled={page >= pagination.totalPage}
                                onClick={() => setPage(page + 1)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={confirmDelete !== null}
                title="Delete Room"
                message="Are you sure you want to delete this room? This will hide the room from users but retain historical data."
                onConfirm={() => executeDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
                confirmText="Yes, Delete"
                type="danger"
            />

            {/* Confirm Restore Modal */}
            <ConfirmModal
                isOpen={confirmRestore !== null}
                title="Restore Room"
                message="Do you want to restore this room and make it available for booking again?"
                onConfirm={() => executeRestore(confirmRestore)}
                onCancel={() => setConfirmRestore(null)}
                confirmText="Yes, Restore"
                type="primary"
            />

            {/* Confirm Permanent Delete Modal */}
            <ConfirmModal
                isOpen={confirmPermanentDelete !== null}
                title="Delete Permanently"
                message="Are you sure you want to permanently delete this room? This action is irreversible and will delete all associated data."
                onConfirm={() => executePermanentDelete(confirmPermanentDelete)}
                onCancel={() => setConfirmPermanentDelete(null)}
                confirmText="Delete Forever"
                type="danger"
            />
        </div>
    );
}

function SkeletonRoomCard() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse flex flex-col h-[380px]">
            <div className="h-48 bg-slate-200 w-full shrink-0"></div>
            <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="space-y-2">
                    <div className="h-6 bg-slate-200 rounded-md w-1/2"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
                </div>
                <div className="space-y-2 mt-2">
                    <div className="h-4 bg-slate-200 rounded-md w-full"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-full"></div>
                </div>
                <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                    <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
                    <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
                    <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ search }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <div className="bg-white p-6 rounded-full mb-5 shadow-sm border border-slate-100">
                <PackageOpen size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Rooms Found</h3>
            <p className="text-slate-500 max-w-md text-sm">
                {search 
                    ? `We couldn't find any rooms matching "${search}". Try adjusting your search keywords.` 
                    : "Your hotel currently has no rooms. Click 'Add New Room' to get started."}
            </p>
        </div>
    );
}