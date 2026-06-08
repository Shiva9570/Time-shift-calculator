import { useState, useEffect } from "react";
import { Coffee, Briefcase, DoorOpen } from "lucide-react";
import { calculateShiftProgress, formatTimeToDisplay } from "../timeUtils";

interface VisualTimelineProps {
  arrivalTime: string;
  departureTime: string;
  offsetHours: number;
  offsetMinutes: number;
  use12Hour: boolean;
}

export function VisualTimeline({
  arrivalTime,
  departureTime,
  offsetHours,
  offsetMinutes,
  use12Hour,
}: VisualTimelineProps) {
  const [progress, setProgress] = useState({
    progressRatio: 0,
    timeLeftText: "",
    isCompleted: false,
    elapsedText: "",
  });

  useEffect(() => {
    // Run immediately
    setProgress(calculateShiftProgress(arrivalTime, offsetHours, offsetMinutes));

    const pollInterval = setInterval(() => {
      setProgress(calculateShiftProgress(arrivalTime, offsetHours, offsetMinutes));
    }, 15000); // refresh progress details every 15 seconds

    return () => clearInterval(pollInterval);
  }, [arrivalTime, offsetHours, offsetMinutes]);

  const percentage = Math.round(progress.progressRatio * 100);

  return (
    <div className="p-6 border border-[#1A1A1A] bg-[#0E0E0E] text-[#F0F0F0] rounded-none">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold tracking-[0.25em] text-white/80 uppercase font-mono">
          Stage 03 // Progress Tracker
        </h3>
        <span className="text-[10px] font-bold font-mono tracking-widest text-[#00FF5F] bg-[#00FF5F]/10 border border-[#00FF5F]/20 rounded-none px-2.5 py-0.5 uppercase">
          +{offsetHours}H {offsetMinutes}M OFFSET
        </span>
      </div>

      {/* Progress Line */}
      <div className="relative pt-2 pb-8">
        {/* Timeline track */}
        <div className="relative w-full h-1.5 bg-[#1B1B1B] rounded-none overflow-hidden mb-6">
          <div
            className="h-full bg-linear-to-r from-[#00FF5F] via-emerald-500 to-teal-400 rounded-none transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Timeline Checkpoints */}
        <div className="grid grid-cols-3 gap-1">
          {/* Start Point */}
          <div className="flex flex-col items-start text-left">
            <div className={`flex items-center justify-center w-8 h-8 rounded-none border-2 ${percentage > 0 ? "bg-[#00FF5F] border-[#00FF5F] text-[#0A0A0A]" : "bg-transparent border-[#1B1B1B] text-white/30"}`}>
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2.5 space-y-0.5">
              <p className="text-[9px] font-bold font-mono text-[#00FF5F] tracking-widest uppercase">ARRIVED</p>
              <p className="text-sm font-bold font-mono text-white">
                {formatTimeToDisplay(arrivalTime, use12Hour)}
              </p>
            </div>
          </div>

          {/* Halfway Point */}
          <div className="flex flex-col items-center text-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-none border-2 ${percentage >= 50 ? "bg-[#00FF5F] border-[#00FF5F] text-[#0A0A0A]" : "bg-transparent border-[#1B1B1B] text-white/30"}`}>
              <Coffee className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2.5 space-y-0.5">
              <p className="text-[9px] font-bold font-mono text-white/40 tracking-widest uppercase">HALF-WAY</p>
              <p className="text-sm font-bold font-mono text-white">
                {(() => {
                  const totalShiftMins = offsetHours * 60 + offsetMinutes;
                  const halfMins = Math.round(totalShiftMins / 2);
                  const halfHrs = Math.floor(halfMins / 60);
                  const halfRems = halfMins % 60;
                  const [h, m] = arrivalTime.split(":").map(Number);
                  let finalH = h + halfHrs;
                  let finalM = m + halfRems;
                  if (finalM >= 60) {
                    finalH += 1;
                    finalM -= 60;
                  }
                  finalH = finalH % 24;
                  const halfTimeString = `${String(finalH).padStart(2, "0")}:${String(finalM).padStart(2, "0")}`;
                  return formatTimeToDisplay(halfTimeString, use12Hour);
                })()}
              </p>
            </div>
          </div>

          {/* End Point */}
          <div className="flex flex-col items-end text-right">
            <div className={`flex items-center justify-center w-8 h-8 rounded-none border-2 ${percentage === 100 ? "bg-[#00FF5F] border-[#00FF5F] text-[#0A0A0A]" : "bg-transparent border-[#1B1B1B] text-white/30"}`}>
              <DoorOpen className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2.5 space-y-0.5">
              <p className="text-[9px] font-bold font-mono text-white/40 tracking-widest uppercase">TARGET</p>
              <p className="text-sm font-bold font-mono text-[#00FF5F]">
                {formatTimeToDisplay(departureTime, use12Hour)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Indicators */}
      <div className="mt-4 pt-4 border-t border-[#1A1A1A] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#111111]/60 p-4">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 bg-[#1B1B1B] border border-[#2B2B2B] text-center shrink-0">
            <p className="text-[9px] font-bold font-mono tracking-widest text-white/40 uppercase">PROGRESS</p>
            <p className="text-base font-black font-mono text-[#00FF5F]">{percentage}%</p>
          </div>
          <div className="text-left space-y-0.5">
            <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">{progress.elapsedText || "0m worked"}</p>
            <p className="text-[10px] text-white/40 font-mono uppercase tracking-wide">Started // {formatTimeToDisplay(arrivalTime, use12Hour)}</p>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end pt-2 sm:pt-0">
          <p className="text-xs font-bold text-[#00FF5F] flex items-center gap-1.5 font-mono uppercase tracking-wider">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#00FF5F] shadow-[0_0_8px_#00FF5F] animate-pulse"></span>
            {progress.timeLeftText}
          </p>
          <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest mt-1">Goal // {formatTimeToDisplay(departureTime, use12Hour)}</p>
        </div>
      </div>
    </div>
  );
}
