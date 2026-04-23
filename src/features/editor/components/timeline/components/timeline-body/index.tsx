import { TimelineTrackLaneLayout } from "@/src/features/editor/lib/build-track-lane-layouts";
import { TIMELINE_GUTTER_X } from "@/src/features/editor/lib/timeline-math";
import TimelineLaneBackgrounds from "./timeline-lane-backgrounds";
import TimelineItemsLayer from "./timeline-items-layer";

type TimelineBodyProps = {
    timelineWidth: number;
    lanes: TimelineTrackLaneLayout[];
    totalHeight: number;
    children?: React.ReactNode;
};

const TimelineBody: React.FC<TimelineBodyProps> = ({
    timelineWidth,
    lanes,
    totalHeight,
    children,
}) => {
    return (
        <div
            className='relative'
            style={{
                width: timelineWidth,
                height: totalHeight,
                paddingLeft: TIMELINE_GUTTER_X,
                paddingRight: TIMELINE_GUTTER_X,
            }}>
            <TimelineLaneBackgrounds width={timelineWidth} lanes={lanes} />
            <TimelineItemsLayer>{children}</TimelineItemsLayer>
        </div>
    );
};

export default TimelineBody;
