import { useState, useContext } from "react";
import { loginUser } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "../../components/Toast";

import { Mail, Lock, Eye, EyeOff, CheckCircle, Shield, Clock } from "lucide-react";

export default function Login() {
    const navigate      = useNavigate();
    const { login }     = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw]   = useState(false);
    const [form, setForm]       = useState({ email: "", password: "" });

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await loginUser(form);
            if (!response?.token || !response?.user) throw new Error("Invalid login response");
            login(response.token, response.user);
            toast.success("Welcome back! Signing you in…");
            if (response.user.role === "admin") navigate("/admin/dashboard");
            else navigate("/user/rooms");
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Login failed");
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
                            Welcome Back
                        </h2>
                        <p className="text-[13px] leading-relaxed text-blue-100 mb-8 max-w-sm">
                            Manage bookings, rooms, and payments from one elegant and simple dashboard.
                        </p>
                        <div className="flex flex-col gap-3.5">
                            {[
                                { icon: <CheckCircle className="text-base shrink-0" />, text: "Instant room booking & search" },
                                { icon: <Shield    className="text-base shrink-0" />, text: "Secure payment verification" },
                                { icon: <Clock     className="text-base shrink-0" />, text: "24/7 availability & updates" },
                            ].map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs text-blue-50">
                                    <span className="text-amber-400">{f.icon}</span>
                                    {f.text}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative text-xs text-blue-200">
                        New here?{" "}
                        <Link to="/register" className="font-semibold text-white hover:underline transition-all">
                            Create an account →
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col justify-center p-10 lg:p-12 bg-white">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-800 mb-1">Sign In</h1>
                        <p className="text-xs text-slate-400">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-4">
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
                                    placeholder="••••••••"
                                    className="w-full rounded-lg pl-11 pr-11 py-2.5 text-xs text-slate-800 bg-slate-50 placeholder-slate-400 border border-slate-200 focus:bg-white focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 outline-none transition-all"
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-xs text-white bg-[#003580] hover:bg-[#00224f] transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? "Signing In…" : "Sign In"}
                        </button>
                    </form>
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">or</span>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <div className="text-center space-y-2">
                        <Link 
                            to="/forgot-password" 
                            className="block text-xs text-[#003580] hover:underline font-medium"
                        >
                            Forgot your password?
                        </Link>
                        <p className="text-xs text-slate-500">
                            Don't have an account?{" "}
                            <Link to="/register" className="font-semibold text-[#003580] hover:underline">
                                Register now
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
