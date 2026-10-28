"use client";

import * as React from "react";
import {Box, Button, Typography} from "@mui/material";
import BrandHeader from "@/components/auth/components/BrandHeader";
import {CENTERED_MIN_HEIGHT} from "@/components/auth/constants";
import {COLORS} from "@/components/common/theme";

export default function ScreenShell({
                                        title,
                                        subtitle,
                                        onBack,
                                        focusHeading = true,
                                        centered = false,
                                        maxWidth = 520,
                                        gap = 3,
                                        children,
                                    }: {
    title: string;
    subtitle?: React.ReactNode;
    onBack?: () => void;
    focusHeading?: boolean;
    centered?: boolean;
    maxWidth?: number;
    gap?: number;
    children?: React.ReactNode;
}) {
    const headingRef = React.useRef<HTMLHeadingElement>(null);
    React.useEffect(() => {
        if (focusHeading) headingRef.current?.focus();
    }, [focusHeading]);

    const content = (
        <>
            <BrandHeader/>
            <Box
                sx={{
                    width: "100%",
                    maxWidth,
                    mx: "auto",
                    px: 3,
                    py: 4,
                    backgroundColor: COLORS.surface.base,
                    display: "flex",
                    flexDirection: "column",
                    gap,
                }}
            >
                {onBack && (
                    <Button
                        variant="text"
                        disableRipple
                        onClick={onBack}
                        sx={{
                            alignSelf: "flex-start",
                            ml: -1,
                            px: 1,
                            minHeight: 40,
                            fontSize: 14,
                            fontWeight: 600,
                            textTransform: "none",
                            color: COLORS.brand.link,
                            "&:hover": {backgroundColor: COLORS.brand.linkHoverBg},
                        }}
                    >
                        Back
                    </Button>
                )}

                <Box sx={{textAlign: "center", display: "flex", flexDirection: "column", gap: 1}}>
                    <Typography
                        ref={headingRef}
                        component="h1"
                        tabIndex={-1}
                        sx={{
                            fontSize: 24,
                            fontWeight: 700,
                            lineHeight: 1.3,
                            color: COLORS.text.primary,
                            outline: "none",
                        }}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography
                            component="div"
                            sx={{fontSize: 14, lineHeight: 1.5, color: COLORS.text.subCaption}}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                {children}
            </Box>
        </>
    );

    if (!centered) return content;

    return (
        <Box
            sx={{
                minHeight: CENTERED_MIN_HEIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: COLORS.surface.base,
            }}
        >
            {content}
        </Box>
    );
}
