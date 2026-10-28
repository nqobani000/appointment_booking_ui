import {Box, OutlinedInput, Typography} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {ERROR_COLOR} from "@/components/auth/constants";
import {COLORS} from "@/components/common/theme";

const inputSx = (hasError: boolean) => ({
    height: 48,
    borderRadius: "10px",
    fontSize: 14,
    color: COLORS.text.primary,
    backgroundColor: COLORS.surface.base,
    "& fieldset": {borderColor: hasError ? ERROR_COLOR : COLORS.border.default},
    "&:hover fieldset": {borderColor: hasError ? ERROR_COLOR : COLORS.border.hover},
    "&.Mui-focused fieldset": {
        borderColor: hasError ? ERROR_COLOR : COLORS.border.focus,
        borderWidth: 1.5,
    },
    "& input::placeholder": {color: COLORS.text.muted, opacity: 1},
});

export default function Field({
                                  id,
                                  label,
                                  value,
                                  onChange,
                                  onBlur,
                                  error,
                                  placeholder,
                                  type = "text",
                                  autoComplete,
                                  disabled,
                                  hint,
                                  showRequiredMark = true,
                              }: {
    id: string;
    label?: string;
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    error?: string;
    placeholder?: string;
    type?: string;
    autoComplete?: string;
    disabled?: boolean;
    /** Supporting text shown under the input (and under any error), with an info icon. */
    hint?: string;
    showRequiredMark?: boolean;
}) {
    const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
    return (
        <Box>
            {label && (
                <Typography
                    component="label"
                    htmlFor={id}
                    sx={{
                        display: "block",
                        mb: 1,
                        fontSize: 14,
                        fontWeight: 600,
                        color: COLORS.text.primary,
                    }}
                >
                    {label} {showRequiredMark && <span aria-hidden="true">*</span>}
                </Typography>
            )}
            <OutlinedInput
                id={id}
                fullWidth
                type={type}
                value={value}
                disabled={disabled}
                placeholder={placeholder}
                autoComplete={autoComplete}
                error={!!error}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                inputProps={{
                    "aria-label": label ? undefined : placeholder?.replace(/\s*\*$/, ""),
                    "aria-invalid": !!error,
                    "aria-describedby": describedBy,
                }}
                sx={inputSx(!!error)}
            />
            {error && (
                <Typography
                    id={`${id}-error`}
                    role="alert"
                    sx={{mt: 0.75, fontSize: 13, color: ERROR_COLOR}}
                >
                    {error}
                </Typography>
            )}
            {hint && (
                <Box sx={{mt: 1.5, display: "flex", alignItems: "center", gap: 1, color: COLORS.text.subCaption}}>
                    <InfoOutlinedIcon aria-hidden fontSize="small"/>
                    <Typography id={`${id}-hint`} sx={{fontSize: 13, lineHeight: 1.4}}>
                        {hint}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
