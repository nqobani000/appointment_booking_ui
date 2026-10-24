import {Box} from "@mui/material";
import CaptionSubCaption from "@/components/common/CaptionSubCaption";
import DateAndTimePicker from "@/components/date_and_time_selection/DateAndTimePicker";
import {MOCK_OPERATING_HOURS} from "@/components/date_and_time_selection/mockOperatingHours";
import type {BookingSelection} from "@/components/appointment_booking/types";

export default function DateAndTimeSelection({selection, onSelectDateTime}: {
    selection: BookingSelection;
    onSelectDateTime: (date: Date | null, time: string | null) => void;
}) {
    const captionDetail = [selection.branch?.name, selection.service?.title].filter(Boolean).join(" - ");

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
                subCaption={captionDetail}
            />

            <DateAndTimePicker operatingHours={MOCK_OPERATING_HOURS}
                               initialDate={selection.date}
                               initialTime={selection.time}
                               onDateTimeChange={onSelectDateTime}/>
        </Box>
    );
}