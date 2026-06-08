import { useState, useEffect } from "react";

export function ClockView() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const hoursStr = String(hours).padStart(2, "0");
    return { hoursStr, minutes, seconds, ampm };
  };

  const { hoursStr, minutes, seconds, ampm } = formatTime(time);

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();

  return (
    <div className="flex flex-col items-center justify-between p-6 bg-[#0E0E0E] border border-[#1A1A1A] rounded-none sm:flex-row gap-4">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 bg-[#00FF5F] rounded-full shadow-[0_0_10px_#00FF5F]"></div>
        <p className="text-xs font-bold tracking-[0.25em] text-[#00FF5F] uppercase font-mono">
          SYSTEM CLOCK // LIVE
        </p>
      </div>

      <div className="flex flex-col items-center sm:items-end">
        <div className="flex items-baseline font-mono text-white tracking-tighter gap-1.5 text-2xl md:text-3xl font-bold">
          <span>{hoursStr}</span>
          <span className="opacity-40 animate-pulse">:</span>
          <span>{minutes}</span>
          <span className="opacity-40 animate-pulse">:</span>
          <span className="text-[#00FF5F] font-semibold">{seconds}</span>
          <span className="ml-3 text-[10px] font-bold tracking-widest text-[#0a0a0a] bg-white border border-white px-2 py-0.5 uppercase">
            {ampm}
          </span>
        </div>
        <p className="mt-1 text-[10px] font-mono text-white/40 tracking-[0.15em] uppercase">
          {formattedDate} // UTC+0 BASED
        </p>
      </div>
    </div>
  );
}
