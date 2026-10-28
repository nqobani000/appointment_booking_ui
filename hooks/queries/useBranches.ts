import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {getBranches} from "@/api/branches";
import {queryKeys} from "@/api/queryKeys";
import type {BranchSearchParams} from "@/api/types/branches";
import {STALE_TIME} from "@/lib/queryClient";

/** Drops empty values so equivalent searches share one cache entry. */
function normalize(params: BranchSearchParams): BranchSearchParams {
    const result: BranchSearchParams = {page: params.page ?? 0, size: params.size ?? 20};
    const search = params.search?.trim();
    if (search) result.search = search;
    if (params.latitude !== undefined && params.longitude !== undefined) {
        result.latitude = params.latitude;
        result.longitude = params.longitude;
    }
    return result;
}

export function useBranches(params: BranchSearchParams) {
    const normalized = normalize(params);
    return useQuery({
        queryKey: queryKeys.branches.list(normalized),
        queryFn: ({signal}) => getBranches(normalized, signal),
        placeholderData: keepPreviousData,
        staleTime: STALE_TIME.stable,
    });
}
