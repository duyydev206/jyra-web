"use client";

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
// import { getPixelsPerFrame, getTimelineWidth } from "../../lib/timeline-math";
import { computeTimelineZoom } from "../../lib/timeline-zoom-engine";

const Timeline: React.FC = () => {
    const project = useEditorStore((state) => state.project);
    const runtime = useEditorStore((state) => state.runtime);

    const tracks = project.tracks;
    const clips = project.clips;
    const fps = project.video.fps;
    const durationInFrames = project.video.durationInFrames;
    const currentFrame = runtime.player.currentFrame;
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
                        <div className='flex h-full w-full overflow-x-scroll overflow-y-scroll'>
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
                                className='absolute top-0 left-0 h-7 w z-20 bg-gray-300'
                                style={{ width: "111px" }}></div>

                            <div className='relative h-full'>
                                {/* ===== Tick header =====*/}
                                <TimelineRuler
                                    fps={fps}
                                    visibleDurationInFrames={
                                        zoomComputed.visibleDurationInFrames
                                    }
                                    tickFrames={zoomComputed.tickFrames}
                                    timelineWidth={zoomComputed.timelineWidth}
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
                                        />
                                    ))}
                                </TimelineBody>

                                {/* ===== Playhead ===== */}
                                <Playhead
                                    currentFrame={currentFrame}
                                    durationInFrames={
                                        zoomComputed.visibleDurationInFrames
                                    }
                                    pixelsPerFrame={zoomComputed.pixelsPerFrame}
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
