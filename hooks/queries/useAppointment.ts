import {queryOptions, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getAppointmentByReference} from "@/api/appointments";
import {queryKeys} from "@/api/queryKeys";
import {STALE_TIME} from "@/lib/queryClient";

export const appointmentQueryOptions = (referenceNo: string) =>
    queryOptions({
        queryKey: queryKeys.appointments.detail(referenceNo),
        queryFn: ({signal}) => getAppointmentByReference(referenceNo, signal),
        staleTime: STALE_TIME.volatile,
    });

/** For the details page; `enabled` lets callers skip malformed references. */
export const useAppointment = (referenceNo: string, enabled = true) =>
    useQuery({...appointmentQueryOptions(referenceNo), enabled});

/**
 * Submit-triggered lookup for the index screen: surfaces pending/error state inline and leaves the
 * result in the query cache so the details route renders without a second request.
 */
export function useLookupAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (referenceNo: string) => queryClient.fetchQuery(appointmentQueryOptions(referenceNo)),
    });
}
