"use client";

import {Box} from "@mui/material";
import CaptionSubCaption from "@/components/common/CaptionSubCaption";
import ServiceOptionGroups, {ServiceOption} from "@/components/service_selection/ServiceOptionGroups";
import {MOCK_GROUPS} from "@/components/service_selection/mockServiceGroups";

export default function ServiceSelection({selectedService, onSelectService}: {
    selectedService: ServiceOption | null;
    onSelectService: (service: ServiceOption) => void;
}) {
    const handleServiceChange = (serviceId: string) => {
        const service = MOCK_GROUPS
            .flatMap((group) => group.options)
            .find((option) => option.id === serviceId);
        if (service) onSelectService(service);
    };

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
                value={selectedService?.id ?? ""}
                onChange={handleServiceChange}
            />
        </Box>
    );
}