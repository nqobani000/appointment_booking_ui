"use client";

import {useState} from "react";
import {Box} from "@mui/material";
import CaptionSubCaption from "@/components/common/CaptionSubCaption";
import ServiceOptionGroups from "@/components/service_selection/ServiceOptionGroups";
import {MOCK_GROUPS} from "@/components/service_selection/mockServiceGroups";

export default function ServiceSelection() {
    const [serviceId, setServiceId] = useState("");

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            rowGap: 3,
            width: "100%",
        }}>
            <CaptionSubCaption
                caption="What can we help you with?"
                subCaption="Choose the service you need at the branch."
            />

            <ServiceOptionGroups
                groups={MOCK_GROUPS}
                value={serviceId}
                onChange={setServiceId}
            />
        </Box>
    );
}