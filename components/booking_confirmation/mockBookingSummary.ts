import type {BookingSummary} from "@/components/booking_confirmation/types";

export const MOCK_BOOKING_SUMMARY: BookingSummary = {
    branchName: "Sandton City Branch",
    branchAddress: "Sandton City, Sandton, Johannesburg",
    serviceName: "Open an account",
    date: "Tuesday, 27 October 2026",
    time: "10:00",
    userDetails: {
        name: "Nqobani Nhlengethwa",
        email: "nqobani@example.com",
        phone: "+27 82 000 0000",
    },
};
