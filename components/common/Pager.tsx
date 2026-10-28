import {Box, Button, Typography} from "@mui/material";
import {COLORS} from "@/components/common/theme";

export default function Pager({page, totalPages, onChange, disabled}: {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
    disabled?: boolean;
}) {
    if (totalPages <= 1) return null;
    const buttonSx = {textTransform: "none", fontWeight: 600, color: COLORS.brand.link};
    return (
        <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", pt: 1}}>
            <Button sx={buttonSx} disabled={disabled || page <= 0} onClick={() => onChange(page - 1)}>
                Previous
            </Button>
            <Typography sx={{fontSize: 12, color: COLORS.text.subCaption}} aria-live="polite">
                Page {page + 1} of {totalPages}
            </Typography>
            <Button sx={buttonSx} disabled={disabled || page >= totalPages - 1} onClick={() => onChange(page + 1)}>
                Next
            </Button>
        </Box>
    );
}
