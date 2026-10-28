"use client";

import * as React from "react";
import {Box} from "@mui/material";
import CaptionSubCaption from "@/components/common/CaptionSubCaption";
import PillToggle from "@/components/common/PillToggle";
import ServiceOptionGroups, {ServiceOption} from "@/components/service_selection/ServiceOptionGroups";
import {filterByCustomerType, toServiceGroups} from "@/components/service_selection/toServiceGroups";
import {useServices} from "@/hooks/queries/useServices";
import {useDebouncedValue} from "@/hooks/useDebouncedValue";
import {getErrorMessage} from "@/api/errors";
import {useAuth} from "@/components/auth/AuthContext";

type ServiceView = "available" | "all";

const VIEW_OPTIONS: { value: ServiceView; label: string }[] = [
    {value: "available", label: "Available to me"},
    {value: "all", label: "All services"},
];

const PAGE_SIZE = 20;
// The backend can only filter by search text, so the "available" view loads the whole catalogue in
// one request (its maximum page size) and filters by customer type here instead of paginating.
const FULL_CATALOGUE_SIZE = 100;

export default function ServiceSelection({branchId, selectedService, onSelectService}: {
    branchId: string;
    selectedService: ServiceOption | null;
    onSelectService: (service: ServiceOption) => void;
}) {
    const {session} = useAuth();
    const customerType = session?.customerType ?? "GUEST";
    const [view, setView] = React.useState<ServiceView>("available");
    const [query, setQuery] = React.useState("");
    const [page, setPage] = React.useState(0);
    const [blockedId, setBlockedId] = React.useState<string>();
    const search = useDebouncedValue(query);
    const showAll = view === "all";
    const servicesQuery = useServices(
        showAll
            ? {branchId, search, page, size: PAGE_SIZE}
            : {branchId, search, page: 0, size: FULL_CATALOGUE_SIZE},
    );

    const groups = React.useMemo(() => {
        const all = servicesQuery.data ? toServiceGroups(servicesQuery.data.content) : [];
        return showAll ? all : filterByCustomerType(all, customerType);
    }, [servicesQuery.data, showAll, customerType]);

    const handleServiceChange = (serviceId: string) => {
        const service = groups.flatMap((group) => group.options).find((option) => option.id === serviceId);
        setBlockedId(undefined);
        if (service) onSelectService(service);
    };

    const changeView = (next: ServiceView) => {
        setView(next);
        setPage(0);
        setBlockedId(undefined);
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
                action={<PillToggle ariaLabel="Which services to show" value={view} options={VIEW_OPTIONS}
                                    onChange={changeView}/>}
            />

            <ServiceOptionGroups
                groups={groups}
                value={selectedService?.id ?? ""}
                onChange={handleServiceChange}
                onBlockedSelect={setBlockedId}
                blockedId={blockedId}
                query={query}
                onQueryChange={(next) => {
                    setQuery(next);
                    setPage(0);
                    setBlockedId(undefined);
                }}
                customerType={customerType}
                availableOnly={!showAll}
                onShowAll={() => changeView("all")}
                loading={servicesQuery.isFetching}
                errorMessage={servicesQuery.isError ? getErrorMessage(servicesQuery.error) : undefined}
                onRetry={() => void servicesQuery.refetch()}
                page={page}
                totalPages={showAll ? (servicesQuery.data?.totalPages ?? 0) : 0}
                onPageChange={(next) => {
                    setPage(next);
                    setBlockedId(undefined);
                }}
            />
        </Box>
    );
}
