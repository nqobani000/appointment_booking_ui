import * as React from "react";

export function useCountdown(initial: number) {
    const [seconds, setSeconds] = React.useState(initial);
    React.useEffect(() => {
        if (seconds <= 0) return;
        const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [seconds]);
    return [seconds, () => setSeconds(initial)] as const;
}

export const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
