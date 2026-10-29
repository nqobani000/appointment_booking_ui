"use client";

import logo from "@/assets/images/logo.png";
import Image from "next/image";
import {Alert, Box, Button, Typography} from "@mui/material";
import BookingStepper from "@/components/booking_stepper/BookingStepper";
import {useCallback, useEffect, useState} from "react";
import ServiceSelection from "../service_selection/ServiceSelection";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {COLORS} from "@/components/common/theme";
import {TYPE} from "@/components/common/typography";
import DateAndTimeSelection from "@/components/date_and_time_selection/DateAndTimeSelection";
import BranchSelection from "@/components/branch_selection/BranchSelection";
import BookingConfirmation from "@/components/booking_confirmation/BookingConfirmation";
import {useAuth} from "@/components/auth/AuthContext";
import LogoutButton from "@/components/auth/LogoutButton";
import {getDisplayName} from "@/components/auth/session";
import AppointmentConfirmed from "@/components/booking_confirmation/AppointmentConfirmed";
import {ReservationSessionProvider, useReservationSession} from "@/components/appointment_booking/ReservationSession";
import {useConfirmReservation, useCreateReservation, useReleaseReservation} from "@/hooks/mutations/useReservationMutations";
import {selectionFromReservation} from "@/components/appointment_booking/resumeFromReservation";
import {useReservationCountdown} from "@/hooks/useReservationCountdown";
import {getErrorMessage, isApiError} from "@/api/errors";
import {releaseReservation} from "@/api/reservations";
import {toStartAt} from "@/lib/datetime";
import type {Appointment} from "@/api/types/reservations";
import {
    BookingSelection,
    EMPTY_BOOKING_SELECTION,
    isBookingComplete,
    isStepComplete,
} from "@/components/appointment_booking/types";

const LAST_STEP = 3;

export default function AppointmentBooking() {
    return (
        <ReservationSessionProvider>
            <BookingFlow/>
        </ReservationSessionProvider>
    );
}

function BookingFlow() {
    const {session, signOut} = useAuth();
    const reservationSession = useReservationSession();
    const {reservation, getReservationToken, clear: clearReservation} = reservationSession;
    // A held reservation restored from sessionStorage resumes at the review step.
    const [step, setStep] = useState(reservation ? LAST_STEP : 0);
    const [selection, setSelection] = useState<BookingSelection>(
        reservation ? selectionFromReservation(reservation) : EMPTY_BOOKING_SELECTION,
    );
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const createReservation = useCreateReservation();
    const releaseHeldReservation = useReleaseReservation();
    const confirmReservation = useConfirmReservation();
    const busy = createReservation.isPending || confirmReservation.isPending || releaseHeldReservation.isPending;

    const {secondsLeft, expired} = useReservationCountdown(reservation?.expiresAt ?? null);

    const updateSelection = (changes: Partial<BookingSelection>) => {
        setNotice(null);
        setSelection((current) => ({...current, ...changes}));
    };

    const selectBranch = (branch: BookingSelection["branch"]) =>
        setSelection((current) =>
            current.branch?.id === branch?.id
                ? current
                : {...current, branch, service: null, date: null, time: null});

    const handleFailure = (error: unknown, fallbackStep?: number) => {
        if (isApiError(error) && error.kind === "unauthorized") {
            signOut();
            return;
        }
        setNotice(getErrorMessage(error));
        if (fallbackStep !== undefined && isApiError(error) && ["expired", "conflict", "notFound"].includes(error.kind)) {
            setStep(fallbackStep);
        }
    };

    // The countdown is only a UX aid; reaching zero does not imply the server released anything.
    const expiresAt = reservation?.expiresAt;
    useEffect(() => {
        if (!expiresAt) return;
        const timer = setTimeout(() => {
            clearReservation();
            setNotice("Your reservation has expired. Please choose a new time.");
            setStep(2);
        }, Math.max(new Date(expiresAt).getTime() - Date.now(), 0));
        return () => clearTimeout(timer);
    }, [expiresAt, clearReservation]);

    // Best-effort release (keepalive survives a tab close or the sign-out that follows); backend expiry is the fallback.
    const accessToken = session?.accessToken;
    const releaseInBackground = useCallback(() => {
        const token = getReservationToken();
        if (token && accessToken && reservation) {
            void releaseReservation(reservation.reservationId, {accessToken, reservationToken: token}, {keepalive: true}).catch(() => undefined);
        }
    }, [reservation, accessToken, getReservationToken]);

    useEffect(() => {
        window.addEventListener("pagehide", releaseInBackground);
        return () => window.removeEventListener("pagehide", releaseInBackground);
    }, [releaseInBackground]);

    const logOut = () => {
        releaseInBackground();
        signOut();
    };

    const reserveSlot = () => {
        if (!isBookingComplete(selection)) return;
        setNotice(null);
        createReservation.mutate(
            {
                branchId: selection.branch.id,
                serviceId: selection.service.id,
                startAt: toStartAt(selection.date, selection.time),
            },
            {
                onSuccess: () => setStep(LAST_STEP),
                onError: (error) => {
                    if (isApiError(error) && error.kind === "network") {
                        setNotice("We couldn't confirm whether your time was held. Check your connection and try again; any hold expires automatically.");
                        return;
                    }
                    handleFailure(error);
                },
            },
        );
    };

    const confirmBooking = () => {
        setNotice(null);
        confirmReservation.mutate(undefined, {
            onSuccess: ({appointment: confirmed}) => setAppointment(confirmed),
            onError: (error) => handleFailure(error, 2),
        });
    };

    const handleNext = () => {
        if (busy) return;
        if (step === 2) {
            reserveSlot();
            return;
        }
        if (step === LAST_STEP) {
            confirmBooking();
            return;
        }
        setStep((current) => current + 1);
    };

    const handleBack = () => {
        if (busy) return;
        if (step === LAST_STEP) releaseHeldReservation.mutate();
        setNotice(null);
        setStep((prev) => Math.max(prev - 1, 0));
    };

    const startOver = () => {
        clearReservation();
        setAppointment(null);
        setSelection(EMPTY_BOOKING_SELECTION);
        setNotice(null);
        setStep(0);
    };

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
                    {session && (
                        <Box sx={{display: "flex", alignItems: "center", columnGap: 1, marginLeft: "auto"}}>
                            <Typography sx={{...TYPE.cardDescription, color: COLORS.text.muted}}>
                                {getDisplayName(session)}
                            </Typography>
                            <LogoutButton
                                onLogout={logOut}
                                disabled={busy}
                                confirm={reservation ? {
                                    title: "Log out?",
                                    message: "You'll lose your held time slot. We'll release it and log you out.",
                                    confirmLabel: "Release and log out",
                                } : undefined}
                            />
                        </Box>
                    )}
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
                    {notice && !appointment && (
                        <Alert severity="warning" role="alert" sx={{marginBottom: 2}}>{notice}</Alert>
                    )}
                    {appointment && <AppointmentConfirmed appointment={appointment} onBookAnother={startOver}/>}
                    {!appointment && step === 0 && (
                        <BranchSelection
                            selectedBranch={selection.branch}
                            onSelectBranch={selectBranch}
                        />
                    )}
                    {!appointment && step === 1 && selection.branch && (
                        <ServiceSelection
                            branchId={selection.branch.id}
                            selectedService={selection.service}
                            onSelectService={(service) => updateSelection({service})}
                        />
                    )}
                    {!appointment && step === 2 && (
                        <DateAndTimeSelection
                            selection={selection}
                            onSelectDateTime={(date, time) => updateSelection({date, time})}
                        />
                    )}
                    {!appointment && step === LAST_STEP && isBookingComplete(selection) && reservation && (
                        <BookingConfirmation
                            selection={selection}
                            reservation={reservation}
                            secondsLeft={secondsLeft}
                            onAgreementChange={(agreedToNotifications) => updateSelection({agreedToNotifications})}
                        />
                    )}
                </Box>
            </Box>

            {!appointment && <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2}}>
                <Button
                    onClick={handleBack}
                    disabled={busy}
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
                    onClick={handleNext}
                    disabled={!isStepComplete(step, selection) || busy || (step === LAST_STEP && (!reservation || expired))}
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
                        "&.Mui-disabled": {
                            backgroundColor: COLORS.border.default,
                            color: COLORS.text.muted,
                        },
                    }}
                >
                    {confirmReservation.isPending ? "Confirming…" : createReservation.isPending ? "Holding your slot…" : step === LAST_STEP ? "Confirm Booking" : "Next"}
                </Button>
            </Box>}
        </Box>
    );
}
