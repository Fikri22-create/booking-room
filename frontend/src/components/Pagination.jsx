import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPage, onPageChange }) {
    if (!totalPage || totalPage <= 1) return null;

    const pages = [];
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPage, currentPage + delta);

    for (let i = left; i <= right; i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-center gap-1 py-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
                <ChevronLeft size={16} />
            </button>
            {left > 1 && (
                <>
                    <button
                        onClick={() => onPageChange(1)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium transition"
                    >
                        1
                    </button>
                    {left > 2 && (
                        <span className="px-1 text-slate-400 text-sm">...</span>
                    )}
                </>
            )}
            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition border ${
                        page === currentPage
                            ? "bg-[#003580] text-white border-[#003580]"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                >
                    {page}
                </button>
            ))}
            {right < totalPage && (
                <>
                    {right < totalPage - 1 && (
                        <span className="px-1 text-slate-400 text-sm">...</span>
                    )}
                    <button
                        onClick={() => onPageChange(totalPage)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium transition"
                    >
                        {totalPage}
                    </button>
                </>
            )}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPage}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
