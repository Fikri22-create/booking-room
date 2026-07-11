import { useState } from "react";
import { registerUser } from "../../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "../../components/Toast";

import { Mail, Lock, User, Eye, EyeOff, Star, Calendar, Shield } from "lucide-react";

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw]   = useState(false);
    const [form, setForm]       = useState({ name: "", email: "", password: "" });

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const submitHandler = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) {
            toast.warning("Password must be at least 6 characters");
            return;
        }
        try {
            setLoading(true);
            await registerUser(form);
            toast.success("Account created! Redirecting to login…");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#f2f6fa]">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden grid lg:grid-cols-2 shadow-[0_12px_38px_rgba(0,0,0,0.06)] border border-slate-100">
                <div className="relative flex flex-col justify-between p-10 lg:p-12 bg-[#003580] text-white">
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
                    <div className="relative flex items-center gap-2.5">
                        <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 shadow-sm" />
                        <div>
                            <p className="font-bold text-white text-[15px] leading-none">Roomora</p>
                            <p className="text-[10px] text-blue-200 mt-0.5 font-medium">Premium Hotel</p>
                        </div>
                    </div>
                    <div className="relative flex-1 flex flex-col justify-center my-8">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                            Join Roomora
                        </h2>
                        <p className="text-[13px] leading-relaxed text-blue-100 mb-8 max-w-sm">
                            Create your free account and start booking premium hotel rooms in minutes.
                        </p>
                        <div className="flex flex-col gap-3.5">
                            {[
                                { icon: <Star className="text-base shrink-0" />, text: "Access to verified premium rooms" },
                                { icon: <Calendar className="text-base shrink-0" />, text: "Manage bookings & requests easily" },
                                { icon: <Shield className="text-base shrink-0" />, text: "Secure payment tracking & uploads" },
                            ].map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs text-blue-50">
                                    <span className="text-amber-400">{f.icon}</span>
                                    {f.text}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative text-xs text-blue-200">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-white hover:underline transition-all">
                            Sign In →
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col justify-center p-10 lg:p-12 bg-white">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-800 mb-1">Create Account</h1>
                        <p className="text-xs text-slate-400">
                            Fill in your details to get started
                        </p>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                                <input
                                    type="text" required
                                    value={form.name} onChange={set("name")}
                                    placeholder="Your full name"
                                    className="w-full rounded-lg pl-11 pr-4 py-2.5 text-xs text-slate-800 bg-slate-50 placeholder-slate-400 border border-slate-200 focus:bg-white focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                                <input
                                    type="email" required
                                    value={form.email} onChange={set("email")}
                                    placeholder="name@example.com"
                                    className="w-full rounded-lg pl-11 pr-4 py-2.5 text-xs text-slate-800 bg-slate-50 placeholder-slate-400 border border-slate-200 focus:bg-white focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                                <input
                                    type={showPw ? "text" : "password"} required
                                    value={form.password} onChange={set("password")}
                                    placeholder="Min. 6 characters"
                                    className="w-full rounded-lg pl-11 pr-11 py-2.5 text-xs text-slate-800 bg-slate-50 placeholder-slate-400 border border-slate-200 focus:bg-white focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 outline-none transition-all"
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            {form.password.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    {[1,2,3,4].map(n => (
                                        <div key={n} className="flex-1 h-1 rounded-full transition-all duration-300"
                                            style={{
                                                background: n <= Math.min(Math.floor(form.password.length / 3), 4)
                                                    ? (form.password.length >= 10 ? "#10b981" : form.password.length >= 6 ? "#f59e0b" : "#ef4444")
                                                    : "#e2e8f0"
                                            }} />
                                    ))}
                                    <span className="text-[10px] font-semibold ml-1 text-slate-500">
                                        {form.password.length < 4 ? "Weak" : form.password.length < 7 ? "Fair" : form.password.length < 10 ? "Good" : "Strong"}
                                    </span>
                                </div>
                            )}
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-xs text-white bg-[#003580] hover:bg-[#00224f] transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? "Creating Account…" : "Create Account"}
                        </button>
                    </form>
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">or</span>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <p className="text-center text-xs text-slate-500">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-[#003580] hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
