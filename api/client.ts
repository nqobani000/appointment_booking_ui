import {ApiError} from "@/api/errors";

const DEFAULT_BASE_URL = "http://localhost:8080";

export function getBaseUrl(): string {
    return (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
}

export interface RequestOptions {
    method?: "GET" | "POST" | "DELETE";
    query?: object;
    body?: unknown;
    /** JWT; sent as `Authorization: Bearer`. */
    accessToken?: string | null;
    /** Reservation secret; sent only as `X-Reservation-Token`. */
    reservationToken?: string | null;
    signal?: AbortSignal;
    keepalive?: boolean;
}

export interface ApiResponse<T> {
    status: number;
    data: T;
}

function buildUrl(path: string, query?: object): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
        if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    }
    const qs = params.toString();
    return `${getBaseUrl()}${path}${qs ? `?${qs}` : ""}`;
}

async function parseBody(response: Response): Promise<unknown> {
    if (response.status === 204) return undefined;
    const text = await response.text().catch(() => "");
    if (!text) return undefined;
    try {
        return JSON.parse(text);
    } catch {
        return undefined;
    }
}

export async function requestWithStatus<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {Accept: "application/json"};
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;
    if (options.reservationToken) headers["X-Reservation-Token"] = options.reservationToken;

    let response: Response;
    try {
        response = await fetch(buildUrl(path, options.query), {
            method: options.method ?? "GET",
            headers,
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
            signal: options.signal,
            keepalive: options.keepalive,
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;
        throw ApiError.network();
    }

    const data = await parseBody(response);
    if (!response.ok) throw ApiError.fromResponse(response.status, data);
    return {status: response.status, data: data as T};
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return (await requestWithStatus<T>(path, options)).data;
}
