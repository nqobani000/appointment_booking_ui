"use client";

import logo from "@/assets/images/logo.png";
import Image from "next/image";
import {Box, Button, Typography} from "@mui/material";
import BookingStepper from "@/components/booking_stepper/BookingStepper";
import {useState} from "react";
import ServiceSelection from "../service_selection/ServiceSelection";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {COLORS} from "@/components/common/theme";
import {TYPE} from "@/components/common/typography";
import DateAndTimeSelection from "@/components/date_and_time_selection/DateAndTimeSelection";
import BranchSelection from "@/components/branch_selection/BranchSelection";
import BookingConfirmation from "@/components/booking_confirmation/BookingConfirmation";

export default function AppointmentBooking() {
    const [step, setStep] = useState(0);

    return (
        <Box sx={{
            width: "60vw",
            margin: "3rem auto",
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                rowGap: 2,
                width: "100%",
                height: "80vh",
                boxSizing: "border-box",
                border: `1px solid ${COLORS.border.container}`,
                padding: 2,
                borderRadius: 2
            }}
            >
                <Box sx={{display: "flex", flexDirection: "row", columnGap: 2, alignItems: "center"}}>
                    <Image alt={"Logo"} src={logo} width={70} height={70}/>
                    <Typography sx={{...TYPE.header, color: COLORS.brand.header}}>
                        Book Branch Appointment
                    </Typography>
                </Box>
                <BookingStepper activeStep={step}/>

                <Box
                    id={"step-content"}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        minHeight: 0,
                        marginTop: 2,
                        width: "100%",
                        minWidth: 0,
                        boxSizing: "border-box",
                        padding: 3,
                        overflowY: "auto",
                        border: `1px solid ${COLORS.border.container}`,
                        borderRadius: 2
                    }}
                >
                    {step === 0 && (
                        <BranchSelection/>
                    )}
                    {step === 1 && (
                        <ServiceSelection/>
                    )}
                    {step === 2 && (
                        <DateAndTimeSelection/>
                    )}
                    {step === 3 && (
                        <BookingConfirmation/>
                    )}
                </Box>
            </Box>

            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2}}>
                <Button
                    onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
                    startIcon={<ChevronLeftIcon sx={{fontSize: 20}}/>}
                    disableRipple
                    sx={{
                        color: COLORS.brand.link,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "15px",
                        padding: "8px 16px",
                        "&:hover": {
                            backgroundColor: COLORS.brand.linkHoverBg,
                        },
                    }}
                >
                    Back
                </Button>

                <Button
                    variant="contained"
                    disableElevation
                    onClick={() => setStep((prev) => Math.min(prev + 1, 3))}
                    sx={{
                        backgroundColor: COLORS.brand.button,
                        color: COLORS.text.inverse,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "15px",
                        borderRadius: "50px",
                        padding: "10px 40px",
                        "&:hover": {
                            backgroundColor: COLORS.brand.buttonHover,
                        },
                    }}
                >
                    {step === 3 ? "Confirm Booking" : "Next"}
                </Button>
            </Box>
        </Box>
    );
}