import type {ReactNode} from "react";
import {Box, Typography} from "@mui/material";
import {COLORS} from "@/components/common/theme";
import {TYPE} from "@/components/common/typography";

export default function CaptionSubCaption({
                                              caption,
                                              subCaption,
                                              action,
                                          }: {
    caption: string;
    subCaption: string;
    /** Optional control shown at the far right of the title row. */
    action?: ReactNode;
}) {
    return (
        <Box>
            <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", columnGap: 2, rowGap: 1}}>
                <Typography
                    variant="h5"
                    component="h1"
                    sx={{...TYPE.heading, color: COLORS.text.primary}}
                >
                    {caption}
                </Typography>
                {action && <Box sx={{ml: "auto"}}>{action}</Box>}
            </Box>
            <Typography
                variant="body2"
                sx={{...TYPE.subCaption, mt: 0.5, color: COLORS.text.subCaption}}
            >
                {subCaption}
            </Typography>
        </Box>
    );
}