import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../../services/roomService";
import { Upload, BedDouble, Image as ImageIcon } from "lucide-react";
import { toast } from "../../components/Toast";

export default function AddRoom() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [form, setForm] = useState({
        room_number: "",
        room_type: "standard",
        capacity: "",
        price_per_night: "",
        description: ""
    });
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("room_number", form.room_number);
            formData.append("room_type", form.room_type);
            formData.append("capacity", form.capacity);
            formData.append("price_per_night", form.price_per_night);
            formData.append("description", form.description);
            if (image) {
                formData.append("image", image);
            }
            await createRoom(formData);
            toast.success("Room created successfully!");
            navigate("/admin/rooms");
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to create room.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Add New Room</h1>
                <p className="text-sm text-slate-500 mt-1">Fill in the details below to add a new room to your hotel.</p>
            </div>
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8"
            >
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-5">
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-700">
                                Room Number
                            </label>
                            <input
                                type="text"
                                name="room_number"
                                value={form.room_number}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                placeholder="e.g. 101"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-700">
                                Room Type
                            </label>
                            <select
                                name="room_type"
                                value={form.room_type}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white"
                            >
                                <option value="standard">Standard</option>
                                <option value="deluxe">Deluxe</option>
                                <option value="suite">Suite</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                                    Capacity (Guests)
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={form.capacity}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                    placeholder="e.g. 2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                                    Price / Night (Rp)
                                </label>
                                <input
                                    type="number"
                                    name="price_per_night"
                                    value={form.price_per_night}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                    placeholder="e.g. 500000"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-slate-700">
                            Cover Image
                        </label>
                        <label className="relative border-2 border-dashed border-slate-300 rounded-2xl h-64 flex flex-col justify-center items-center cursor-pointer overflow-hidden hover:bg-slate-50 hover:border-slate-400 transition-colors group">
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
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
                <div className="mt-6">
                    <label className="block mb-1.5 text-sm font-medium text-slate-700">
                        Room Description
                    </label>
                    <textarea
                        rows="4"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all resize-y"
                        placeholder="Describe the room features, bed size, view, etc..."
                        required
                    />
                </div>
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/rooms")}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm font-medium min-w-[140px]"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <BedDouble size={16} />
                                <span>Create Room</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}