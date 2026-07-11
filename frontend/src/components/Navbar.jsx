import { useContext, useState } from "react"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { LogOut, ChevronDown } from "lucide-react"
import { toast } from "./Toast"
import NotificationCenter from "./NotificationCenter"

export default function Navbar({ role }) {
    const { user, logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const initial = user?.name?.[0]?.toUpperCase() || "U"

    const handleLogoutConfirm = () => {
        setShowLogoutConfirm(false)
        logout()
        navigate("/")
        toast.success("Successfully logged out. Have a nice day!")
    }

    return (
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400 font-medium">Roomora</span>
                <ChevronDown size={13} className="text-slate-300 -rotate-90" />
                <span className="text-slate-700 font-semibold">
                    {role === "admin" ? "Admin Panel" : "My Account"}
                </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                <NotificationCenter />

                {/* User info */}
                <div className="flex items-center gap-2.5">
                    {user?.avatar ? (
                        <img
                            src={`http://localhost:3000/uploads/${user.avatar}`}
                            alt={user?.name}
                            className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-slate-100"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-[#003580] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {initial}
                        </div>
                    )}
                    <div className="hidden sm:block">
                        <p className="text-[13px] font-semibold text-slate-800 leading-none">{user?.name}</p>
                        <p className="text-[11px] text-slate-400 capitalize mt-0.5">{role}</p>
                    </div>
                </div>

                <div className="w-px h-5 bg-slate-100" />

                {/* Logout */}
                <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                >
                    <LogOut size={14} />
                    <span className="hidden md:inline font-medium">Sign out</span>
                </button>
            </div>

            {/* Logout confirm modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-base font-bold text-slate-900 mb-2">Sign Out?</h3>
                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            Are you sure you want to leave Roomora?
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowLogoutConfirm(false);
                                    toast.info("Logout cancelled");
                                }}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogoutConfirm}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#003580] hover:bg-[#00224f] transition-colors cursor-pointer shadow-sm"
                            >
                                Yes, sign out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
