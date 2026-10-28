import {request} from "@/api/client";
import type {Appointment} from "@/api/types/reservations";

/** Public lookup (no access token): `GET /api/appointments/{referenceNo}` returns an `Appointment`, or 404. */
export const getAppointmentByReference = (referenceNo: string, signal?: AbortSignal) =>
    request<Appointment>(`/api/appointments/${encodeURIComponent(referenceNo)}`, {signal});
