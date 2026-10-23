import {Box} from "@mui/material";
import CaptionSubCaption from "@/components/common/CaptionSubCaption";
import DateAndTimePicker from "@/components/date_and_time_selection/DateAndTimePicker";
import {MOCK_OPERATING_HOURS} from "@/components/date_and_time_selection/mockOperatingHours";
import {useState} from "react";

export default function DateAndTimeSelection() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const handleSelectionChange = (date: Date | null, time: string | null) => {
        setSelectedDate(date);
        setSelectedTime(time);

        console.log("Selected Date Object:", date);
        console.log("Selected Time String:", time);
    };

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            rowGap: 3,
            width: "100%",
            flex: 1,
            minHeight: 0,
            minWidth: 0,
        }}>
            <CaptionSubCaption
                caption="Choose a date and time"
                subCaption="Sandton City Branch - Open An Account"
            />

            <DateAndTimePicker operatingHours={MOCK_OPERATING_HOURS}
                               onDateTimeChange={handleSelectionChange}/>
        </Box>
    );
}