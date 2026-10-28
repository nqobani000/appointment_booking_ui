import {useMutation, useQueryClient} from "@tanstack/react-query";
import {confirmWithReconciliation, createReservation, releaseReservation} from "@/api/reservations";
import {queryKeys} from "@/api/queryKeys";
import type {CreateReservationRequest, Reservation} from "@/api/types/reservations";
import {useAuth} from "@/components/auth/AuthContext";
import {useReservationSession} from "@/components/appointment_booking/ReservationSession";

function useCredentials() {
    const {session} = useAuth();
    const reservationSession = useReservationSession();
    return () => {
        const reservationToken = reservationSession.getReservationToken();
        const reservationId = reservationSession.reservation?.reservationId;
        if (!session || !reservationToken || !reservationId) return null;
        return {reservationId, credentials: {accessToken: session.accessToken, reservationToken}};
    };
}

/**
 * The token is moved into the in-memory reservation session inside the mutation function, so it
 * never becomes mutation data/state. No retries: a timeout may follow a committed create.
 */
export function useCreateReservation() {
    const {session} = useAuth();
    const reservationSession = useReservationSession();
    const queryClient = useQueryClient();

    return useMutation<Reservation, Error, CreateReservationRequest>({
        mutationFn: async (request) => {
            if (!session) throw new Error("Not signed in");
            const created = await createReservation(request, session.accessToken);
            reservationSession.hold(created);
            return created.reservation;
        },
        gcTime: 0,
        onSettled: () => queryClient.invalidateQueries({queryKey: queryKeys.reservations.all}),
    });
}

/** Local state is cleared whatever the outcome; the backend expiry is the fallback. */
export function useReleaseReservation() {
    const getCredentials = useCredentials();
    const reservationSession = useReservationSession();
    const queryClient = useQueryClient();

    return useMutation<void, Error, void>({
        mutationFn: async () => {
            const current = getCredentials();
            if (!current) return;
            await releaseReservation(current.reservationId, current.credentials);
        },
        gcTime: 0,
        onSettled: () => {
            reservationSession.clear();
            return queryClient.invalidateQueries({queryKey: queryKeys.reservations.all});
        },
    });
}

export function useConfirmReservation() {
    const getCredentials = useCredentials();
    const reservationSession = useReservationSession();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const current = getCredentials();
            if (!current) throw new Error("No active reservation");
            return confirmWithReconciliation(current.reservationId, current.credentials);
        },
        gcTime: 0,
        onSuccess: () => reservationSession.clear(),
        onError: (error) => {
            // A held reservation after a network failure keeps its token so the user can retry.
            const kind = (error as {kind?: string}).kind;
            if (kind && kind !== "network" && kind !== "server") reservationSession.clear();
        },
        onSettled: () => queryClient.invalidateQueries({queryKey: queryKeys.reservations.all}),
    });
}
