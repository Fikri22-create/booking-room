import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Home, Users, Calendar, Shield, CreditCard, ArrowRight, Star, Wifi, Wind, Tv, Clock, Menu, X, Search, CheckCircle, Bath } from "lucide-react";

const API = "http://localhost:3000/api";

function useCounter(target, duration = 1800, trigger) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!trigger || target === 0) return;
        let start = 0;
        const step = Math.ceil(target / (duration / 16));
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setVal(target); clearInterval(timer); }
            else setVal(start);
        }, 16);
        return () => clearInterval(timer);
    }, [target, trigger, duration]);
    return val;
}

function useVisible(threshold = 0.2) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setVisible(true); },
            { threshold }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

export default function LandingPage() {
    const [rooms, setRooms]     = useState([]);
    const [stats, setStats]     = useState({ totalRooms: 0, totalBookings: 0, totalUsers: 0 });
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [reviewsMeta, setReviewsMeta] = useState({ totalReviews: 0, avgRating: 0, distribution: {} });
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [mobileOpen, setMobileOpen]     = useState(false);
    const [scrolled, setScrolled]         = useState(false);
    const [searchQuery, setSearchQuery]   = useState("");
    const [searchCapacity, setSearchCapacity] = useState("");

    const [statsRef, statsVisible] = useVisible();
    const roomsRef = useRef(null);

    const countRooms    = useCounter(stats.totalRooms,    1600, statsVisible);
    const countBookings = useCounter(stats.totalBookings, 1800, statsVisible);
    const countUsers    = useCounter(stats.totalUsers,    1700, statsVisible);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);

    useEffect(() => {
        axios.get(`${API}/public/rooms`)
            .then(r => setRooms(r.data.data || []))
            .catch(() => setRooms([]))
            .finally(() => setLoadingRooms(false));

        axios.get(`${API}/public/stats`)
            .then(r => setStats(r.data.data || { totalRooms: 0, totalBookings: 0, totalUsers: 0 }))
            .catch(() => {});

        // Fetch latest reviews for testimonials section
        axios.get(`${API}/public/reviews/latest`)
            .then(r => {
                setReviews(r.data.data || []);
                setReviewsMeta(r.data.meta || { totalReviews: 0, avgRating: 0, distribution: {} });
            })
            .catch(() => setReviews([]))
            .finally(() => setReviewsLoading(false));
    }, []);

    const scrollToRooms = () => roomsRef.current?.scrollIntoView({ behavior: "smooth" });
    const filteredRooms = rooms.filter(room => {
        const matchesQuery = !searchQuery || 
            room.room_number?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.room_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCapacity = !searchCapacity || room.capacity >= Number(searchCapacity);
        return matchesQuery && matchesCapacity;
    });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans overflow-x-hidden">
            <header
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#003580] text-white border-b border-blue-900 animate-in fade-in"
                style={scrolled ? { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" } : {}}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5" />
                        <div>
                            <span className="font-bold text-lg tracking-tight text-white">Roomora</span>
                            <span className="block text-[9px] -mt-1 font-medium text-blue-200">Premium Hotel</span>
                        </div>
                    </div>
                    
                    <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-blue-100">
                        <button onClick={scrollToRooms} className="hover:text-white transition-colors cursor-pointer">Rooms</button>
                        <a href="#features"     className="hover:text-white transition-colors cursor-pointer">Features</a>
                        <a href="#testimonials" className="hover:text-white transition-colors cursor-pointer">Reviews</a>
                    </nav>

                    <div className="hidden md:flex items-center gap-3">
                        <Link to="/login"
                            className="px-4 py-1.5 text-xs rounded-sm font-semibold text-[#003580] bg-white border border-transparent hover:bg-blue-5 transition-all shadow-sm"
                        >
                            Sign In
                        </Link>
                        <Link to="/register"
                            className="px-4 py-1.5 text-xs rounded-sm font-semibold text-white bg-transparent border border-white hover:bg-white/10 transition-all"
                        >
                            Register
                        </Link>
                    </div>

                    <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
                {mobileOpen && (
                    <div className="md:hidden px-6 py-5 flex flex-col gap-4 text-sm bg-[#00224f] border-t border-blue-900">
                        <button onClick={() => { scrollToRooms(); setMobileOpen(false); }}
                            className="text-left text-blue-100 font-semibold hover:text-white">
                            Rooms
                        </button>
                        <a href="#features" onClick={() => setMobileOpen(false)}
                            className="text-blue-100 font-semibold hover:text-white">
                            Features
                        </a>
                        <a href="#testimonials" onClick={() => setMobileOpen(false)}
                            className="text-blue-100 font-semibold hover:text-white">
                            Reviews
                        </a>
                        <hr className="border-blue-900" />
                        <Link to="/login" onClick={() => setMobileOpen(false)} className="text-blue-100 font-semibold hover:text-white">Sign In</Link>
                        <Link to="/register" onClick={() => setMobileOpen(false)}
                            className="py-2 rounded-sm font-semibold text-center text-[#003580] bg-white">
                            Register
                        </Link>
                    </div>
                )}
            </header>
            <section className="bg-[#003580] text-white pt-32 pb-24 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4 animate-in slide-in-from-left duration-500">
                            Find your next stay
                        </h1>
                        <p className="text-base md:text-lg text-blue-100 leading-relaxed mb-6 font-medium animate-in slide-in-from-left duration-700">
                            Search deals on premium hotel rooms, suites, and much more. Experience comfort at its best.
                        </p>
                    </div>
                </div>
            </section>
            <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
                <div className="bg-[#febb02] rounded-lg p-1 shadow-md border-4 border-[#febb02] flex flex-col md:flex-row gap-1 items-stretch">
                    <div className="flex-1 bg-white rounded-md px-3.5 py-2.5 flex items-center gap-2 border border-slate-100 focus-within:ring-2 focus-within:ring-[#003580]/10">
                        <Home className="text-slate-400 shrink-0" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Where are you staying? (Type room number or type...)"
                            className="w-full text-xs text-slate-800 bg-transparent outline-none placeholder-slate-400"
                        />
                    </div>
                    
                    <div className="w-full md:w-56 bg-white rounded-md px-3.5 py-2.5 flex items-center gap-2 border border-slate-100 focus-within:ring-2 focus-within:ring-[#003580]/10">
                        <Users className="text-slate-400 shrink-0" size={16} />
                        <select
                            value={searchCapacity}
                            onChange={(e) => setSearchCapacity(e.target.value)}
                            className="w-full text-xs text-slate-800 bg-transparent outline-none cursor-pointer"
                        >
                            <option value="">Guests count...</option>
                            <option value="1">1 Guest</option>
                            <option value="2">2 Guests</option>
                            <option value="3">3 Guests</option>
                            <option value="4">4 Guests</option>
                            <option value="5">5+ Guests</option>
                        </select>
                    </div>

                    <button
                        onClick={scrollToRooms}
                        className="bg-[#006ce4] hover:bg-[#0056b3] text-white text-xs font-bold px-8 py-3 rounded-md transition-all cursor-pointer shadow-sm shrink-0 flex items-center justify-center gap-2"
                    >
                        <Search size={14} />
                        Search
                    </button>
                </div>
            </div>
            <section ref={statsRef} className="py-16 bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StatItem value={countRooms} suffix="+" label="Available Rooms" icon={<Home size={18}/>} />
                        <StatItem value={countBookings} suffix="+" label="Happy Bookings" icon={<Calendar size={18}/>} />
                        <StatItem value={countUsers} suffix="+" label="Registered Guests" icon={<Users size={18}/>} />
                    </div>
                </div>
            </section>
            <section ref={roomsRef} className="py-20 max-w-7xl mx-auto px-6">
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800">Featured Accommodations</h2>
                        <p className="text-xs text-slate-500 mt-1">Explore available rooms matched to your preference</p>
                    </div>
                    {searchQuery || searchCapacity ? (
                        <button 
                            onClick={() => { setSearchQuery(""); setSearchCapacity(""); }}
                            className="text-xs text-[#006ce4] font-semibold hover:underline cursor-pointer"
                        >
                            Clear filters
                        </button>
                    ) : null}
                </div>

                {loadingRooms ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1,2,3,4,5,6].map(n => (
                            <div key={n} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
                                <div className="h-48 bg-slate-200" />
                                <div className="p-5 space-y-3">
                                    <div className="h-5 bg-slate-200 rounded w-2/3" />
                                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                                    <div className="h-9 bg-slate-200 rounded mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
                        <Home size={40} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-slate-600 font-semibold text-sm">No rooms match your search criteria</p>
                        <p className="text-slate-400 text-xs mt-1">Try resetting the destination query or guest capacity filters.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRooms.map(room => {
                            const img = room.gallery?.[0]?.image || room.image;
                            return <RoomCard key={room.id} room={room} img={img} />;
                        })}
                    </div>
                )}
            </section>
            <section id="features" className="py-20 bg-white border-t border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-extrabold text-slate-800">Why Book With Us</h2>
                        <p className="text-xs text-slate-500 mt-1">Simple, reliable, and premium hotel booking experience</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: <Home size={18}/>,       title: "Curated Rooms",    desc: "Each room is thoughtfully selected with high standards of cleanliness and design." },
                            { icon: <CreditCard size={18}/>, title: "Instant Payments",  desc: "Upload proof of payment and get confirmation verification in real-time." },
                            { icon: <Shield size={18}/>,     title: "Secure & Verified", desc: "Enterprise grade security protocols protecting all user personal records." },
                        ].map((f, i) => (
                            <div key={i} className="p-6 rounded-lg bg-slate-50 border border-slate-100 flex gap-4">
                                <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 bg-[#003580] text-white">
                                    {f.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm mb-1">{f.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="py-20 max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800 mb-4">Premium Facilities</h2>
                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            We believe luxury is in the details. Every single Roomora room comes fully equipped with modern conveniences to make your residency absolute.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: <Wifi size={14}/>,   text: "Free High-Speed WiFi"  },
                                { icon: <Wind size={14}/>,   text: "Full Air Conditioning" },
                                { icon: <Tv size={14}/>,     text: "Smart Flat TV"         },
                                { icon: <Bath size={14}/>,   text: "Private Bathroom & Spa" },
                                { icon: <Clock size={14}/>,  text: "24h Concierge Service" },
                                { icon: <Shield size={14}/>, text: "In-Room Safety Safe"   },
                            ].map((f, i) => (
                                <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200/60 rounded-md">
                                    <span className="text-[#006ce4]">{f.icon}</span>
                                    <span className="text-xs font-semibold text-slate-700">{f.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                        {[
                            { label: "Standard Room",   price: "From Rp 300K", highlight: false },
                            { label: "Deluxe Room",     price: "From Rp 600K", highlight: true  },
                            { label: "Suite Room",      price: "From Rp 1.4M", highlight: false },
                            { label: "Extra Facilities",  price: "& Breakfast",    highlight: false },
                        ].map((item, i) => (
                            <div key={i} className={`p-5 rounded-lg border ${
                                item.highlight 
                                    ? "bg-[#003580] text-white border-blue-900 shadow-sm" 
                                    : "bg-white text-slate-800 border-slate-200/60"
                            }`}>
                                <p className={`text-[10px] uppercase tracking-wider mb-1 ${item.highlight ? "text-blue-200" : "text-slate-400"}`}>{item.label}</p>
                                <p className="text-lg font-bold">{item.price}</p>
                                <p className={`text-[10px] mt-0.5 ${item.highlight ? "text-blue-300" : "text-slate-400"}`}>Best Price Guarantee</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section id="testimonials" className="py-20 bg-white border-t border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-extrabold text-slate-800">What Our Guests Say</h2>
                        <p className="text-xs text-slate-500 mt-1">Verified reviews from booking customers</p>
                        {!reviewsLoading && reviewsMeta.totalReviews > 0 && (
                            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-4xl font-black text-[#003580]">{reviewsMeta.avgRating}</span>
                                    <div>
                                        <div className="flex items-center gap-0.5">
                                            {[1,2,3,4,5].map(s => (
                                                <Star key={s} size={14} className={s <= Math.round(reviewsMeta.avgRating) ? "fill-[#febb02] text-[#febb02]" : "text-slate-200"} />
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{reviewsMeta.totalReviews} verified reviews</p>
                                    </div>
                                </div>
                                <div className="hidden sm:block w-px h-12 bg-slate-200" />
                                <div className="space-y-1 w-40">
                                    {[5,4,3,2,1].map(star => {
                                        const count = reviewsMeta.distribution?.[star] || 0
                                        const pct = reviewsMeta.totalReviews > 0 ? Math.round((count / reviewsMeta.totalReviews) * 100) : 0
                                        return (
                                            <div key={star} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                                <span className="w-2 text-right">{star}</span>
                                                <Star size={9} className="fill-[#febb02] text-[#febb02] shrink-0" />
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#febb02] rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="w-5 text-right">{count}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {reviewsLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="p-5 rounded-lg bg-slate-50 border border-slate-100 animate-pulse">
                                    <div className="flex items-center gap-0.5 mb-3">
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <div key={j} className="w-3 h-3 bg-slate-200 rounded"></div>
                                        ))}
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <div className="h-3 bg-slate-200 rounded"></div>
                                        <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                                        <div>
                                            <div className="h-3 bg-slate-200 rounded w-16 mb-1"></div>
                                            <div className="h-2 bg-slate-200 rounded w-20"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : reviews.length === 0 ? (
                            <div className="col-span-3 text-center py-12">
                                <Star size={40} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500">No reviews yet. Be the first to share your experience!</p>
                            </div>
                        ) : (
                            reviews.slice(0, 3).map((review) => (
                                <div key={review.id} className="p-5 rounded-lg bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center gap-0.5 mb-2">
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <Star 
                                                key={j} 
                                                size={12} 
                                                className={j < review.rating ? "fill-[#febb02] text-[#febb02]" : "text-slate-300"}
                                            />
                                        ))}
                                        {review.isVerified && (
                                            <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-bold rounded-full flex items-center gap-1">
                                                <CheckCircle size={8} />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    {review.title && (
                                        <p className="text-xs font-bold text-slate-800 mb-1">{review.title}</p>
                                    )}
                                    <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                                        &ldquo;{review.comment}&rdquo;
                                    </p>
                                    <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
                                        {review.user?.avatar ? (
                                            <img
                                                src={`http://localhost:3000/uploads/${review.user.avatar}`}
                                                alt={review.user.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-[#003580]">
                                                {review.user?.name?.[0]?.toUpperCase() || "U"}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{review.user?.name || "Anonymous"}</p>
                                            <p className="text-[10px] text-slate-400">
                                                {review.room?.room_type && <span className="capitalize">{review.room.room_type} · </span>}
                                                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
            <section className="py-20 max-w-4xl mx-auto px-6 text-center">
                <div className="p-10 rounded-xl bg-[#003580] text-white relative overflow-hidden shadow-sm">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
                    <div className="relative">
                        <h2 className="text-3xl font-extrabold mb-2">Ready to Book Your Perfect Stay?</h2>
                        <p className="text-xs text-blue-200 mb-6 max-w-md mx-auto">
                            Join thousands of happy guests. Create your account and book your dream room today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/register"
                                className="px-6 py-2.5 rounded-sm font-semibold text-xs text-[#003580] bg-[#febb02] hover:brightness-110 shadow-sm"
                            >
                                Create Free Account
                            </Link>
                            <Link to="/login"
                                className="px-6 py-2.5 rounded-sm font-semibold text-xs text-white border border-white hover:bg-white/10"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            <footer className="py-12 bg-[#00224f] text-blue-200 text-xs border-t border-blue-900">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded-md object-contain bg-white p-0.5" />
                        <div>
                            <span className="font-bold text-white text-sm">Roomora</span>
                        </div>
                    </div>
                    <p className="text-blue-300">
                        © {new Date().getFullYear()} Roomora. All rights reserved.
                    </p>
                    <div className="flex gap-4 font-semibold">
                        <Link to="/login"    className="hover:underline">Sign In</Link>
                        <Link to="/register" className="hover:underline">Register</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function StatItem({ value, suffix, label, icon }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-[#003580] border border-blue-100">
                {icon}
            </div>
            <div className="text-3xl font-extrabold text-[#003580]">
                {value.toLocaleString()}{suffix}
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {label}
            </p>
        </div>
    );
}

function RoomCard({ room, img }) {
    const badgeStyle = {
        suite:    "bg-purple-100 text-purple-700 border border-purple-200",
        deluxe:   "bg-blue-100 text-[#003580] border border-blue-200",
        standard: "bg-slate-100 text-slate-700 border border-slate-200",
    };
    const bs = badgeStyle[room.room_type] || badgeStyle.standard;

    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="relative h-48 bg-slate-100 overflow-hidden shrink-0">
                {img ? (
                    <img
                        src={`http://localhost:3000/uploads/${img}`}
                        alt={`Room ${room.room_number}`}
                        className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                        onError={e => { e.target.style.display = "none"; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Home size={40} />
                    </div>
                )}
                <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${bs}`}>
                    {room.room_type}
                </span>
                {room.averageRating > 0 && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#febb02]/95 text-[#003580] flex items-center gap-1">
                        <Star size={9} className="fill-[#003580]" />
                        {room.averageRating}
                    </span>
                )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-sm text-slate-800">Room {room.room_number}</h3>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Users size={11} />
                            Up to {room.capacity} guests
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400">price/night</p>
                        <p className="text-sm font-extrabold text-[#003580]">
                            Rp {Number(room.price_per_night).toLocaleString("id-ID")}
                        </p>
                    </div>
                </div>
                {room.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 mt-1">
                        {room.description}
                    </p>
                )}
                {room.averageRating > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                        {[1,2,3,4,5].map(s => (
                            <Star key={s} size={11} className={s <= Math.round(room.averageRating) ? "fill-[#febb02] text-[#febb02]" : "text-slate-200"} />
                        ))}
                        <span className="text-[10px] text-slate-500 ml-1">
                            {room.averageRating} ({room.reviewCount || 0} reviews)
                        </span>
                    </div>
                )}
                <Link to="/login"
                    className="w-full mt-auto flex items-center justify-center gap-1.5 py-2 rounded-sm text-xs font-bold text-white bg-[#003580] hover:bg-[#0056b3] transition-all duration-200 cursor-pointer shadow-xs"
                >
                    Book This Room
                    <ArrowRight size={12} />
                </Link>
            </div>
        </div>
    );
}
