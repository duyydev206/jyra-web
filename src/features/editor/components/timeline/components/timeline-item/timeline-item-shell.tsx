type TimelineItemShellProps = {
    children?: React.ReactNode;
    isLocked?: boolean;
    isSelected?: boolean;
};

const TimelineItemShell: React.FC<TimelineItemShellProps> = ({
    children,
    isLocked = false,
    isSelected = false,
}) => {
    return (
        <div
            className='absolute box-border h-full w-full overflow-hidden rounded-md select-none'
            style={{
                borderWidth: 1.5,
                borderColor: isSelected ? "#2563eb" : "black",
                cursor: isLocked ? "not-allowed" : "pointer",
            }}>
            {children}
        </div>
    );
};

export default TimelineItemShell;
