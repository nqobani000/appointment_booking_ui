"use client";

import * as React from "react";
import {Box} from "@mui/material";
import {useRequestGuestCode} from "@/hooks/mutations/useAuthMutations";
import {getErrorMessage} from "@/api/errors";
import Field from "@/components/auth/components/Field";
import FormError from "@/components/auth/components/FormError";
import PrimaryButton from "@/components/auth/components/PrimaryButton";
import ScreenShell from "@/components/auth/components/ScreenShell";
import type {Draft} from "@/components/auth/types";
import {validateGuest} from "@/components/auth/validation";
import {COLORS} from "@/components/common/theme";

export default function GuestDetailsScreen({
                                               initial,
                                               onBack,
                                               onCodeSent,
                                           }: {
    initial: Draft;
    onBack: () => void;
    onCodeSent: (values: Draft) => void;
}) {
    const [values, setValues] = React.useState<Draft>(initial);
    const [touched, setTouched] = React.useState<Partial<Record<keyof Draft, boolean>>>({});
    const requestCode = useRequestGuestCode();
    const loading = requestCode.isPending;

    const errors = validateGuest(values);
    const shown = (key: keyof Draft) => (touched[key] ? errors[key] : undefined);
    const setField = (key: keyof Draft) => (v: string) =>
        setValues((prev) => ({...prev, [key]: v}));
    const touch = (key: keyof Draft) => () =>
        setTouched((prev) => ({...prev, [key]: true}));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({firstName: true, lastName: true, email: true, phone: true});
        if (Object.keys(errors).length > 0) return;

        const clean: Draft = {
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim(),
            phone: values.phone.trim(),
        };

        try {
            await requestCode.mutateAsync({
                name: clean.firstName,
                surname: clean.lastName,
                email: clean.email,
                phone: clean.phone,
            });
            onCodeSent(clean);
        } catch {
            // surfaced through requestCode.error
        }
    };

    return (
        <ScreenShell
            title="Tell us a bit about yourself"
            subtitle="Please provide your details so we can send you a confirmation code and keep your appointment information."
            onBack={onBack}
        >
            <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    p: 3,
                    border: `1px solid ${COLORS.border.default}`,
                    borderRadius: "12px",
                }}
            >
                <Field
                    id="guest-first-name"
                    autoComplete="given-name"
                    placeholder="First name *"
                    value={values.firstName}
                    onChange={setField("firstName")}
                    onBlur={touch("firstName")}
                    error={shown("firstName")}
                    disabled={loading}
                />
                <Field
                    id="guest-last-name"
                    autoComplete="family-name"
                    placeholder="Last Name *"
                    value={values.lastName}
                    onChange={setField("lastName")}
                    onBlur={touch("lastName")}
                    error={shown("lastName")}
                    disabled={loading}
                />
                <Field
                    id="guest-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email address *"
                    value={values.email}
                    onChange={setField("email")}
                    onBlur={touch("email")}
                    error={shown("email")}
                    disabled={loading}
                />
                <Field
                    id="guest-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Phone number *"
                    value={values.phone}
                    onChange={setField("phone")}
                    onBlur={touch("phone")}
                    error={shown("phone")}
                    disabled={loading}
                />
                {requestCode.error && <FormError>{getErrorMessage(requestCode.error)}</FormError>}
                <PrimaryButton type="submit" loading={loading} loadingLabel="Sending code…">
                    Send verification code
                </PrimaryButton>
            </Box>
        </ScreenShell>
    );
}
