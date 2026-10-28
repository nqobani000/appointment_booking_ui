import * as React from "react";
import { Box, RadioGroup, Typography } from "@mui/material";
import SearchField from "@/components/common/SearchField";
import Pager from "@/components/common/Pager";
import BranchCard from "@/components/branch_selection/BranchCard";
import UseLocationButton from "@/components/branch_selection/UseLocationButton";
import type { Branch } from "@/components/branch_selection/types";
import { COLORS } from "@/components/common/theme";
import { TYPE } from "@/components/common/typography";

export default function BranchSelector({
                                           branches,
                                           query,
                                           onQueryChange,
                                           value,
                                           onChange,
                                           onUseLocation,
                                           locating = false,
                                           locationMessage,
                                           usingLocation = false,
                                           loading = false,
                                           errorMessage,
                                           onRetry,
                                           page,
                                           totalPages,
                                           totalElements,
                                           onPageChange,
                                       }: {
    branches: Branch[];
    query: string;
    onQueryChange: (query: string) => void;
    value?: string;
    onChange?: (branchId: string) => void;
    onUseLocation?: () => void;
    locating?: boolean;
    locationMessage?: string;
    usingLocation?: boolean;
    loading?: boolean;
    errorMessage?: string;
    onRetry?: () => void;
    page: number;
    totalPages: number;
    totalElements: number;
    onPageChange: (page: number) => void;
}) {
    const handleChange = (_: React.ChangeEvent<HTMLInputElement>, id: string) => onChange?.(id);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <SearchField
                value={query}
                onChange={onQueryChange}
                placeholder="Search branch, city or suburb"
            />

            <UseLocationButton onClick={onUseLocation} loading={locating} />
            {locationMessage && (
                <Typography role="status" sx={{ fontSize: 13, color: COLORS.text.subCaption }}>
                    {locationMessage}
                </Typography>
            )}

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
                    {query.trim() ? "Search results" : usingLocation ? "Nearest to you" : "Branches"}
                </Typography>
                <Typography
                    sx={{ fontSize: 12, color: COLORS.text.subCaption }}
                    aria-live="polite"
                >
                    {totalElements} {totalElements === 1 ? "branch" : "branches"}
                </Typography>
            </Box>

            {errorMessage ? (
                <Box role="alert" sx={{ py: 3, display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography sx={{ fontSize: 14, color: COLORS.text.subCaption }}>{errorMessage}</Typography>
                    {onRetry && (
                        <Typography component="button" type="button" onClick={onRetry}
                                    sx={{ alignSelf: "flex-start", background: "none", border: 0, p: 0, cursor: "pointer", fontSize: 14, fontWeight: 600, color: COLORS.brand.link }}>
                            Try again
                        </Typography>
                    )}
                </Box>
            ) : loading && branches.length === 0 ? (
                <Typography sx={{ py: 3, fontSize: 14, color: COLORS.text.subCaption }} role="status">
                    Loading branches…
                </Typography>
            ) : branches.length > 0 ? (
                <>
                    <RadioGroup value={value ?? ""} onChange={handleChange}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, opacity: loading ? 0.6 : 1 }}>
                            {branches.map((branch) => (
                                <BranchCard
                                    key={branch.id}
                                    branch={branch}
                                    selected={value === branch.id}
                                />
                            ))}
                        </Box>
                    </RadioGroup>
                    <Pager page={page} totalPages={totalPages} onChange={onPageChange} disabled={loading} />
                </>
            ) : (
                <Typography sx={{ py: 3, fontSize: 14, color: COLORS.text.subCaption }}>
                    {query.trim()
                        ? `No branches match “${query.trim()}”. Try a different city or suburb.`
                        : "No branches are available right now."}
                </Typography>
            )}
        </Box>
    );
}
