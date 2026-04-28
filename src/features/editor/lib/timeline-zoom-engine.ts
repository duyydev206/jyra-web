import { Frames, Pixels } from "@/src/features/editor/types/primitives";
import {
    DurationBucketRule,
    MIN_TIMELINE_VIEWPORT_WIDTH,
    TIMELINE_DURATION_BUCKET_RULES,
    TIMELINE_TICK_UNITS,
    TickUnit,
    getTickUnitFrames,
} from "./timeline-zoom-spec";
import { TIMELINE_GUTTER_X } from "./timeline-math";

export type TimelineZoomComputed = {
    tickUnit: TickUnit;
    tickFrames: Frames;
    visibleDurationInFrames: Frames;
    timelineWidth: Pixels;
    pixelsPerFrame: number;
    tickCount: number;
};

const clampZoom = (zoomLevel: number) => Math.max(1, Math.min(10, zoomLevel));

const getDurationBucketRule = (
    durationInSeconds: number,
): DurationBucketRule => {
    return (
        TIMELINE_DURATION_BUCKET_RULES.find(
            (rule) => durationInSeconds <= rule.maxDurationSeconds,
        ) ??
        TIMELINE_DURATION_BUCKET_RULES[
            TIMELINE_DURATION_BUCKET_RULES.length - 1
        ]
    );
};

const snapUpToMultiple = (value: number, step: number) => {
    if (step <= 0) return value;
    return Math.ceil(value / step) * step;
};

const MIN_VISIBLE_TICK_COUNT = 10;
const MIN_VISIBLE_DURATION_SECONDS = 10;
const MIN_TICK_SPACING_PX = 64;
const TARGET_TICK_SPACING_PX = 140;
const MAX_TICK_SPACING_PX = 260;
const MIN_FRAME_TICK_ZOOM_LEVEL = 3;

const getVisualTickFrames = ({
    tickUnit,
    tickFrames,
    fps,
}: {
    tickUnit: TickUnit;
    tickFrames: Frames;
    fps: number;
}) => {
    if (tickUnit === "15f") {
        return fps / 2;
    }

    return tickFrames;
};

const getDurationGrowthPerZoomStep = ({
    durationInSeconds,
    viewportWidth,
}: {
    durationInSeconds: number;
    viewportWidth: Pixels;
}) => {
    const minimumShortProjectGrowth = viewportWidth * 0.287;
    const durationGrowth = durationInSeconds * 12.85;

    return Math.max(minimumShortProjectGrowth, durationGrowth);
};

const getBestTickUnit = ({
    fps,
    timelineWidth,
    visibleDurationInFrames,
    zoomLevel,
}: {
    fps: number;
    timelineWidth: Pixels;
    visibleDurationInFrames: Frames;
    zoomLevel: number;
}) => {
    const tickUnits = TIMELINE_TICK_UNITS.filter((tickUnit) => {
        return tickUnit !== "15f" || zoomLevel >= MIN_FRAME_TICK_ZOOM_LEVEL;
    }).map((tickUnit) => ({
        tickUnit,
        tickFrames: getTickUnitFrames(tickUnit, fps),
    }));
    const pixelsPerFrame =
        visibleDurationInFrames > 0
            ? timelineWidth / visibleDurationInFrames
            : 0;
    const tickCandidates = tickUnits.map((tickUnit) => {
        const spacingPx =
            getVisualTickFrames({
                fps,
                tickUnit: tickUnit.tickUnit,
                tickFrames: tickUnit.tickFrames,
            }) * pixelsPerFrame;

        return {
            ...tickUnit,
            spacingPx,
        };
    });
    const readableTicks = tickCandidates.filter((tickUnit) => {
        return (
            tickUnit.spacingPx >= MIN_TICK_SPACING_PX &&
            tickUnit.spacingPx <= MAX_TICK_SPACING_PX
        );
    });
    const closestToTarget = (
        bestTick: (typeof tickCandidates)[number],
        currentTick: (typeof tickCandidates)[number],
    ) => {
        const bestDistance = Math.abs(
            bestTick.spacingPx - TARGET_TICK_SPACING_PX,
        );
        const currentDistance = Math.abs(
            currentTick.spacingPx - TARGET_TICK_SPACING_PX,
        );

        return currentDistance < bestDistance ? currentTick : bestTick;
    };

    if (readableTicks.length > 0) {
        return readableTicks.reduce(closestToTarget);
    }

    const ticksBelowMax = tickCandidates.filter((tickUnit) => {
        return tickUnit.spacingPx < MIN_TICK_SPACING_PX;
    });

    if (ticksBelowMax.length > 0) {
        return ticksBelowMax[ticksBelowMax.length - 1];
    }

    return tickCandidates[0];
};

export const computeTimelineZoom = ({
    durationInFrames,
    fps,
    zoomLevel,
    viewportWidth,
}: {
    durationInFrames: Frames;
    fps: number;
    zoomLevel: number;
    viewportWidth: Pixels;
}): TimelineZoomComputed => {
    const safeZoom = clampZoom(zoomLevel);
    const isEmptyProject = durationInFrames <= 0;
    const durationInSeconds = durationInFrames / fps;

    const bucketRule = getDurationBucketRule(durationInSeconds);
    const tailPaddingFrames = bucketRule.tailPaddingSeconds * fps;

    /**
     * Timeline visible duration is larger than project duration.
     * It is padded first, then snapped up after choosing the readable tick unit.
     */
    const paddedDurationInFrames = Math.max(
        fps * MIN_VISIBLE_DURATION_SECONDS,
        isEmptyProject ? fps : durationInFrames + tailPaddingFrames,
    );
    const viewportTimelineWidth = Math.max(
        MIN_TIMELINE_VIEWPORT_WIDTH,
        viewportWidth,
    );
    const growthPerStep = getDurationGrowthPerZoomStep({
        durationInSeconds: Math.max(1, durationInSeconds),
        viewportWidth: viewportTimelineWidth,
    });
    const timelineWidth = Math.round(
        viewportTimelineWidth + (safeZoom - 1) * growthPerStep,
    );
    const usableWidth = Math.max(0, timelineWidth - TIMELINE_GUTTER_X * 2);
    const { tickUnit, tickFrames } = getBestTickUnit({
        fps,
        timelineWidth: usableWidth,
        visibleDurationInFrames: paddedDurationInFrames,
        zoomLevel: safeZoom,
    });
    const paddedVisibleDurationInFrames = snapUpToMultiple(
        paddedDurationInFrames,
        tickFrames,
    );
    const minimumVisibleDurationInFrames = tickFrames * MIN_VISIBLE_TICK_COUNT;
    const visibleDurationInFrames = Math.max(
        // OLD logic: Empty or very short projects could render too few ruler ticks.
        // NEW logic: Keep project duration unchanged, but guarantee enough visible timeline ticks.
        minimumVisibleDurationInFrames,
        paddedVisibleDurationInFrames,
    );

    const tickCount = Math.max(
        1,
        Math.round(visibleDurationInFrames / tickFrames),
    );

    const pixelsPerFrame =
        visibleDurationInFrames > 0 ? usableWidth / visibleDurationInFrames : 0;

    return {
        tickUnit,
        tickFrames,
        visibleDurationInFrames,
        timelineWidth,
        pixelsPerFrame,
        tickCount,
    };
};
