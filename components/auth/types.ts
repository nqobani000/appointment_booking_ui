import type {CustomerType} from "@/api/types/common";

/** In-memory only: contains the access token, which is a credential. */
export interface Session {
    kind: "client" | "guest";
    email: string;
    firstName?: string;
    lastName?: string;
    customerId: string;
    customerType: CustomerType;
    accessToken: string;
    expiresAt: string;
}

export interface Draft {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export type Step =
    | { name: "choose" }
    | { name: "client-login" }
    | { name: "guest-details" }
    | { name: "verify" };
