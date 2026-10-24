import type {Session} from "@/components/auth/types";

export function getDisplayName(session: Session): string {
    return session.kind === "guest" ? `${session.firstName} ${session.lastName}` : session.email;
}
