import * as React from "react";

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export type GeolocationStatus = "idle" | "locating" | "granted" | "denied" | "unavailable" | "timeout";

export const GEOLOCATION_MESSAGES: Partial<Record<GeolocationStatus, string>> = {
    denied: "Location access was denied. You can still search for a branch by name or suburb.",
    unavailable: "We couldn't determine your location. Try searching by name or suburb instead.",
    timeout: "Finding your location took too long. Please try again or search by name.",
};

const round = (value: number) => Math.round(value * 1000) / 1000;

/** Never requests the position until `locate` is called from a user action. */
export function useGeolocation() {
    const [status, setStatus] = React.useState<GeolocationStatus>("idle");
    const [coordinates, setCoordinates] = React.useState<Coordinates | null>(null);

    const locate = React.useCallback(() => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            setStatus("unavailable");
            return;
        }
        setStatus("locating");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordinates({latitude: round(position.coords.latitude), longitude: round(position.coords.longitude)});
                setStatus("granted");
            },
            (error) => {
                setStatus(error.code === error.PERMISSION_DENIED ? "denied" : error.code === error.TIMEOUT ? "timeout" : "unavailable");
            },
            {timeout: 10_000, maximumAge: 60_000},
        );
    }, []);

    const clear = React.useCallback(() => {
        setCoordinates(null);
        setStatus("idle");
    }, []);

    return {status, coordinates, locate, clear};
}
