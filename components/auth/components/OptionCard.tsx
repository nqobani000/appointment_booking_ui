import {Box, Typography} from "@mui/material";
import PrimaryButton from "@/components/auth/components/PrimaryButton";
import {COLORS} from "@/components/common/theme";

export default function OptionCard({
                                       id,
                                       title,
                                       description,
                                       ariaLabel,
                                       onClick,
                                   }: {
    id: string;
    title: string;
    description: string;
    ariaLabel: string;
    onClick: () => void;
}) {
    return (
        <Box
            component="section"
            aria-labelledby={`${id}-title`}
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxSizing: "border-box",
                p: 3,
                borderRadius: "12px",
                border: "1.5px solid",
                borderColor: COLORS.border.default,
                backgroundColor: COLORS.surface.base,
            }}
        >
            <Typography
                id={`${id}-title`}
                component="h2"
                sx={{fontSize: 16, fontWeight: 600, color: COLORS.text.primary}}
            >
                {title}
            </Typography>
            <Typography sx={{mt: 0.5, fontSize: 14, color: COLORS.text.subCaption}}>
                {description}
            </Typography>

            <Box sx={{mt: "auto", pt: 3}}>
                <PrimaryButton compact ariaLabel={ariaLabel} onClick={onClick}>
                    Continue
                </PrimaryButton>
            </Box>
        </Box>
    );
}
