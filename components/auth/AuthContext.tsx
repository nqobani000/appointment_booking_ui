"use client";

import * as React from "react";
import {useQueryClient} from "@tanstack/react-query";
import type {Session} from "@/components/auth/types";
import {RESERVATION_KEY, SESSION_KEY, sessionStore, useStoredValue} from "@/lib/sessionStore";

interface AuthContextValue {
    session: Session | null;
    signIn: (session: Session) => void;
    signOut: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthGate>");
    return ctx;
}

function parseSession(raw: string | null): Session | null {
    if (!raw) return null;
    try {
        const session = JSON.parse(raw) as Session;
        return new Date(session.expiresAt).getTime() > Date.now() ? session : null;
    } catch {
        return null;
    }
}

/** The session (including the JWT) is kept in sessionStorage, so it survives a reload in the same tab. */
export function AuthProvider({children}: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const raw = useStoredValue(SESSION_KEY);
    const session = React.useMemo(() => parseSession(raw), [raw]);

    const signIn = React.useCallback((next: Session) => sessionStore.set(SESSION_KEY, JSON.stringify(next)), []);

    const signOut = React.useCallback(() => {
        sessionStore.remove(SESSION_KEY);
        sessionStore.remove(RESERVATION_KEY);
        queryClient.clear();
    }, [queryClient]);

    const expiresAt = session?.expiresAt;
    React.useEffect(() => {
        if (!expiresAt) return;
        const timer = setTimeout(signOut, Math.max(new Date(expiresAt).getTime() - Date.now(), 0));
        return () => clearTimeout(timer);
    }, [expiresAt, signOut]);

    const value = React.useMemo(() => ({session, signIn, signOut}), [session, signIn, signOut]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
