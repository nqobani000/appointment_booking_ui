"use client";

import {Box, Button, Typography} from "@mui/material";
import CaptionSubCaption from "@/components/common/CaptionSubCaption";
import {COLORS} from "@/components/common/theme";
import {TYPE} from "@/components/common/typography";
import type {Appointment} from "@/api/types/reservations";

export default function AppointmentConfirmed({
                                                 appointment,
                                                 onBookAnother,
                                                 caption = "Your appointment is confirmed",
                                                 subCaption = "Keep your reference number handy when you visit the branch.",
                                                 actionLabel = "Book another appointment",
                                             }: {
    appointment: Appointment;
    onBookAnother: () => void;
    caption?: string;
    subCaption?: string;
    actionLabel?: string;
}) {
    const consultantName = [appointment.consultant?.name, appointment.consultant?.surname].filter(Boolean).join(" ");
    const start = new Date(appointment.startAt);
    const when = start.toLocaleString("en-ZA", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "Africa/Johannesburg"
    });

    return (
        <Box sx={{display: "flex", flexDirection: "column", rowGap: 3, width: "100%"}}>
            <CaptionSubCaption caption={caption} subCaption={subCaption}/>
            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                <Typography sx={{...TYPE.cardDescription, color: COLORS.text.muted}}>Reference number</Typography>
                <Typography sx={{...TYPE.cardTitle, color: COLORS.text.primary}}>{appointment.referenceNo}</Typography>
            </Box>
            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                <Typography sx={{...TYPE.cardTitle, color: COLORS.text.primary}}>{appointment.service.name}</Typography>
                <Typography
                    sx={{...TYPE.cardDescription, color: COLORS.text.muted}}>{appointment.branch.name}</Typography>
                <Typography sx={{...TYPE.cardDescription, color: COLORS.text.muted}}>{when}</Typography>
                {consultantName && (
                    <Typography sx={{...TYPE.cardDescription, color: COLORS.text.muted}}>
                        With {consultantName}
                    </Typography>
                )}
            </Box>
            <Button onClick={onBookAnother}
                    sx={{alignSelf: "flex-start", textTransform: "none", fontWeight: 600, color: COLORS.brand.link}}>
                {actionLabel}
            </Button>
        </Box>
    );
}
