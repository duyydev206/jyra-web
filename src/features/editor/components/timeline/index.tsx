"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import Playhead from "./components/playhead";
import TimelineRuler from "./components/timeline-ruler";
import TimelineToolbar from "./components/timeline-toolbar";
import TimelineBody from "./components/timeline-body";
import TimelineItem from "./components/timeline-item";
import { buildTrackLaneLayouts } from "../../lib/build-track-lane-layouts";
import { buildClipLayouts } from "../../lib/build-clip-layouts";
import TimelineTrackHeaders from "./components/timeline-track-headers";
// import { TimelineClip, TimelineTrack } from "../../types";
import { useEditorStore } from "../../stores";
import {
    frameToPx,
    TIMELINE_GUTTER_X,
    TRACK_HEADER_WIDTH,
} from "../../lib/timeline-math";
import { computeTimelineZoom } from "../../lib/timeline-zoom-engine";
import { getEditorPlaybackDurationInFrames } from "../../lib/playback-duration";

const PLAYHEAD_PAGE_SCROLL_THRESHOLD = 2;
const PLAYHEAD_SCRUB_SYNC_INTERVAL_MS = 66;

type TimelineBoundaryScrollEvent = CustomEvent<{
    position: "start" | "end";
}>;

const Timeline: React.FC = () => {
    const scrollViewportRef = useRef<HTMLDivElement>(null);
    const timelineContentRef = useRef<HTMLDivElement>(null);
    const playheadRef = useRef<HTMLDivElement>(null);
    const scrubFrameRef = useRef<number | null>(null);
    const scrubSyncTimeoutRef = useRef<number | null>(null);
    const scrubLastSyncedAtRef = useRef(0);
    const project = useEditorStore((state) => state.project);
    const runtime = useEditorStore((state) => state.runtime);
    const selectedClipIds = useEditorStore(
        (state) => state.runtime.selection.selectedClipIds,
    );
    const setSelectedClipIds = useEditorStore(
        (state) => state.setSelectedClipIds,
    );
    const seekToFrame = useEditorStore((state) => state.seekToFrame);
    const pause = useEditorStore((state) => state.pause);
    const deleteSelectedClips = useEditorStore(
        (state) => state.deleteSelectedClips,
    );
    const setTimelineScroll = useEditorStore(
        (state) => state.setTimelineScroll,
    );

    const tracks = project.tracks;
    const clips = project.clips;
    const fps = project.video.fps;
    const durationInFrames = project.video.durationInFrames;
    const playbackDurationInFrames =
        getEditorPlaybackDurationInFrames(project);
    const currentFrame = runtime.player.currentFrame;
    const playbackStatus = runtime.player.status;
    const zoomValue = runtime.timeline.zoom.zoomLevel;
    const laneResult = buildTrackLaneLayouts(tracks);
    const zoomComputed = computeTimelineZoom({
        durationInFrames,
        fps,
        zoomLevel: zoomValue,
    });

    const clipLayouts = buildClipLayouts(
        clips,
        tracks,
        laneResult.layouts,
        zoomComputed.pixelsPerFrame,
    );

    const getFrameFromClientX = (clientX: number) => {
        const content = timelineContentRef.current;
        if (!content || zoomComputed.pixelsPerFrame <= 0) return null;

        const rect = content.getBoundingClientRect();
        const timelineX = clientX - rect.left;
        const frame = Math.round(
            (timelineX - TIMELINE_GUTTER_X) / zoomComputed.pixelsPerFrame,
        );

        return Math.max(0, Math.min(frame, playbackDurationInFrames));
    };

    const scrubToClientX = (clientX: number) => {
        const frame = getFrameFromClientX(clientX);

        if (frame === null) return;

        scrubFrameRef.current = frame;
        const playhead = playheadRef.current;

        if (!playhead) return;

        const left = frameToPx(frame, zoomComputed.pixelsPerFrame);

        // OLD logic: Pointer move updated React state and rebuilt the full timeline on every pixel.
        // NEW logic: Move the playhead element directly during drag, then commit the frame on release.
        playhead.style.transition = "none";
        playhead.style.transform = `translate3d(${left}px, 0, 0)`;

        const now = window.performance.now();
        const elapsed = now - scrubLastSyncedAtRef.current;

        if (elapsed >= PLAYHEAD_SCRUB_SYNC_INTERVAL_MS) {
            scrubLastSyncedAtRef.current = now;
            seekToFrame(frame);
            return;
        }

        if (scrubSyncTimeoutRef.current !== null) return;

        scrubSyncTimeoutRef.current = window.setTimeout(() => {
            const nextFrame = scrubFrameRef.current;

            scrubSyncTimeoutRef.current = null;
            scrubLastSyncedAtRef.current = window.performance.now();

            if (nextFrame !== null) {
                // OLD logic: Preview/time only updated after releasing the playhead.
                // NEW logic: Sync preview/time at a throttled rate so dragging stays smooth.
                seekToFrame(nextFrame);
            }
        }, PLAYHEAD_SCRUB_SYNC_INTERVAL_MS - elapsed);
    };

    const handlePlayheadScrubStart = (event: PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (playbackStatus === "playing") {
            pause();
        }

        // OLD logic: The playhead could only be moved by clicking the ruler.
        // NEW logic: Dragging the original playhead marker scrubs the shared frame.
        scrubToClientX(event.clientX);
    };

    const handlePlayheadScrubMove = (event: PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        scrubToClientX(event.clientX);
    };

    const handlePlayheadScrubEnd = (event: PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const frame = scrubFrameRef.current;

        if (frame !== null) {
            seekToFrame(frame);
        }

        if (scrubSyncTimeoutRef.current !== null) {
            window.clearTimeout(scrubSyncTimeoutRef.current);
            scrubSyncTimeoutRef.current = null;
        }

        if (playheadRef.current) {
            playheadRef.current.style.transition = "";
        }

        scrubFrameRef.current = null;
        scrubLastSyncedAtRef.current = 0;
    };

    useEffect(() => {
        return () => {
            if (scrubSyncTimeoutRef.current !== null) {
                window.clearTimeout(scrubSyncTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const viewport = scrollViewportRef.current;
        if (!viewport) return;
        if (playbackStatus !== "playing") return;

        const playheadX = frameToPx(currentFrame, zoomComputed.pixelsPerFrame);
        const playheadViewportX =
            TRACK_HEADER_WIDTH + playheadX - viewport.scrollLeft;

        if (
            playheadViewportX <
            viewport.clientWidth - PLAYHEAD_PAGE_SCROLL_THRESHOLD
        ) {
            return;
        }

        const targetScrollLeft = Math.max(
            0,
            Math.min(
                playheadX - TIMELINE_GUTTER_X,
                viewport.scrollWidth - viewport.clientWidth,
            ),
        );

        // OLD logic: The playhead could move past the visible track area while playback continued.
        // NEW logic: Page-scroll only when the playhead reaches the right edge, making that time the new track start.
        viewport.scrollTo({
            left: targetScrollLeft,
            behavior: "auto",
        });
    }, [currentFrame, playbackStatus, zoomComputed.pixelsPerFrame]);

    useEffect(() => {
        const viewport = scrollViewportRef.current;
        if (!viewport) return;
        if (playbackStatus === "playing") return;
        if (scrubFrameRef.current !== null) return;

        if (currentFrame <= 0) {
            viewport.scrollTo({ left: 0, behavior: "auto" });
            return;
        }

        if (currentFrame >= playbackDurationInFrames) {
            viewport.scrollTo({
                left: Math.max(0, viewport.scrollWidth - viewport.clientWidth),
                behavior: "auto",
            });
        }
    }, [currentFrame, playbackDurationInFrames, playbackStatus]);

    useEffect(() => {
        const handleBoundaryScroll = (event: Event) => {
            const viewport = scrollViewportRef.current;
            if (!viewport) return;

            const boundaryEvent = event as TimelineBoundaryScrollEvent;

            if (boundaryEvent.detail.position === "start") {
                viewport.scrollTo({ left: 0, behavior: "auto" });
                return;
            }

            viewport.scrollTo({
                left: Math.max(0, viewport.scrollWidth - viewport.clientWidth),
                behavior: "auto",
            });
        };

        window.addEventListener(
            "editor:timeline-scroll-to-boundary",
            handleBoundaryScroll,
        );

        return () => {
            window.removeEventListener(
                "editor:timeline-scroll-to-boundary",
                handleBoundaryScroll,
            );
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target;
            const isEditableTarget =
                target instanceof HTMLElement &&
                (target.isContentEditable ||
                    target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.tagName === "SELECT");

            if (isEditableTarget) return;
            if (event.key !== "Delete" && event.key !== "Backspace") return;

            event.preventDefault();
            deleteSelectedClips();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [deleteSelectedClips]);

    return (
        <div className='w-full max-h-full h-full flex flex-col'>
            <TimelineToolbar />
            {/* ===== Resize handdle ===== */}
            <div className='relative w-full'>
                <div
                    className='absolute w-full shrink-0 select-none z-30'
                    style={{
                        transformOrigin: "center bottom",
                        cursor: "row-resize",
                        height: "5px",
                        top: "-2px",
                    }}
                />
            </div>
            {/* ===== Timeline outer ===== */}
            <div className='flex-1 w-full h-full shrink-0 overflow-hidden border'>
                {/* ===== Timeline surface ===== */}
                <div className='relative h-full w-full select-none'>
                    {/* ===== Absolute fill wrapper ===== */}
                    <div className='absolute inset-0 h-full w-full flex flex-col'>
                        {/* ===== Scroll viewport ===== */}
                        <div
                            ref={scrollViewportRef}
                            className='flex h-full w-full overflow-x-scroll overflow-y-scroll'
                            onScroll={(event) => {
                                const element = event.currentTarget;

                                setTimelineScroll({
                                    scrollLeft: element.scrollLeft,
                                    scrollTop: element.scrollTop,
                                });
                            }}>
                            {/* ===== Track controls ===== */}
                            <div className='sticky left-0 flex flex-col min-h-0 h-full z-20 min-w-28 bg-white'>
                                <TimelineTrackHeaders
                                    tracks={tracks}
                                    lanes={laneResult.layouts}
                                    totalHeight={laneResult.totalHeight}
                                />
                            </div>

                            {/* ===== Track corner ===== */}
                            <div
                                className='absolute top-0 left-0 h-7 z-20 bg-gray-300'
                                style={{ width: "111px" }}></div>

                            <div
                                ref={timelineContentRef}
                                className='relative h-full w-full'>
                                {/* ===== Tick header =====*/}
                                <TimelineRuler
                                    fps={fps}
                                    visibleDurationInFrames={
                                        zoomComputed.visibleDurationInFrames
                                    }
                                    maxSeekFrame={playbackDurationInFrames}
                                    tickFrames={zoomComputed.tickFrames}
                                    timelineWidth={zoomComputed.timelineWidth}
                                    onSeekFrame={seekToFrame}
                                />

                                {/* ===== Track container ===== */}
                                <TimelineBody
                                    timelineWidth={zoomComputed.timelineWidth}
                                    lanes={laneResult.layouts}
                                    totalHeight={laneResult.totalHeight}>
                                    {clipLayouts.map((clipLayout) => (
                                        <TimelineItem
                                            key={clipLayout.clip.id}
                                            clipLayout={clipLayout}
                                            // OLD logic: TimelineItem always received the default unselected state.
                                            // NEW logic: Selection comes from the editor store so toolbar, timeline, and preview share state.
                                            isSelected={selectedClipIds.includes(
                                                clipLayout.clip.id,
                                            )}
                                            onSelect={(clipId) => {
                                                setSelectedClipIds([clipId]);
                                            }}
                                        />
                                    ))}
                                </TimelineBody>

                                {/* ===== Playhead ===== */}
                                <Playhead
                                    ref={playheadRef}
                                    currentFrame={currentFrame}
                                    durationInFrames={
                                        zoomComputed.visibleDurationInFrames
                                    }
                                    pixelsPerFrame={zoomComputed.pixelsPerFrame}
                                    isPlaying={playbackStatus === "playing"}
                                    onScrubStart={handlePlayheadScrubStart}
                                    onScrubMove={handlePlayheadScrubMove}
                                    onScrubEnd={handlePlayheadScrubEnd}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
