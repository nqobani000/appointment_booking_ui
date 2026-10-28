import * as React from "react";
import { Box, Button, Radio, RadioGroup, Typography } from "@mui/material";
import type {CustomerType} from "@/api/types/common";
import {ERROR_COLOR} from "@/components/auth/constants";
import Pager from "@/components/common/Pager";
import SearchField from "@/components/common/SearchField";
import {COLORS} from "@/components/common/theme";
import {TYPE} from "@/components/common/typography";

export interface ServiceOption {
    id: string;
    title: string;
    description: string;
    availableTo: CustomerType[];
}

export interface ServiceGroup {
    id: string;
    title: string;
    options: ServiceOption[];
}

export const SERVICE_NOT_AVAILABLE_MESSAGE =
    "This service is not available to you. Contact customer services for more information.";

function OptionCard({
                        option,
                        selected,
                        eligible,
                        blocked,
                    }: {
    option: ServiceOption;
    selected: boolean;
    eligible: boolean;
    blocked: boolean;
}) {
    const messageId = `${option.id}-unavailable`;
    return (
        <Box
            component="label"
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 3,
                py: 2,
                cursor: "pointer",
                opacity: eligible ? 1 : 0.7,
                borderRadius: "12px",
                border: "1.5px solid",
                borderColor: selected ? COLORS.border.focus : COLORS.border.default,
                backgroundColor: selected ? COLORS.surface.selected : COLORS.surface.base,
                transition: "background-color .15s, border-color .15s",
                "&:hover": {
                    borderColor: selected ? COLORS.border.focus : COLORS.radio.idle,
                },
                "&:has(input:focus-visible)": {
                    outline: `2px solid ${COLORS.border.focus}`,
                    outlineOffset: 2,
                },
            }}
        >
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    sx={{ ...TYPE.cardTitle, color: COLORS.text.primary }}
                >
                    {option.title}
                </Typography>
                {option.description && (
                    <Typography
                        sx={{ ...TYPE.cardDescription, mt: 0.25, color: COLORS.text.muted }}
                    >
                        {option.description}
                    </Typography>
                )}
                {blocked && (
                    <Typography id={messageId} role="alert"
                                sx={{ fontSize: 13, fontWeight: 600, mt: 0.75, color: ERROR_COLOR }}>
                        {SERVICE_NOT_AVAILABLE_MESSAGE}
                    </Typography>
                )}
            </Box>

            <Radio
                value={option.id}
                disableRipple
                slotProps={{
                    input: {
                        "aria-disabled": !eligible,
                        "aria-describedby": blocked ? messageId : undefined,
                    },
                }}
                sx={{
                    p: 0,
                    color: COLORS.radio.idle,
                    "&.Mui-checked": { color: COLORS.radio.checked },
                }}
            />
        </Box>
    );
}

export default function ServiceOptionGroups({
                                                groups,
                                                value,
                                                onChange,
                                                onBlockedSelect,
                                                blockedId,
                                                query,
                                                onQueryChange,
                                                customerType,
                                                availableOnly = false,
                                                onShowAll,
                                                loading = false,
                                                errorMessage,
                                                onRetry,
                                                page,
                                                totalPages,
                                                onPageChange,
                                            }: {
    groups: ServiceGroup[];
    value?: string;
    onChange?: (optionId: string) => void;
    /** Called instead of `onChange` when the user picks a service they cannot book. */
    onBlockedSelect?: (optionId: string) => void;
    blockedId?: string;
    query: string;
    onQueryChange: (query: string) => void;
    customerType: CustomerType;
    /** The list only contains bookable services; changes the empty-state wording. */
    availableOnly?: boolean;
    onShowAll?: () => void;
    loading?: boolean;
    errorMessage?: string;
    onRetry?: () => void;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    const handleChange = (_: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const option = groups.flatMap((group) => group.options).find((candidate) => candidate.id === id);
        if (option && !option.availableTo.includes(customerType)) onBlockedSelect?.(id);
        else onChange?.(id);
    };
    const searchTerm = query.trim();

    return (
        <Box>
            <SearchField
                value={query}
                onChange={onQueryChange}
                placeholder="Search services"
                sx={{ mb: 4 }}
            />

            {errorMessage ? (
                <Box role="alert" sx={{ py: 2 }}>
                    <Typography sx={{ color: COLORS.text.muted }}>{errorMessage}</Typography>
                    {onRetry && (
                        <Typography component="button" type="button" onClick={onRetry}
                                    sx={{ background: "none", border: 0, p: 0, mt: 1, cursor: "pointer", fontWeight: 600, color: COLORS.brand.link }}>
                            Try again
                        </Typography>
                    )}
                </Box>
            ) : loading && groups.length === 0 ? (
                <Typography role="status" sx={{ color: COLORS.text.muted, py: 2 }}>Loading services…</Typography>
            ) : (
                <RadioGroup value={value ?? ""} onChange={handleChange} sx={{ opacity: loading ? 0.6 : 1 }}>
                    {groups.map((group) => (
                        <Box
                            key={group.id}
                            component="section"
                            aria-labelledby={`${group.id}-heading`}
                            sx={{ "&:not(:last-of-type)": { mb: 4 } }}
                        >
                            <Typography
                                id={`${group.id}-heading`}
                                component="h2"
                                sx={{
                                    mb: 1.5,
                                    ...TYPE.categoryLabel,
                                    color: COLORS.text.category,
                                }}
                            >
                                {group.title}
                            </Typography>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                {group.options.map((option) => (
                                    <OptionCard
                                        key={option.id}
                                        option={option}
                                        selected={value === option.id}
                                        eligible={option.availableTo.includes(customerType)}
                                        blocked={blockedId === option.id}
                                    />
                                ))}
                            </Box>
                        </Box>
                    ))}

                    {groups.length === 0 && (
                        <Box sx={{ textAlign: "center", py: 2 }}>
                            <Typography sx={{ color: COLORS.text.muted }}>
                                {availableOnly
                                    ? searchTerm
                                        ? `No services available to you match “${searchTerm}”.`
                                        : "No services at this branch are available to you."
                                    : searchTerm
                                        ? `No services found matching “${searchTerm}”`
                                        : "No services are available at this branch."}
                            </Typography>
                            {availableOnly && onShowAll && (
                                <Button onClick={onShowAll}
                                        sx={{ textTransform: "none", fontWeight: 600, color: COLORS.brand.link }}>
                                    View all services
                                </Button>
                            )}
                        </Box>
                    )}
                </RadioGroup>
            )}
            <Pager page={page} totalPages={totalPages} onChange={onPageChange} disabled={loading} />
        </Box>
    );
}
