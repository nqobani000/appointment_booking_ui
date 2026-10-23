import {Box, Typography} from "@mui/material";
import {COLORS} from "@/components/common/theme";
import {TYPE} from "@/components/common/typography";

export default function CaptionSubCaption({
                                              caption,
                                              subCaption,
                                          }: {
    caption: string;
    subCaption: string;
}) {
    return (
        <Box>
            <Typography
                variant="h5"
                component="h1"
                sx={{...TYPE.heading, color: COLORS.text.primary}}
            >
                {caption}
            </Typography>
            <Typography
                variant="body2"
                sx={{...TYPE.subCaption, mt: 0.5, color: COLORS.text.subCaption}}
            >
                {subCaption}
            </Typography>
        </Box>
    );
}