import type {Session} from "@/components/auth/types";
import type {AuthTokenResponse} from "@/api/types/auth";

export function getDisplayName(session: Session): string {
    return session.kind === "guest" && session.firstName
        ? `${session.firstName} ${session.lastName ?? ""}`.trim()
        : session.email;
}

export function toSession(
    token: AuthTokenResponse,
    profile: { email: string; firstName?: string; lastName?: string },
): Session {
    return {
        kind: token.customerType === "GUEST" ? "guest" : "client",
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        customerId: token.customerId,
        customerType: token.customerType,
        accessToken: token.accessToken,
        expiresAt: token.expiresAt,
    };
}
