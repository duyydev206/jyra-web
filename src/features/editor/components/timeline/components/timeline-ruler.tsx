import { Frame, Frames } from "@/src/features/editor/types/primitives";
import {
    TIMELINE_GUTTER_X,
    RULER_HEIGHT,
} from "@/src/features/editor/lib/timeline-math";

type TimelineRulerProps = {
    fps: number;
    visibleDurationInFrames: Frames;
    tickFrames: Frames;
    timelineWidth: number;
};

const formatTimecode = (frame: number, fps: number) => {
    const totalSeconds = Math.floor(frame / fps);
    const frames = frame % fps;

    const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    const frameText = frames.toString().padStart(2, "0");

    return `${minutes}:${seconds}:${frameText}${frameText != "00" ? "f" : ""}`;
};

const getMarkerStartFrame = (tickFrames: Frames, fps: number) => {
    /**
     * Finest detail is 15f, but labels must not start at:
     * 00:00:15 | 00:00:30 | 00:00:45
     * Start from the first full second instead:
     * 00:01:00
     */
    if (tickFrames === 15) {
        return fps;
    }

    return 0;
};

const TimelineRuler: React.FC<TimelineRulerProps> = ({
    fps,
    visibleDurationInFrames,
    tickFrames,
    timelineWidth,
}: TimelineRulerProps) => {
    const startFrame = getMarkerStartFrame(tickFrames, fps);

    const markers = [];
    for (
        let frame = startFrame;
        frame <= visibleDurationInFrames;
        frame += tickFrames
    ) {
        markers.push({
            frame,
            label: formatTimecode(frame, fps),
        });
    }

    const usableWidth = Math.max(0, timelineWidth - TIMELINE_GUTTER_X * 2);

    /**
     * We space ticks by the real frame scale, not by evenly distributing labels.
     * This keeps ruler spacing in sync with clip widths and playhead.
     */
    const stepWidth = tickFrames * (usableWidth / visibleDurationInFrames);

    return (
        <div className='sticky top-0 z-1'>
            <div
                className='pointer-events-none absolute top-0 h-7 bg-gray-300'
                style={{ width: timelineWidth }}
            />

            <div
                id='tick-headers'
                className='flex overflow-hidden select-none h-7'
                style={{
                    width: timelineWidth,
                    paddingLeft: TIMELINE_GUTTER_X,
                }}>
                {markers.map((marker) => (
                    <div
                        key={marker.frame}
                        className='relative shrink-0'
                        style={{
                            width: stepWidth,
                            minWidth: stepWidth,
                        }}>
                        <div
                            className=' flex items-start truncate border-l border-l-gray-500 pt-3 pl-1 text-slate-800'
                            style={{
                                fontSize: 10,
                                height: RULER_HEIGHT,
                            }}>
                            {marker.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimelineRuler;
