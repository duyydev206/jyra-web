import { TimelineTrack, TrackMediaKind } from "../types";
import { TimelineTrackLaneLayout } from "./build-track-lane-layouts";

export type TimelineItemData = {
    id: string;
    trackId: string;
    label: string;
    left: number;
    width: number;
    background?: string;
    src?: string;
};

export type TimelineItemLayout = {
    id: string;
    trackId: string;
    kind: TrackMediaKind;
    label: string;
    left: number;
    top: number;
    width: number;
    height: number;
    background?: string;
    src?: string;
    resizeHandleWidth: number;
    isLocked: boolean;
    isHidden: boolean;
    isMuted: boolean;
};

export const buildItemLayouts = (
    items: TimelineItemData[],
    tracks: TimelineTrack[],
    trackLaneLayouts: TimelineTrackLaneLayout[],
): TimelineItemLayout[] => {
    const trackMap = new Map(tracks.map((track) => [track.id, track]));
    const trackLaneLayoutMap = new Map(
        trackLaneLayouts.map((layout) => [layout.trackId, layout]),
    );

    return items.flatMap((item) => {
        const track = trackMap.get(item.trackId);
        const trackLaneLayout = trackLaneLayoutMap.get(item.trackId);

        /**
         * Skip items that cannot resolve their track or track lane layout.
         */
        if (!track || !trackLaneLayout) {
            return [];
        }

        return [
            {
                id: item.id,
                trackId: item.trackId,
                kind: track.kind,
                label: item.label,
                left: item.left,
                top: trackLaneLayout.top + trackLaneLayout.itemInsetY,
                width: item.width,
                height: trackLaneLayout.itemHeight,
                background: item.background,
                src: item.src,
                resizeHandleWidth: trackLaneLayout.resizeHandleWidth,
                isLocked: track.isLocked,
                isHidden: track.isHidden,
                isMuted: track.isMuted,
            },
        ];
    });
};
