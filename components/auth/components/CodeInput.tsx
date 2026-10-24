import * as React from "react";
import {Box, OutlinedInput} from "@mui/material";
import {CODE_LENGTH, ERROR_COLOR} from "@/components/auth/constants";
import {COLORS} from "@/components/common/theme";

export default function CodeInput({
                                      digits,
                                      onChange,
                                      inputRefs,
                                      disabled,
                                      hasError,
                                  }: {
    digits: string[];
    onChange: (digits: string[]) => void;
    inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    disabled?: boolean;
    hasError?: boolean;
}) {
    const focusAt = (i: number) => inputRefs.current[i]?.focus();

    const fillFrom = (start: number, raw: string) => {
        const cleaned = raw.replace(/\D/g, "");
        if (!cleaned) return;
        const next = [...digits];
        cleaned
            .slice(0, CODE_LENGTH - start)
            .split("")
            .forEach((c, k) => (next[start + k] = c));
        onChange(next);
        focusAt(Math.min(start + cleaned.length, CODE_LENGTH - 1));
    };

    const handleChange = (i: number, raw: string) => {
        const cleaned = raw.replace(/\D/g, "");
        if (!cleaned) {
            const next = [...digits];
            next[i] = "";
            onChange(next);
            return;
        }
        fillFrom(i, cleaned);
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === "Backspace" && !digits[i] && i > 0) {
            e.preventDefault();
            const next = [...digits];
            next[i - 1] = "";
            onChange(next);
            focusAt(i - 1);
        } else if (e.key === "ArrowLeft" && i > 0) {
            e.preventDefault();
            focusAt(i - 1);
        } else if (e.key === "ArrowRight" && i < CODE_LENGTH - 1) {
            e.preventDefault();
            focusAt(i + 1);
        }
    };

    return (
        <Box
            role="group"
            aria-label="Verification code"
            sx={{display: "flex", justifyContent: "center", gap: {xs: 1, sm: 1.5}}}
        >
            {digits.map((digit, i) => (
                <OutlinedInput
                    key={i}
                    value={digit}
                    disabled={disabled}
                    placeholder="–"
                    error={hasError}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    onPaste={(e) => {
                        e.preventDefault();
                        fillFrom(i, e.clipboardData.getData("text"));
                    }}
                    inputRef={(el) => (inputRefs.current[i] = el)}
                    inputProps={{
                        inputMode: "numeric",
                        autoComplete: i === 0 ? "one-time-code" : "off",
                        "aria-label": `Digit ${i + 1} of ${CODE_LENGTH}`,
                        style: {textAlign: "center", padding: 0},
                    }}
                    sx={{
                        width: {xs: 44, sm: 52},
                        height: 56,
                        borderRadius: "10px",
                        fontSize: 20,
                        fontWeight: 600,
                        color: COLORS.text.primary,
                        "& fieldset": {
                            borderColor: hasError ? ERROR_COLOR : COLORS.border.default,
                        },
                        "&:hover fieldset": {
                            borderColor: hasError ? ERROR_COLOR : COLORS.border.hover,
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: hasError ? ERROR_COLOR : COLORS.border.focus,
                            borderWidth: 1.5,
                        },
                        "& input::placeholder": {color: COLORS.text.muted, opacity: 1},
                    }}
                />
            ))}
        </Box>
    );
}
