import type {ApiBranch} from "@/api/types/branches";

export interface Branch {
    id: string;
    name: string;
    address: string;
    distanceKm?: number;
}

const clean = (value: string | null | undefined) => value?.trim() || null;

/** Drops null or blank parts so missing data is never displayed. */
export function toBranch(branch: ApiBranch): Branch {
    const {streetNo, streetName, suburb, city} = branch.location ?? {};
    const street = [clean(streetNo), clean(streetName)].filter(Boolean).join(" ");
    return {
        id: branch.id,
        name: branch.name,
        address: [street, clean(suburb), clean(city)].filter(Boolean).join(", "),
        distanceKm: branch.distanceKm ?? undefined,
    };
}
