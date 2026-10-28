import {request} from "@/api/client";
import type {BranchPage, BranchSearchParams} from "@/api/types/branches";

export const getBranches = (params: BranchSearchParams, signal?: AbortSignal) =>
    request<BranchPage>("/api/branches", {query: params, signal});
