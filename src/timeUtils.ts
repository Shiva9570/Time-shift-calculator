/**
 * Utility functions for time calculations.
 */

/**
 * Adds hours and minutes to a 24-hour style string "HH:MM".
 * Returns the resulting "HH:MM" and a boolean indicating if it rolled over to the next day.
 */
export function addTimeOffset(
  timeString: string,
  hoursToAdd: number,
  minutesToAdd: number
): { time: string; crossedDay: boolean; daysAdded: number } {
  if (!timeString || !timeString.includes(":")) {
    return { time: "00:00", crossedDay: false, daysAdded: 0 };
  }

  const [hoursStr, minutesStr] = timeString.split(":");
  let hours = parseInt(hoursStr, 10);
  let minutes = parseInt(minutesStr, 10);

  if (isNaN(hours)) hours = 0;
  if (isNaN(minutes)) minutes = 0;

  // Calculate total minutes
  let totalMinutes = hours * 60 + minutes + (hoursToAdd * 60 + minutesToAdd);

  // Take care of day rollovers
  const minutesInDay = 24 * 60;
  let daysAdded = Math.floor(totalMinutes / minutesInDay);
  let finalMinutesInDay = totalMinutes % minutesInDay;

  // Handle negative modulo if any offset was negative
  if (finalMinutesInDay < 0) {
    finalMinutesInDay += minutesInDay;
    daysAdded -= 1;
  }

  const finalHours = Math.floor(finalMinutesInDay / 60);
  const finalMinutes = finalMinutesInDay % 60;

  const formattedHours = String(finalHours).padStart(2, "0");
  const formattedMinutes = String(finalMinutes).padStart(2, "0");

  return {
    time: `${formattedHours}:${formattedMinutes}`,
    crossedDay: daysAdded > 0,
    daysAdded,
  };
}

/**
 * Format "HH:MM" 24h format to either visual 12h representation ("03:45 PM") or simple 24h ("15:45").
 */
export function formatTimeToDisplay(time24: string, use12Hour: boolean): string {
  if (!time24 || !time24.includes(":")) return "";
  
  const [hoursStr, minutesStr] = time24.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) return time24;

  if (!use12Hour) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  const ampm = hours >= 12 ? "PM" : "AM";
  let hours12 = hours % 12;
  hours12 = hours12 ? hours12 : 12; // the hour '0' should be '12'
  const minutesFormatted = String(minutes).padStart(2, "0");

  return `${String(hours12).padStart(2, "0")}:${minutesFormatted} ${ampm}`;
}

/**
 * Returns current local "HH:MM" string.
 */
export function getCurrentTime24(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Calculates current progress status if shift started at arrivalTime today.
 * Returns ratio from 0 to 1, readable status text, and remaining info.
 */
export function calculateShiftProgress(
  arrivalTime24: string,
  offsetHours: number,
  offsetMinutes: number
): {
  progressRatio: number; // 0 to 1
  timeLeftText: string;
  isCompleted: boolean;
  elapsedText: string;
} {
  if (!arrivalTime24 || !arrivalTime24.includes(":")) {
    return { progressRatio: 0, timeLeftText: "", isCompleted: false, elapsedText: "" };
  }

  const [arrHours, arrMins] = arrivalTime24.split(":").map(x => parseInt(x, 10));
  
  const now = new Date();
  
  // Construct Date objects for arrival and target on current day
  const arrivalDate = new Date(now);
  arrivalDate.setHours(arrHours, arrMins, 0, 0);

  const totalShiftMinutes = offsetHours * 60 + offsetMinutes;
  const targetDate = new Date(arrivalDate.getTime() + totalShiftMinutes * 60 * 1000);

  // If arrival was set as tomorrow/yesterday, we can match current date boundary.
  // For simplicity and immediate utility, we compute relative to recent arrival time.
  const nowMs = now.getTime();
  const arrivalMs = arrivalDate.getTime();
  const targetMs = targetDate.getTime();

  // If arrival is way in the future or past, adjust for context or represent as today
  const totalDuration = targetMs - arrivalMs;
  if (totalDuration <= 0) {
    return { progressRatio: 0, timeLeftText: "", isCompleted: false, elapsedText: "" };
  }

  const elapsedMs = nowMs - arrivalMs;

  if (elapsedMs < 0) {
    // Shift hasn't started yet
    const diffMs = arrivalMs - nowMs;
    const diffMins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    let text = "";
    if (hrs > 0) text += `${hrs}h `;
    text += `${mins}m until shift start`;
    
    return {
      progressRatio: 0,
      timeLeftText: text,
      isCompleted: false,
      elapsedText: "Not started yet"
    };
  }

  if (nowMs >= targetMs) {
    // Shift completed!
    const overstayMs = nowMs - targetMs;
    const overstayMins = Math.floor(overstayMs / 60000);
    const hrs = Math.floor(overstayMins / 60);
    const mins = overstayMins % 60;

    let text = "Completed! ";
    if (hrs > 0 || mins > 0) {
      text += `(${hrs > 0 ? hrs + "h " : ""}${mins}m ago)`;
    } else {
      text += "(Just checked out!)";
    }

    return {
      progressRatio: 1,
      timeLeftText: "Shift finished",
      isCompleted: true,
      elapsedText: text
    };
  }

  // Active shift
  const progressRatio = elapsedMs / totalDuration;
  const remainingMs = targetMs - nowMs;
  const remainingMins = Math.floor(remainingMs / 60000);
  const remHrs = Math.floor(remainingMins / 60);
  const remMins = remainingMins % 60;

  // Elapsed
  const elapsedMinsTotal = Math.floor(elapsedMs / 60000);
  const elHrs = Math.floor(elapsedMinsTotal / 60);
  const elMins = elapsedMinsTotal % 60;

  let timeLeftText = "";
  if (remHrs > 0) timeLeftText += `${remHrs}h `;
  timeLeftText += `${remMins}m remaining`;

  let elapsedText = "";
  if (elHrs > 0) elapsedText += `${elHrs}h `;
  elapsedText += `${elMins}m worked`;

  return {
    progressRatio,
    timeLeftText,
    isCompleted: false,
    elapsedText
  };
}
