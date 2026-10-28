// The backend builds the date with BASIC_ISO_DATE on an offset timestamp, so real references carry
// an offset suffix after yyyyMMdd ("Z", "+0200", "-0500"), e.g. APT-20261028Z-741F5018F7.
const BOOKING_REFERENCE_PATTERN = /^APT-\d{8}(?:Z|[+-]\d{2}(?::?\d{2}){0,2})?-[A-Z0-9]{10}$/;

export function normalizeBookingReference(value: string): string {
    return value.trim().toUpperCase();
}

/** Route params may arrive percent-encoded ("+" as "%2B"); malformed escapes are left as-is and fail validation. */
export function decodeBookingReference(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

export function isBookingReference(value: string): boolean {
    return BOOKING_REFERENCE_PATTERN.test(normalizeBookingReference(value));
}

export function validateBookingReference(value: string): string | undefined {
    if (!value.trim()) return "Booking reference is required.";
    if (!isBookingReference(value)) return "Enter a valid booking reference, like APT-20300101-3F9A1C7B2D.";
    return undefined;
}
