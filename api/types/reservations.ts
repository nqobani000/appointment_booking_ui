import type {IsoTimestamp, Uuid} from "@/api/types/common";

export type ReservationStatus = "HELD" | "CONFIRMED" | "RELEASED" | "EXPIRED";

export interface CreateReservationRequest {
    branchId: Uuid;
    serviceId: Uuid;
    startAt: IsoTimestamp;
}

export interface ReservationBranch {
    id: Uuid;
    name: string;
}

export interface ReservationService {
    id: Uuid;
    name: string;
    durationMinutes: number;
}

export interface ReservationConsultant {
    id: Uuid;
    name: string;
    surname: string;
}

/** Public reservation data. Never contains the reservation token. */
export interface Reservation {
    reservationId: Uuid;
    status: ReservationStatus;
    branchId: Uuid;
    serviceId: Uuid;
    consultantId: Uuid;
    branch: ReservationBranch;
    service: ReservationService;
    consultant: ReservationConsultant;
    startAt: IsoTimestamp;
    endAt: IsoTimestamp;
    expiresAt: IsoTimestamp;
}

export interface CreateReservationResponse extends Reservation {
    reservationToken: string;
}

export interface Appointment {
    appointmentId: Uuid;
    referenceNo: string;
    status: "CONFIRMED";
    reservationId: Uuid;
    branch: ReservationBranch;
    service: ReservationService;
    consultant: ReservationConsultant;
    startAt: IsoTimestamp;
    endAt: IsoTimestamp;
}

export interface CreatedReservation {
    reservation: Reservation;
    reservationToken: string;
}

export interface ConfirmResult {
    appointment: Appointment;
    alreadyConfirmed: boolean;
}
