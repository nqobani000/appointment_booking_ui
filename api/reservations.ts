import {request, requestWithStatus} from "@/api/client";
import {ApiError, isApiError} from "@/api/errors";
import type {
    Appointment,
    ConfirmResult,
    CreatedReservation,
    CreateReservationRequest,
    CreateReservationResponse,
    Reservation,
} from "@/api/types/reservations";

interface Credentials {
    accessToken: string;
    reservationToken: string;
}

const reservationPath = (reservationId: string) => `/api/reservations/${encodeURIComponent(reservationId)}`;

/** Splits the secret token from the public reservation data. */
export async function createReservation(body: CreateReservationRequest, accessToken: string): Promise<CreatedReservation> {
    const {reservationToken, ...reservation} = await request<CreateReservationResponse>("/api/reservations", {
        method: "POST",
        body,
        accessToken,
    });
    return {reservation, reservationToken};
}

export const getReservation = (reservationId: string, {accessToken, reservationToken}: Credentials, signal?: AbortSignal) =>
    request<Reservation>(reservationPath(reservationId), {accessToken, reservationToken, signal});

export async function releaseReservation(
    reservationId: string,
    {accessToken, reservationToken}: Credentials,
    options: {keepalive?: boolean} = {},
): Promise<void> {
    await request<void>(reservationPath(reservationId), {
        method: "DELETE",
        accessToken,
        reservationToken,
        keepalive: options.keepalive,
    });
}

export async function confirmReservation(
    reservationId: string,
    {accessToken, reservationToken}: Credentials,
): Promise<ConfirmResult> {
    const {status, data} = await requestWithStatus<Appointment>(`${reservationPath(reservationId)}/confirm`, {
        method: "POST",
        accessToken,
        reservationToken,
    });
    return {appointment: data, alreadyConfirmed: status === 200};
}

/**
 * Confirm is idempotent on the backend (a repeat returns the existing appointment), but after a
 * network failure the outcome is unknown, so the reservation state is checked before deciding.
 */
export async function confirmWithReconciliation(reservationId: string, credentials: Credentials): Promise<ConfirmResult> {
    try {
        return await confirmReservation(reservationId, credentials);
    } catch (error) {
        if (!isApiError(error) || error.kind !== "network") throw error;

        let current: Reservation;
        try {
            current = await getReservation(reservationId, credentials);
        } catch {
            throw error;
        }

        switch (current.status) {
            case "CONFIRMED":
                return confirmReservation(reservationId, credentials);
            case "EXPIRED":
                throw ApiError.fromResponse(410, undefined);
            case "RELEASED":
                throw new ApiError("conflict", 409, "This reservation was released. Please choose a new time.");
            default:
                // Still held: nothing was committed, the caller may safely confirm again.
                throw error;
        }
    }
}
