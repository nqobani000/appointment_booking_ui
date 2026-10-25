import * as React from "react";
import {Typography} from "@mui/material";
import {ERROR_COLOR} from "@/components/auth/constants";

export default function FormError({children}: { children: React.ReactNode }) {
    return (
        <Typography
            role="alert"
            sx={{fontSize: 13, fontWeight: 600, color: ERROR_COLOR, textAlign: "center"}}
        >
            {children}
        </Typography>
    );
}
