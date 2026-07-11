import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UploadCloud, CreditCard, Image as ImageIcon, Loader2, X, CheckCircle, ArrowLeft } from "lucide-react";
import api from "../../services/api";
import { toast } from "../../components/Toast";

const PAYMENT_METHODS = [
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "credit_card",  label: "Credit Card" },
    { value: "e_wallet",     label: "E-Wallet" },
];

export default function PaymentUpload() {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [method, setMethod] = useState("bank_transfer");
    const [loading, setLoading] = useState(false);
    const [dragging, setDragging] = useState(false);

    // Fetch booking info untuk tampilkan detail
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get(`/bookings/${bookingId}`);
                setBooking(res.data?.data || null);
            } catch {
                // silently fail — sidebar will just show booking ID
            }
        })();
    }, [bookingId]);

    const handleFile = useCallback((selectedFile) => {
        if (!selectedFile) return;
        if (!selectedFile.type.startsWith("image/")) {
            toast.error("Only image files are allowed (JPG, PNG, etc.)");
            return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5 MB");
            return;
        }
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) handleFile(dropped);
    }, [handleFile]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => setDragging(false);

    const removeFile = () => {
        setFile(null);
        setPreview(null);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!file) return toast.error("Please upload a payment proof image");

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("bookingId", bookingId);
            formData.append("payment_method", method);
            formData.append("proof_image", file);
            await api.post("/payments", formData);
            toast.success("Payment submitted! Admin will verify shortly.");
            navigate("/user/payments");
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to upload payment");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (n) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—";

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate("/user/my-bookings")}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Upload Payment Proof</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Submit your transfer receipt for booking verification.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Method */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Payment Method
                            </label>
                            <div className="relative">
                                <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    value={method}
                                    onChange={(e) => setMethod(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/30 focus:border-[#003580] bg-white cursor-pointer"
                                >
                                    {PAYMENT_METHODS.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Upload area */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Payment Proof <span className="text-red-400">*</span>
                            </label>

                            {!preview ? (
                                <label
                                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${
                                        dragging
                                            ? "border-[#003580] bg-blue-50"
                                            : "border-slate-300 hover:border-[#003580] hover:bg-slate-50"
                                    }`}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                >
                                    <UploadCloud
                                        size={44}
                                        className={`mb-3 transition-colors ${dragging ? "text-[#003580]" : "text-slate-400"}`}
                                    />
                                    <p className="font-semibold text-slate-700 text-sm">
                                        {dragging ? "Drop image here" : "Click or drag & drop to upload"}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, JPEG · Max 5 MB</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => handleFile(e.target.files[0])}
                                    />
                                </label>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full max-h-72 object-cover rounded-2xl border border-slate-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="absolute top-3 right-3 bg-white border border-slate-200 rounded-full p-1.5 shadow text-slate-600 hover:text-red-600 hover:border-red-200 transition"
                                    >
                                        <X size={15} />
                                    </button>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                        <CheckCircle size={13} className="text-emerald-500" />
                                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !file}
                            className="w-full bg-[#003580] hover:bg-[#002a6b] text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                            ) : (
                                <><UploadCloud size={18} /> Submit Payment</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Booking summary */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <ImageIcon size={16} className="text-[#003580]" />
                            Booking Summary
                        </h3>
                        {booking ? (
                            <div className="space-y-2.5 text-sm">
                                <Row label="Booking Code" value={<span className="font-mono text-xs">{booking.booking_code}</span>} />
                                <Row label="Room" value={`Room ${booking.room?.room_number} — ${booking.room?.room_type}`} />
                                <Row label="Check In" value={formatDate(booking.check_in)} />
                                <Row label="Check Out" value={formatDate(booking.check_out)} />
                                <Row label="Guests" value={`${booking.guest_count} guest${booking.guest_count !== 1 ? "s" : ""}`} />
                                <div className="pt-2 mt-2 border-t border-slate-100">
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-700">Total</span>
                                        <span className="text-[#003580]">{formatCurrency(booking.total_price)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2.5 text-sm">
                                <Row label="Booking ID" value={`#${bookingId}`} />
                                <p className="text-xs text-slate-400 italic">Loading booking details...</p>
                            </div>
                        )}
                    </div>

                    {/* Payment guide */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h3 className="font-bold text-slate-900 mb-3">Payment Guide</h3>
                        <ul className="space-y-2.5 text-sm text-slate-600">
                            <li className="flex gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#003580] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                                Complete payment according to your booking total amount.
                            </li>
                            <li className="flex gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#003580] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                                Take a clear screenshot or photo of the transfer receipt.
                            </li>
                            <li className="flex gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#003580] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                                Upload the image as payment proof above.
                            </li>
                            <li className="flex gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#003580] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
                                Admin will verify your payment within 24 hours.
                            </li>
                        </ul>
                    </div>

                    {/* Tips box */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                        <div className="flex gap-3">
                            <ImageIcon size={18} className="text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-blue-700 text-sm">Upload Tips</p>
                                <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                                    Make sure the image is clear, readable, and shows the full transaction details including amount and date.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between items-center gap-2">
            <span className="text-slate-500 shrink-0">{label}</span>
            <span className="font-semibold text-slate-800 text-right">{value}</span>
        </div>
    );
}