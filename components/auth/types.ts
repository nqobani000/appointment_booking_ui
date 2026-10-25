export type Session =
    | { kind: "client"; email: string }
    | { kind: "guest"; email: string; firstName: string; lastName: string };

export type Flow = "client" | "guest";

export interface Draft {
    firstName: string;
    lastName: string;
    email: string;
}

export type Step =
    | { name: "choose" }
    | { name: "client-email" }
    | { name: "guest-details" }
    | { name: "verify"; flow: Flow };

export type VerifyResult = { ok: true } | { ok: false; message: string };
