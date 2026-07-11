import { useEffect, useMemo, useState } from "react";
import { getUsers, exportUsersExcel } from "../../services/userService";
import {
    Search,
    Users as UsersIcon,
    Mail,
    Shield,
    Calendar,
    Download,
    Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "../../components/Toast";
import StatCard from "../../components/StatCard";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await getUsers();
            setUsers(response.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            setExportingExcel(true);
            const response = await exportUsersExcel();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "users.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Users exported to Excel successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to export users to Excel");
        } finally {
            setExportingExcel(false);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, []);
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const keyword = search.toLowerCase();
            return (
                u.name?.toLowerCase().includes(keyword) ||
                u.email?.toLowerCase().includes(keyword) ||
                u.role?.toLowerCase().includes(keyword)
            );
        });
    }, [users, search]);
    const total = users.length;
    const admin = users.filter((u) => u.role === "admin").length;
    const userCount = users.filter((u) => u.role === "user").length;
    if (loading) {
        return (
            <div className="flex justify-center items-center h-72 text-slate-500">
                Loading users...
            </div>
        );
    }
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Users</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage registered users in the system.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportExcel}
                        disabled={exportingExcel || users.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm font-medium shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {exportingExcel ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        Export Excel
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard
                    title="Total Users"
                    value={total}
                    icon={<UsersIcon size={20} />}
                    color="blue"
                />
                <StatCard
                    title="Admin"
                    value={admin}
                    icon={<Shield size={20} />}
                    color="emerald"
                />
                <StatCard
                    title="User"
                    value={userCount}
                    icon={<Mail size={20} />}
                    color="amber"
                />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
                <div className="relative">
                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users by name, email, role..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20 text-sm transition-all"
                    />
                </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-left">User</th>
                                <th className="px-6 py-4 text-left">Email</th>
                                <th className="px-6 py-4 text-left">Phone</th>
                                <th className="px-6 py-4 text-left">Role</th>
                                <th className="px-6 py-4 text-left">Created</th>
                                <th className="px-6 py-4 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <img
                                                        src={`http://localhost:3000/uploads/${user.avatar}`}
                                                        alt={user.name}
                                                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-[#003580] flex items-center justify-center text-white text-xs font-bold">
                                                        {user.name?.[0]?.toUpperCase() || "U"}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-800">{user.name}</p>
                                                    <p className="text-xs text-slate-400">ID #{user.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {user.phone || <span className="text-slate-300 italic">Not set</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                                ${user.role === "admin"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {user.createdAt
                                                    ? new Date(user.createdAt).toLocaleDateString("id-ID")
                                                    : "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/admin/users/${user.id}`}
                                                className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs hover:bg-slate-800"
                                            >
                                                Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}