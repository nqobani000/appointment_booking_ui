import * as React from "react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {act, renderHook, waitFor} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReservationSessionProvider, useReservationSession} from "@/components/appointment_booking/ReservationSession";
import {useConfirmReservation, useCreateReservation, useReleaseReservation} from "@/hooks/mutations/useReservationMutations";
import {useReservationCountdown} from "@/hooks/useReservationCountdown";
import {queryKeys} from "@/api/queryKeys";
import {APPOINTMENT, jsonResponse, lastCall, mockFetch, RESERVATION, SECRET} from "./helpers";

vi.mock("@/components/auth/AuthContext", () => ({
    useAuth: () => ({session: {accessToken: "jwt"}, signOut: vi.fn(), signIn: vi.fn()}),
}));

const REQUEST = {branchId: "b1", serviceId: "s1", startAt: "2030-01-01T10:00:00+02:00"};
let fetchMock: ReturnType<typeof mockFetch>;
let queryClient: QueryClient;

function setup<T>(useHook: () => T) {
    queryClient = new QueryClient({defaultOptions: {queries: {retry: false}}});
    const wrapper = ({children}: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <ReservationSessionProvider>{children}</ReservationSessionProvider>
        </QueryClientProvider>
    );
    return renderHook(() => ({hook: useHook(), session: useReservationSession()}), {wrapper});
}

beforeEach(() => {
    fetchMock = mockFetch();
    sessionStorage.clear();
    localStorage.clear();
});
afterEach(() => vi.unstubAllGlobals());

async function hold(result: ReturnType<typeof setup<ReturnType<typeof useCreateReservation>>>["result"]) {
    fetchMock.mockResolvedValueOnce(jsonResponse(201, {...RESERVATION, reservationToken: SECRET}));
    await act(() => result.current.hook.mutateAsync(REQUEST));
}

describe("create reservation", () => {
    it("persists the token in sessionStorage only, never in query state, localStorage or keys", async () => {
        const {result} = setup(useCreateReservation);
        const invalidate = vi.spyOn(queryClient, "invalidateQueries");
        await hold(result);

        expect(result.current.session.getReservationToken()).toBe(SECRET);
        expect(result.current.session.reservation).toEqual(RESERVATION);
        expect(JSON.stringify(result.current.hook.data) ?? "").not.toContain(SECRET);
        expect(JSON.stringify(queryClient.getMutationCache().getAll().map((m) => m.state))).not.toContain(SECRET);
        expect(JSON.stringify(queryClient.getQueryCache().getAll().map((q) => q.queryKey))).not.toContain(SECRET);
        expect(sessionStorage.getItem("booking.reservation")).toContain(SECRET);
        expect(JSON.stringify({...localStorage})).not.toContain(SECRET);
        expect(invalidate).toHaveBeenCalledWith({queryKey: queryKeys.reservations.all});
    });

    it("prevents duplicate submissions while pending in the flow (isPending exposed)", async () => {
        const {result} = setup(useCreateReservation);
        let resolve!: (r: Response) => void;
        fetchMock.mockReturnValueOnce(new Promise<Response>((r) => (resolve = r)));
        act(() => void result.current.hook.mutate(REQUEST));
        await waitFor(() => expect(result.current.hook.isPending).toBe(true));
        resolve(jsonResponse(201, {...RESERVATION, reservationToken: SECRET}));
        await waitFor(() => expect(result.current.hook.isPending).toBe(false));
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("does not retry or hold anything on network failure or conflict", async () => {
        const {result} = setup(useCreateReservation);
        fetchMock.mockRejectedValue(new TypeError("offline"));
        await act(() => result.current.hook.mutateAsync(REQUEST).catch(() => undefined));
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result.current.session.reservation).toBeNull();

        fetchMock.mockResolvedValueOnce(jsonResponse(409, {message: "No consultant is available for the requested time."}));
        await act(() => result.current.hook.mutateAsync(REQUEST).catch(() => undefined));
        await waitFor(() => expect(result.current.hook.error).toMatchObject({kind: "conflict"}));
        expect(result.current.session.getReservationToken()).toBeNull();
    });
});

describe("release (abandon)", () => {
    it("sends the token, clears local state on 204 and invalidates reservations", async () => {
        const {result} = setup(() => ({create: useCreateReservation(), release: useReleaseReservation()}));
        fetchMock.mockResolvedValueOnce(jsonResponse(201, {...RESERVATION, reservationToken: SECRET}));
        await act(() => result.current.hook.create.mutateAsync(REQUEST));
        const invalidate = vi.spyOn(queryClient, "invalidateQueries");

        fetchMock.mockResolvedValueOnce(jsonResponse(204));
        await act(() => result.current.hook.release.mutateAsync());
        const {init, headers} = lastCall(fetchMock);
        expect(init.method).toBe("DELETE");
        expect(headers["X-Reservation-Token"]).toBe(SECRET);
        expect(result.current.session.getReservationToken()).toBeNull();
        expect(result.current.session.reservation).toBeNull();
        expect(invalidate).toHaveBeenCalled();
    });

    it("still clears the token when release fails (backend expiry is the fallback)", async () => {
        const {result} = setup(() => ({create: useCreateReservation(), release: useReleaseReservation()}));
        fetchMock.mockResolvedValueOnce(jsonResponse(201, {...RESERVATION, reservationToken: SECRET}));
        await act(() => result.current.hook.create.mutateAsync(REQUEST));
        fetchMock.mockRejectedValueOnce(new TypeError("offline"));
        await act(() => result.current.hook.release.mutateAsync().catch(() => undefined));
        expect(result.current.session.getReservationToken()).toBeNull();
    });
});

describe("confirm", () => {
    const setupConfirm = () => setup(() => ({create: useCreateReservation(), confirm: useConfirmReservation()}));

    it.each([[201], [200]])("succeeds on %i, clears the token and invalidates", async (status) => {
        const {result} = setupConfirm();
        fetchMock.mockResolvedValueOnce(jsonResponse(201, {...RESERVATION, reservationToken: SECRET}));
        await act(() => result.current.hook.create.mutateAsync(REQUEST));
        const invalidate = vi.spyOn(queryClient, "invalidateQueries");

        fetchMock.mockResolvedValueOnce(jsonResponse(status, APPOINTMENT));
        let outcome: Awaited<ReturnType<typeof result.current.hook.confirm.mutateAsync>> | undefined;
        await act(async () => {
            outcome = await result.current.hook.confirm.mutateAsync();
        });
        expect(outcome?.appointment).toEqual(APPOINTMENT);
        expect(outcome?.alreadyConfirmed).toBe(status === 200);
        expect(result.current.session.getReservationToken()).toBeNull();
        expect(invalidate).toHaveBeenCalled();
    });

    it("treats 410 as expired and clears the token", async () => {
        const {result} = setupConfirm();
        fetchMock.mockResolvedValueOnce(jsonResponse(201, {...RESERVATION, reservationToken: SECRET}));
        await act(() => result.current.hook.create.mutateAsync(REQUEST));
        fetchMock.mockResolvedValueOnce(jsonResponse(410, {message: "The reservation has expired."}));
        await act(() => result.current.hook.confirm.mutateAsync().catch(() => undefined));
        await waitFor(() => expect(result.current.hook.confirm.error).toMatchObject({kind: "expired"}));
        expect(result.current.session.getReservationToken()).toBeNull();
    });

    it("keeps the token after a network failure while the reservation is still held", async () => {
        const {result} = setupConfirm();
        fetchMock.mockResolvedValueOnce(jsonResponse(201, {...RESERVATION, reservationToken: SECRET}));
        await act(() => result.current.hook.create.mutateAsync(REQUEST));
        fetchMock.mockRejectedValueOnce(new TypeError("offline"));
        fetchMock.mockResolvedValueOnce(jsonResponse(200, RESERVATION));
        await act(() => result.current.hook.confirm.mutateAsync().catch(() => undefined));
        await waitFor(() => expect(result.current.hook.confirm.error).toMatchObject({kind: "network"}));
        expect(result.current.session.getReservationToken()).toBe(SECRET);
    });

    it("fails without a request when there is no active reservation", async () => {
        const {result} = setupConfirm();
        await act(() => result.current.hook.confirm.mutateAsync().catch(() => undefined));
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe("countdown", () => {
    afterEach(() => vi.useRealTimers());

    it("derives remaining time from expiresAt and expires exactly at the instant", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2030-01-01T08:00:00Z"));
        const {result} = renderHook(() => useReservationCountdown("2030-01-01T08:10:00Z"));
        await act(() => vi.advanceTimersByTimeAsync(1000));
        expect(result.current).toEqual({secondsLeft: 599, expired: false});
        await act(() => vi.advanceTimersByTimeAsync(599_000));
        expect(result.current).toEqual({secondsLeft: 0, expired: true});
    });
});
