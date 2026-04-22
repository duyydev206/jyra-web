type TimelineItemResizeHandleProps = {
    side: "start" | "end";
    width?: number;
};

const TimelineItemResizeHandle: React.FC<TimelineItemResizeHandleProps> = ({
    side,
    width = 6,
}: TimelineItemResizeHandleProps) => {
    const isStart = side === "start";

    return (
        <div
            className={`group absolute top-0 bottom-0 flex items-center justify-center ${
                isStart ? "cursor-e-resize" : "cursor-w-resize"
            }`}
            style={{
                width,
                [isStart ? "left" : "right"]: -1,
            }}
        />
    );
};

export default TimelineItemResizeHandle;
