import { Box, Radio, Typography } from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { COLORS } from "@/components/common/theme";
import { TYPE } from "@/components/common/typography";
import type { Branch } from "@/components/branch_selection/types";

export default function BranchCard({ branch, selected }: { branch: Branch; selected: boolean }) {
    return (
        <Box
            component="label"
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 2,
                py: 1.75,
                cursor: "pointer",
                borderRadius: "12px",
                border: "1.5px solid",
                borderColor: selected ? COLORS.border.focus : COLORS.border.default,
                backgroundColor: selected ? COLORS.surface.selected : COLORS.surface.base,
                transition: "background-color .15s, border-color .15s",
                "&:hover": {
                    borderColor: selected ? COLORS.border.focus : COLORS.border.hover,
                },
                "&:has(input:focus-visible)": {
                    outline: `2px solid ${COLORS.border.focus}`,
                    outlineOffset: 2,
                },
            }}
        >
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: selected ? COLORS.surface.base : COLORS.surface.selected,
                    color: COLORS.text.primary,
                }}
            >
                <PlaceOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ ...TYPE.cardTitle, color: COLORS.text.primary }}>
                    {branch.name}
                </Typography>
                {branch.address && (
                    <Typography sx={{ ...TYPE.cardDescription, color: COLORS.text.subCaption }}>
                        {branch.address}
                    </Typography>
                )}
            </Box>
            {branch.distanceKm !== undefined && (
                <Typography
                    sx={{
                        flexShrink: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: COLORS.text.primary,
                    }}
                >
                    {branch.distanceKm.toFixed(1)} km away
                </Typography>
            )}

            <Radio
                value={branch.id}
                disableRipple
                slotProps={{ input: { "aria-label": branch.name } }}
                sx={{
                    p: 0,
                    color: COLORS.radio.idle,
                    "&.Mui-checked": { color: COLORS.radio.checked },
                }}
            />
        </Box>
    );
}
