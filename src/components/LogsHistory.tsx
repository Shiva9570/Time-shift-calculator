import { Trash2, Calendar, ClipboardList, Clock, RefreshCw } from "lucide-react";
import { ShiftLog } from "../types";
import { formatTimeToDisplay } from "../timeUtils";

interface LogsHistoryProps {
  logs: ShiftLog[];
  onDeleteLog: (id: string) => void;
  onClearAll: () => void;
  onSelectLog: (log: ShiftLog) => void;
  use12Hour: boolean;
}

export function LogsHistory({
  logs,
  onDeleteLog,
  onClearAll,
  onSelectLog,
  use12Hour,
}: LogsHistoryProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 border border-[#1A1A1A] bg-[#0E0E0E] text-center">
        <ClipboardList className="w-8 h-8 text-white/20 mb-3" />
        <p className="text-xs font-bold font-mono tracking-[0.2em] text-white/80 uppercase">NO SHIFT LOGGER DATA</p>
        <p className="text-[11px] text-white/40 mt-1.5 max-w-xs font-mono uppercase tracking-wider">
          Log calculations using the &ldquo;Save logged shift&rdquo; protocol below.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#1A1A1A] bg-[#0E0E0E] p-6">
      <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-[#1A1A1A]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/60" />
          <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase font-mono">
            RECENT TRACKED SHIFTS // LOGS ({logs.length})
          </h3>
        </div>
        <button
          onClick={onClearAll}
          className="text-[10px] font-bold font-mono tracking-widest text-[#FF003C] hover:text-[#FF3B67] hover:bg-[#FF003C]/5 px-3 py-1.5 border border-[#FF003C]/20 uppercase transition-all"
        >
          CLEAR SYSTEM ALL
        </button>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {logs.map((log) => {
          const formattedDate = new Date(log.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            weekday: "short",
          }).toUpperCase();

          return (
            <div
              key={log.id}
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#333333] transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#141414] border border-[#222222] text-[#00FF5F] shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[11px] font-bold text-white tracking-widest font-mono">{formattedDate}</p>
                    <span className="text-[10px] font-bold text-[#00FF5F] bg-[#00FF5F]/10 px-2 py-0.2 border border-[#00FF5F]/20 font-mono uppercase tracking-wider">
                      +{log.offsetHours}H {log.offsetMinutes}M
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-white/60 font-medium">
                      ARR: {formatTimeToDisplay(log.arrivalTime, use12Hour)}
                    </span>
                    <span className="text-white/20">&bull;</span>
                    <span className="font-bold text-[#00FF5F]">
                      DEP: {formatTimeToDisplay(log.departureTime, use12Hour)}
                    </span>
                  </div>
                  {log.notes && (
                    <p className="text-[11px] text-white/50 italic font-mono mt-0.5">
                      // &ldquo;{log.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1A1A1A]">
                <button
                  onClick={() => onSelectLog(log)}
                  title="Re-apply settings"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold font-mono tracking-widest text-[#00FF5F] hover:text-[#0A0A0A] bg-transparent hover:bg-[#00FF5F] border border-[#00FF5F]/40 hover:border-transparent transition-all uppercase"
                >
                  <RefreshCw className="w-3 h-3" />
                  Load
                </button>
                <button
                  onClick={() => onDeleteLog(log.id)}
                  title="Delete log"
                  className="p-1.5 text-white/40 hover:text-[#FF003C] hover:bg-[#FF003C]/10 border border-transparent hover:border-[#FF003C]/35 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
