import type {Branch} from "@/components/branch_selection/types";
import type {ServiceOption} from "@/components/service_selection/ServiceOptionGroups";

export interface BookingSelection {
    branch: Branch | null;
    service: ServiceOption | null;
    date: Date | null;
    time: string | null;
    agreedToNotifications: boolean;
}

export interface CompleteBookingSelection extends BookingSelection {
    branch: Branch;
    service: ServiceOption;
    date: Date;
    time: string;
}

export const EMPTY_BOOKING_SELECTION: BookingSelection = {
    branch: null,
    service: null,
    date: null,
    time: null,
    agreedToNotifications: true,
};

export function isBookingComplete(selection: BookingSelection): selection is CompleteBookingSelection {
    return Boolean(selection.branch && selection.service && selection.date && selection.time);
}

export function isStepComplete(step: number, selection: BookingSelection): boolean {
    switch (step) {
        case 0:
            return selection.branch !== null;
        case 1:
            return selection.service !== null;
        case 2:
            return selection.date !== null && selection.time !== null;
        default:
            return isBookingComplete(selection);
    }
}
