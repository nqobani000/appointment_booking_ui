"use client";

import * as React from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import {COLORS} from "@/components/common/theme";

export interface LogoutConfirmation {
    title: string;
    message: string;
    confirmLabel: string;
}

/** Logs out straight away, or after the user confirms when `confirm` is provided. */
export default function LogoutButton({
                                         onLogout,
                                         confirm,
                                         disabled = false,
                                     }: {
    onLogout: () => void;
    confirm?: LogoutConfirmation;
    disabled?: boolean;
}) {
    const [open, setOpen] = React.useState(false);

    const handleClick = () => (confirm ? setOpen(true) : onLogout());

    const handleConfirm = () => {
        setOpen(false);
        onLogout();
    };

    return (
        <>
            <Button
                variant="text"
                disableRipple
                disabled={disabled}
                onClick={handleClick}
                startIcon={<LogoutIcon sx={{fontSize: 18}}/>}
                sx={{
                    minHeight: 36,
                    px: 1.5,
                    fontSize: 14,
                    fontWeight: 600,
                    textTransform: "none",
                    color: COLORS.brand.link,
                    "&:hover": {backgroundColor: COLORS.brand.linkHoverBg},
                    "&.Mui-focusVisible, &:focus-visible": {outline: `2px solid ${COLORS.border.focus}`, outlineOffset: 2},
                    "&.Mui-disabled": {color: COLORS.text.muted},
                }}
            >
                Log out
            </Button>

            {confirm && (
                <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                    aria-labelledby="logout-dialog-title"
                    aria-describedby="logout-dialog-description"
                >
                    <DialogTitle id="logout-dialog-title" sx={{color: COLORS.text.primary, fontWeight: 700}}>
                        {confirm.title}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="logout-dialog-description" sx={{color: COLORS.text.subCaption}}>
                            {confirm.message}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{px: 3, pb: 2}}>
                        <Button
                            onClick={() => setOpen(false)}
                            autoFocus
                            disableRipple
                            sx={{textTransform: "none", fontWeight: 600, color: COLORS.brand.link}}
                        >
                            Stay
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            variant="contained"
                            disableElevation
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "50px",
                                px: 3,
                                color: COLORS.text.inverse,
                                backgroundColor: COLORS.brand.button,
                                "&:hover": {backgroundColor: COLORS.brand.buttonHover},
                            }}
                        >
                            {confirm.confirmLabel}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
}
