import React, { useState, useMemo } from "react";
import { Box, Typography, IconButton, Button, Grid } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { COLORS } from "../common/theme";

interface OperatingHour {
    day: number;
    hours: {
        opens: string;
        closes: string;
    };
}

interface DateAndTimePickerProps {
    operatingHours: OperatingHour[];
    onDateTimeChange?: (date: Date | null, time: string | null) => void;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DateAndTimePicker({ operatingHours, onDateTimeChange }: DateAndTimePickerProps) {
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const [currentMonthDate, setCurrentMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const handlePrevMonth = () => {
        setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null);
        if (onDateTimeChange) onDateTimeChange(date, null);
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        if (onDateTimeChange) onDateTimeChange(selectedDate, time);
    };

    const calendarDays = useMemo(() => {
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const startingDayIso = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        const days = [];
        for (let i = 0; i < startingDayIso; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    }, [currentMonthDate]);

    const availableTimes = useMemo(() => {
        if (!selectedDate) return [];

        const jsDay = selectedDate.getDay();
        const isoDay = jsDay === 0 ? 7 : jsDay;
        const dayHours = operatingHours.find((h) => h.day === isoDay);

        if (!dayHours) return [];

        const slots = [];
        const [openHour, openMin] = dayHours.hours.opens.split(":").map(Number);
        const [closeHour, closeMin] = dayHours.hours.closes.split(":").map(Number);

        let currentHour = openHour;
        let currentMin = openMin;

        const now = new Date();
        const isToday = selectedDate.getTime() === today.getTime();

        while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
            const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`;

            let isPastTime = false;
            if (isToday) {
                const slotTime = new Date(selectedDate);
                slotTime.setHours(currentHour, currentMin, 0, 0);
                if (slotTime < now) {
                    isPastTime = true;
                }
            }

            slots.push({ time: timeString, disabled: isPastTime });

            currentMin += 30;
            if (currentMin >= 60) {
                currentMin -= 60;
                currentHour += 1;
            }
        }

        return slots;
    }, [selectedDate, operatingHours, today]);

    const formatDateString = (date: Date) => {
        return `${DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
    };

    return (
        <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "minmax(0, 1.4fr) minmax(0, 1fr)" },
            gap: 2,
            width: "100%",
            flex: 1,
            minHeight: 0,
            minWidth: 0,
        }}>
            <Box
                sx={{
                    border: `1px solid ${COLORS.border.default}`,
                    borderRadius: 2,
                    p: 2,
                    minWidth: 0,
                    minHeight: 0,
                    boxSizing: "border-box",
                    overflow: "hidden",
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <IconButton onClick={handlePrevMonth} size="small" sx={{ color: COLORS.brand.button }}>
                        <ChevronLeftIcon />
                    </IconButton>
                    <Typography sx={{ fontWeight: 600, color: COLORS.brand.header, fontSize: 15 }}>
                        {MONTHS[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                    </Typography>
                    <IconButton onClick={handleNextMonth} size="small" sx={{ color: COLORS.brand.button }}>
                        <ChevronRightIcon />
                    </IconButton>
                </Box>

                <Grid container columns={7} spacing={0.5} sx={{ mb: 1 }}>
                    {DAYS.map((day) => (
                        <Grid size={1} key={day} sx={{ textAlign: "center" }}>
                            <Typography sx={{ fontSize: 12, color: COLORS.text.subCaption, fontWeight: 500 }}>
                                {day}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>

                <Grid container columns={7} spacing={0.5}>
                    {calendarDays.map((date, index) => {
                        if (!date) {
                            return <Grid size={1} key={`empty_${index}`} />;
                        }

                        const isPast = date < today;
                        const isSelected = selectedDate?.getTime() === date.getTime();

                        return (
                            <Grid size={1} key={date.toISOString()} sx={{ display: "flex", justifyContent: "center" }}>
                                <Box
                                    onClick={() => !isPast && handleDateSelect(date)}
                                    sx={{
                                        width: "100%",
                                        maxWidth: 34,
                                        aspectRatio: "1",
                                        fontSize: 13,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "50%",
                                        cursor: isPast ? "default" : "pointer",
                                        backgroundColor: isSelected ? COLORS.brand.button : "transparent",
                                        color: isPast
                                            ? COLORS.text.muted
                                            : isSelected
                                                ? COLORS.text.inverse
                                                : COLORS.text.primary,
                                        fontWeight: isSelected ? 600 : 400,
                                        opacity: isPast ? 0.4 : 1,
                                        "&:hover": {
                                            backgroundColor: !isPast && !isSelected ? COLORS.surface.selected : isSelected ? COLORS.brand.button : "transparent",
                                        },
                                    }}
                                >
                                    {date.getDate()}
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>

                <Box sx={{ display: "flex", gap: 3, mt: 2, alignItems: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: COLORS.brand.button }} />
                        <Typography sx={{ fontSize: 12, color: COLORS.text.subCaption }}>Selected date</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: COLORS.border.default }} />
                        <Typography sx={{ fontSize: 12, color: COLORS.text.subCaption }}>Unavailable</Typography>
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    border: `1px solid ${COLORS.border.default}`,
                    borderRadius: 2,
                    p: 2,
                    minWidth: 0,
                    minHeight: 0,
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <Box sx={{ flexShrink: 0 }}>
                    <Typography sx={{ fontWeight: 600, color: COLORS.brand.header, fontSize: 18, mb: 1 }}>
                        Available times
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: COLORS.text.subCaption, mb: 2, minHeight: 21 }}>
                        {selectedDate ? formatDateString(selectedDate) : "Select a date to view times"}
                    </Typography>
                </Box>

                <Box sx={{ overflowY: "auto", flex: 1, minHeight: 0, pr: 1, pb: 1 }}>
                    <Grid container spacing={1} sx={{ alignContent: "flex-start" }}>
                        {availableTimes.map((slot) => (
                            <Grid size={6} key={slot.time}>
                                <Button
                                    fullWidth
                                    variant={selectedTime === slot.time ? "contained" : "outlined"}
                                    disabled={slot.disabled}
                                    onClick={() => handleTimeSelect(slot.time)}
                                    sx={{
                                        py: 0.75,
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontSize: 14,
                                        fontWeight: selectedTime === slot.time ? 600 : 400,
                                        backgroundColor: selectedTime === slot.time ? COLORS.brand.button : "transparent",
                                        borderColor: selectedTime === slot.time ? COLORS.brand.button : COLORS.border.default,
                                        color: selectedTime === slot.time ? COLORS.text.inverse : COLORS.text.primary,
                                        "&:hover": {
                                            backgroundColor: selectedTime === slot.time ? COLORS.brand.buttonHover : COLORS.surface.selected,
                                            borderColor: selectedTime === slot.time ? COLORS.brand.buttonHover : COLORS.border.focus,
                                        },
                                        "&.Mui-disabled": {
                                            borderColor: COLORS.border.default,
                                            color: COLORS.text.muted,
                                            opacity: 0.5,
                                        }
                                    }}
                                >
                                    {slot.time}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <Box sx={{ flexShrink: 0, display: "flex", alignItems: "flex-start", gap: 1, mt: 2, pt: 2, borderTop: `1px solid ${COLORS.border.default}` }}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: COLORS.text.subCaption, mt: 0.5 }} />
                    <Typography sx={{ fontSize: 13, color: COLORS.text.subCaption, lineHeight: 1.4 }}>
                        Times are shown in South African Standard Time (SAST).
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}