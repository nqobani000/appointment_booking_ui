"use client";

import * as React from "react";
import {authService} from "@/api/authService";
import type {Session} from "@/components/auth/types";

interface AuthContextValue {
    session: Session | null;
    ready: boolean;
    signIn: (session: Session) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

const getStoredSession = () => authService.loadStoredSession();
const getServerSession = () => undefined;

export function useAuth(): AuthContextValue {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthGate>");
    return ctx;
}

export function AuthProvider({children}: { children: React.ReactNode }) {
    const stored = React.useSyncExternalStore(subscribe, getStoredSession, getServerSession);

    const signIn = React.useCallback((next: Session) => {
        authService.saveSession(next);
        listeners.forEach((listener) => listener());
    }, []);

    const value = React.useMemo<AuthContextValue>(
        () => ({
            session: stored ? (JSON.parse(stored) as Session) : null,
            ready: stored !== undefined,
            signIn,
        }),
        [stored, signIn]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
