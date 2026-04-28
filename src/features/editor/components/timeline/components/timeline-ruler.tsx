import { useEffect, useRef, type PointerEvent } from "react";
import { Frames } from "@/src/features/editor/types/primitives";
import {
    TIMELINE_GUTTER_X,
    RULER_HEIGHT,
} from "@/src/features/editor/lib/timeline-math";
import { dispatchPreviewSeekFrame } from "@/src/features/editor/lib/preview-seek";
import type { TickUnit } from "@/src/features/editor/lib/timeline-zoom-spec";

type TimelineRulerProps = {
    fps: number;
    visibleDurationInFrames: Frames;
    maxSeekFrame: Frames;
    tickUnit: TickUnit;
    tickFrames: Frames;
    timelineWidth: number;
    onSeekFrame?: (frame: number) => void;
    isInteractionDisabled?: boolean;
};

const shouldShowFrameLabel = ({
    frame,
    fps,
    tickUnit,
    projectDurationInFrames,
}: {
    frame: number;
    fps: number;
    tickUnit: TickUnit;
    projectDurationInFrames: Frames;
}) => {
    if (frame % fps === 0) return false;
    if (tickUnit !== "15f") return false;

    const projectDurationInSeconds = projectDurationInFrames / fps;

    return projectDurationInSeconds <= 12;
};

const formatTimecode = ({
    frame,
    fps,
    tickUnit,
    projectDurationInFrames,
    isSymbolicFrameMarker = false,
}: {
    frame: number;
    fps: number;
    tickUnit: TickUnit;
    projectDurationInFrames: Frames;
    isSymbolicFrameMarker?: boolean;
}) => {
    const totalSeconds = Math.floor(frame / fps);
    const frames = frame % fps;

    if (
        frames > 0 &&
        !isSymbolicFrameMarker &&
        !shouldShowFrameLabel({ frame, fps, tickUnit, projectDurationInFrames })
    ) {
        return "";
    }

    const hours = Math.floor(totalSeconds / 3600)
        .toString()
        .padStart(2, "0");
    const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");

    if (projectDurationInFrames >= fps * 3600) {
        return `${hours}:${minutes}:${seconds}`;
    }

    if (tickUnit === "15f") {
        const frameText = isSymbolicFrameMarker
            ? "15"
            : frames.toString().padStart(2, "0");

        return `${minutes}:${seconds}:${frameText}`;
    }

    return `${minutes}:${seconds}`;
};

const TimelineRuler: React.FC<TimelineRulerProps> = ({
    fps,
    visibleDurationInFrames,
    maxSeekFrame,
    tickUnit,
    tickFrames,
    timelineWidth,
    onSeekFrame,
    isInteractionDisabled = false,
}: TimelineRulerProps) => {
    const previewSeekFrameRef = useRef<number | null>(null);
    const previewSeekRafRef = useRef<number | null>(null);
    const usableWidth = Math.max(0, timelineWidth - TIMELINE_GUTTER_X * 2);
    const pixelsPerFrame =
        visibleDurationInFrames > 0 ? usableWidth / visibleDurationInFrames : 0;

    const getMarkers = () => {
        if (tickUnit !== "15f") {
            const tickCount = Math.floor(visibleDurationInFrames / tickFrames);

            return Array.from({ length: tickCount + 1 }, (_, index) => {
                const frame = index * tickFrames;

                return {
                    key: String(frame),
                    frame,
                    labelFrame: frame,
                    isSymbolicFrameMarker: false,
                };
            });
        }

        const markers: {
            key: string;
            frame: Frames;
            labelFrame: Frames;
            isSymbolicFrameMarker: boolean;
        }[] = [];

        for (
            let secondStartFrame = 0;
            secondStartFrame <= visibleDurationInFrames;
            secondStartFrame += fps
        ) {
            markers.push({
                key: String(secondStartFrame),
                frame: secondStartFrame,
                labelFrame: secondStartFrame,
                isSymbolicFrameMarker: false,
            });

            const symbolicFrame = secondStartFrame + fps / 2;
            if (symbolicFrame < visibleDurationInFrames) {
                markers.push({
                    key: `${secondStartFrame}:15f`,
                    frame: symbolicFrame,
                    labelFrame: secondStartFrame + 15,
                    isSymbolicFrameMarker: true,
                });
            }
        }

        return markers;
    };

    const markers = getMarkers().map((marker) => {
        const { frame, labelFrame, isSymbolicFrameMarker } = marker;
        const left = TIMELINE_GUTTER_X + frame * pixelsPerFrame;

        return {
            key: marker.key,
            frame,
            left,
            label: formatTimecode({
                frame: labelFrame,
                fps,
                tickUnit,
                projectDurationInFrames: maxSeekFrame,
                isSymbolicFrameMarker,
            }),
        };
    });

    const flushPreviewSeekFrame = () => {
        previewSeekRafRef.current = null;

        const frame = previewSeekFrameRef.current;
        if (frame === null) return;

        dispatchPreviewSeekFrame(frame);
    };

    const schedulePreviewSeek = (frame: number) => {
        previewSeekFrameRef.current = frame;

        if (previewSeekRafRef.current !== null) return;

        previewSeekRafRef.current = window.requestAnimationFrame(
            flushPreviewSeekFrame,
        );
    };

    const seekFromPointer = (
        event: PointerEvent<HTMLDivElement>,
        shouldCapture: boolean,
    ) => {
        if (isInteractionDisabled) return;
        if (pixelsPerFrame <= 0) return;

        if (shouldCapture) {
            event.currentTarget.setPointerCapture(event.pointerId);
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const frame = Math.round((x - TIMELINE_GUTTER_X) / pixelsPerFrame);
        const clampedFrame = Math.max(0, Math.min(frame, maxSeekFrame));

        onSeekFrame?.(clampedFrame);
        schedulePreviewSeek(clampedFrame);
    };

    useEffect(() => {
        return () => {
            if (previewSeekRafRef.current !== null) {
                window.cancelAnimationFrame(previewSeekRafRef.current);
            }
        };
    }, []);

    return (
        <div className='sticky top-0 z-10'>
            <div
                className='min-w-full pointer-events-none absolute top-0 h-7 bg-gray-300'
                style={{ width: timelineWidth }}
            />

            <div
                id='tick-headers'
                className='relative min-w-full overflow-hidden select-none h-7 cursor-pointer'
                onPointerDown={(event) => {
                    if (isInteractionDisabled) return;
                    // OLD logic: Ruler was display-only.
                    // NEW logic: Clicking or dragging the ruler scrubs the shared player frame.
                    seekFromPointer(event, true);
                }}
                onPointerMove={(event) => {
                    if (isInteractionDisabled) return;
                    if (event.buttons !== 1) return;

                    seekFromPointer(event, false);
                }}
                style={{
                    width: timelineWidth,
                }}>
                {markers.map((marker) => (
                    <div
                        key={marker.key}
                        className='absolute top-0 h-7'
                        style={{
                            left: marker.left,
                            width: 1,
                        }}>
                        <div
                            className='absolute top-0 h-7 border-l border-l-gray-500'
                            style={{
                                left: 0,
                            }}
                        />

                        {marker.label ? (
                            <div
                                className='absolute pt-3 pl-1 text-slate-800 whitespace-nowrap'
                                style={{
                                    top: 0,
                                    left: 0,
                                    fontSize: 10,
                                    height: RULER_HEIGHT,
                                }}>
                                {marker.label}
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimelineRuler;
