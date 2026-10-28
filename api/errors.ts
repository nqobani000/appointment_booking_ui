import type {ApiErrorResponse} from "@/api/types/common";

export type ApiErrorKind =
    | "validation"
    | "unauthorized"
    | "notFound"
    | "conflict"
    | "expired"
    | "network"
    | "server";

const KIND_BY_STATUS: Record<number, ApiErrorKind> = {
    400: "validation",
    401: "unauthorized",
    404: "notFound",
    409: "conflict",
    410: "expired",
};

const FALLBACK_MESSAGES: Record<ApiErrorKind, string> = {
    validation: "Some of the details provided are not valid. Please check and try again.",
    unauthorized: "Your session has expired. Please sign in again.",
    notFound: "We couldn't find that item. Please start again.",
    conflict: "That request conflicts with the current state. Please try again.",
    expired: "This reservation has expired. Please choose a new time.",
    network: "We couldn't reach the server. Check your connection and try again.",
    server: "Something went wrong on our side. Please try again shortly.",
};

export class ApiError extends Error {
    readonly kind: ApiErrorKind;
    readonly status: number | null;

    constructor(kind: ApiErrorKind, status: number | null, message: string) {
        super(message);
        this.name = "ApiError";
        this.kind = kind;
        this.status = status;
    }

    /** Only 4xx messages from the backend contract are shown; 5xx and network use fixed text. */
    static fromResponse(status: number, body: unknown): ApiError {
        const kind = KIND_BY_STATUS[status] ?? (status >= 500 ? "server" : "validation");
        const serverMessage = isApiErrorBody(body) ? body.message : null;
        const showServerMessage = serverMessage && (kind === "conflict" || kind === "validation" || kind === "unauthorized");
        return new ApiError(kind, status, showServerMessage ? serverMessage : FALLBACK_MESSAGES[kind]);
    }

    static network(): ApiError {
        return new ApiError("network", null, FALLBACK_MESSAGES.network);
    }
}

function isApiErrorBody(body: unknown): body is ApiErrorResponse {
    return typeof body === "object" && body !== null && typeof (body as ApiErrorResponse).message === "string";
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

export function getErrorMessage(error: unknown): string {
    return isApiError(error) ? error.message : FALLBACK_MESSAGES.server;
}
