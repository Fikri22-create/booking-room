import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { User, Lock, Phone, MapPin, Mail, Camera, Loader2 } from "lucide-react";
import { getMyProfile, updateMyProfile, changePassword } from "../../services/userService";
import { toast } from "../../components/Toast";

export default function Profile() {
    const { updateUser } = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("profile");
    const [profileForm, setProfileForm] = useState({
        name: "",
        phone: "",
        address: ""
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [savingProfile, setSavingProfile] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        old_password: "",
        new_password: "",
        confirm_password: ""
    });
    const [savingPassword, setSavingPassword] = useState(false);
    const loadProfile = async () => {
        try {
            setLoading(true);
            const res = await getMyProfile();
            if (res?.success && res.data) {
                setUser(res.data);
                setProfileForm({
                    name: res.data.name || "",
                    phone: res.data.phone || "",
                    address: res.data.address || ""
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile details");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadProfile();
    }, []);
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!profileForm.name.trim()) {
            return toast.error("Name cannot be empty");
        }
        try {
            setSavingProfile(true);
            const formData = new FormData();
            formData.append("name", profileForm.name.trim());
            formData.append("phone", profileForm.phone.trim());
            formData.append("address", profileForm.address.trim());
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }
            const res = await updateMyProfile(formData);
            if (res?.success) {
                toast.success("Profile updated successfully");
                setUser(res.data);
                updateUser(res.data);
                setAvatarFile(null);
                setAvatarPreview(null);
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const { old_password, new_password, confirm_password } = passwordForm;
        if (!old_password || !new_password || !confirm_password) {
            return toast.error("All password fields are required");
        }
        if (new_password.length < 6) {
            return toast.error("New password must be at least 6 characters");
        }
        if (new_password !== confirm_password) {
            return toast.error("New password and confirm password do not match");
        }
        try {
            setSavingPassword(true);
            const res = await changePassword({ old_password, new_password });
            if (res?.success) {
                toast.success("Password changed successfully");
                setPasswordForm({
                    old_password: "",
                    new_password: "",
                    confirm_password: ""
                });
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to change password");
        } finally {
            setSavingPassword(false);
        }
    };
    if (loading) {
        return (
            <div className="h-72 flex justify-center items-center">
                <Loader2 size={30} className="animate-spin text-slate-400" />
            </div>
        );
    }
    const currentAvatarUrl = avatarPreview || (user?.avatar ? `http://localhost:3000/uploads/${user.avatar}` : null);
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your account information and password.</p>
            </div>
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all ${
                        activeTab === "profile"
                            ? "border-[#003580] text-[#003580]"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                    <User size={16} />
                    Edit Profile
                </button>
                <button
                    onClick={() => setActiveTab("password")}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all ${
                        activeTab === "password"
                            ? "border-[#003580] text-[#003580]"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                    <Lock size={16} />
                    Change Password
                </button>
            </div>
            {activeTab === "profile" ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                                    {currentAvatarUrl ? (
                                        <img
                                            src={currentAvatarUrl}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={40} className="text-slate-400" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#003580] hover:bg-[#002a66] text-white flex items-center justify-center cursor-pointer shadow-md transition-all">
                                    <Camera size={14} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="font-bold text-slate-900 text-lg">{user?.name}</h3>
                                <p className="text-sm text-slate-500">{user?.email}</p>
                                <p className="text-xs text-slate-400 capitalize mt-1">Role: {user?.role}</p>
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                        placeholder="Your full name"
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580] text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-sm cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        placeholder="Phone number"
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580] text-sm"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-4 text-slate-400" />
                                    <textarea
                                        rows={3}
                                        value={profileForm.address}
                                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                        placeholder="Your address"
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580] text-sm resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="w-full bg-[#003580] hover:bg-[#002a66] text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingProfile ? (
                                <span className="flex justify-center items-center gap-2">
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Old Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        value={passwordForm.old_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580] text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        value={passwordForm.new_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580] text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        value={passwordForm.confirm_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580] text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={savingPassword}
                            className="w-full bg-[#003580] hover:bg-[#002a66] text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingPassword ? (
                                <span className="flex justify-center items-center gap-2">
                                    <Loader2 size={18} className="animate-spin" />
                                    Updating...
                                </span>
                            ) : (
                                "Change Password"
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
