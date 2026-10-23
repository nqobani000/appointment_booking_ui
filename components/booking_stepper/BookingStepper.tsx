import {
    Stepper,
    Step,
    StepLabel,
    StepConnector,
    stepConnectorClasses,
    styled,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import type {StepIconProps} from "@mui/material/StepIcon";
import {COLORS as THEME} from "@/components/common/theme";
import {TYPE} from "@/components/common/typography";

const COLORS = THEME.stepper;

const STEPS = ["Select Branch", "Service", "Date & Time", "Confirm Booking"];

const Connector = styled(StepConnector)(() => ({
    [`& .${stepConnectorClasses.line}`]: {
        height: 2,
        border: 0,
        borderRadius: 1,
        backgroundColor: COLORS.inactiveBorder,
    },
    [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
        backgroundColor: COLORS.completed,
    },
    [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
        backgroundColor: COLORS.completed,
    },
}));

type StepIconState = Pick<StepIconProps, "active" | "completed">;

const IconRoot = styled("div", {
    shouldForwardProp: (p) => p !== "ownerState",
})<{ ownerState: StepIconState }>(({ownerState}) => ({
    width: 30,
    height: 30,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 600,
    boxSizing: "border-box",
    transition: "background-color .2s, border-color .2s, color .2s",
    ...(ownerState.completed && {
        backgroundColor: COLORS.completed,
        color: THEME.surface.base,
    }),
    ...(ownerState.active && {
        backgroundColor: COLORS.active,
        color: THEME.surface.base,
    }),
    ...(!ownerState.active &&
        !ownerState.completed && {
            backgroundColor: THEME.surface.base,
            border: `1.5px solid ${COLORS.inactiveBorder}`,
            color: COLORS.inactiveText,
        }),
}));

function StepIcon({active = false, completed = false, icon}: StepIconProps) {
    return (
        <IconRoot ownerState={{active, completed}}>
            {completed ? <CheckIcon sx={{fontSize: 16}}/> : icon}
        </IconRoot>
    );
}

type BookingStepperProps = {
    activeStep?: number;
    steps?: readonly string[];
};

export default function BookingStepper({
                                           activeStep = 1,
                                           steps = STEPS,
                                       }: BookingStepperProps) {
    return (
        <Stepper
            activeStep={activeStep}
            connector={<Connector/>}
            sx={{
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                "& .MuiStep-root:first-of-type": {pl: 0},
                "& .MuiStep-root:last-of-type": {pr: 0},
            }}
        >
            {steps.map((label) => (
                <Step key={label}>
                    <StepLabel
                        slots={{stepIcon: StepIcon}}
                        sx={{
                            [`& .MuiStepLabel-label`]: {
                                ...TYPE.stepLabel,
                                color: COLORS.inactiveText,
                            },
                            [`& .MuiStepLabel-label.Mui-active`]: {
                                color: COLORS.active,
                            },
                            [`& .MuiStepLabel-label.Mui-completed`]: {
                                color: COLORS.completed,
                            },
                        }}
                    >
                        {label}
                    </StepLabel>
                </Step>
            ))}
        </Stepper>
    );
}