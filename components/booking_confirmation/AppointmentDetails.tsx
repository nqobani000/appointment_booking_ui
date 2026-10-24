import * as React from "react";
import {Box, Checkbox, FormControlLabel, Typography} from "@mui/material";
import {COLORS} from "@/components/common/theme";
import {TYPE} from "@/components/common/typography";
import type {BookingSummary} from "@/components/booking_confirmation/types";

function DetailRow({label, children, hasBorder = true}: {
    label: string;
    children: React.ReactNode;
    hasBorder?: boolean;
}) {
    return (
        <Box
            component="section"
            sx={{
                py: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                borderBottom: hasBorder ? `1px solid ${COLORS.border.default}` : "none",
            }}
        >
            <Typography
                component="h2"
                sx={{...TYPE.categoryLabel, color: COLORS.text.category}}
            >
                {label}
            </Typography>
            <Box sx={{display: "flex", flexDirection: "column", gap: 0.25}}>
                {children}
            </Box>
        </Box>
    );
}

function Primary({children}: {children: React.ReactNode}) {
    return (
        <Typography sx={{...TYPE.cardTitle, color: COLORS.text.primary}}>
            {children}
        </Typography>
    );
}

function Secondary({children}: {children: React.ReactNode}) {
    return (
        <Typography sx={{...TYPE.cardDescription, color: COLORS.text.muted}}>
            {children}
        </Typography>
    );
}

export default function AppointmentDetails({
                                               summary,
                                               agreedToNotifications,
                                               onAgreementChange,
                                           }: {
    summary: BookingSummary;
    agreedToNotifications: boolean;
    onAgreementChange: (agreed: boolean) => void;
}) {
    const {branchName, branchAddress, serviceName, date, time, userDetails} = summary;

    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: 2, width: "100%"}}>
            <Box sx={{
                px: 3,
                py: 2,
                borderRadius: "12px",
                border: `1.5px solid ${COLORS.border.default}`,
                backgroundColor: COLORS.surface.base,
            }}>
                <DetailRow label="Branch">
                    <Primary>{branchName}</Primary>
                    <Secondary>{branchAddress}</Secondary>
                </DetailRow>

                <DetailRow label="Service">
                    <Primary>{serviceName}</Primary>
                </DetailRow>

                <DetailRow label="Date">
                    <Primary>{date}</Primary>
                </DetailRow>

                <DetailRow label="Time">
                    <Primary>{time}</Primary>
                </DetailRow>

                <DetailRow label="Your details" hasBorder={false}>
                    <Primary>{userDetails.name}</Primary>
                    <Secondary>{userDetails.email}</Secondary>
                    <Secondary>{userDetails.phone}</Secondary>
                </DetailRow>
            </Box>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={agreedToNotifications}
                        onChange={(e) => onAgreementChange(e.target.checked)}
                        disableRipple
                        sx={{
                            color: COLORS.radio.idle,
                            "&.Mui-checked": {color: COLORS.radio.checked},
                        }}
                    />
                }
                label={
                    <Typography sx={{...TYPE.cardDescription, color: COLORS.text.muted}}>
                        I agree to receive appointment-related notifications.
                    </Typography>
                }
                sx={{ml: 0, alignItems: "center"}}
            />
        </Box>
    );
}
