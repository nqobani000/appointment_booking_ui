import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {getService, getServices} from "@/api/services";
import {queryKeys} from "@/api/queryKeys";
import type {ServiceSearchParams} from "@/api/types/services";
import {STALE_TIME} from "@/lib/queryClient";

function normalize(params: ServiceSearchParams): ServiceSearchParams {
    const result: ServiceSearchParams = {page: params.page ?? 0, size: params.size ?? 20};
    const search = params.search?.trim();
    if (search) result.search = search;
    if (params.branchId) result.branchId = params.branchId;
    return result;
}

/** Uses the branch-specific endpoint when `branchId` is set. */
export function useServices(params: ServiceSearchParams) {
    const normalized = normalize(params);
    return useQuery({
        queryKey: queryKeys.services.list(normalized),
        queryFn: ({signal}) => getServices(normalized, signal),
        placeholderData: keepPreviousData,
        staleTime: STALE_TIME.stable,
    });
}

export function useService(serviceId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.services.detail(serviceId ?? ""),
        queryFn: ({signal}) => getService(serviceId as string, signal),
        enabled: Boolean(serviceId),
        staleTime: STALE_TIME.stable,
    });
}
