import { useState, useEffect } from 'react';
import { toast } from '../../components/Toast';
import { Plus, Pencil, Trash2, Search, Settings, Wifi, Tv, Wind, Coffee, Bath } from 'lucide-react';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';
import * as amenityService from '../../services/amenityService';
import ConfirmModal from '../../components/ConfirmModal';

export default function Amenities() {
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentAmenity, setCurrentAmenity] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'FiSettings'
    });

    const iconOptions = [
        { value: 'FiWifi', label: 'WiFi', icon: <Wifi size={20} /> },
        { value: 'FiTv', label: 'TV', icon: <Tv size={20} /> },
        { value: 'FiWind', label: 'AC', icon: <Wind size={20} /> },
        { value: 'FiCoffee', label: 'Coffee', icon: <Coffee size={20} /> },
        { value: 'MdOutlineBathtub', label: 'Bathtub', icon: <Bath size={20} /> },
        { value: 'FiSettings', label: 'General', icon: <Settings size={20} /> },
    ];

    const getIconComponent = (iconName) => {
        switch (iconName) {
            case 'FiWifi': return <Wifi size={16} />;
            case 'FiTv': return <Tv size={16} />;
            case 'FiWind': return <Wind size={16} />;
            case 'FiCoffee': return <Coffee size={16} />;
            case 'MdOutlineBathtub': return <Bath size={16} />;
            default: return <Settings size={16} />;
        }
    };

    const fetchAmenities = async () => {
        try {
            setLoading(true);
            const res = await amenityService.getAmenities();
            setAmenities(res.data || res || []);
        } catch (error) {
            console.error('Failed to fetch amenities:', error);
            toast.error('Failed to fetch amenities');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAmenities();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await amenityService.updateAmenity(currentAmenity.id, formData);
                toast.success('Amenity updated successfully');
            } else {
                await amenityService.createAmenity(formData);
                toast.success('Amenity created successfully');
            }
            
            fetchAmenities();
            resetForm();
        } catch (error) {
            console.error('Failed to submit amenity:', error);
            toast.error(`Failed to ${editMode ? 'update' : 'create'} amenity`);
        }
    };

    const handleEdit = (amenity) => {
        setCurrentAmenity(amenity);
        setFormData({
            name: amenity.name,
            description: amenity.description || '',
            icon: amenity.icon || 'FiSettings'
        });
        setEditMode(true);
        setShowModal(true);
    };

    const executeDelete = async (id) => {
        try {
            await amenityService.deleteAmenity(id);
            toast.success('Amenity deleted successfully');
            setConfirmDelete(null);
            fetchAmenities();
        }  catch (error) {
            console.error('Failed to delete amenity:', error);
            toast.error('failed to delete amenity')
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', icon: 'FiSettings' });
        setCurrentAmenity(null);
        setEditMode(false);
        setShowModal(false);
    };

    const filteredAmenities = amenities.filter(amenity =>
        amenity.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        amenity.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return(
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Amenities Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage room amenities and facilities</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#003580] text-white rounded-xl hover:bg-[#002760] transition-colors font-medium text-sm"
                >
                    <Plus size={16} />
                    Add Amenity
                </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search amenities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm bg-slate-50 transition"
                    />
                </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-6">
                            <SkeletonLoader rows={5} />
                        </div>
                    ) : filteredAmenities.length === 0 ? (
                        <EmptyState
                            icon={<Settings size={48} />}
                            title="No amenities found"
                            description={searchQuery ? "No amenities match your search criteria." : "No amenities have been added yet."}
                            action={!searchQuery ? { label: "Add Amenity", onClick: () => setShowModal(true) } : null}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Amenity</th>
                                        <th className="px-6 py-4 text-left">Description</th>
                                        <th className="px-6 py-4 text-left">Rooms Using</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredAmenities.map((amenity) => (
                                        <tr key={amenity.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-[#003580]/10 rounded-xl flex items-center justify-center text-[#003580]">
                                                        {getIconComponent(amenity.icon)}
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-800">
                                                        {amenity.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-500">
                                                    {amenity.description || '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-500">
                                                    {amenity.roomCount || 0} rooms
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(amenity)}
                                                        className="p-2 text-slate-500 hover:text-[#003580] hover:bg-blue-50 rounded-xl transition-colors"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete(amenity.id)}
                                                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900">
                                {editMode ? 'Edit Amenity' : 'Add New Amenity'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                        Amenity Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580] text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580] text-sm resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                        Icon
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {iconOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: option.value })}
                                                className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 transition-colors text-xs ${
                                                    formData.icon === option.value
                                                        ? 'border-[#003580] bg-[#003580]/10 text-[#003580] font-semibold'
                                                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                            >
                                                {option.icon}
                                                <span>{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2.5 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2.5 bg-[#003580] text-white rounded-xl hover:bg-[#002760] transition-colors text-sm font-medium"
                                >
                                    {editMode ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={confirmDelete !== null}
                title="Delete Amenity"
                message="Are you sure you want to delete this amenity? This will remove it from all associated rooms."
                onConfirm={() => executeDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
                confirmText="Yes, Delete"
                type="danger"
            />
        </div>
        )
    }
