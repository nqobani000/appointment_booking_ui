import {ToggleButton, ToggleButtonGroup} from "@mui/material";
import {COLORS} from "@/components/common/theme";

export interface PillOption<T extends string> {
    value: T;
    label: string;
}

/** Two-or-more option segmented pill; exactly one option is always selected. */
export default function PillToggle<T extends string>({value, options, onChange, ariaLabel}: {
    value: T;
    options: PillOption<T>[];
    onChange: (value: T) => void;
    ariaLabel: string;
}) {
    return (
        <ToggleButtonGroup
            exclusive
            size="small"
            value={value}
            aria-label={ariaLabel}
            onChange={(_, next: T | null) => {
                if (next !== null) onChange(next);
            }}
            sx={{
                p: "3px",
                gap: "2px",
                borderRadius: "999px",
                border: `1px solid ${COLORS.border.default}`,
                backgroundColor: COLORS.surface.subtle,
                "& .MuiToggleButtonGroup-grouped": {
                    border: 0,
                    borderRadius: "999px !important",
                    px: 1.75,
                    py: 0.5,
                    textTransform: "none",
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.4,
                    whiteSpace: "nowrap",
                    color: COLORS.text.category,
                    transition: "background-color .15s, color .15s, box-shadow .15s",
                    "&:hover": {backgroundColor: COLORS.surface.selected},
                    "&.Mui-selected": {
                        color: COLORS.text.inverse,
                        backgroundColor: COLORS.brand.button,
                        boxShadow: "0 1px 3px rgba(30, 58, 95, 0.25)",
                        "&:hover": {backgroundColor: COLORS.brand.buttonHover},
                    },
                    "&.Mui-focusVisible": {
                        outline: `2px solid ${COLORS.border.focus}`,
                        outlineOffset: 1,
                    },
                },
            }}
        >
            {options.map((option) => (
                <ToggleButton key={option.value} value={option.value} disableRipple>
                    {option.label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}
