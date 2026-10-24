"use client";

import {Box} from "@mui/material";
import {useState} from "react";
import CaptionSubCaption from "@/components/common/CaptionSubCaption";
import BranchSelector from "@/components/branch_selection/BranchSelector";
import {MOCK_BRANCHES} from "@/components/branch_selection/mockBranches";

export default function BranchSelection() {
    const [branchId, setBranchId] = useState("");

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
                value={branchId}
                onChange={setBranchId}
            />
        </Box>
    );
}
