import { Frame, Frames, Pixels } from "@/src/features/editor/types/primitives";

export const TIMELINE_GUTTER_X: Pixels = 15;
export const TRACK_HEADER_WIDTH: Pixels = 111;
export const RULER_HEIGHT: Pixels = 28;

/**
 * Measured minimum width at 1x zoom.
 */
export const MIN_TIMELINE_WIDTH: Pixels = 1949;

/**
 * Growth measured from your samples:
 * - short duration (~31.23s): ~575.7 px per zoom step
 * - long duration (~213s): ~3413.7 px per zoom step
 */
const SHORT_REF_DURATION_SECONDS = 31.23;
const SHORT_REF_GROWTH_PER_SECOND = 18.43;

const LONG_REF_DURATION_SECONDS = 213;
const LONG_REF_GROWTH_PER_SECOND = 16.03;

const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Interpolate measured growth-per-second from your real samples.
 */
const getWidthGrowthPerSecond = (durationInSeconds: number) => {
    const t = clamp(
        (durationInSeconds - SHORT_REF_DURATION_SECONDS) /
            (LONG_REF_DURATION_SECONDS - SHORT_REF_DURATION_SECONDS),
        0,
        1,
    );

    return lerp(SHORT_REF_GROWTH_PER_SECOND, LONG_REF_GROWTH_PER_SECOND, t);
};

/**
 * The only timeline width rule we need.
 * At 1x zoom, width is always clamped to the measured minimum width.
 */
export const getTimelineWidth = ({
    durationInFrames,
    fps,
    zoomValue,
}: {
    durationInFrames: Frames;
    fps: number;
    zoomValue: number;
}): Pixels => {
    const durationInSeconds = durationInFrames / fps;
    const growthPerSecond = getWidthGrowthPerSecond(durationInSeconds);

    return Math.max(
        MIN_TIMELINE_WIDTH,
        MIN_TIMELINE_WIDTH +
            (zoomValue - 1) * durationInSeconds * growthPerSecond,
    );
};

/**
 * Derive pixelsPerFrame from the single timeline width.
 */
export const getPixelsPerFrame = (
    timelineWidth: Pixels,
    durationInFrames: Frames,
    gutterX: Pixels = TIMELINE_GUTTER_X,
): number => {
    if (durationInFrames <= 0) return 0;

    const usableWidth = Math.max(0, timelineWidth - gutterX * 2);
    return usableWidth / durationInFrames;
};

export const frameToPx = (
    frame: Frame,
    pixelsPerFrame: number,
    gutterX: Pixels = TIMELINE_GUTTER_X,
): Pixels => {
    return gutterX + frame * pixelsPerFrame;
};

export const framesToPx = (frames: Frames, pixelsPerFrame: number): Pixels => {
    return frames * pixelsPerFrame;
};
