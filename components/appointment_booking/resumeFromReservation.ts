import type {Reservation} from "@/api/types/reservations";
import type {BookingSelection} from "@/components/appointment_booking/types";

const ZONE = "Africa/Johannesburg";

/** Rebuilds the review-step selection from a reservation restored after a reload. */
export function selectionFromReservation(reservation: Reservation): BookingSelection {
    const start = new Date(reservation.startAt);
    const [year, month, day] = start.toLocaleDateString("en-CA", {timeZone: ZONE}).split("-").map(Number);
    return {
        branch: {id: reservation.branch.id, name: reservation.branch.name, address: ""},
        service: {id: reservation.service.id, title: reservation.service.name, description: "", availableTo: []},
        date: new Date(year, month - 1, day),
        time: start.toLocaleTimeString("en-GB", {timeZone: ZONE, hour: "2-digit", minute: "2-digit"}),
        agreedToNotifications: true,
    };
}
