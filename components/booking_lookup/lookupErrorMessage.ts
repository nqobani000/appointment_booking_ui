import {getErrorMessage, isApiError} from "@/api/errors";

export const NOT_FOUND_MESSAGE = "We couldn't find a booking with that reference. Check it and try again.";

/** The public lookup has no session, so a 401/403 means the lookup is unavailable, not "sign in again". */
export function getLookupErrorMessage(error: unknown): string {
    if (isApiError(error)) {
        if (error.kind === "notFound") return NOT_FOUND_MESSAGE;
        if (error.kind === "unauthorized") return "We couldn't look up that booking right now. Please try again later.";
    }
    return getErrorMessage(error);
}
