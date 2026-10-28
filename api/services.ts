import {request} from "@/api/client";
import type {ApiService, ServicePage, ServiceSearchParams} from "@/api/types/services";

export function getServices({branchId, ...params}: ServiceSearchParams, signal?: AbortSignal) {
    const path = branchId ? `/api/services/branch/${encodeURIComponent(branchId)}` : "/api/services";
    return request<ServicePage>(path, {query: params, signal});
}

export const getService = (serviceId: string, signal?: AbortSignal) =>
    request<ApiService>(`/api/services/${encodeURIComponent(serviceId)}`, {signal});
