import {Box, Typography} from "@mui/material";
import Image from "next/image";
import logo from "@/assets/images/logo.png";
import {COLORS} from "@/components/common/theme";
import {TYPE} from "@/components/common/typography";

/**
 * Logo and application title. `floating` pins it to the top-left corner (auth screens);
 * `bar` renders a full-width header with a bottom border (index and booking details screens).
 */
export default function BrandHeader({variant = "floating"}: { variant?: "floating" | "bar" }) {
    return (
        <Box
            component={variant === "bar" ? "header" : "div"}
            sx={
                variant === "bar"
                    ? {
                        display: "flex",
                        alignItems: "center",
                        columnGap: 2,
                        px: 3,
                        py: 1,
                        borderBottom: `1px solid ${COLORS.border.default}`,
                        backgroundColor: COLORS.surface.base,
                    }
                    : {position: "fixed", top: 16, left: 24, display: "flex", alignItems: "center", columnGap: 2}
            }
        >
            <Image alt="Logo" src={logo} width={70} height={70} priority/>
            <Typography sx={{...TYPE.header, color: COLORS.brand.header}}>
                Book Branch Appointment
            </Typography>
        </Box>
    );
}
