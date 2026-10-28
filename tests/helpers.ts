import {vi} from "vitest";

export function jsonResponse(status: number, body?: unknown): Response {
    return new Response(body === undefined ? null : JSON.stringify(body), {
        status,
        headers: body === undefined ? {} : {"Content-Type": "application/json"},
    });
}

export function mockFetch() {
    const fn = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fn);
    return fn;
}

export function lastCall(fn: ReturnType<typeof mockFetch>) {
    const [url, init] = fn.mock.calls[fn.mock.calls.length - 1];
    return {url: String(url), init: (init ?? {}) as RequestInit, headers: (init?.headers ?? {}) as Record<string, string>};
}

export const RESERVATION = {
    reservationId: "d1e2f3a4-5555-4666-8777-888899990000",
    status: "HELD" as const,
    branchId: "b1",
    serviceId: "s1",
    consultantId: "c1",
    branch: {id: "b1", name: "Sandton Branch"},
    service: {id: "s1", name: "Home Loan Enquiry", durationMinutes: 30},
    consultant: {id: "c1", name: "Thandi", surname: "Nkosi"},
    startAt: "2030-01-01T10:00:00Z",
    endAt: "2030-01-01T10:30:00Z",
    expiresAt: "2030-01-01T08:10:00Z",
};

export const APPOINTMENT = {
    appointmentId: "a1",
    referenceNo: "APT-20300101-3F9A1C7B2D",
    status: "CONFIRMED" as const,
    reservationId: RESERVATION.reservationId,
    branch: RESERVATION.branch,
    service: RESERVATION.service,
    consultant: RESERVATION.consultant,
    startAt: RESERVATION.startAt,
    endAt: RESERVATION.endAt,
};

export const SECRET = "secret-reservation-token";
