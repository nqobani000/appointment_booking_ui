import * as React from "react";

export const SESSION_KEY = "booking.session";
export const RESERVATION_KEY = "booking.reservation";

const listeners = new Set<() => void>();
const memoryFallback = new Map<string, string>();

function notify() {
    listeners.forEach((listener) => listener());
}

/** sessionStorage-backed store (tab-scoped); falls back to memory when storage is unavailable. */
export const sessionStore = {
    get(key: string): string | null {
        try {
            return sessionStorage.getItem(key);
        } catch {
            return memoryFallback.get(key) ?? null;
        }
    },
    set(key: string, value: string): void {
        try {
            sessionStorage.setItem(key, value);
        } catch {
            memoryFallback.set(key, value);
        }
        notify();
    },
    remove(key: string): void {
        try {
            sessionStorage.removeItem(key);
        } catch {
            memoryFallback.delete(key);
        }
        notify();
    },
    subscribe(listener: () => void): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
};

/** Returns null on the server and during hydration, then the stored value. */
export function useStoredValue(key: string): string | null {
    return React.useSyncExternalStore(
        sessionStore.subscribe,
        () => sessionStore.get(key),
        () => null,
    );
}
