import * as React from "react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import BranchSelection from "@/components/branch_selection/BranchSelection";
import {jsonResponse, lastCall, mockFetch} from "./helpers";

const page = {
    page: 0, size: 20, totalElements: 1, totalPages: 1, first: true, last: true,
    content: [{id: "b1", name: "Sandton Branch", distanceKm: 1.8, location: {id: "l", streetNo: "10", streetName: "Rivonia Rd", suburb: "Sandton", city: "Johannesburg", province: "G", postalCode: "1", country: "ZA", latitude: 1, longitude: 2}}],
};

afterEach(() => vi.unstubAllGlobals());

function renderSelection() {
    const client = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return render(
        <QueryClientProvider client={client}>
            <BranchSelection selectedBranch={null} onSelectBranch={vi.fn()}/>
        </QueryClientProvider>,
    );
}

describe("BranchSelection geolocation", () => {
    it("never asks for location on load, only after the button is pressed", async () => {
        const fetchMock = mockFetch();
        fetchMock.mockImplementation(async () => jsonResponse(200, page));
        const getCurrentPosition = vi.fn((success: PositionCallback) =>
            success({coords: {latitude: -26.10761, longitude: 28.05671}} as GeolocationPosition));
        vi.stubGlobal("navigator", {geolocation: {getCurrentPosition}});

        renderSelection();
        await screen.findByText("Sandton Branch");
        expect(getCurrentPosition).not.toHaveBeenCalled();
        expect(lastCall(fetchMock).url).not.toContain("latitude");

        await userEvent.click(screen.getByRole("button", {name: /current location/i}));
        await waitFor(() => expect(lastCall(fetchMock).url).toContain("latitude=-26.108&longitude=28.057"));
        expect(getCurrentPosition).toHaveBeenCalledTimes(1);
        expect(screen.getByText("1.8 km away")).toBeInTheDocument();
    });

    it("shows a friendly message when permission is denied", async () => {
        mockFetch().mockImplementation(async () => jsonResponse(200, page));
        vi.stubGlobal("navigator", {
            geolocation: {getCurrentPosition: (_: PositionCallback, error: PositionErrorCallback) =>
                error({code: 1, PERMISSION_DENIED: 1, TIMEOUT: 3} as GeolocationPositionError)},
        });
        renderSelection();
        await userEvent.click(await screen.findByRole("button", {name: /current location/i}));
        expect(await screen.findByText(/Location access was denied/)).toBeInTheDocument();
    });
});
