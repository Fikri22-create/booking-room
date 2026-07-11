import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getRoomGallery, uploadRoomGallery, deleteGalleryImage } from "../../services/roomService";
import { Trash2, UploadCloud, ImagePlus, ImageOff, ArrowLeft, Loader2, X } from "lucide-react";
import { toast } from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";

export default function RoomGallery() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [gallery, setGallery] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const fetchGallery = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getRoomGallery(id);
            setGallery(response.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load gallery images");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchGallery();
    }, [fetchGallery]);
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles((prev) => [...prev, ...selectedFiles]);
        e.target.value = null; 
    };
    const removeSelectedFile = (indexToRemove) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };
    const handleUpload = async () => {
        if (files.length === 0) {
            return toast.error("Please select at least one image first");
        }
        try {
            setUploading(true);
            const formData = new FormData();
            files.forEach((file) => {
                formData.append("images", file);
            });
            await uploadRoomGallery(id, formData);
        
            toast.success("Images uploaded successfully! 📸");
            setFiles([]);
            fetchGallery();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to upload images");
        } finally {
            setUploading(false);
        }
    };

    const executeDelete = async (imageId) => {
        try {
            await deleteGalleryImage(imageId);
            toast.success("Image deleted successfully");
            setConfirmDelete(null);
            fetchGallery();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete image");
        }
    };
    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button onClick={() => navigate("/admin/rooms")}className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-2 transition-colors">
                        <ArrowLeft size={16} /> Back to Rooms
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">Room Gallery</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage photos for Room ID: {id}</p>
                </div>
                <Link
                    to={`/admin/rooms/${id}/bookings`}
                    className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 bg-[#003580] text-white rounded-xl hover:bg-[#002a6b] transition shadow-sm"
                >
                    View Bookings
                </Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900 mb-4">Upload New Images</h2>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <label className="flex-1 w-full border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer min-h-[160px] group">
                        <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            <ImagePlus className="text-slate-400 group-hover:text-slate-600 transition-colors" size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-700">Click to browse images</p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB. You can select multiple.</p>
                        <input
                            type="file"
                            multiple
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                    <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
                        <button
                            onClick={handleUpload}
                            disabled={uploading || files.length === 0}
                            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm font-medium shadow-sm"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={18} />
                                    Upload {files.length > 0 ? `(${files.length})` : ""}
                                </>
                            )}
                        </button>
                        {files.length > 0 && (
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 max-h-[140px] overflow-y-auto">
                                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Selected Files:</p>
                                <ul className="space-y-2">
                                    {files.map((file, index) => (
                                        <li key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm">
                                            <span className="text-xs text-slate-700 truncate pr-2" title={file.name}>
                                                {file.name}
                                            </span>
                                            <button 
                                                onClick={() => removeSelectedFile(index)}
                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Current Gallery</h2>
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {[1, 2, 3, 4].map((n) => <SkeletonGalleryCard key={n} />)}
                    </div>
                ) : gallery.length === 0 ? (
                    <EmptyGalleryState />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {gallery.map((item) => (
                            <div
                                key={item.id}
                                className="relative group rounded-2xl overflow-hidden shadow-sm border border-slate-200 aspect-[4/3] bg-slate-100"
                            >
                                <img
                                    src={`http://localhost:3000/uploads/${item.image}`}
                                    alt="Room view"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors duration-300 flex items-center justify-center backdrop-blur-[2px] opacity-0 group-hover:opacity-100">
                                    <button
                                        onClick={() => setConfirmDelete(item.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 cursor-pointer"
                                        title="Delete Image"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={confirmDelete !== null}
                title="Delete Image"
                message="Are you sure you want to delete this gallery photo? This action cannot be undone."
                onConfirm={() => executeDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
                confirmText="Yes, Delete"
                type="danger"
            />
        </div>
    );
}
function SkeletonGalleryCard() {
    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-200 animate-pulse flex items-center justify-center">
            <ImageOff size={32} className="text-slate-300" />
        </div>
    );
}
function EmptyGalleryState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="bg-white p-5 rounded-full mb-4 shadow-sm border border-slate-100">
                <ImageOff size={40} className="text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No Images Found</h3>
            <p className="text-slate-500 text-sm max-w-sm">
                This room doesn't have any gallery images yet. Upload some photos above to show off the room.
            </p>
        </div>
    );
}