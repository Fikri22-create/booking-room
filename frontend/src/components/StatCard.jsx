/**
 * Shared StatCard component – single source of truth for all pages.
 * Props: title, value, icon, color (blue | emerald | amber | rose | violet)
 */
const COLORS = {
    blue:    "bg-[#003580]/8 text-[#003580] border-[#003580]/10",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber:   "bg-amber-50   text-amber-600   border-amber-100",
    rose:    "bg-rose-50    text-rose-600    border-rose-100",
    violet:  "bg-violet-50  text-violet-600  border-violet-100",
};

export default function StatCard({ title, value, icon, color = "blue" }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
            <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${COLORS[color] ?? COLORS.blue}`}>
                {icon}
            </div>
        </div>
    );
}
