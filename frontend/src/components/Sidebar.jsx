import { Link, useLocation } from "react-router-dom"
import {
    LayoutGrid,
    Box,
    Calendar,
    CreditCard,
    Users,
    User,
    MessageSquare,
    Heart,
    Settings,
    Eye
} from "lucide-react"

export default function Sidebar({ role }) {
    const location = useLocation();

    const adminMenus = [
        { name: "Dashboard",  icon: LayoutGrid,    path: "/admin/dashboard" },
        { name: "Rooms",      icon: Box,           path: "/admin/rooms" },
        { name: "Bookings",   icon: Calendar,      path: "/admin/bookings" },
        { name: "Payments",   icon: CreditCard,    path: "/admin/payments" },
        { name: "Users",      icon: Users,         path: "/admin/users" },
        { name: "Reviews",    icon: MessageSquare, path: "/admin/reviews" },
        { name: "Amenities",  icon: Settings,      path: "/admin/amenities" },
        { name: "Audit Logs", icon: Eye,           path: "/admin/audit-logs" },
    ]
    const userMenus = [
        { name: "Dashboard",   icon: LayoutGrid,    path: "/user/dashboard" },
        { name: "Rooms",       icon: Box,           path: "/user/rooms" },
        { name: "Wishlist",    icon: Heart,         path: "/user/wishlist" },
        { name: "My Bookings", icon: Calendar,      path: "/user/my-bookings" },
        { name: "My Payments", icon: CreditCard,    path: "/user/payments" },
        { name: "My Reviews",  icon: MessageSquare, path: "/user/my-reviews" },
        { name: "Profile",     icon: User,          path: "/user/profile" },
    ]
    const menus = role === "admin" ? adminMenus : userMenus

    return (
        <aside className="w-60 flex flex-col h-screen sticky top-0 bg-white border-r border-slate-100">
            {/* Logo */}
            <div className="h-16 px-5 flex items-center border-b border-slate-100 shrink-0">
                <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-xl object-contain bg-[#003580]/5 p-0.5" />
                    <div>
                        <p className="font-bold text-[13px] text-slate-900 leading-none">Roomora</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Premium Hotel</p>
                    </div>
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-2 mb-3">
                    Navigation
                </p>
                {menus.map((menu) => {
                    const Icon   = menu.icon;
                    const active = location.pathname.startsWith(menu.path);
                    return (
                        <Link
                            key={menu.path}
                            to={menu.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                                active
                                    ? "bg-[#003580]/8 text-[#003580]"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                            style={active ? { background: "rgba(0,53,128,0.07)" } : {}}
                        >
                            <Icon
                                size={16}
                                className={active ? "text-[#003580]" : "text-slate-400"}
                            />
                            {menu.name}
                            {active && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#003580]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                    <span className="text-[11px] text-slate-400">System Online</span>
                </div>
            </div>
        </aside>
    );
}
