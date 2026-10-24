"use client";

import {Box} from "@mui/material";
import CaptionSubCaption from "@/components/common/CaptionSubCaption";
import BranchSelector from "@/components/branch_selection/BranchSelector";
import {MOCK_BRANCHES} from "@/components/branch_selection/mockBranches";
import type {Branch} from "@/components/branch_selection/types";

export default function BranchSelection({selectedBranch, onSelectBranch}: {
    selectedBranch: Branch | null;
    onSelectBranch: (branch: Branch) => void;
}) {
    const handleBranchChange = (branchId: string) => {
        const branch = MOCK_BRANCHES.find((candidate) => candidate.id === branchId);
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
                branches={MOCK_BRANCHES}
                value={selectedBranch?.id ?? ""}
                onChange={handleBranchChange}
            />
        </Box>
    );
}
