import * as React from "react";
import { Box, Radio, RadioGroup, Typography } from "@mui/material";
import SearchField from "@/components/common/SearchField";
import {COLORS} from "@/components/common/theme";
import {TYPE} from "@/components/common/typography";

export interface ServiceOption {
    id: string;
    title: string;
    description: string;
}

export interface ServiceGroup {
    id: string;
    title: string;
    options: ServiceOption[];
}

function OptionCard({
                        option,
                        selected,
                    }: {
    option: ServiceOption;
    selected: boolean;
}) {
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
                <Typography
                    sx={{ ...TYPE.cardDescription, mt: 0.25, color: COLORS.text.muted }}
                >
                    {option.description}
                </Typography>
            </Box>

            <Radio
                value={option.id}
                disableRipple
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
                                            }: {
    groups: ServiceGroup[];
    value?: string;
    onChange?: (optionId: string) => void;
}) {
    const [internal, setInternal] = React.useState<string>("");
    const [searchQuery, setSearchQuery] = React.useState<string>("");

    const selected = value ?? internal;

    const handleChange = (_: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setInternal(id);
        onChange?.(id);
    };

    const filteredGroups = groups.map((group) => {
        const filteredOptions = group.options.filter(
            (option) =>
                option.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                option.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { ...group, options: filteredOptions };
    }).filter((group) => group.options.length > 0);

    return (
        <Box>
            <SearchField
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search services"
                sx={{ mb: 4 }}
            />

            <RadioGroup value={selected} onChange={handleChange}>
                {filteredGroups.map((group) => (
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
                                    selected={selected === option.id}
                                />
                            ))}
                        </Box>
                    </Box>
                ))}

                {filteredGroups.length === 0 && (
                    <Typography sx={{ color: COLORS.text.muted, textAlign: "center", py: 2 }}>
                        No services found matching &ldquo;{searchQuery}&rdquo;
                    </Typography>
                )}
            </RadioGroup>
        </Box>
    );
}