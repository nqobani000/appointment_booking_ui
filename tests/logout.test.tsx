import * as React from "react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {act, render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import AppointmentBooking from "@/components/appointment_booking/AppointmentBooking";
import AuthGate from "@/components/auth/AuthGate";
import {useAuth} from "@/components/auth/AuthContext";
import LogoutButton from "@/components/auth/LogoutButton";
import {RESERVATION_KEY, SESSION_KEY, sessionStore} from "@/lib/sessionStore";
import {jsonResponse, mockFetch, RESERVATION, SECRET} from "./helpers";

const BRANCHES = {
    page: 0, size: 20, totalElements: 1, totalPages: 1, first: true, last: true,
    content: [{id: "b1", name: "Sandton Branch", location: {id: "l", streetNo: "10", streetName: "Rivonia Rd", suburb: "Sandton", city: "Johannesburg", province: "G", postalCode: "1", country: "ZA", latitude: 1, longitude: 2}}],
};

const SESSION = JSON.stringify({
    kind: "client", email: "a@b.co", customerId: "c1", customerType: "CLIENT",
    accessToken: "jwt", expiresAt: new Date(Date.now() + 60_000).toISOString(),
});
const HOLD = JSON.stringify({
    reservation: {...RESERVATION, expiresAt: new Date(Date.now() + 10 * 60_000).toISOString()},
    reservationToken: SECRET,
});

vi.mock("next/navigation", () => ({useRouter: () => ({push: vi.fn()})}));

let fetchMock: ReturnType<typeof mockFetch>;

const deleteCalls = () => fetchMock.mock.calls.filter(([, init]) => init?.method === "DELETE");
const indexScreen = () => screen.queryByLabelText("Booking reference");

function renderGate(child: React.ReactNode) {
    const client = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return render(<QueryClientProvider client={client}><AuthGate>{child}</AuthGate></QueryClientProvider>);
}

/** Stands in for any sign-out that does not come from the log out button (401, expiry). */
function SignOutProbe() {
    const {signOut} = useAuth();
    return <button onClick={signOut}>probe sign out</button>;
}

beforeEach(() => {
    sessionStorage.clear();
    fetchMock = mockFetch();
    fetchMock.mockImplementation(async (_url, init) =>
        init?.method === "DELETE" ? jsonResponse(204) : jsonResponse(200, BRANCHES));
});
afterEach(() => vi.unstubAllGlobals());

describe("LogoutButton", () => {
    it("logs out immediately when no confirmation is needed", async () => {
        const onLogout = vi.fn();
        render(<LogoutButton onLogout={onLogout}/>);
        await userEvent.setup().click(screen.getByRole("button", {name: "Log out"}));
        expect(onLogout).toHaveBeenCalledTimes(1);
    });

    it("asks first when a confirmation is configured, and Stay does nothing", async () => {
        const user = userEvent.setup();
        const onLogout = vi.fn();
        render(<LogoutButton onLogout={onLogout} confirm={{title: "Log out?", message: "You'll lose it.", confirmLabel: "Yes, log out"}}/>);

        await user.click(screen.getByRole("button", {name: "Log out"}));
        const dialog = await screen.findByRole("dialog", {name: "Log out?"});
        expect(dialog).toHaveAccessibleDescription("You'll lose it.");
        expect(onLogout).not.toHaveBeenCalled();

        await user.click(within(dialog).getByRole("button", {name: "Stay"}));
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        expect(onLogout).not.toHaveBeenCalled();

        await user.click(screen.getByRole("button", {name: "Log out"}));
        await user.click(within(await screen.findByRole("dialog")).getByRole("button", {name: "Yes, log out"}));
        expect(onLogout).toHaveBeenCalledTimes(1);
    });

    it("cannot be used while disabled", () => {
        render(<LogoutButton onLogout={vi.fn()} disabled/>);
        expect(screen.getByRole("button", {name: "Log out"})).toBeDisabled();
    });
});

describe("AuthGate logout", () => {
    it("logs out from the all-set screen, back to the index screen, and discards the stored session", async () => {
        sessionStorage.setItem(SESSION_KEY, SESSION);
        renderGate(<div>booking wizard</div>);
        expect(screen.getByRole("heading", {name: "You're all set!"})).toBeInTheDocument();

        await userEvent.setup().click(screen.getByRole("button", {name: "Log out"}));

        expect(indexScreen()).toBeInTheDocument();
        expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("does not reopen the login form the user had used before signing in", async () => {
        const user = userEvent.setup();
        renderGate(<div>booking wizard</div>);
        await user.click(screen.getByRole("button", {name: "Client booking"}));
        expect(screen.getByRole("heading", {name: "Log in to your account"})).toBeInTheDocument();

        act(() => sessionStore.set(SESSION_KEY, SESSION));
        expect(screen.getByRole("heading", {name: "You're all set!"})).toBeInTheDocument();

        await user.click(screen.getByRole("button", {name: "Log out"}));
        expect(indexScreen()).toBeInTheDocument();
        expect(screen.queryByRole("heading", {name: "Log in to your account"})).not.toBeInTheDocument();
    });

    it("shows the all-set screen again after signing back in, whichever way the user signed out", async () => {
        const user = userEvent.setup();
        sessionStorage.setItem(SESSION_KEY, SESSION);
        renderGate(<SignOutProbe/>);

        await user.click(screen.getByRole("button", {name: "Start booking"}));
        await user.click(screen.getByRole("button", {name: "probe sign out"}));
        expect(indexScreen()).toBeInTheDocument();

        act(() => sessionStore.set(SESSION_KEY, SESSION));
        expect(screen.getByRole("heading", {name: "You're all set!"})).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "probe sign out"})).not.toBeInTheDocument();
    });
});

describe("booking header logout", () => {
    async function startBooking() {
        const user = userEvent.setup();
        renderGate(<AppointmentBooking/>);
        await user.click(screen.getByRole("button", {name: "Start booking"}));
        return user;
    }

    it("logs out straight away with no reservation, without calling the API to release anything", async () => {
        sessionStorage.setItem(SESSION_KEY, SESSION);
        const user = await startBooking();
        await screen.findByText("Sandton Branch");

        await user.click(screen.getByRole("button", {name: "Log out"}));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(indexScreen()).toBeInTheDocument();
        expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
        expect(deleteCalls()).toHaveLength(0);
    });

    it("keeps the session and the hold when the user chooses to stay", async () => {
        sessionStorage.setItem(SESSION_KEY, SESSION);
        sessionStorage.setItem(RESERVATION_KEY, HOLD);
        const user = await startBooking();

        await user.click(screen.getByRole("button", {name: "Log out"}));
        const dialog = await screen.findByRole("dialog", {name: "Log out?"});
        expect(dialog).toHaveTextContent(/lose your held time slot/i);
        await user.click(within(dialog).getByRole("button", {name: "Stay"}));

        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        expect(sessionStorage.getItem(SESSION_KEY)).not.toBeNull();
        expect(sessionStorage.getItem(RESERVATION_KEY)).not.toBeNull();
        expect(deleteCalls()).toHaveLength(0);
    });

    it("releases the held slot with both credentials, then discards the session and the reservation", async () => {
        sessionStorage.setItem(SESSION_KEY, SESSION);
        sessionStorage.setItem(RESERVATION_KEY, HOLD);
        const user = await startBooking();

        await user.click(screen.getByRole("button", {name: "Log out"}));
        await user.click(within(await screen.findByRole("dialog")).getByRole("button", {name: "Release and log out"}));

        expect(indexScreen()).toBeInTheDocument();
        expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
        expect(sessionStorage.getItem(RESERVATION_KEY)).toBeNull();

        expect(deleteCalls()).toHaveLength(1);
        const [url, init] = deleteCalls()[0];
        expect(String(url)).toBe(`http://localhost:8080/api/reservations/${RESERVATION.reservationId}`);
        expect(init?.headers).toMatchObject({Authorization: "Bearer jwt", "X-Reservation-Token": SECRET});
    });

    it("still logs out when releasing the hold fails", async () => {
        sessionStorage.setItem(SESSION_KEY, SESSION);
        sessionStorage.setItem(RESERVATION_KEY, HOLD);
        fetchMock.mockImplementation(async (_url, init) => {
            if (init?.method === "DELETE") throw new TypeError("offline");
            return jsonResponse(200, BRANCHES);
        });
        const user = await startBooking();

        await user.click(screen.getByRole("button", {name: "Log out"}));
        await user.click(within(await screen.findByRole("dialog")).getByRole("button", {name: "Release and log out"}));

        expect(indexScreen()).toBeInTheDocument();
        expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    });
});
