import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRoomById, updateRoom } from "../../services/roomService";
import { Upload, Save, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "../../components/Toast";

export default function EditRoom() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [form, setForm] = useState({
        room_number: "",
        room_type: "",
        capacity: "",
        price_per_night: "",
        description: "",
        status: "available"
    });

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const response = await getRoomById(id);
                const room = response.data;
                setForm({
                    room_number: room.room_number || "",
                    room_type: room.room_type || "standard",
                    capacity: room.capacity || "",
                    price_per_night: room.price_per_night || "",
                    description: room.description || "",
                    status: room.status || "available"
                });
                if (room.image) {
                    setPreview(`http://localhost:3000/uploads/${room.image}`);
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load room data");
                navigate("/admin/rooms");
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [id, navigate]);
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };
    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const formData = new FormData();
            Object.keys(form).forEach((key) => {
                formData.append(key, form[key]);
            });
            if (image) {
                formData.append("image", image);
            }
            await updateRoom(id, formData);
            toast.success("Room updated successfully! ✨");
            navigate("/admin/rooms");
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to update room");
        } finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col justify-center items-center gap-4">
                <Loader2 size={32} className="text-slate-900 animate-spin" />
                <p className="text-sm font-medium text-slate-500">Loading room data...</p>
            </div>
        );
    }
    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Edit Room</h1>
                <p className="text-sm text-slate-500 mt-1">Update information for Room {form.room_number}.</p>
            </div>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-5">
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-700">Room Number</label>
                            <input
                                type="text"
                                name="room_number"
                                value={form.room_number}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-700">Room Type</label>
                            <select name="room_type" value={form.room_type} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white">
                                <option value="standard">Standard</option>
                                <option value="deluxe">Deluxe</option>
                                <option value="suite">Suite</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-slate-700">Capacity (Guests)</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={form.capacity}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-slate-700">Price / Night (Rp)</label>
                                <input
                                    type="number"
                                    name="price_per_night"
                                    value={form.price_per_night}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-700">Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white"
                            >
                                <option value="available">Available</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-slate-700">Room Image</label>
                        <label className="relative border-2 border-dashed border-slate-300 rounded-2xl h-[284px] flex flex-col justify-center items-center cursor-pointer overflow-hidden hover:bg-slate-50 hover:border-slate-400 transition-colors group">
                            {preview ? (
                                <>
                                    <img
                                        src={preview}
                                        alt="Room Preview"
                                        className="w-full h-full object-cover group-hover:opacity-50 transition-opacity duration-300"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium">
                                            <Upload size={16} />
                                            Change Image
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-slate-500">
                                    <div className="bg-slate-100 p-4 rounded-full mb-3 group-hover:bg-slate-200 transition-colors">
                                        <ImageIcon size={32} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                                    </div>
                                    <p className="text-sm font-medium">Click to upload image</p>
                                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 2MB</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={handleImage}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
                <div className="mt-6">
                    <label className="block mb-1.5 text-sm font-medium text-slate-700">Description</label>
                    <textarea
                        rows="4"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all resize-y"
                        required
                    />
                </div>
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                    <button type="button" onClick={() => navigate("/admin/rooms")} className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Cancel</button>
                    <button type="submit" disabled={saving} className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm font-medium min-w-[140px]">
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                <span>Update Room</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}