import { useCallback, useEffect, useState, useRef } from "react"
import { getRooms } from "../../services/roomService"
import { Link } from "react-router-dom"
import { BedDouble, Search, Users, ArrowRight, SlidersHorizontal } from "lucide-react"
import Pagination from "../../components/Pagination"
import WishlistButton from "../../components/WishlistButton"
import SkeletonLoader from "../../components/SkeletonLoader"
import EmptyState from "../../components/EmptyState"
import StatCard from "../../components/StatCard"

export default function UserRooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roomType, setRoomType] = useState("");
    const [capacity, setCapacity] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [totalData, setTotalData] = useState(0);
    const searchTimer = useRef(null);

    const fetchRooms = useCallback(async (params) => {
        try {
            setLoading(true);
            const res = await getRooms(params);
            setRooms(res?.data || []);
            setTotalPage(res?.totalPage || 1);
            setTotalData(res?.totalData || 0);
        } catch (err) {
            console.error(err);
            setRooms([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setCurrentPage(1);
            fetchRooms({
                search: search || undefined,
                room_type: roomType || undefined,
                capacity: capacity || undefined,
                status: "available",
                page: 1,
                limit: 9
            });
        }, 400);
        return () => clearTimeout(searchTimer.current);
    }, [search, roomType, capacity, fetchRooms]);

    useEffect(() => {
        fetchRooms({
            search: search || undefined,
            room_type: roomType || undefined,
            capacity: capacity || undefined,
            status: "available",
            page: currentPage,
            limit: 9
        });
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Available Rooms</h1>
                <p className="text-sm text-slate-500 mt-1">Browse and book your perfect room.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Rooms" value={totalData} icon={<BedDouble size={18} />} color="blue" />
                <StatCard title="Room Types" value={3} icon={<SlidersHorizontal size={18} />} color="emerald" />
                <StatCard title="Page" value={`${currentPage} / ${totalPage}`} icon={<Users size={18} />} color="amber" />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[180px]">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by room number..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm bg-slate-50 transition"
                    />
                </div>
                <select
                    value={roomType}
                    onChange={(e) => { setRoomType(e.target.value); setCurrentPage(1); }}
                    className="border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20 cursor-pointer text-slate-700"
                >
                    <option value="">All Types</option>
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                </select>
                <select
                    value={capacity}
                    onChange={(e) => { setCapacity(e.target.value); setCurrentPage(1); }}
                    className="border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20 cursor-pointer text-slate-700"
                >
                    <option value="">Any Capacity</option>
                    <option value="1">1+ Guests</option>
                    <option value="2">2+ Guests</option>
                    <option value="3">3+ Guests</option>
                    <option value="4">4+ Guests</option>
                </select>
            </div>

            {/* Room Cards */}
            {loading ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonLoader key={i} type="card" />
                    ))}
                </div>
            ) : rooms.length === 0 ? (
                <EmptyState
                    icon="rooms"
                    title="No rooms found"
                    description="Try adjusting your search or filters to find available rooms."
                    actionLabel="Clear Filters"
                    onAction={() => { setSearch(""); setRoomType(""); setCapacity(""); }}
                />
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {rooms.map((room) => {
                        const image = room.gallery?.[0]?.image || room.image;
                        return <RoomCard key={room.id} room={room} image={image} />;
                    })}
                </div>
            )}

            <Pagination currentPage={currentPage} totalPage={totalPage} onPageChange={handlePageChange} />
        </div>
    );
}

function RoomCard({ room, image }) {
    const typeColor = {
        standard: "bg-slate-100 text-slate-600",
        deluxe:   "bg-[#003580]/10 text-[#003580]",
        suite:    "bg-amber-100 text-amber-700",
    }[room.room_type] ?? "bg-slate-100 text-slate-600";

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            {/* Image */}
            <div className="h-48 bg-slate-100 overflow-hidden relative">
                {image ? (
                    <img
                        src={`http://localhost:3000/uploads/${image}`}
                        alt={`Room ${room.room_number}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BedDouble size={40} className="text-slate-300" />
                    </div>
                )}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                    Available
                </span>
                <div className="absolute top-3 right-3">
                    <WishlistButton roomId={room.id} />
                </div>
            </div>

            {/* Body */}
            <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-bold text-slate-900">Room {room.room_number}</h2>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize ${typeColor}`}>
                        {room.room_type}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users size={13} />
                    <span>{room.capacity} guests max</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-end justify-between">
                    <div>
                        <p className="text-xs text-slate-400">Per night</p>
                        <p className="text-lg font-bold text-[#003580]">
                            Rp {Number(room.price_per_night).toLocaleString("id-ID")}
                        </p>
                    </div>
                    <Link
                        to={`/user/rooms/${room.id}`}
                        className="flex items-center gap-1.5 bg-[#003580] hover:bg-[#002a66] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    >
                        View <ArrowRight size={13} />
                    </Link>
                </div>
            </div>
        </div>
    );
}