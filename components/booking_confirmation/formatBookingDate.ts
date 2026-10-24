export function formatBookingDate(date: Date): string {
    const weekday = date.toLocaleDateString("en-GB", {weekday: "long"});
    const month = date.toLocaleDateString("en-GB", {month: "long"});
    return `${weekday}, ${date.getDate()} ${month} ${date.getFullYear()}`;
}
