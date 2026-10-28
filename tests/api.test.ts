import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {getBranches} from "@/api/branches";
import {getService, getServices} from "@/api/services";
import {confirmReservation, confirmWithReconciliation, createReservation, getReservation, releaseReservation} from "@/api/reservations";
import {request} from "@/api/client";
import {ApiError} from "@/api/errors";
import {queryKeys} from "@/api/queryKeys";
import {APPOINTMENT, lastCall, jsonResponse, mockFetch, RESERVATION, SECRET} from "./helpers";

const creds = {accessToken: "jwt", reservationToken: SECRET};
let fetchMock: ReturnType<typeof mockFetch>;

beforeEach(() => {
    fetchMock = mockFetch();
});
afterEach(() => vi.unstubAllGlobals());

describe("branches and services requests", () => {
    it("builds branch URL with query params and omits empty ones", async () => {
        fetchMock.mockResolvedValue(jsonResponse(200, {content: []}));
        await getBranches({search: "sand", latitude: -26.1, longitude: 28.05, page: 1, size: 20});
        const {url, headers} = lastCall(fetchMock);
        expect(url).toBe("http://localhost:8080/api/branches?search=sand&latitude=-26.1&longitude=28.05&page=1&size=20");
        expect(headers["X-Reservation-Token"]).toBeUndefined();
        expect(headers.Authorization).toBeUndefined();

        await getBranches({search: ""});
        expect(lastCall(fetchMock).url).toBe("http://localhost:8080/api/branches");
    });

    it("uses the branch endpoint only when a branch is selected and returns grouped content", async () => {
        const body = {page: 0, content: {LOANS: [{id: "1"}]}};
        fetchMock.mockResolvedValue(jsonResponse(200, body));
        await expect(getServices({branchId: "b1", search: "loan", page: 0, size: 20})).resolves.toEqual(body);
        expect(lastCall(fetchMock).url).toBe("http://localhost:8080/api/services/branch/b1?search=loan&page=0&size=20");
        expect(lastCall(fetchMock).headers["X-Reservation-Token"]).toBeUndefined();

        await getServices({page: 0});
        expect(lastCall(fetchMock).url).toBe("http://localhost:8080/api/services?page=0");

        fetchMock.mockResolvedValue(jsonResponse(200, {id: "s1"}));
        await getService("s1");
        expect(lastCall(fetchMock).url).toBe("http://localhost:8080/api/services/s1");
    });
});

describe("reservation requests", () => {
    it("creates with JWT only, and separates the token from public data", async () => {
        fetchMock.mockResolvedValue(jsonResponse(201, {...RESERVATION, reservationToken: SECRET}));
        const body = {branchId: "b1", serviceId: "s1", startAt: "2030-01-01T10:00:00+02:00"};
        const result = await createReservation(body, "jwt");
        const {url, init, headers} = lastCall(fetchMock);
        expect(url).toBe("http://localhost:8080/api/reservations");
        expect(init.method).toBe("POST");
        expect(JSON.parse(init.body as string)).toEqual(body);
        expect(headers.Authorization).toBe("Bearer jwt");
        expect(headers["X-Reservation-Token"]).toBeUndefined();
        expect(result.reservationToken).toBe(SECRET);
        expect(JSON.stringify(result.reservation)).not.toContain(SECRET);
    });

    it("sends the token header on get, release and confirm", async () => {
        fetchMock.mockResolvedValue(jsonResponse(200, RESERVATION));
        await getReservation(RESERVATION.reservationId, creds);
        expect(lastCall(fetchMock).headers["X-Reservation-Token"]).toBe(SECRET);
        expect(lastCall(fetchMock).url).not.toContain(SECRET);

        fetchMock.mockResolvedValue(jsonResponse(204));
        await releaseReservation(RESERVATION.reservationId, creds);
        expect(lastCall(fetchMock).init.method).toBe("DELETE");
        expect(lastCall(fetchMock).headers["X-Reservation-Token"]).toBe(SECRET);

        fetchMock.mockResolvedValue(jsonResponse(201, APPOINTMENT));
        await confirmReservation(RESERVATION.reservationId, creds);
        expect(lastCall(fetchMock).url).toMatch(/\/confirm$/);
        expect(lastCall(fetchMock).headers["X-Reservation-Token"]).toBe(SECRET);
    });

    it("handles 204 without parsing a body", async () => {
        fetchMock.mockResolvedValue(jsonResponse(204));
        await expect(request("/x", {method: "DELETE"})).resolves.toBeUndefined();
    });

    it("accepts both 201 and 200 on confirm", async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(201, APPOINTMENT));
        expect(await confirmReservation("r", creds)).toEqual({appointment: APPOINTMENT, alreadyConfirmed: false});
        fetchMock.mockResolvedValueOnce(jsonResponse(200, APPOINTMENT));
        expect(await confirmReservation("r", creds)).toEqual({appointment: APPOINTMENT, alreadyConfirmed: true});
    });
});

describe("error handling", () => {
    it.each([
        [400, "validation"],
        [401, "unauthorized"],
        [404, "notFound"],
        [409, "conflict"],
        [410, "expired"],
        [500, "server"],
    ])("maps %i to %s", async (status, kind) => {
        fetchMock.mockResolvedValue(jsonResponse(status, {status, error: "x", message: "Backend message", timestamp: "t"}));
        await expect(request("/x")).rejects.toMatchObject({kind, status});
    });

    it("shows the backend message for conflicts but not for 5xx", async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(409, {message: "No consultant is available for the requested time."}));
        await expect(request("/x")).rejects.toThrow("No consultant is available");
        fetchMock.mockResolvedValueOnce(jsonResponse(500, {message: "NullPointerException at Foo.java:12"}));
        await expect(request("/x")).rejects.toThrow(/Something went wrong/);
    });

    it("handles non-JSON failure bodies", async () => {
        fetchMock.mockResolvedValue(new Response("<html>Bad gateway</html>", {status: 502}));
        await expect(request("/x")).rejects.toMatchObject({kind: "server", message: expect.not.stringContaining("html")});
    });

    it("reports network failures without leaking tokens", async () => {
        fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
        const error = await request("/x", {reservationToken: SECRET}).catch((e: ApiError) => e);
        expect(error).toMatchObject({kind: "network", status: null});
        expect((error as ApiError).message).not.toContain(SECRET);
    });
});

describe("confirmWithReconciliation", () => {
    const network = () => fetchMock.mockRejectedValueOnce(new TypeError("offline"));

    it("passes through non-network errors without extra calls", async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(410, {message: "x"}));
        await expect(confirmWithReconciliation("r", creds)).rejects.toMatchObject({kind: "expired"});
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("re-confirms when the first attempt actually committed", async () => {
        network();
        fetchMock.mockResolvedValueOnce(jsonResponse(200, {...RESERVATION, status: "CONFIRMED"}));
        fetchMock.mockResolvedValueOnce(jsonResponse(200, APPOINTMENT));
        await expect(confirmWithReconciliation("r", creds)).resolves.toMatchObject({appointment: APPOINTMENT});
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("rethrows the network error when still HELD so the user can retry", async () => {
        network();
        fetchMock.mockResolvedValueOnce(jsonResponse(200, RESERVATION));
        await expect(confirmWithReconciliation("r", creds)).rejects.toMatchObject({kind: "network"});
    });

    it("reports expiry and release found during reconciliation", async () => {
        network();
        fetchMock.mockResolvedValueOnce(jsonResponse(200, {...RESERVATION, status: "EXPIRED"}));
        await expect(confirmWithReconciliation("r", creds)).rejects.toMatchObject({kind: "expired"});
        network();
        fetchMock.mockResolvedValueOnce(jsonResponse(200, {...RESERVATION, status: "RELEASED"}));
        await expect(confirmWithReconciliation("r", creds)).rejects.toMatchObject({kind: "conflict"});
    });

    it("keeps the original network error when reconciliation also fails", async () => {
        network();
        network();
        await expect(confirmWithReconciliation("r", creds)).rejects.toMatchObject({kind: "network"});
    });
});

describe("query keys", () => {
    it("are serialisable and contain no token", () => {
        const keys = JSON.stringify([
            queryKeys.branches.list({search: "a", page: 0}),
            queryKeys.services.list({branchId: "b", page: 0}),
            queryKeys.reservations.detail(RESERVATION.reservationId),
        ]);
        expect(keys).not.toContain(SECRET);
        expect(queryKeys.branches.list({page: 1})).toEqual(["branches", "list", {page: 1}]);
        expect(queryKeys.services.list({page: 1}).slice(0, 1)).toEqual(queryKeys.services.all);
    });
});
