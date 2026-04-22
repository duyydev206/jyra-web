import { TimelineTrack, TrackMediaKind } from "../types";
import {
    DEFAULT_TIMELINE_TRACK_VISUAL_CONFIG,
    TIMELINE_TRACK_VISUAL_CONFIG,
} from "./timeline-track-visual-config";

export type TimelineTrackLaneLayout = {
    trackId: string;
    kind: TrackMediaKind;
    top: number;
    laneHeight: number;
    itemInsetY: number;
    itemHeight: number;
    resizeHandleWidth: number;
};

export type BuildTrackLaneLayoutsResult = {
    layouts: TimelineTrackLaneLayout[];
    totalHeight: number;
};

const clampPositive = (value: number, fallback: number) => {
    if (!Number.isFinite(value) || value <= 0) {
        return fallback;
    }

    return value;
};

export const buildTrackLaneLayouts = (
    tracks: TimelineTrack[]
): BuildTrackLaneLayoutsResult => {
    if (!Array.isArray(tracks) || tracks.length === 0) {
        return {
            layouts: [],
            totalHeight: 0,
        };
    }

    const sortedTracks = [...tracks].sort((a, b) => a.index - b.index);

    let currentTop = 0;

    const layouts: TimelineTrackLaneLayout[] = sortedTracks.map((track) => {
        const visualConfig =
            TIMELINE_TRACK_VISUAL_CONFIG[track.kind] ??
            DEFAULT_TIMELINE_TRACK_VISUAL_CONFIG;

        /**
         * Use track.height if provided and valid.
         * Otherwise fallback to visual config by kind.
         */
        const laneHeight = clampPositive(track.height, visualConfig.laneHeight);

        /**
         * Prevent inset from making item height invalid.
         */
        const maxInsetY = Math.max(0, (laneHeight - 1) / 2);
        const itemInsetY = Math.min(visualConfig.itemInsetY, maxInsetY);

        const itemHeight = Math.max(1, laneHeight - itemInsetY * 2);

        const layout: TimelineTrackLaneLayout = {
            trackId: track.id,
            kind: track.kind,
            top: currentTop,
            laneHeight,
            itemInsetY,
            itemHeight,
            resizeHandleWidth: visualConfig.resizeHandleWidth,
        };

        currentTop += laneHeight;

        return layout;
    });

    return {
        layouts,
        totalHeight: currentTop,
    };
};