"use client";

import * as React from "react";
import {Box} from "@mui/material";
import CaptionSubCaption from "@/components/common/CaptionSubCaption";
import ServiceOptionGroups, {ServiceOption} from "@/components/service_selection/ServiceOptionGroups";
import {toServiceGroups} from "@/components/service_selection/toServiceGroups";
import {useServices} from "@/hooks/queries/useServices";
import {useDebouncedValue} from "@/hooks/useDebouncedValue";
import {getErrorMessage} from "@/api/errors";
import {useAuth} from "@/components/auth/AuthContext";

export default function ServiceSelection({branchId, selectedService, onSelectService}: {
    branchId: string;
    selectedService: ServiceOption | null;
    onSelectService: (service: ServiceOption) => void;
}) {
    const {session} = useAuth();
    const [query, setQuery] = React.useState("");
    const [page, setPage] = React.useState(0);
    const search = useDebouncedValue(query);
    const servicesQuery = useServices({branchId, search, page});

    const groups = React.useMemo(
        () => (servicesQuery.data ? toServiceGroups(servicesQuery.data.content) : []),
        [servicesQuery.data],
    );

    const handleServiceChange = (serviceId: string) => {
        const service = groups.flatMap((group) => group.options).find((option) => option.id === serviceId);
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
                groups={groups}
                value={selectedService?.id ?? ""}
                onChange={handleServiceChange}
                query={query}
                onQueryChange={(next) => {
                    setQuery(next);
                    setPage(0);
                }}
                customerType={session?.customerType ?? "GUEST"}
                loading={servicesQuery.isFetching}
                errorMessage={servicesQuery.isError ? getErrorMessage(servicesQuery.error) : undefined}
                onRetry={() => void servicesQuery.refetch()}
                page={page}
                totalPages={servicesQuery.data?.totalPages ?? 0}
                onPageChange={setPage}
            />
        </Box>
    );
}
