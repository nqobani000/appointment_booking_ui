"use client";

import * as React from "react";
import {Box, Button, Typography} from "@mui/material";
import {useRequestGuestCode, useVerifyGuestCode} from "@/hooks/mutations/useAuthMutations";
import {getErrorMessage} from "@/api/errors";
import type {AuthTokenResponse} from "@/api/types/auth";
import type {Draft} from "@/components/auth/types";
import CodeInput from "@/components/auth/components/CodeInput";
import FormError from "@/components/auth/components/FormError";
import PrimaryButton from "@/components/auth/components/PrimaryButton";
import ScreenShell from "@/components/auth/components/ScreenShell";
import {CODE_LENGTH, RESEND_SECONDS} from "@/components/auth/constants";
import {formatTime, useCountdown} from "@/components/auth/hooks/useCountdown";
import {COLORS} from "@/components/common/theme";

export default function VerifyScreen({
                                         draft,
                                         onBack,
                                         onVerified,
                                     }: {
    draft: Draft;
    onBack: () => void;
    onVerified: (token: AuthTokenResponse) => void;
}) {
    const email = draft.email;
    const verifyCode = useVerifyGuestCode();
    const requestCode = useRequestGuestCode();
    const [digits, setDigits] = React.useState<string[]>(Array(CODE_LENGTH).fill(""));
    const verifying = verifyCode.isPending;
    const resending = requestCode.isPending;
    const [error, setError] = React.useState<string | null>(null);
    const [notice, setNotice] = React.useState<string | null>(null);
    const [secondsLeft, restartCountdown] = useCountdown(RESEND_SECONDS);
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    React.useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const code = digits.join("");
    const complete = code.length === CODE_LENGTH;

    const handleDigitsChange = (next: string[]) => {
        setDigits(next);
        if (error) setError(null);
        if (notice) setNotice(null);
    };

    const resetCode = () => {
        setDigits(Array(CODE_LENGTH).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 0);
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!complete) return;
        setError(null);
        try {
            onVerified(await verifyCode.mutateAsync({email, code}));
        } catch (err) {
            setError(getErrorMessage(err));
            resetCode();
        }
    };

    const handleResend = async () => {
        setError(null);
        setNotice(null);
        try {
            await requestCode.mutateAsync({
                name: draft.firstName,
                surname: draft.lastName,
                email,
                phone: draft.phone,
            });
            restartCountdown();
            resetCode();
            setNotice("A new code has been sent to your email.");
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const canResend = secondsLeft <= 0 && !resending && !verifying;

    return (
        <ScreenShell
            centered
            focusHeading={false}
            title="Check your email"
            subtitle={
                <>
                    We&apos;ve sent a 6-digit verification code to
                    <Typography
                        component="span"
                        sx={{display: "block", mt: 0.5, fontSize: 16, fontWeight: 600, color: COLORS.text.primary}}
                    >
                        {email}
                    </Typography>
                </>
            }
            onBack={onBack}
        >
            <Box
                component="form"
                noValidate
                onSubmit={handleVerify}
                sx={{display: "flex", flexDirection: "column", gap: 3}}
            >
                <CodeInput
                    digits={digits}
                    onChange={handleDigitsChange}
                    inputRefs={inputRefs}
                    disabled={verifying}
                    hasError={!!error}
                />

                {error && <FormError>{error}</FormError>}
                {notice && (
                    <Typography
                        role="status"
                        sx={{fontSize: 13, textAlign: "center", color: COLORS.text.category}}
                    >
                        {notice}
                    </Typography>
                )}

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        columnGap: 1,
                    }}
                >
                    <Typography sx={{fontSize: 13, color: COLORS.text.subCaption}}>
                        Didn&apos;t receive the code?
                    </Typography>
                    <Button
                        variant="text"
                        disableRipple
                        disabled={!canResend}
                        onClick={handleResend}
                        sx={{
                            minWidth: 0,
                            px: 1,
                            fontSize: 13,
                            fontWeight: 600,
                            textTransform: "none",
                            color: COLORS.brand.link,
                            "&:hover": {backgroundColor: COLORS.brand.linkHoverBg},
                            "&.Mui-disabled": {color: COLORS.text.muted},
                        }}
                    >
                        {resending ? "Sending…" : "Resend code"}
                    </Button>
                    {secondsLeft > 0 && (
                        <Typography sx={{fontSize: 13, color: COLORS.text.subCaption}}>
                            (in {formatTime(secondsLeft)})
                        </Typography>
                    )}
                </Box>


                <PrimaryButton
                    type="submit"
                    disabled={!complete}
                    loading={verifying}
                    loadingLabel="Verifying…"
                >
                    Verify code
                </PrimaryButton>
            </Box>
        </ScreenShell>
    );
}
