import * as React from "react";

export function useReservationCountdown(expiresAt: string | null) {
    const [now, setNow] = React.useState(() => Date.now());

    React.useEffect(() => {
        if (!expiresAt) return;
        const tick = () => setNow(Date.now());
        const immediate = setTimeout(tick, 0);
        const timer = setInterval(tick, 1000);
        return () => {
            clearTimeout(immediate);
            clearInterval(timer);
        };
    }, [expiresAt]);

    if (!expiresAt) return {secondsLeft: 0, expired: false};
    const remainingMs = new Date(expiresAt).getTime() - now;
    return {secondsLeft: Math.max(0, Math.ceil(remainingMs / 1000)), expired: remainingMs <= 0};
}
