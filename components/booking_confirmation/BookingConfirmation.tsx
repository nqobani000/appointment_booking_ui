"use client";

import {Box} from "@mui/material";
import CaptionSubCaption from "@/components/common/CaptionSubCaption";
import AppointmentDetails from "@/components/booking_confirmation/AppointmentDetails";
import {formatBookingDate} from "@/components/booking_confirmation/formatBookingDate";
import {useAuth} from "@/components/auth/AuthContext";
import type {CompleteBookingSelection} from "@/components/appointment_booking/types";

export default function BookingConfirmation({selection, onAgreementChange}: {
    selection: CompleteBookingSelection;
    onAgreementChange: (agreed: boolean) => void;
}) {
    const {session} = useAuth();

    const summary = {
        branchName: selection.branch.name,
        branchSuburb: selection.branch.suburb,
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

            <AppointmentDetails
                summary={summary}
                agreedToNotifications={selection.agreedToNotifications}
                onAgreementChange={onAgreementChange}
            />
        </Box>
    );
}
