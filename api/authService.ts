import type {Session, VerifyResult} from "@/components/auth/types";

export const MOCK_VERIFICATION_CODE = "123456";

const SESSION_KEY = "booking.session";
let memorySession: string | null = null;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const authService = {
    async sendVerificationCode(_email: string): Promise<void> {
        await wait(900);
    },

    async verifyCode(_email: string, code: string): Promise<VerifyResult> {
        await wait(700);
        if (code === MOCK_VERIFICATION_CODE) return {ok: true};
        return {
            ok: false,
            message: "That code isn't correct. Check the code in your email and try again.",
        };
    },

    loadStoredSession(): string | null {
        try {
            return sessionStorage.getItem(SESSION_KEY) ?? memorySession;
        } catch {
            return memorySession;
        }
    },

    saveSession(session: Session): void {
        const raw = JSON.stringify(session);
        memorySession = raw;
        try {
            sessionStorage.setItem(SESSION_KEY, raw);
        } catch {
            return;
        }
    },
};
