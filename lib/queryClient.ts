import {QueryClient} from "@tanstack/react-query";
import {isApiError} from "@/api/errors";

export const STALE_TIME = {
    /** Branches and services change rarely. */
    stable: 10 * 60 * 1000,
    /** Volatile data such as availability (no endpoint exists yet). */
    volatile: 15 * 1000,
} as const;

const MAX_QUERY_RETRIES = 2;

/** Only transient failures (network, 5xx) are retried; 4xx will not change on retry. */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
    if (failureCount >= MAX_QUERY_RETRIES) return false;
    return isApiError(error) && (error.kind === "network" || error.kind === "server");
}

export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: STALE_TIME.stable,
                gcTime: 30 * 60 * 1000,
                retry: shouldRetryQuery,
                refetchOnWindowFocus: false,
            },
            // Mutations may have committed on the server even if the client saw a failure.
            mutations: {retry: false},
        },
    });
}
