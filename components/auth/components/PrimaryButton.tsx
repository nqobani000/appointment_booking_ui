import * as React from "react";
import {Button} from "@mui/material";
import {COLORS} from "@/components/common/theme";

export default function PrimaryButton({
                                          children,
                                          loading = false,
                                          loadingLabel,
                                          disabled = false,
                                          type = "button",
                                          compact = false,
                                          ariaLabel,
                                          onClick,
                                      }: {
    children: React.ReactNode;
    loading?: boolean;
    loadingLabel?: string;
    disabled?: boolean;
    type?: "button" | "submit";
    compact?: boolean;
    ariaLabel?: string;
    onClick?: () => void;
}) {
    return (
        <Button
            type={type}
            variant="contained"
            disableElevation
            fullWidth
            disabled={disabled || loading}
            onClick={onClick}
            aria-label={ariaLabel}
            aria-busy={loading || undefined}
            sx={{
                height: compact ? 44 : 52,
                borderRadius: "10px",
                textTransform: "none",
                fontSize: compact ? 14 : 15,
                fontWeight: 600,
                color: COLORS.text.inverse,
                backgroundColor: COLORS.brand.button,
                "&:hover": {backgroundColor: COLORS.brand.buttonHover},
                "&.Mui-disabled": loading
                    ? {backgroundColor: COLORS.brand.button, color: COLORS.text.inverse, opacity: 0.75}
                    : {backgroundColor: COLORS.surface.selected, color: COLORS.text.muted},
            }}
        >
            {loading && loadingLabel ? loadingLabel : children}
        </Button>
    );
}
