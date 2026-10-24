import * as React from "react";
import { Box, RadioGroup, Typography } from "@mui/material";
import SearchField from "@/components/common/SearchField";
import BranchCard from "@/components/branch_selection/BranchCard";
import UseLocationButton from "@/components/branch_selection/UseLocationButton";
import type { Branch } from "@/components/branch_selection/types";
import { COLORS } from "@/components/common/theme";
import { TYPE } from "@/components/common/typography";

export default function BranchSelector({
                                           branches = [],
                                           value,
                                           onChange,
                                           onUseLocation,
                                       }: {
    branches?: Branch[];
    value?: string;
    onChange?: (branchId: string) => void;
    onUseLocation?: () => void;
}) {
    const [query, setQuery] = React.useState("");
    const [internal, setInternal] = React.useState("");
    const selected = value ?? internal;

    const results = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return branches;
        return branches.filter(
            (b) =>
                b.name.toLowerCase().includes(q) || b.suburb.toLowerCase().includes(q)
        );
    }, [branches, query]);

    const handleChange = (_: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setInternal(id);
        onChange?.(id);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <SearchField
                value={query}
                onChange={setQuery}
                placeholder="Search branch, city or suburb"
            />

            <UseLocationButton onClick={onUseLocation} />

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    borderTop: `1px solid ${COLORS.border.default}`,
                    pt: 2,
                }}
            >
                <Typography
                    component="h2"
                    sx={{ ...TYPE.categoryLabel, color: COLORS.text.category }}
                >
                    {query.trim() ? "Search results" : "Nearest to you"}
                </Typography>
                <Typography
                    sx={{ fontSize: 12, color: COLORS.text.subCaption }}
                    aria-live="polite"
                >
                    {results.length} {results.length === 1 ? "branch" : "branches"}
                </Typography>
            </Box>

            {results.length > 0 ? (
                <RadioGroup value={selected} onChange={handleChange}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                        {results.map((branch) => (
                            <BranchCard
                                key={branch.id}
                                branch={branch}
                                selected={selected === branch.id}
                            />
                        ))}
                    </Box>
                </RadioGroup>
            ) : (
                <Typography sx={{ py: 3, fontSize: 14, color: COLORS.text.subCaption }}>
                    No branches match &ldquo;{query.trim()}&rdquo;. Try a different city or suburb.
                </Typography>
            )}
        </Box>
    );
}
