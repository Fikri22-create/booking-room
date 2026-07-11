import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Mail, Shield, Phone, MapPin, Calendar } from "lucide-react";
import { getUserById } from "../../services/userService";
import { toast } from "../../components/Toast";

export default function UserDetail() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await getUserById(id);
            setUser(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch user");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUser();
    }, [id]);
    if (loading) {
        return (
            <div className="flex justify-center items-center h-72">
                Loading...
            </div>
        );
    }
    if (!user) {
        return (
            <div className="text-center py-20">
                User not found
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    to="/admin/users"
                    className="p-2 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">User Detail</h1>
                    <p className="text-sm text-slate-500">User information overview</p>
                </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                {}
                <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 mb-6 border-b border-slate-100">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                        {user.avatar ? (
                            <img
                                src={`http://localhost:3000/uploads/${user.avatar}`}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-[#003580] flex items-center justify-center text-white text-2xl font-bold">
                                {user.name?.[0]?.toUpperCase() || "U"}
                            </div>
                        )}
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold capitalize
                            ${user.role === "admin"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                        >
                            {user.role}
                        </span>
                    </div>
                </div>

                {}
                <div className="grid md:grid-cols-2 gap-6">
                    <Info
                        icon={<User size={16} />}
                        label="Full Name"
                        value={user.name}
                    />
                    <Info
                        icon={<Mail size={16} />}
                        label="Email"
                        value={user.email}
                    />
                    <Info
                        icon={<Phone size={16} />}
                        label="Phone"
                        value={user.phone}
                    />
                    <Info
                        icon={<Shield size={16} />}
                        label="Role"
                        value={user.role}
                    />
                    <Info
                        icon={<MapPin size={16} />}
                        label="Address"
                        value={user.address}
                    />
                    <Info
                        icon={<Calendar size={16} />}
                        label="Created At"
                        value={
                            user.createdAt
                                ? new Date(
                                    user.createdAt
                                ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric"
                                })
                                : "-"
                        }
                    />
                </div>
            </div>
        </div>
    );
}
function Info({
    label,
    value,
    icon
}) {
    return (
        <div>
            <p className="text-xs uppercase text-slate-400 mb-2 flex items-center gap-2">
                {icon}
                {label}
            </p>
            <p className="font-medium text-slate-900">
                {value || <span className="text-slate-300 italic font-normal">Not set</span>}
            </p>
        </div>
    );
}