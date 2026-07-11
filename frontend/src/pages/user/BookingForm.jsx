import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CalendarDays, Users, MessageSquare, BedDouble, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "../../components/Toast";
import { getRoomById, getAvailableRooms } from "../../services/roomService";
import { createBooking } from "../../services/userBookingService";

export default function BookingForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    const [availabilityStatus, setAvailabilityStatus] = useState(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [form, setForm] = useState({
        check_in: "",
        check_out: "",
        guest_count: 1,
        special_request: ""
    });

    const loadRoom = useCallback(async () => {
        try {
            const res = await getRoomById(id);
            setRoom(res?.data || null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load room");
        }
    }, [id]);

    useEffect(() => {
        loadRoom();
    }, [loadRoom]);

    useEffect(() => {
        if (!form.check_in || !form.check_out) {
            setAvailabilityStatus(null);
            return;
        }
        if (new Date(form.check_out) <= new Date(form.check_in)) {
            setAvailabilityStatus(null);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setCheckingAvailability(true);
                const res = await getAvailableRooms(form.check_in, form.check_out);
                const availableIds = (res?.data || []).map((r) => r.id);
                if (availableIds.includes(Number(id))) {
                    setAvailabilityStatus("available");
                } else {
                    setAvailabilityStatus("unavailable");
                }
            } catch (error) {
                console.error(error);
                setAvailabilityStatus(null);
            } finally {
                setCheckingAvailability(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [form.check_in, form.check_out, id]);

    const nights =
        form.check_in && form.check_out
            ? Math.max(0, Math.ceil((new Date(form.check_out) - new Date(form.check_in)) / 86400000))
            : 0;

    const total = nights * (room?.price_per_night || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.check_in || !form.check_out) {
            return toast.error("Please select check in and check out date");
        }
        if (nights <= 0) {
            return toast.error("Check out date must be after check in");
        }
        if (availabilityStatus === "unavailable") {
            return toast.error("Room is not available for selected dates");
        }
        try {
            setLoading(true);
            await createBooking({ roomId: room.id, ...form });
            toast.success("Booking created successfully");
            navigate("/user/my-bookings");
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to create booking");
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split("T")[0];

    if (!room) {
        return (
            <div className="h-72 flex flex-col justify-center items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#003580] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Loading room details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Book Room</h1>
                <p className="text-sm text-slate-500 mt-1">Complete your booking information.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Check In</label>
                                <div className="relative">
                                    <CalendarDays size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="date"
                                        min={today}
                                        value={form.check_in}
                                        onChange={(e) => setForm({ ...form, check_in: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580] text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Check Out</label>
                                <div className="relative">
                                    <CalendarDays size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="date"
                                        min={form.check_in || today}
                                        value={form.check_out}
                                        onChange={(e) => setForm({ ...form, check_out: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580] text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {(checkingAvailability || availabilityStatus) && (
                            <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium transition-all ${
                                checkingAvailability
                                    ? "bg-slate-50 border-slate-200 text-slate-500"
                                    : availabilityStatus === "available"
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-rose-50 border-rose-200 text-rose-700"
                            }`}>
                                {checkingAvailability ? (
                                    <><Loader2 size={16} className="animate-spin" /> Checking availability...</>
                                ) : availabilityStatus === "available" ? (
                                    <><CheckCircle size={16} /> Room is available for your selected dates!</>
                                ) : (
                                    <><XCircle size={16} /> Room is already booked for these dates. Please choose different dates.</>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Guest Count</label>
                            <div className="relative">
                                <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                                <select
                                    value={form.guest_count}
                                    onChange={(e) => setForm({ ...form, guest_count: Number(e.target.value) })}
                                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580] text-sm appearance-none bg-white cursor-pointer"
                                >
                                    {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                                        <option key={num} value={num}>
                                            {num} {num === 1 ? "Guest" : "Guests"}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-slate-400">
                                    ▼
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Max capacity: {room.capacity} guests</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Special Request <span className="text-slate-400 font-normal">(optional)</span></label>
                            <div className="relative">
                                <MessageSquare size={18} className="absolute left-3 top-4 text-slate-400" />
                                <textarea
                                    rows={4}
                                    value={form.special_request}
                                    onChange={(e) => setForm({ ...form, special_request: e.target.value })}
                                    placeholder="Any additional notes or requests..."
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580] text-sm resize-none"
                                />
                            </div>
                        </div>

                        {availabilityStatus === "unavailable" && (
                            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                Booking is disabled because the room is unavailable for your selected dates.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || availabilityStatus === "unavailable" || checkingAvailability}
                            className="w-full bg-[#003580] hover:bg-[#002a66] text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex justify-center items-center gap-2">
                                    <Loader2 size={18} className="animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                "Confirm Booking"
                            )}
                        </button>
                    </form>
                </div>

                <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {(room.gallery?.[0]?.image || room.image) && (
                            <img
                                src={`http://localhost:3000/uploads/${room.gallery?.[0]?.image || room.image}`}
                                alt={room.room_number}
                                className="w-full h-40 object-cover"
                            />
                        )}
                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <BedDouble size={18} className="text-[#003580]" />
                                <h3 className="font-bold text-slate-900">Room Information</h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Room Number</span>
                                    <span className="font-semibold">{room.room_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Type</span>
                                    <span className="font-semibold capitalize">{room.room_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Capacity</span>
                                    <span className="font-semibold">{room.capacity} guests</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Price / Night</span>
                                    <span className="font-bold text-[#003580]">
                                        Rp {Number(room.price_per_night).toLocaleString("id-ID")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h3 className="font-bold text-slate-900 mb-4">Booking Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Check In</span>
                                <span className="font-medium">
                                    {form.check_in
                                        ? new Date(form.check_in).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                                        : "—"}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Check Out</span>
                                <span className="font-medium">
                                    {form.check_out
                                        ? new Date(form.check_out).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                                        : "—"}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Duration</span>
                                <span className="font-medium">{nights > 0 ? `${nights} night${nights !== 1 ? "s" : ""}` : "—"}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Guests</span>
                                <span className="font-medium">{form.guest_count} guest{form.guest_count !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Price / Night</span>
                                <span>Rp {Number(room.price_per_night).toLocaleString("id-ID")}</span>
                            </div>
                            <hr className="border-slate-100" />
                            <div className="flex justify-between font-bold text-base">
                                <span>Total</span>
                                <span className="text-[#003580]">
                                    {nights > 0 ? `Rp ${Number(total).toLocaleString("id-ID")}` : "—"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}