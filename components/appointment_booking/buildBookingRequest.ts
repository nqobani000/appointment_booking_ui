import type {BookingRequest} from "@/api/createBooking";
import type {Session} from "@/components/auth/types";
import type {CompleteBookingSelection} from "@/components/appointment_booking/types";

export function buildBookingRequest(selection: CompleteBookingSelection, session: Session): BookingRequest {
    const user = session.kind === "guest"
        ? {kind: session.kind, email: session.email, firstName: session.firstName, lastName: session.lastName}
        : {kind: session.kind, email: session.email};

    return {
        branchId: selection.branch.id,
        branchName: selection.branch.name,
        serviceId: selection.service.id,
        serviceTitle: selection.service.title,
        date: selection.date.toLocaleDateString("en-CA"),
        time: selection.time,
        agreedToNotifications: selection.agreedToNotifications,
        user,
    };
}
