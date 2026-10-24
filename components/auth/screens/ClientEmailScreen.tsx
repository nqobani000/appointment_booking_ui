"use client";

import * as React from "react";
import {Box} from "@mui/material";
import {authService} from "@/api/authService";
import Field from "@/components/auth/components/Field";
import FormError from "@/components/auth/components/FormError";
import PrimaryButton from "@/components/auth/components/PrimaryButton";
import ScreenShell from "@/components/auth/components/ScreenShell";
import {validateEmail} from "@/components/auth/validation";
import {COLORS} from "@/components/common/theme";

export default function ClientEmailScreen({
                                              initialEmail,
                                              onBack,
                                              onCodeSent,
                                          }: {
    initialEmail: string;
    onBack: () => void;
    onCodeSent: (email: string) => void;
}) {
    const [email, setEmail] = React.useState(initialEmail);
    const [touched, setTouched] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [submitError, setSubmitError] = React.useState<string | null>(null);

    const error = touched ? validateEmail(email) : undefined;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);
        if (validateEmail(email)) return;

        setLoading(true);
        setSubmitError(null);
        try {
            await authService.sendVerificationCode(email.trim());
            onCodeSent(email.trim());
        } catch {
            setSubmitError("We couldn't send your code. Please try again.");
            setLoading(false);
        }
    };

    return (
        <ScreenShell
            title="Log in to your account"
            subtitle="Enter the email address linked to your account and we'll send you a verification code."
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
                    id="client-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email address *"
                    value={email}
                    onChange={setEmail}
                    onBlur={() => setTouched(true)}
                    error={error}
                    disabled={loading}
                />
                {submitError && <FormError>{submitError}</FormError>}
                <PrimaryButton type="submit" loading={loading} loadingLabel="Sending code…">
                    Send verification code
                </PrimaryButton>
            </Box>
        </ScreenShell>
    );
}
