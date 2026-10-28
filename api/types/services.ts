import type {CustomerType, PageParams, PageResponse, Uuid} from "@/api/types/common";

export interface ApiService {
    id: Uuid;
    code: string;
    name: string;
    description: string | null;
    category: string;
    availableTo: CustomerType[];
}

export interface ServiceSearchParams extends PageParams {
    search?: string;
    branchId?: Uuid;
}

export type ServicePage = PageResponse<Record<string, ApiService[]>>;
