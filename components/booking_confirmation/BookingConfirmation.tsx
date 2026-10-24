"use client";

import {Box} from "@mui/material";
import {useState} from "react";
import CaptionSubCaption from "@/components/common/CaptionSubCaption";
import AppointmentDetails from "@/components/booking_confirmation/AppointmentDetails";
import {MOCK_BOOKING_SUMMARY} from "@/components/booking_confirmation/mockBookingSummary";

export default function BookingConfirmation() {
    const [agreedToNotifications, setAgreedToNotifications] = useState(true);

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
                summary={MOCK_BOOKING_SUMMARY}
                agreedToNotifications={agreedToNotifications}
                onAgreementChange={setAgreedToNotifications}
            />
        </Box>
    );
}
