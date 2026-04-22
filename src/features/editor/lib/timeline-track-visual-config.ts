import { TrackMediaKind } from "../types";

export type TimelineTrackVisualConfig = {
    laneHeight: number;
    itemInsetY: number;
    resizeHandleWidth: number;
};

export const DEFAULT_TIMELINE_TRACK_VISUAL_CONFIG: TimelineTrackVisualConfig = {
    laneHeight: 35,
    itemInsetY: 1.5,
    resizeHandleWidth: 6,
};

/**
 * laneHeight = full row height
 * itemHeight = laneHeight - itemInsetY * 2
 *
 * So:
 * - text/shape: 35 -> item 32
 * - media/audio/image/video: 71 -> item 68
 */
export const TIMELINE_TRACK_VISUAL_CONFIG: Record<
    TrackMediaKind,
    TimelineTrackVisualConfig
> = {
    text: {
        laneHeight: 35,
        itemInsetY: 1.5,
        resizeHandleWidth: 6,
    },
    shape: {
        laneHeight: 35,
        itemInsetY: 1.5,
        resizeHandleWidth: 6,
    },
    audio: {
        laneHeight: 71,
        itemInsetY: 1.5,
        resizeHandleWidth: 6,
    },
    video: {
        laneHeight: 71,
        itemInsetY: 1.5,
        resizeHandleWidth: 6,
    },
    image: {
        laneHeight: 71,
        itemInsetY: 1.5,
        resizeHandleWidth: 6,
    },
};
