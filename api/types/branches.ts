import type {PageParams, PageResponse, Uuid} from "@/api/types/common";

export interface BranchLocation {
    id: Uuid;
    streetNo: string | null;
    streetName: string | null;
    suburb: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
    country: string | null;
    latitude: number | null;
    longitude: number | null;
}

export interface ApiBranch {
    id: Uuid;
    name: string;
    location: BranchLocation;
    distanceKm?: number | null;
}

export interface BranchSearchParams extends PageParams {
    search?: string;
    latitude?: number;
    longitude?: number;
}

export type BranchPage = PageResponse<ApiBranch[]>;
