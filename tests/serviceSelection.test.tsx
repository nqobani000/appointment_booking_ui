import * as React from "react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {AuthProvider} from "@/components/auth/AuthContext";
import ServiceSelection from "@/components/service_selection/ServiceSelection";
import {SERVICE_NOT_AVAILABLE_MESSAGE} from "@/components/service_selection/ServiceOptionGroups";
import type {ApiService} from "@/api/types/services";
import {jsonResponse, mockFetch} from "./helpers";

const service = (id: string, name: string, category: string, availableTo: ApiService["availableTo"]): ApiService =>
    ({id, code: id.toUpperCase(), name, description: `${name} details`, category, availableTo});

const OPEN_ACCOUNT = service("s1", "Open Account", "ACCOUNTS", ["CLIENT", "GUEST"]);
const HOME_LOAN = service("s2", "Home Loan", "LOANS", ["CLIENT"]);
const CARD_REPLACEMENT = service("s3", "Card Replacement", "CARDS", ["CLIENT"]);

const byCategory = (services: ApiService[]) =>
    services.reduce<Record<string, ApiService[]>>((acc, s) => ({...acc, [s.category]: [...(acc[s.category] ?? []), s]}), {});

const pageOf = (services: ApiService[], page: number, totalPages: number) => ({
    page, size: 20, totalElements: 3, totalPages, first: page === 0, last: page === totalPages - 1,
    content: byCategory(services),
});

let fetchMock: ReturnType<typeof mockFetch>;
let catalogue: ApiService[];

/** Server pages of 20 hold two services on page 0 and one on page 1; size=100 returns everything. */
function serve(url: string) {
    const params = new URL(url).searchParams;
    if (params.get("size") === "100") return jsonResponse(200, pageOf(catalogue, 0, 1));
    return params.get("page") === "1"
        ? jsonResponse(200, pageOf(catalogue.slice(2), 1, 2))
        : jsonResponse(200, pageOf(catalogue.slice(0, 2), 0, 2));
}

const requestedUrls = () => fetchMock.mock.calls.map(([url]) => String(url));

function signIn(customerType: "CLIENT" | "GUEST") {
    sessionStorage.setItem("booking.session", JSON.stringify({
        kind: customerType === "GUEST" ? "guest" : "client", email: "a@b.co", customerId: "c1", customerType,
        accessToken: "jwt", expiresAt: new Date(Date.now() + 60_000).toISOString(),
    }));
}

function setup(customerType: "CLIENT" | "GUEST") {
    signIn(customerType);
    const onSelectService = vi.fn();
    const client = new QueryClient({defaultOptions: {queries: {retry: false}}});
    render(
        <QueryClientProvider client={client}>
            <AuthProvider>
                <ServiceSelection branchId="b1" selectedService={null} onSelectService={onSelectService}/>
            </AuthProvider>
        </QueryClientProvider>,
    );
    return {onSelectService, user: userEvent.setup()};
}

beforeEach(() => {
    catalogue = [OPEN_ACCOUNT, HOME_LOAN, CARD_REPLACEMENT];
    fetchMock = mockFetch();
    fetchMock.mockImplementation(async (url) => serve(String(url)));
    sessionStorage.clear();
});
afterEach(() => vi.unstubAllGlobals());

describe("ServiceSelection view pill", () => {
    it("defaults a guest to the services available to them, loaded in one unpaginated request", async () => {
        setup("GUEST");
        expect(await screen.findByText("Open Account")).toBeInTheDocument();
        expect(screen.queryByText("Home Loan")).not.toBeInTheDocument();
        expect(screen.queryByText("Card Replacement")).not.toBeInTheDocument();
        expect(screen.queryByText(/Page \d+ of/)).not.toBeInTheDocument();
        expect(requestedUrls().every((url) => url.includes("size=100"))).toBe(true);
        expect(screen.getByRole("button", {name: "Available to me"})).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", {name: "All services"})).toHaveAttribute("aria-pressed", "false");
    });

    it("shows a client every service they may book", async () => {
        setup("CLIENT");
        expect(await screen.findByText("Open Account")).toBeInTheDocument();
        expect(screen.getByText("Home Loan")).toBeInTheDocument();
        expect(screen.getByText("Card Replacement")).toBeInTheDocument();
    });

    it("puts the pill in a labelled group on the title row", async () => {
        setup("GUEST");
        await screen.findByText("Open Account");
        expect(screen.getByRole("group", {name: "Which services to show"})).toBeInTheDocument();
        expect(screen.getByRole("heading", {name: "What can we help you with?"})).toBeInTheDocument();
    });

    it("lists every service with the existing server pagination in the All services view", async () => {
        const {user} = setup("GUEST");
        await screen.findByText("Open Account");

        await user.click(screen.getByRole("button", {name: "All services"}));
        expect(await screen.findByText("Home Loan")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "All services"})).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
        expect(requestedUrls().some((url) => url.includes("page=0") && url.includes("size=20"))).toBe(true);

        await user.click(screen.getByRole("button", {name: "Next"}));
        expect(await screen.findByText("Card Replacement")).toBeInTheDocument();
        expect(requestedUrls().some((url) => url.includes("page=1") && url.includes("size=20"))).toBe(true);
    });

    it("returns to page 1 of the All view when the pill is toggled away and back", async () => {
        const {user} = setup("GUEST");
        await screen.findByText("Open Account");
        await user.click(screen.getByRole("button", {name: "All services"}));
        await user.click(await screen.findByRole("button", {name: "Next"}));
        await screen.findByText("Page 2 of 2");

        await user.click(screen.getByRole("button", {name: "Available to me"}));
        await user.click(screen.getByRole("button", {name: "All services"}));
        expect(await screen.findByText("Page 1 of 2")).toBeInTheDocument();
    });
});

describe("services the customer cannot book", () => {
    it("shows a message instead of selecting, and still selects bookable services", async () => {
        const {onSelectService, user} = setup("GUEST");
        await screen.findByText("Open Account");
        await user.click(screen.getByRole("button", {name: "All services"}));
        await screen.findByText("Home Loan");

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        await user.click(screen.getByRole("radio", {name: /Home Loan/}));
        expect(await screen.findByRole("alert")).toHaveTextContent(SERVICE_NOT_AVAILABLE_MESSAGE);
        expect(SERVICE_NOT_AVAILABLE_MESSAGE).toBe(
            "This service is not available to you. Contact customer services for more information.");
        expect(screen.getByRole("radio", {name: /Home Loan/})).toHaveAccessibleDescription(SERVICE_NOT_AVAILABLE_MESSAGE);
        expect(onSelectService).not.toHaveBeenCalled();

        await user.click(screen.getByRole("radio", {name: /Open Account/}));
        expect(onSelectService).toHaveBeenCalledWith(expect.objectContaining({id: "s1", title: "Open Account"}));
        await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    });

    it("clears the message when the view changes", async () => {
        const {user} = setup("GUEST");
        await screen.findByText("Open Account");
        await user.click(screen.getByRole("button", {name: "All services"}));
        await user.click(await screen.findByRole("radio", {name: /Home Loan/}));
        expect(await screen.findByRole("alert")).toBeInTheDocument();

        await user.click(screen.getByRole("button", {name: "Available to me"}));
        await user.click(screen.getByRole("button", {name: "All services"}));
        await screen.findByText("Home Loan");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("no longer shows the old permanent hint on unavailable services", async () => {
        const {user} = setup("GUEST");
        await screen.findByText("Open Account");
        await user.click(screen.getByRole("button", {name: "All services"}));
        await screen.findByText("Home Loan");
        expect(screen.queryByText(/account holders only/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Not available for your customer type/i)).not.toBeInTheDocument();
    });
});

describe("when nothing is available to the customer", () => {
    it("explains it and offers to view all services", async () => {
        catalogue = [HOME_LOAN, CARD_REPLACEMENT];
        const {user} = setup("GUEST");
        expect(await screen.findByText("No services at this branch are available to you.")).toBeInTheDocument();

        await user.click(screen.getByRole("button", {name: "View all services"}));
        expect(await screen.findByText("Home Loan")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "All services"})).toHaveAttribute("aria-pressed", "true");
        expect(screen.queryByRole("button", {name: "View all services"})).not.toBeInTheDocument();
    });
});
