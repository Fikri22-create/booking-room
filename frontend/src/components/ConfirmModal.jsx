import { X, AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "primary" }) {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-start gap-3.5 mb-4">
                    {type === "danger" && (
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                            <AlertTriangle size={20} />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-900">{title}</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">{message}</p>
                    </div>
                    <button onClick={onCancel} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 shrink-0 transition-colors cursor-pointer">
                        <X size={18} />
                    </button>
                </div>
                <div className="flex gap-2.5 justify-end mt-6">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-sm font-semibold transition cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-xl text-white text-sm font-semibold transition cursor-pointer active:scale-95 shadow-sm ${
                            type === "danger" ? "bg-rose-600 hover:bg-rose-700" : "bg-[#003580] hover:bg-[#002760]"
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
