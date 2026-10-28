import {describe, expect, it} from "vitest";
import {toStartAt, formatCountdown} from "@/lib/datetime";
import {filterByCustomerType, toServiceGroups} from "@/components/service_selection/toServiceGroups";
import {toBranch} from "@/components/branch_selection/types";
import {shouldRetryQuery} from "@/lib/queryClient";
import {ApiError} from "@/api/errors";

describe("helpers", () => {
    it("builds startAt with the branch offset", () => {
        expect(toStartAt(new Date(2030, 0, 1), "10:30")).toBe("2030-01-01T10:30:00+02:00");
    });

    it("formats countdown", () => {
        expect(formatCountdown(605)).toBe("10:05");
    });

    it("groups services by category and keeps availableTo", () => {
        const groups = toServiceGroups({
            LOANS: [{id: "1", code: "H", name: "Home", description: "d", category: "LOANS", availableTo: ["CLIENT"]}],
        });
        expect(groups).toEqual([
            {id: "LOANS", title: "Loans", options: [{id: "1", title: "Home", description: "d", availableTo: ["CLIENT"]}]},
        ]);
    });

    it("filters groups to the services a customer type may book and drops empty groups", () => {
        const groups = toServiceGroups({
            LOANS: [{id: "1", code: "H", name: "Home", description: "d", category: "LOANS", availableTo: ["CLIENT"]}],
            ACCOUNTS: [
                {id: "2", code: "O", name: "Open", description: "d", category: "ACCOUNTS", availableTo: ["CLIENT", "GUEST"]},
                {id: "3", code: "C", name: "Close", description: "d", category: "ACCOUNTS", availableTo: ["CLIENT"]},
            ],
        });
        expect(filterByCustomerType(groups, "GUEST").map((g) => [g.id, g.options.map((o) => o.id)]))
            .toEqual([["ACCOUNTS", ["2"]]]);
        expect(filterByCustomerType(groups, "CLIENT").map((g) => g.options.length)).toEqual([1, 2]);
        expect(filterByCustomerType([], "GUEST")).toEqual([]);
    });

    it("uses backend distance and does not compute one", () => {
        const loc = {id: "l", streetNo: "10", streetName: "Rivonia Rd", suburb: "Sandton", city: "Joburg", province: "G", postalCode: "1", country: "ZA", latitude: 1, longitude: 2};
        expect(toBranch({id: "b", name: "n", location: loc}).distanceKm).toBeUndefined();
        expect(toBranch({id: "b", name: "n", location: loc, distanceKm: 1.8}).distanceKm).toBe(1.8);
    });

    it("retries only transient query errors", () => {
        expect(shouldRetryQuery(0, ApiError.network())).toBe(true);
        expect(shouldRetryQuery(2, ApiError.network())).toBe(false);
        for (const status of [400, 404, 409, 410]) {
            expect(shouldRetryQuery(0, ApiError.fromResponse(status, undefined))).toBe(false);
        }
    });
});

describe("null data is not displayed", () => {
    const loc = {id: "l", streetNo: null, streetName: "Rivonia Rd", suburb: null, city: "Joburg", province: null, postalCode: null, country: null, latitude: null, longitude: null};

    it("omits null address parts and null distance", () => {
        const branch = toBranch({id: "b", name: "n", location: loc, distanceKm: null});
        expect(branch.address).toBe("Rivonia Rd, Joburg");
        expect(branch.distanceKm).toBeUndefined();
        expect(toBranch({id: "b", name: "n", location: {...loc, streetName: null, city: null}}).address).toBe("");
    });

    it("tolerates null descriptions, availableTo and empty categories", () => {
        const groups = toServiceGroups({
            A: [{id: "1", code: "c", name: "N", description: null, category: "A", availableTo: null as never}],
            B: [],
        });
        expect(groups).toEqual([{id: "A", title: "A", options: [{id: "1", title: "N", description: "", availableTo: []}]}]);
    });
});
