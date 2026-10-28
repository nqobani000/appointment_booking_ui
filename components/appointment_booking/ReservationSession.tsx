"use client";

import * as React from "react";
import type {CreatedReservation, Reservation} from "@/api/types/reservations";
import {RESERVATION_KEY, sessionStore, useStoredValue} from "@/lib/sessionStore";

interface ReservationSessionValue {
    /** Public reservation data (never the token). */
    reservation: Reservation | null;
    hold: (created: CreatedReservation) => void;
    /** Returns the secret token for attaching to `X-Reservation-Token`; do not render or log it. */
    getReservationToken: () => string | null;
    clear: () => void;
}

const ReservationSessionContext = React.createContext<ReservationSessionValue | null>(null);

export function useReservationSession(): ReservationSessionValue {
    const ctx = React.useContext(ReservationSessionContext);
    if (!ctx) throw new Error("useReservationSession must be used inside <ReservationSessionProvider>");
    return ctx;
}

function parseStored(raw: string | null): CreatedReservation | null {
    if (!raw) return null;
    try {
        const stored = JSON.parse(raw) as CreatedReservation;
        return new Date(stored.reservation.expiresAt).getTime() > Date.now() ? stored : null;
    } catch {
        return null;
    }
}

/**
 * Persists the reservation and its token in sessionStorage (tab-scoped) so a reload can resume the
 * hold. The token is never placed in React state, context values, URLs or query keys.
 */
export function ReservationSessionProvider({children}: { children: React.ReactNode }) {
    const raw = useStoredValue(RESERVATION_KEY);
    const reservation = React.useMemo(() => parseStored(raw)?.reservation ?? null, [raw]);

    const hold = React.useCallback((created: CreatedReservation) => {
        sessionStore.set(RESERVATION_KEY, JSON.stringify(created));
    }, []);

    const clear = React.useCallback(() => sessionStore.remove(RESERVATION_KEY), []);

    const getReservationToken = React.useCallback(
        () => parseStored(sessionStore.get(RESERVATION_KEY))?.reservationToken ?? null,
        [],
    );

    const value = React.useMemo(
        () => ({reservation, hold, getReservationToken, clear}),
        [reservation, hold, getReservationToken, clear],
    );

    return <ReservationSessionContext.Provider value={value}>{children}</ReservationSessionContext.Provider>;
}
