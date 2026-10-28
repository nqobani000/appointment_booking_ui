"use client";

import * as React from "react";
import {Box} from "@mui/material";
import CaptionSubCaption from "@/components/common/CaptionSubCaption";
import BranchSelector from "@/components/branch_selection/BranchSelector";
import {toBranch} from "@/components/branch_selection/types";
import type {Branch} from "@/components/branch_selection/types";
import {useBranches} from "@/hooks/queries/useBranches";
import {useDebouncedValue} from "@/hooks/useDebouncedValue";
import {GEOLOCATION_MESSAGES, useGeolocation} from "@/hooks/useGeolocation";
import {getErrorMessage} from "@/api/errors";

export default function BranchSelection({selectedBranch, onSelectBranch}: {
    selectedBranch: Branch | null;
    onSelectBranch: (branch: Branch) => void;
}) {
    const [query, setQuery] = React.useState("");
    const [page, setPage] = React.useState(0);
    const search = useDebouncedValue(query);
    const geo = useGeolocation();

    const branchesQuery = useBranches({search, page, ...geo.coordinates});
    const branches = React.useMemo(() => branchesQuery.data?.content.map(toBranch) ?? [], [branchesQuery.data]);

    const handleQueryChange = (next: string) => {
        setQuery(next);
        setPage(0);
    };

    const handleUseLocation = () => {
        setPage(0);
        geo.locate();
    };

    const handleBranchChange = (branchId: string) => {
        const branch = branches.find((candidate) => candidate.id === branchId);
        if (branch) onSelectBranch(branch);
    };

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            rowGap: 3,
            width: "100%",
        }}>
            <CaptionSubCaption
                caption="Find a branch"
                subCaption="Search by city, suburb, or use your location to find the nearest branch."
            />

            <BranchSelector
                branches={branches}
                query={query}
                onQueryChange={handleQueryChange}
                value={selectedBranch?.id ?? ""}
                onChange={handleBranchChange}
                onUseLocation={handleUseLocation}
                locating={geo.status === "locating"}
                locationMessage={GEOLOCATION_MESSAGES[geo.status]}
                usingLocation={geo.coordinates !== null}
                loading={branchesQuery.isFetching}
                errorMessage={branchesQuery.isError ? getErrorMessage(branchesQuery.error) : undefined}
                onRetry={() => void branchesQuery.refetch()}
                page={page}
                totalPages={branchesQuery.data?.totalPages ?? 0}
                totalElements={branchesQuery.data?.totalElements ?? 0}
                onPageChange={setPage}
            />
        </Box>
    );
}
