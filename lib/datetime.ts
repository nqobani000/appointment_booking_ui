/** Branches operate in Africa/Johannesburg (UTC+02:00, no daylight saving). */
const BRANCH_UTC_OFFSET = "+02:00";

/** Combines a calendar date and an "HH:mm" slot into an ISO-8601 timestamp with offset. */
export function toStartAt(date: Date, time: string): string {
    const day = date.toLocaleDateString("en-CA");
    return `${day}T${time}:00${BRANCH_UTC_OFFSET}`;
}

export function formatCountdown(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
