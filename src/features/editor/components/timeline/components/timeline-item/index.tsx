import { TrackMediaKind } from "@/src/features/editor/types";
import TimelineItemContent from "./timeline-item-content";
import TimelineItemResizeHandle from "./timeline-item-resize-handle";
import TimelineItemShell from "./timeline-item-shell";

type TimelineItemProps = {
    kind: TrackMediaKind;
    left: number;
    top: number;
    width: number;
    height: number;
    label?: string;
    background?: string;
    src?: string;
    resizeHandleWidth?: number;
    isLocked?: boolean;
    isHidden?: boolean;
    isMuted?: boolean;
};

const TimelineItem: React.FC<TimelineItemProps> = ({
    kind,
    left,
    top,
    width,
    height,
    label,
    background = "#666",
    src,
    resizeHandleWidth = 6,
    isLocked = false,
    isHidden = false,
    isMuted = false,
}: TimelineItemProps) => {
    return (
        <div
            className='relative'
            data-hidden={isHidden}
            style={{ opacity: isHidden ? 0.45 : 1 }}>
            <div data-state='closed' style={{ display: "contents" }}>
                <div
                    style={{
                        width,
                        left,
                        top,
                        height,
                        position: "absolute",
                    }}>
                    <TimelineItemShell isLocked={isLocked}>
                        <TimelineItemContent
                            kind={kind}
                            label={label}
                            background={background}
                            src={src}
                            isMuted={isMuted}
                        />
                    </TimelineItemShell>

                    {!isLocked && (
                        <>
                            <TimelineItemResizeHandle
                                side='start'
                                width={resizeHandleWidth}
                            />
                            <TimelineItemResizeHandle
                                side='end'
                                width={resizeHandleWidth}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimelineItem;
