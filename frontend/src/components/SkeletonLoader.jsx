export function SkeletonCard() {
    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 animate-pulse">
            <div className="h-48 bg-slate-200 rounded-2xl mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="flex justify-between items-center">
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-8 bg-slate-200 rounded w-20"></div>
                </div>
            </div>
        </div>
    )
}

export function SkeletonTable({ rows = 5, columns = 4 }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
            <div className="p-6 border-b border-slate-200">
                <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            </div>
            <div className="divide-y divide-slate-200">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="p-4 flex gap-4">
                        {Array.from({ length: columns }).map((_, j) => (
                            <div key={j} className="flex-1">
                                <div className="h-4 bg-slate-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export function SkeletonStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                        <div className="flex-1">
                            <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function SkeletonChart() {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
        </div>
    )
}

export function SkeletonDetail() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-3 bg-slate-200 rounded w-full"></div>
                        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-3 bg-slate-200 rounded w-full"></div>
                        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SkeletonLoader({ type = "card", ...props }) {
    switch (type) {
        case "card":
            return <SkeletonCard {...props} />
        case "table":
            return <SkeletonTable {...props} />
        case "stats":
            return <SkeletonStats {...props} />
        case "chart":
            return <SkeletonChart {...props} />
        case "detail":
            return <SkeletonDetail {...props} />
        default:
            return <SkeletonCard {...props} />
    }
}