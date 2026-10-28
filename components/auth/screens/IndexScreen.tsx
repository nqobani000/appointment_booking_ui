"use client";

import * as React from "react";
import {Box, ButtonBase, Divider, Typography} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import {useRouter} from "next/navigation";
import BrandHeader from "@/components/auth/components/BrandHeader";
import Field from "@/components/auth/components/Field";
import FormError from "@/components/auth/components/FormError";
import PrimaryButton from "@/components/auth/components/PrimaryButton";
import {getLookupErrorMessage} from "@/components/booking_lookup/lookupErrorMessage";
import {COLORS} from "@/components/common/theme";
import {useLookupAppointment} from "@/hooks/queries/useAppointment";
import {normalizeBookingReference, validateBookingReference} from "@/lib/bookingReference";

function BookingOption({label, onClick}: { label: string; onClick: () => void }) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                px: 2,
                py: 3,
                fontSize: 18,
                fontWeight: 600,
                color: COLORS.text.primary,
                backgroundColor: COLORS.surface.subtle,
                "&:hover": {backgroundColor: COLORS.surface.selected},
                "&.Mui-focusVisible": {outline: `2px solid ${COLORS.border.focus}`, outlineOffset: -2},
            }}
        >
            {label}
        </ButtonBase>
    );
}

export default function IndexScreen({onClient, onGuest}: { onClient: () => void; onGuest: () => void }) {
    const router = useRouter();
    const lookup = useLookupAppointment();
    const [reference, setReference] = React.useState("");
    const [touched, setTouched] = React.useState(false);

    const validationError = touched ? validateBookingReference(reference) : undefined;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);
        if (validateBookingReference(reference) || lookup.isPending) return;
        const referenceNo = normalizeBookingReference(reference);
        try {
            await lookup.mutateAsync(referenceNo);
            router.push(`/bookings/${encodeURIComponent(referenceNo)}`);
        } catch {
            // surfaced through lookup.error
        }
    };

    return (
        <Box sx={{minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: COLORS.surface.base}}>
            <BrandHeader variant="bar"/>
            <Box
                component="main"
                sx={{
                    width: "100%",
                    maxWidth: 640,
                    mx: "auto",
                    px: 3,
                    pt: {xs: 5, sm: 8},
                    pb: 6,
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                }}
            >
                <Box sx={{textAlign: "center", display: "flex", flexDirection: "column", gap: 1.5}}>
                    <Typography sx={{fontSize: {xs: 15, sm: 17}, lineHeight: 1.5, color: COLORS.text.subCaption}}>
                        Enter your booking reference to view your appointment details.
                    </Typography>
                </Box>

                <Box component="form" noValidate onSubmit={handleSubmit}
                     sx={{display: "flex", flexDirection: "column", gap: 3}}>
                    <Field
                        id="booking-reference"
                        label="Booking reference"
                        showRequiredMark={false}
                        placeholder="e.g. APT-20300101-3F9A1C7B2D"
                        autoComplete="off"
                        value={reference}
                        onChange={setReference}
                        onBlur={() => reference && setTouched(true)}
                        error={validationError}
                        hint="Your booking reference can be found in your confirmation email."
                        disabled={lookup.isPending}
                    />
                    {lookup.error && <FormError>{getLookupErrorMessage(lookup.error)}</FormError>}
                    <PrimaryButton type="submit" loading={lookup.isPending} loadingLabel="Looking up…">
                        View booking
                    </PrimaryButton>
                </Box>

                <Divider sx={{
                    color: COLORS.text.muted,
                    fontSize: 14,
                    "&::before, &::after": {borderColor: COLORS.border.default}
                }}>
                    or
                </Divider>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {xs: "1fr", sm: "1fr 1fr"},
                        border: `1px solid ${COLORS.border.default}`,
                        borderRadius: "12px",
                        overflow: "hidden",
                        "& > :not(:first-of-type)": {
                            borderTop: {xs: `1px solid ${COLORS.border.default}`, sm: "none"},
                            borderLeft: {xs: "none", sm: `1px solid ${COLORS.border.default}`},
                        },
                    }}
                >
                    <BookingOption label="Client booking" onClick={onClient}/>
                    <BookingOption label="Guest booking" onClick={onGuest}/>
                </Box>
            </Box>
        </Box>
    );
}
