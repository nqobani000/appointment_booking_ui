"use client";

import * as React from "react";
import {Box} from "@mui/material";
import Field from "@/components/auth/components/Field";
import FormError from "@/components/auth/components/FormError";
import PrimaryButton from "@/components/auth/components/PrimaryButton";
import ScreenShell from "@/components/auth/components/ScreenShell";
import {validateEmail, validatePassword} from "@/components/auth/validation";
import {COLORS} from "@/components/common/theme";
import {getErrorMessage} from "@/api/errors";
import type {AuthTokenResponse} from "@/api/types/auth";
import {useLogin} from "@/hooks/mutations/useAuthMutations";

export default function ClientLoginScreen({
                                              onBack,
                                              onLoggedIn,
                                          }: {
    onBack: () => void;
    onLoggedIn: (token: AuthTokenResponse, email: string) => void;
}) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [touched, setTouched] = React.useState({email: false, password: false});
    const login = useLogin();

    const emailError = touched.email ? validateEmail(email) : undefined;
    const passwordError = touched.password ? validatePassword(password) : undefined;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({email: true, password: true});
        if (validateEmail(email) || validatePassword(password) || login.isPending) return;
        try {
            onLoggedIn(await login.mutateAsync({email: email.trim(), password}), email.trim());
        } catch {
            // surfaced through login.error
        }
    };

    return (
        <ScreenShell
            title="Log in to your account"
            subtitle="Enter your email address and password to continue."
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
                    onBlur={() => setTouched((t) => ({...t, email: true}))}
                    error={emailError}
                    disabled={login.isPending}
                />
                <Field
                    id="client-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password *"
                    value={password}
                    onChange={setPassword}
                    onBlur={() => setTouched((t) => ({...t, password: true}))}
                    error={passwordError}
                    disabled={login.isPending}
                />
                {login.error && <FormError>{getErrorMessage(login.error)}</FormError>}
                <PrimaryButton type="submit" loading={login.isPending} loadingLabel="Logging in…">
                    Log in
                </PrimaryButton>
            </Box>
        </ScreenShell>
    );
}
