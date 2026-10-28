"use client";

import {Box, Typography} from "@mui/material";
import CaptionSubCaption from "@/components/common/CaptionSubCaption";
import AppointmentDetails from "@/components/booking_confirmation/AppointmentDetails";
import {formatBookingDate} from "@/components/booking_confirmation/formatBookingDate";
import {useAuth} from "@/components/auth/AuthContext";
import {formatCountdown} from "@/lib/datetime";
import {COLORS} from "@/components/common/theme";
import type {Reservation} from "@/api/types/reservations";
import type {CompleteBookingSelection} from "@/components/appointment_booking/types";

export default function BookingConfirmation({selection, reservation, secondsLeft, onAgreementChange}: {
    selection: CompleteBookingSelection;
    reservation: Reservation;
    secondsLeft: number;
    onAgreementChange: (agreed: boolean) => void;
}) {
    const {session} = useAuth();
    const consultantName = [reservation.consultant?.name, reservation.consultant?.surname].filter(Boolean).join(" ");

    const summary = {
        branchName: selection.branch.name,
        branchAddress: selection.branch.address,
        serviceName: selection.service.title,
        date: formatBookingDate(selection.date),
        time: selection.time,
        userDetails: {
            name: session?.kind === "guest" ? `${session.firstName} ${session.lastName}` : undefined,
            email: session?.email ?? "",
        },
    };

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            rowGap: 3,
            width: "100%",
        }}>
            <CaptionSubCaption
                caption="Review your appointment booking"
                subCaption="Please check your appointment details before confirming your booking."
            />

            <Typography role="timer" aria-live="off" sx={{fontSize: 14, color: COLORS.text.primary}}>
                Your slot{consultantName ? ` with ${consultantName}` : ""} is held for{" "}
                <strong>{formatCountdown(secondsLeft)}</strong>. Confirm before it expires.
            </Typography>

            <AppointmentDetails
                summary={summary}
                agreedToNotifications={selection.agreedToNotifications}
                onAgreementChange={onAgreementChange}
            />
        </Box>
    );
}
