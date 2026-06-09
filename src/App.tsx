import { useState, useEffect, useRef } from "react";
import { 
  Clock, 
  ArrowRight, 
  Plus, 
  Minus, 
  Settings, 
  Check, 
  Save, 
  Info,
  CalendarDays,
  FileText,
  MousePointerClick
} from "lucide-react";
import { ClockView } from "./components/ClockView";
import { VisualTimeline } from "./components/VisualTimeline";
import { LogsHistory } from "./components/LogsHistory";
import { ShiftLog } from "./types";
import { addTimeOffset, getCurrentTime24, formatTimeToDisplay } from "./timeUtils";

export default function App() {
  // Config state
  const [arrivalTime, setArrivalTime] = useState<string>("09:00");
  const [offsetHours, setOffsetHours] = useState<number>(8);
  const [offsetMinutes, setOffsetMinutes] = useState<number>(45);
  const [use12Hour, setUse12Hour] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>("");
  const [logs, setLogs] = useState<ShiftLog[]>([]);

  // Feedback notifications
  const [notification, setNotification] = useState<string | null>(null);

  // Reference to manually trigger time input if needed
  const timeInputRef = useRef<HTMLInputElement>(null);

  // Initialize values
  useEffect(() => {
    // Try to pre-set arrival time to current time on load
    setArrivalTime(getCurrentTime24());

    // Load logs from localStorage
    try {
      const savedLogs = localStorage.getItem("time_calculator_logs");
      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      }
    } catch (e) {
      console.error("Failed to read shift logs from localStorage:", e);
    }

    // Load preference from localStorage
    const savedFormat = localStorage.getItem("time_calculator_format12");
    if (savedFormat !== null) {
      setUse12Hour(savedFormat === "true");
    }
  }, []);

  // Save logs to localStorage if updated
  const saveLogsToStorage = (updatedLogs: ShiftLog[]) => {
    setLogs(updatedLogs);
    try {
      localStorage.setItem("time_calculator_logs", JSON.stringify(updatedLogs));
    } catch (e) {
      console.error("Failed to save shift logs to localStorage:", e);
    }
  };

  // Notification helper
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Output calculated departure time
  const calculation = addTimeOffset(arrivalTime, offsetHours, offsetMinutes);
  const calculatedEndTime = calculation.time;
  const crossedDay = calculation.crossedDay;

  // Set arrival time to present moment
  const handleSetToNow = () => {
    const now24 = getCurrentTime24();
    setArrivalTime(now24);
    showNotification(`Arrival set to now: ${formatTimeToDisplay(now24, use12Hour)}`);
  };

  // Quick offsets adjustments for arrival time (e.g. adjust hours or minutes)
  const shiftArrivalTime = (minutesDelta: number) => {
    const [h, m] = arrivalTime.split(":").map(Number);
    let totalMinutes = h * 60 + m + minutesDelta;
    if (totalMinutes < 0) totalMinutes += 24 * 60; // loop back
    totalMinutes = totalMinutes % (24 * 60);

    const newH = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const newM = String(totalMinutes % 60).padStart(2, "0");
    setArrivalTime(`${newH}:${newM}`);
  };

  // Preset offset settings
  const handleResetOffset = () => {
    setOffsetHours(8);
    setOffsetMinutes(45);
    showNotification("Restored standard shift length (8h 45m)");
  };

  // Convert hours or minutes incrementally
  const adjustOffsetHours = (dir: "inc" | "dec") => {
    setOffsetHours((prev) => {
      if (dir === "inc") return prev + 1;
      return Math.max(0, prev - 1);
    });
  };

  const adjustOffsetMinutes = (dir: "inc" | "dec") => {
    setOffsetMinutes((prev) => {
      if (dir === "inc") {
        if (prev + 5 >= 60) {
          setOffsetHours((h) => h + 1);
          return (prev + 5) % 60;
        }
        return prev + 5;
      } else {
        if (prev - 5 < 0) {
          if (offsetHours > 0) {
            setOffsetHours((h) => h - 1);
            return 60 + (prev - 5);
          }
          return 0;
        }
        return prev - 5;
      }
    });
  };

  // Toggle time representation format
  const toggleTimeFormat = () => {
    const newValue = !use12Hour;
    setUse12Hour(newValue);
    localStorage.setItem("time_calculator_format12", String(newValue));
  };

  // Log active calculation to history list
  const handleSaveToHistory = () => {
    const today = new Date().toISOString().split("T")[0];
    const newLog: ShiftLog = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      date: today,
      arrivalTime,
      departureTime: calculatedEndTime,
      offsetHours,
      offsetMinutes,
      createdAt: Date.now(),
      notes: notes.trim() || undefined,
    };

    const newLogsList = [newLog, ...logs];
    saveLogsToStorage(newLogsList);
    setNotes("");
    showNotification("Shift protocol calculation stored to system logs!");
  };

  // Select log to reload inputs
  const handleSelectLog = (log: ShiftLog) => {
    setArrivalTime(log.arrivalTime);
    setOffsetHours(log.offsetHours);
    setOffsetMinutes(log.offsetMinutes);
    if (log.notes) {
      setNotes(log.notes);
    }
    showNotification("Shift protocol re-applied to parameters!");
  };

  // Delete specific log
  const handleDeleteLog = (id: string) => {
    const updated = logs.filter((log) => log.id !== id);
    saveLogsToStorage(updated);
    showNotification("Shift log entry purged");
  };

  // Empty all logs
  const handleClearAllLogs = () => {
    if (window.confirm("Are you sure you want to purge all tracked shifts from the protocol database?")) {
      saveLogsToStorage([]);
      showNotification("Protocol histories wiped");
    }
  };

  // Math for Visual Representation
  const parseTimeParts = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(":")) {
      return { hh: "00", mm: "00", ampm: "AM" };
    }
    const [h, m] = timeStr.split(":").map(Number);
    let displayH = h;
    let period = "AM";
    if (use12Hour) {
      period = h >= 12 ? "PM" : "AM";
      displayH = h % 12;
      displayH = displayH ? displayH : 12;
    }
    return {
      hh: String(displayH).padStart(2, "0"),
      mm: String(m).padStart(2, "0"),
      ampm: period
    };
  };

  const arrivalParts = parseTimeParts(arrivalTime);
  const endParts = parseTimeParts(calculatedEndTime);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] font-sans border-y-8 sm:border-x-12 border-[#1A1A1A] transition-all duration-300">
      
      {/* Brand protocol line header */}
      <header className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between px-6 sm:px-12 py-6 border-b border-[#1A1A1A] gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[#00FF5F] rounded-full shadow-[0_0_10px_#00FF5F]"></div>
          <span className="text-xs font-bold tracking-[0.3em] uppercase opacity-75 font-mono">
            Time Calculator Protocol // v2.5
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono uppercase opacity-55">
          <span>Standard Required: +8H:45M:00S</span>
          <div className="hidden sm:block h-3.5 w-px bg-white/20"></div>
          <button 
            onClick={toggleTimeFormat}
            className="text-[#00FF5F] hover:underline font-bold transition-all focus:outline-none"
          >
            Format: {use12Hour ? "12H" : "24H"}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 sm:p-12 space-y-8">
        
        {/* Live Clock Dashboard Panel */}
        <ClockView />

        {/* Action Feed Notification Toast */}
        {notification && (
          <div className="flex items-center gap-3 p-4 text-xs font-mono bg-[#111] border border-[#00FF5F]/30 text-[#00FF5F] uppercase tracking-wider animate-pulse">
            <Check className="w-4 h-4 text-[#00FF5F] shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Primary Interactive Dual Split Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 border border-[#1A1A1A] bg-[#0D0D0D]">
          
          {/* Left Pane (Input Parameters) */}
          <section className="p-8 sm:p-12 border-b lg:border-b-0 lg:border-r border-[#1A1A1A] flex flex-col justify-between gap-8 bg-[#0D0D0D]">
            <div>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#00FF5F] mb-3">STAGE 01 // INPUT PARAMETERS</p>
              <h2 className="text-3xl font-light tracking-tight text-white uppercase font-display">Arrival Coming Time</h2>
            </div>

            {/* Giant Graphic Entry Time Display */}
            <div className="relative group p-4 border border-white/5 bg-[#080808]">
              <div className="absolute top-2 left-3 text-[9px] font-mono opacity-30 tracking-widest uppercase">
                HH:MM FORMAT // CLICK TO MANUALLY ADJUST
              </div>
              
              <div 
                onClick={() => timeInputRef.current?.showPicker?.() || timeInputRef.current?.click()}
                className="text-[80px] sm:text-[110px] leading-none font-bold tracking-tighter text-white border-b border-white/10 pb-4 flex items-baseline font-display cursor-pointer hover:bg-white/5 px-2 transition-all"
              >
                <span>{arrivalParts.hh}</span>
                <span className="opacity-20 mx-1.5 animate-pulse">:</span>
                <span>{arrivalParts.mm}</span>
                {use12Hour && (
                  <span className="text-xl sm:text-2xl font-mono ml-4 tracking-normal opacity-40 uppercase">
                    {arrivalParts.ampm}
                  </span>
                )}
                
                {/* Embedded HTML invisible time input to leverage absolute overlay clickability */}
                <input
                  ref={timeInputRef}
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>

              {/* Adjust trigger hints */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] text-white/40 font-mono tracking-widest flex items-center gap-1">
                  <MousePointerClick className="w-3 h-3 text-[#00FF5F]" />
                  TAP NUMBERS TO POP DEFAULTS
                </span>
                
                <div className="flex gap-1.5 text-xs font-mono font-bold">
                  <button 
                    onClick={() => shiftArrivalTime(-15)}
                    className="px-2.5 py-1 bg-[#1A1A1A] text-white hover:bg-[#00FF5F] hover:text-black transition-all"
                  >
                    -15M
                  </button>
                  <button 
                    onClick={handleSetToNow}
                    className="px-3 py-1 bg-white text-black hover:bg-[#00FF5F] hover:text-black transition-all"
                  >
                    NOW
                  </button>
                  <button 
                    onClick={() => shiftArrivalTime(15)}
                    className="px-2.5 py-1 bg-[#1A1A1A] text-white hover:bg-[#00FF5F] hover:text-black transition-all"
                  >
                    +15M
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Offset Multiplier Row */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/55 font-mono">
                  CUSTOM SHIFT INTERVAL OFFSET
                </p>
                {(offsetHours !== 8 || offsetMinutes !== 45) && (
                  <button
                    onClick={handleResetOffset}
                    className="text-[10px] font-bold font-mono tracking-wider text-[#00FF5F] hover:underline"
                  >
                    RESTORE STANDARD 8h 45m
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Hours controller */}
                <div className="flex items-center justify-between p-3.5 bg-[#141414] border border-[#222]">
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest font-mono">Hours</span>
                  <div className="flex items-center gap-2 font-mono">
                    <button
                      onClick={() => adjustOffsetHours("dec")}
                      className="p-1 px-2.5 bg-[#222] hover:bg-[#00FF5F] hover:text-black transition-colors"
                      disabled={offsetHours <= 0}
                    >
                      -
                    </button>
                    <span className="w-7 text-center font-bold text-white text-sm">
                      {offsetHours}H
                    </span>
                    <button
                      onClick={() => adjustOffsetHours("inc")}
                      className="p-1 px-2.5 bg-[#222] hover:bg-[#00FF5F] hover:text-black transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Minutes controller */}
                <div className="flex items-center justify-between p-3.5 bg-[#141414] border border-[#222]">
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest font-mono">Minutes</span>
                  <div className="flex items-center gap-2 font-mono">
                    <button
                      onClick={() => adjustOffsetMinutes("dec")}
                      className="p-1 px-2.5 bg-[#222] hover:bg-[#00FF5F] hover:text-black transition-colors"
                      disabled={offsetMinutes <= 0 && offsetHours === 0}
                    >
                      -
                    </button>
                    <span className="w-7 text-center font-bold text-white text-sm">
                      {offsetMinutes}M
                    </span>
                    <button
                      onClick={() => adjustOffsetMinutes("inc")}
                      className="p-1 px-2.5 bg-[#222] hover:bg-[#00FF5F] hover:text-black transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 opacity-40">
              <div className="w-8 h-[1px] bg-white"></div>
              <span className="text-[9px] uppercase tracking-[0.3em] font-mono font-bold">Auto-Calculating Live Output</span>
            </div>
          </section>

          {/* Right Pane (Bold Output) */}
          <section className="p-8 sm:p-12 bg-white text-black flex flex-col justify-between gap-8 relative">
            {/* Decorative Vector Clock Graphic exactly as seen in design template */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <svg width="180" height="180" viewBox="0 0 100 100" className="stroke-current">
                <circle cx="50" cy="50" r="48" fill="none" strokeWidth="0.5" strokeDasharray="3 3 shrink" />
                <path d="M 50 10 L 50 50 L 78 50" fill="none" strokeWidth="2.5" />
              </svg>
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-60 mb-3">STAGE 02 // OUTPUT CALCULATED</p>
              <h2 className="text-3xl font-light tracking-tight uppercase font-display">Target Departure</h2>
            </div>

            <div className="relative">
              <div className="absolute -top-6 left-0 text-[10px] font-mono opacity-40 uppercase tracking-widest">
                ESTIMATED COMPLETED DEPARTURE TIME
              </div>
              
              {/* Calculated departure clock in giant display layout */}
              <div className="text-[75px] sm:text-[115px] leading-[0.85] font-black tracking-[-0.05em] font-display text-black">
                {endParts.hh}:{endParts.mm}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="text-3xl font-light italic font-mono uppercase tracking-wide">
                  {use12Hour ? endParts.ampm : "MILITARY"}
                </div>
                <div className="h-8 w-[2.5px] bg-black opacity-15"></div>
                <div className="text-[10px] leading-tight opacity-70 uppercase tracking-widest font-mono">
                  {crossedDay ? (
                    <span className="font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-none mr-2">
                      NEXT DAY (+{calculation.daysAdded}D)
                    </span>
                  ) : (
                    <span>SHIFT LATEST // SAME DAY</span>
                  )}
                  <br />
                  Total duration: <span className="font-black">{offsetHours} hrs {offsetMinutes} mins</span>
                </div>
              </div>
            </div>

            {/* Note Logging Panel Integrated within Right Section */}
            <div className="space-y-3 pt-6 border-t border-black/10">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-black/60" />
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/60 font-mono">
                  Event / Log Description (Optional)
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Normal Routine Shift, Client Meet..."
                  className="flex-1 h-12 px-4 bg-black/5 border border-black/10 focus:border-black rounded-none text-xs font-mono text-black outline-none transition-colors"
                />
                
                <button
                  onClick={handleSaveToHistory}
                  className="h-12 px-6 bg-black text-white hover:bg-[#00FF5F] hover:text-black hover:border-black font-semibold text-xs tracking-widest uppercase transition-colors shrink-0 flex items-center justify-between gap-4 font-mono group"
                >
                  <span>Log Shift</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </section>

        </div>

        {/* Live Multi-Stage Progress Timeline */}
        <VisualTimeline
          arrivalTime={arrivalTime}
          departureTime={calculatedEndTime}
          offsetHours={offsetHours}
          offsetMinutes={offsetMinutes}
          use12Hour={use12Hour}
        />

        {/* Saved Shift Logs database visualizer */}
        <LogsHistory
          logs={logs}
          onDeleteLog={handleDeleteLog}
          onClearAll={handleClearAllLogs}
          onSelectLog={handleSelectLog}
          use12Hour={use12Hour}
        />

        {/* Technical Notice block */}
        <div className="flex items-start gap-4 p-6 border-l-4 border-[#00FF5F] bg-[#0E0E0E] text-white">
          <Info className="w-5 h-5 text-[#00FF5F] shrink-0 mt-0.5" />
          <div className="space-y-1.5 font-mono">
            <h4 className="text-[10px] font-bold text-white tracking-[0.25em] uppercase">
              DECREE PROTOCOL // THE 8H 45M CALCULATION
            </h4>
            <p className="text-xs text-white/60 leading-relaxed uppercase tracking-wider">
              Standard corporate contracts declare exactly 8 hours of performance paired with a mandatory 45 minutes of scheduled lunch resting period. Total local duty presence sums precisely to 8 hours and 45 minutes. This calculator enforces boundaries without configuration overhead.
            </p>
          </div>
        </div>

      </div>

      {/* Footer system details */}
      <footer className="bg-[#0F1115] px-6 sm:px-12 py-6 border-t border-[#1A1A1A] flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono tracking-widest opacity-40 uppercase gap-2">
        <div>System state: Protocol Active</div>
        <div>Location: Northern Hemisphere // Local Terminal</div>
        <div>Calculations standard: v2.5 ISO-8601 Compliance</div>
      </footer>

    </div>
  );
}
