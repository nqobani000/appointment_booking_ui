import * as React from "react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {getAppointmentByReference} from "@/api/appointments";
import {ApiError} from "@/api/errors";
import AuthGate from "@/components/auth/AuthGate";
import IndexScreen from "@/components/auth/screens/IndexScreen";
import BookingDetails from "@/components/booking_lookup/BookingDetails";
import {
    decodeBookingReference,
    isBookingReference,
    normalizeBookingReference,
    validateBookingReference,
} from "@/lib/bookingReference";
import {APPOINTMENT, jsonResponse, lastCall, mockFetch} from "./helpers";

const push = vi.fn();
vi.mock("next/navigation", () => ({useRouter: () => ({push})}));

const REFERENCE = APPOINTMENT.referenceNo;
let fetchMock: ReturnType<typeof mockFetch>;

function renderWithClient(ui: React.ReactElement) {
    const client = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
    fetchMock = mockFetch();
    push.mockClear();
    sessionStorage.clear();
});
afterEach(() => vi.unstubAllGlobals());

describe("booking reference helpers", () => {
    it("normalises and validates the backend reference format", () => {
        expect(normalizeBookingReference("  apt-20300101-3f9a1c7b2d ")).toBe(REFERENCE);
        expect(isBookingReference(" apt-20300101-3f9a1c7b2d ")).toBe(true);
        expect(validateBookingReference("")).toMatch(/required/i);
        expect(validateBookingReference("   ")).toMatch(/required/i);
        expect(validateBookingReference("not-a-reference")).toMatch(/valid booking reference/i);
        expect(validateBookingReference("APT-20300101-3F9A1C7B2D/../x")).toBeDefined();
        expect(validateBookingReference(REFERENCE)).toBeUndefined();
    });

    it("accepts the offset suffix the backend adds to real references", () => {
        for (const ref of ["APT-20261028Z-741F5018F7", "APT-20261028+0200-741F5018F7", "APT-20261028-0500-741F5018F7"]) {
            expect(isBookingReference(ref)).toBe(true);
        }
        expect(isBookingReference("APT-20261028Q-741F5018F7")).toBe(false);
        expect(isBookingReference("APT-20261028Z-741F5018F")).toBe(false);
    });

    it("decodes percent-encoded route params without throwing on malformed input", () => {
        expect(decodeBookingReference("APT-20261028%2B0200-741F5018F7")).toBe("APT-20261028+0200-741F5018F7");
        expect(decodeBookingReference("APT-%E0%A4%A")).toBe("APT-%E0%A4%A");
    });
});

describe("getAppointmentByReference", () => {
    it("is a public GET without credentials", async () => {
        fetchMock.mockResolvedValue(jsonResponse(200, APPOINTMENT));
        await expect(getAppointmentByReference(REFERENCE)).resolves.toEqual(APPOINTMENT);
        const {url, init, headers} = lastCall(fetchMock);
        expect(url).toBe(`http://localhost:8080/api/appointments/${REFERENCE}`);
        expect(init.method ?? "GET").toBe("GET");
        expect(headers.Authorization).toBeUndefined();
        expect(headers["X-Reservation-Token"]).toBeUndefined();
    });

    it("maps 404 to a notFound ApiError", async () => {
        fetchMock.mockResolvedValue(jsonResponse(404, {status: 404, error: "Not Found", message: "x", timestamp: "t"}));
        await expect(getAppointmentByReference(REFERENCE)).rejects.toMatchObject({kind: "notFound"});
    });
});

describe("IndexScreen", () => {
    function setup() {
        const onClient = vi.fn();
        const onGuest = vi.fn();
        renderWithClient(<IndexScreen onClient={onClient} onGuest={onGuest}/>);
        return {onClient, onGuest, user: userEvent.setup()};
    }

    it("shows the redesigned content and no Back button", () => {
        setup();
        expect(screen.getByText("Book Branch Appointment")).toBeInTheDocument();
        expect(screen.getByText("Enter your booking reference to view your appointment details.")).toBeInTheDocument();
        const input = screen.getByLabelText("Booking reference");
        expect(input).toHaveAttribute("placeholder", "e.g. APT-20300101-3F9A1C7B2D");
        expect(input).toHaveAccessibleDescription(/found in your confirmation email/);
        expect(screen.getByRole("button", {name: "View booking"})).toBeInTheDocument();
        expect(screen.getByText("or")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Client booking"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Guest booking"})).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: /back/i})).not.toBeInTheDocument();
    });

    it("launches the client and guest flows", async () => {
        const {onClient, onGuest, user} = setup();
        await user.click(screen.getByRole("button", {name: "Client booking"}));
        expect(onClient).toHaveBeenCalledTimes(1);
        await user.click(screen.getByRole("button", {name: "Guest booking"}));
        expect(onGuest).toHaveBeenCalledTimes(1);
    });

    it("validates empty and malformed references without calling the API", async () => {
        const {user} = setup();
        await user.click(screen.getByRole("button", {name: "View booking"}));
        expect(await screen.findByRole("alert")).toHaveTextContent("Booking reference is required.");

        await user.type(screen.getByLabelText("Booking reference"), "nope");
        await user.click(screen.getByRole("button", {name: "View booking"}));
        expect(await screen.findByRole("alert")).toHaveTextContent(/valid booking reference/i);
        expect(screen.getByLabelText("Booking reference")).toBeInvalid();
        expect(fetchMock).not.toHaveBeenCalled();
        expect(push).not.toHaveBeenCalled();
    });

    it("looks the booking up without authentication and navigates to the details route", async () => {
        fetchMock.mockImplementation(async () => jsonResponse(200, APPOINTMENT));
        const {user} = setup();
        await user.type(screen.getByLabelText("Booking reference"), " apt-20300101-3f9a1c7b2d ");
        await user.click(screen.getByRole("button", {name: "View booking"}));

        await waitFor(() => expect(push).toHaveBeenCalledWith(`/bookings/${REFERENCE}`));
        const {url, headers} = lastCall(fetchMock);
        expect(url).toBe(`http://localhost:8080/api/appointments/${REFERENCE}`);
        expect(headers.Authorization).toBeUndefined();
    });

    it("shows a not-found message inline and stays on the screen", async () => {
        fetchMock.mockImplementation(async () => jsonResponse(404, {status: 404, error: "Not Found", message: "x", timestamp: "t"}));
        const {user} = setup();
        await user.type(screen.getByLabelText("Booking reference"), REFERENCE);
        await user.click(screen.getByRole("button", {name: "View booking"}));

        expect(await screen.findByText(/couldn't find a booking with that reference/i)).toBeInTheDocument();
        expect(push).not.toHaveBeenCalled();
        expect(screen.getByRole("button", {name: "View booking"})).toBeEnabled();
    });

    it("shows network failures and a loading state while the request is pending", async () => {
        let resolve!: (response: Response) => void;
        fetchMock.mockReturnValueOnce(new Promise<Response>((r) => (resolve = r)));
        const {user} = setup();
        await user.type(screen.getByLabelText("Booking reference"), REFERENCE);
        await user.click(screen.getByRole("button", {name: "View booking"}));

        const busy = await screen.findByRole("button", {name: "Looking up…"});
        expect(busy).toBeDisabled();
        expect(busy).toHaveAttribute("aria-busy", "true");

        resolve(jsonResponse(500, {status: 500, error: "Server Error", message: "boom", timestamp: "t"}));
        expect(await screen.findByText(/something went wrong on our side/i)).toBeInTheDocument();
        expect(push).not.toHaveBeenCalled();
    });

    it("does not present a 401 on the public lookup as an expired session", async () => {
        fetchMock.mockImplementation(async () => jsonResponse(401, {status: 401, error: "Unauthorized", message: "Missing token", timestamp: "t"}));
        const {user} = setup();
        await user.type(screen.getByLabelText("Booking reference"), REFERENCE);
        await user.click(screen.getByRole("button", {name: "View booking"}));
        expect(await screen.findByText(/couldn't look up that booking right now/i)).toBeInTheDocument();
    });
});

describe("AuthGate entry screen", () => {
    const renderGate = () => renderWithClient(<AuthGate><div>booking wizard</div></AuthGate>);
    const indexScreen = () => screen.queryByLabelText("Booking reference");

    it("lands unauthenticated users on the index screen and launches both flows, with Back returning to it", async () => {
        const user = userEvent.setup();
        renderGate();
        expect(indexScreen()).toBeInTheDocument();
        expect(screen.queryByText("booking wizard")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", {name: "Client booking"}));
        expect(screen.getByRole("heading", {name: "Log in to your account"})).toBeInTheDocument();
        expect(indexScreen()).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", {name: "Back"}));
        expect(indexScreen()).toBeInTheDocument();

        await user.click(screen.getByRole("button", {name: "Guest booking"}));
        expect(screen.getByRole("heading", {name: "Tell us a bit about yourself"})).toBeInTheDocument();
        expect(indexScreen()).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", {name: "Back"}));
        expect(indexScreen()).toBeInTheDocument();
    });

    it("keeps the authenticated behaviour: a stored session skips the index screen", () => {
        sessionStorage.setItem("booking.session", JSON.stringify({
            kind: "client", email: "a@b.co", customerId: "c1", customerType: "CLIENT",
            accessToken: "jwt", expiresAt: new Date(Date.now() + 60_000).toISOString(),
        }));
        renderGate();
        expect(screen.getByRole("heading", {name: "You're all set!"})).toBeInTheDocument();
        expect(indexScreen()).not.toBeInTheDocument();
    });
});

describe("BookingDetails", () => {
    it("renders the appointment fetched without authentication", async () => {
        fetchMock.mockImplementation(async () => jsonResponse(200, APPOINTMENT));
        renderWithClient(<BookingDetails referenceNo={REFERENCE.toLowerCase()}/>);

        expect(screen.getByRole("status")).toHaveTextContent("Loading your booking");
        expect(await screen.findByText(REFERENCE)).toBeInTheDocument();
        expect(screen.getByText("Home Loan Enquiry")).toBeInTheDocument();
        expect(screen.getByText("Sandton Branch")).toBeInTheDocument();
        expect(screen.getByRole("heading", {name: "Your booking"})).toBeInTheDocument();
        expect(lastCall(fetchMock).headers.Authorization).toBeUndefined();

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", {name: "Back to start"}));
        expect(push).toHaveBeenCalledWith("/");
    });

    it("looks up a reference with an encoded offset suffix from the route", async () => {
        fetchMock.mockImplementation(async () => jsonResponse(200, {...APPOINTMENT, referenceNo: "APT-20261028+0200-741F5018F7"}));
        renderWithClient(<BookingDetails referenceNo="APT-20261028%2B0200-741F5018F7"/>);
        expect(await screen.findByText("APT-20261028+0200-741F5018F7")).toBeInTheDocument();
        expect(lastCall(fetchMock).url).toBe("http://localhost:8080/api/appointments/APT-20261028%2B0200-741F5018F7");
    });

    it("offers another reference when the booking is not found", async () => {
        fetchMock.mockImplementation(async () => jsonResponse(404, {status: 404, error: "Not Found", message: "x", timestamp: "t"}));
        renderWithClient(<BookingDetails referenceNo={REFERENCE}/>);
        expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't find a booking/i);
        expect(screen.getByRole("link", {name: "Try another reference"})).toHaveAttribute("href", "/");
    });

    it("does not call the API for a malformed reference", () => {
        renderWithClient(<BookingDetails referenceNo="nope"/>);
        expect(screen.getByRole("alert")).toHaveTextContent(/couldn't find a booking/i);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("lets the user retry after a network failure", async () => {
        fetchMock.mockRejectedValueOnce(new TypeError("offline"));
        fetchMock.mockImplementation(async () => jsonResponse(200, APPOINTMENT));
        renderWithClient(<BookingDetails referenceNo={REFERENCE}/>);

        expect(await screen.findByRole("alert")).toHaveTextContent(ApiError.network().message);
        await userEvent.setup().click(screen.getByRole("button", {name: "Try again"}));
        expect(await screen.findByText(REFERENCE)).toBeInTheDocument();
    });
});
