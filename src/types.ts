/**
 * Shared Type Definitions for the Time Calculator.
 */

export interface ShiftLog {
  id: string;
  date: string;       // e.g., "2026-06-08"
  arrivalTime: string;  // e.g., "09:00"
  departureTime: string; // e.g., "17:45"
  offsetHours: number;   // e.g., 8
  offsetMinutes: number; // e.g., 45
  createdAt: number;     // Timestamp
  notes?: string;
}

export interface CalculatorSettings {
  defaultOffsetHours: number;
  defaultOffsetMinutes: number;
  format12Hour: boolean;
}
