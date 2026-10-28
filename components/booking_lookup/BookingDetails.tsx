"use client";

import type {ReactNode} from "react";
import {Box, Button, CircularProgress, Typography} from "@mui/material";
import Link from "next/link";
import {useRouter} from "next/navigation";
import BrandHeader from "@/components/auth/components/BrandHeader";
import AppointmentConfirmed from "@/components/booking_confirmation/AppointmentConfirmed";
import {getLookupErrorMessage, NOT_FOUND_MESSAGE} from "@/components/booking_lookup/lookupErrorMessage";
import {COLORS} from "@/components/common/theme";
import {TYPE} from "@/components/common/typography";
import {isApiError} from "@/api/errors";
import {useAppointment} from "@/hooks/queries/useAppointment";
import {decodeBookingReference, isBookingReference, normalizeBookingReference} from "@/lib/bookingReference";

function Message({children, action}: { children: string; action: ReactNode }) {
    return (
        <Box role="alert" sx={{display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2}}>
            <Typography sx={{...TYPE.cardTitle, color: COLORS.text.primary}}>{children}</Typography>
            {action}
        </Box>
    );
}

function LoadingMessage() {
    return (
        <Box role="status" sx={{display: "flex", alignItems: "center", gap: 2, color: COLORS.text.subCaption}}>
            <CircularProgress size={20} aria-hidden/>
            <Typography sx={TYPE.cardDescription}>Loading your booking…</Typography>
        </Box>
    );
}

function BookingPageShell({children}: { children: ReactNode }) {
    return (
        <Box sx={{minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: COLORS.surface.base}}>
            <BrandHeader variant="bar"/>
            <Box component="main" sx={{width: "100%", maxWidth: 640, mx: "auto", px: 3, py: 6, boxSizing: "border-box"}}>
                {children}
            </Box>
        </Box>
    );
}

/** Suspense fallback while the route params resolve. */
export const BookingLoading = () => (
    <BookingPageShell>
        <LoadingMessage/>
    </BookingPageShell>
);

export default function BookingDetails({referenceNo}: { referenceNo: string }) {
    const router = useRouter();
    const reference = normalizeBookingReference(decodeBookingReference(referenceNo));
    const isValid = isBookingReference(reference);
    const {data, error, isPending, refetch, isFetching} = useAppointment(reference, isValid);

    const linkSx = {textTransform: "none", fontWeight: 600, color: COLORS.brand.link, px: 0} as const;
    const tryAnother = (
        <Button component={Link} href="/" sx={linkSx}>
            Try another reference
        </Button>
    );

    let content: ReactNode;
    if (!isValid) {
        content = <Message action={tryAnother}>{NOT_FOUND_MESSAGE}</Message>;
    } else if (data) {
        content = (
            <AppointmentConfirmed
                appointment={data}
                caption="Your booking"
                subCaption="Here are the details of your appointment."
                actionLabel="Back to start"
                onBookAnother={() => router.push("/")}
            />
        );
    } else if (error) {
        const retryable = isApiError(error) && (error.kind === "network" || error.kind === "server");
        content = (
            <Message
                action={
                    retryable ? (
                        <Button disabled={isFetching} onClick={() => refetch()} sx={linkSx}>
                            Try again
                        </Button>
                    ) : (
                        tryAnother
                    )
                }
            >
                {getLookupErrorMessage(error)}
            </Message>
        );
    } else if (isPending) {
        content = <LoadingMessage/>;
    }

    return <BookingPageShell>{content}</BookingPageShell>;
}
