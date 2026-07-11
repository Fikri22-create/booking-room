import { useEffect, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from "lucide-react"
import api from "../services/api"

/**
 * AvailabilityCalendar
 * - Fetches booked date ranges from /rooms/:roomId/booked-dates
 * - Renders an interactive calendar with:
 *   - Red (booked) days
 *   - Green (selected check-in/check-out) days
 *   - Blue range highlight between selected dates
 * - Props:
 *   roomId        : string | number  (required)
 *   onSelect      : ({ checkIn, checkOut }) => void  (optional)
 *   compact       : boolean  — smaller version for sidebar (default false)
 */
export default function AvailabilityCalendar({ roomId, onSelect, compact = false }) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [year, setYear] = useState(today.getFullYear())
    const [month, setMonth] = useState(today.getMonth())        // 0-indexed
    const [bookedRanges, setBookedRanges] = useState([])        // [{ check_in, check_out }]
    const [loading, setLoading] = useState(true)
    const [checkIn, setCheckIn] = useState(null)                // Date | null
    const [checkOut, setCheckOut] = useState(null)              // Date | null
    const [hovering, setHovering] = useState(null)              // Date | null

    const fetchBookedDates = useCallback(async () => {
        if (!roomId) return
        try {
            setLoading(true)
            const res = await api.get(`/rooms/${roomId}/booked-dates`)
            setBookedRanges(res.data?.data || [])
        } catch {
            setBookedRanges([])
        } finally {
            setLoading(false)
        }
    }, [roomId])

    useEffect(() => { fetchBookedDates() }, [fetchBookedDates])

    const isBooked = (date) => {
        const d = new Date(date)
        d.setHours(0, 0, 0, 0)
        return bookedRanges.some(range => {
            const s = new Date(range.check_in); s.setHours(0, 0, 0, 0)
            const e = new Date(range.check_out); e.setHours(0, 0, 0, 0)
            return d >= s && d < e
        })
    }

    const isPast = (date) => {
        const d = new Date(date); d.setHours(0, 0, 0, 0)
        return d < today
    }

    const isCheckIn = (date) => checkIn && sameDay(date, checkIn)
    const isCheckOut = (date) => checkOut && sameDay(date, checkOut)

    const isInRange = (date) => {
        const end = checkOut || hovering
        if (!checkIn || !end) return false
        const d = new Date(date); d.setHours(0, 0, 0, 0)
        const s = new Date(checkIn); s.setHours(0, 0, 0, 0)
        const e = new Date(end); e.setHours(0, 0, 0, 0)
        if (e < s) return false
        return d > s && d < e
    }

    const sameDay = (a, b) => {
        const da = new Date(a); da.setHours(0, 0, 0, 0)
        const db = new Date(b); db.setHours(0, 0, 0, 0)
        return da.getTime() === db.getTime()
    }

    const handleDayClick = (date) => {
        const d = new Date(date); d.setHours(0, 0, 0, 0)
        if (isPast(d) || isBooked(d)) return

        if (!checkIn || (checkIn && checkOut)) {
            // Start new selection
            setCheckIn(d)
            setCheckOut(null)
        } else {
            // Second click
            if (d <= checkIn) {
                setCheckIn(d)
                setCheckOut(null)
                return
            }
            // Check if range overlaps with a booking
            const rangeHasBooked = bookedRanges.some(range => {
                const s = new Date(range.check_in); s.setHours(0, 0, 0, 0)
                const e = new Date(range.check_out); e.setHours(0, 0, 0, 0)
                return s > checkIn && s < d
            })
            if (rangeHasBooked) {
                // Can't select range that crosses a booking
                setCheckIn(d)
                setCheckOut(null)
                return
            }
            setCheckOut(d)
            if (onSelect) {
                onSelect({
                    checkIn: checkIn.toISOString().split("T")[0],
                    checkOut: d.toISOString().split("T")[0]
                })
            }
        }
    }

    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate()
    const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay() // 0=Sun

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1) }
        else setMonth(m => m - 1)
    }
    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1) }
        else setMonth(m => m + 1)
    }

    const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

    const cellSize = compact ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs"

    return (
        <div className={`bg-white rounded-2xl border border-slate-200 ${compact ? "p-3" : "p-5"} shadow-sm`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-500"
                >
                    <ChevronLeft size={compact ? 14 : 16} />
                </button>
                <div className="text-center">
                    <p className={`font-bold text-slate-800 ${compact ? "text-xs" : "text-sm"}`}>
                        {MONTHS[month]} {year}
                    </p>
                    {loading && <Loader2 size={10} className="animate-spin mx-auto text-slate-400 mt-0.5" />}
                </div>
                <button
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-500"
                >
                    <ChevronRight size={compact ? 14 : 16} />
                </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                    <div key={d} className={`text-center text-slate-400 font-semibold ${compact ? "text-[9px]" : "text-[10px]"} pb-1`}>
                        {compact ? d.slice(0,1) : d}
                    </div>
                ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-0.5">
                {cells.map((date, i) => {
                    if (!date) return <div key={i} />
                    const booked = isBooked(date)
                    const past = isPast(date)
                    const isCI = isCheckIn(date)
                    const isCO = isCheckOut(date)
                    const inRange = isInRange(date)
                    const disabled = booked || past

                    let cls = `${cellSize} flex items-center justify-center rounded-full font-medium transition-all select-none`
                    if (isCI || isCO) {
                        cls += " bg-[#003580] text-white font-bold"
                    } else if (inRange) {
                        cls += " bg-blue-100 text-[#003580]"
                    } else if (booked) {
                        cls += " bg-rose-100 text-rose-400 line-through cursor-not-allowed"
                    } else if (past) {
                        cls += " text-slate-300 cursor-not-allowed"
                    } else {
                        cls += " text-slate-700 hover:bg-slate-100 cursor-pointer"
                    }

                    const isToday = sameDay(date, today)
                    if (isToday && !isCI && !isCO && !inRange) {
                        cls += " ring-1 ring-[#003580] ring-offset-1"
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => handleDayClick(date)}
                            onMouseEnter={() => !checkOut && checkIn && !disabled && setHovering(date)}
                            onMouseLeave={() => setHovering(null)}
                            disabled={disabled}
                            className={`flex items-center justify-center ${cls}`}
                        >
                            {date.getDate()}
                        </button>
                    )
                })}
            </div>

            {/* Legend */}
            <div className={`flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 ${compact ? "text-[9px]" : "text-[10px]"} text-slate-500`}>
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#003580] inline-block" />
                    Selected
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-100 border border-blue-200 inline-block" />
                    Range
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-100 inline-block" />
                    Booked
                </span>
            </div>

            {/* Selected dates summary */}
            {(checkIn || checkOut) && !compact && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-2">
                        <Calendar size={11} className="text-[#003580]" />
                        <span>
                            <strong>Check-in:</strong>{" "}
                            {checkIn ? checkIn.toLocaleDateString("en-US", { day:"numeric", month:"short", year:"numeric" }) : "—"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={11} className="text-emerald-600" />
                        <span>
                            <strong>Check-out:</strong>{" "}
                            {checkOut ? checkOut.toLocaleDateString("en-US", { day:"numeric", month:"short", year:"numeric" }) : "Select checkout date"}
                        </span>
                    </div>
                    {checkIn && checkOut && (
                        <p className="text-[#003580] font-semibold pt-1">
                            {Math.ceil((checkOut - checkIn) / 86400000)} night(s) selected
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
