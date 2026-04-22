import { TimelineTrackLaneLayout } from "@/src/features/editor/lib/build-track-lane-layouts";

const TIMELINE_GUTTER_X = 15;

type TimelineLaneBackgroundsProps = {
    width: number;
    lanes: TimelineTrackLaneLayout[];
};

const TimelineLaneBackgrounds: React.FC<TimelineLaneBackgroundsProps> = ({
    width,
    lanes,
}: TimelineLaneBackgroundsProps) => {
    return (
        <div
            className='absolute'
            style={{
                width,
                marginLeft: -TIMELINE_GUTTER_X,
            }}>
            {lanes.map((lane) => (
                <div
                    key={lane.trackId}
                    className='pointer-events-none flex border-b border-black/20'
                    style={{
                        height: lane.laneHeight,
                        width,
                    }}
                />
            ))}
        </div>
    );
};

export default TimelineLaneBackgrounds;
