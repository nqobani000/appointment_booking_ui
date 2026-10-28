import { Button } from "@mui/material";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import { COLORS } from "@/components/common/theme";

export default function UseLocationButton({ onClick, loading = false }: { onClick?: () => void; loading?: boolean }) {
    return (
        <Button
            variant="text"
            disableRipple
            onClick={onClick}
            disabled={loading}
            startIcon={<MyLocationRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
                alignSelf: "flex-start",
                px: 1,
                ml: -1,
                mt: -0.5,
                minHeight: 44,
                fontSize: 14,
                fontWeight: 600,
                textTransform: "none",
                color: COLORS.brand.link,
                "&:hover": { backgroundColor: COLORS.brand.linkHoverBg },
            }}
        >
            {loading ? "Finding your location…" : "Use my current location"}
        </Button>
    );
}
