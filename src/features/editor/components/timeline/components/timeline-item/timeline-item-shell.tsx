type TimelineItemShellProps = {
    children?: React.ReactNode;
    isLocked?: boolean;
};

const TimelineItemShell: React.FC<TimelineItemShellProps> = ({
    children,
    isLocked = false,
}: TimelineItemShellProps) => {
    return (
        <div
            className='absolute box-border h-full w-full overflow-hidden rounded-sm border border-black select-none'
            style={{
                borderWidth: 1,
                cursor: isLocked ? "not-allowed" : "pointer",
            }}>
            {children}
        </div>
    );
};

export default TimelineItemShell;
