import type {BranchSearchParams} from "@/api/types/branches";
import type {ServiceSearchParams} from "@/api/types/services";

// Keys are plain serialisable data and never contain credentials or reservation tokens.
export const queryKeys = {
    branches: {
        all: ["branches"] as const,
        list: (params: BranchSearchParams) => ["branches", "list", params] as const,
    },
    services: {
        all: ["services"] as const,
        list: (params: ServiceSearchParams) => ["services", "list", params] as const,
        detail: (serviceId: string) => ["services", "detail", serviceId] as const,
    },
    appointments: {
        detail: (referenceNo: string) => ["appointments", "detail", referenceNo] as const,
    },
    reservations: {
        all: ["reservations"] as const,
        detail: (reservationId: string) => ["reservations", "detail", reservationId] as const,
    },
};
