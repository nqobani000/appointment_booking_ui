import {InputAdornment, TextField} from "@mui/material";
import type {SxProps, Theme} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {COLORS} from "@/components/common/theme";


export default function SearchField({
                                        value,
                                        onChange,
                                        placeholder = "Search",
                                        sx,
                                    }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    sx?: SxProps<Theme>;
}) {
    return (
        <TextField
            fullWidth
            variant="outlined"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            slotProps={{
                htmlInput: {"aria-label": placeholder},
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{color: COLORS.text.category}}/>
                        </InputAdornment>
                    ),
                    sx: {
                        borderRadius: "12px",
                        backgroundColor: COLORS.surface.base,
                        fontSize: 14,
                        color: COLORS.text.primary,
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: COLORS.border.default,
                            borderWidth: "1.5px",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: COLORS.border.hover,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: COLORS.border.focus,
                        },
                    },
                },
            }}
            sx={sx}
        />
    );
}
