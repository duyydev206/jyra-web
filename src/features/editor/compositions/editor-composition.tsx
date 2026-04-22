"use client";

import React, { useMemo } from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { EditorProject, TextClip, TimelineClip, TimelineTrack } from "../types";

type EditorPreviewCompositionProps = {
    project?: EditorProject;
};

const fallbackProject: EditorProject = {
    id: "demo-project",
    name: "Demo Project",
    video: {
        fps: 30,
        width: 1920,
        height: 1080,
        durationInFrames: 90,
        backgroundColor: "#000000",
        aspectRatioPreset: "16:9",
    },
    trackGroups: [],
    tracks: [
        {
            id: "track-text-1",
            groupId: "group-text",
            label: "Text Track",
            kind: "text",
            index: 0,
            height: 72,
            isLocked: false,
            isMuted: false,
            isHidden: false,
        },
    ],
    clips: [
        {
            id: "clip-text-1",
            trackId: "track-text-1",
            type: "text",
            from: 0,
            durationInFrames: 60,
            sourceStartFrame: 0,
            label: "Hello World",
            color: "#3b82f6",
            isLocked: false,
            isHidden: false,
            text: "Hello World",
            style: {
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: 120,
                fontWeight: 700,
                textAlign: "center",
                color: "#ffffff",
            },
            transform: {
                x: 960,
                y: 540,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                opacity: 1,
                anchorX: 0.5,
                anchorY: 0.5,
            },
        },
    ],
};

const isClipVisibleAtFrame = (clip: TimelineClip, frame: number) => {
    return frame >= clip.from && frame < clip.from + clip.durationInFrames;
};

const getTrackIndexMap = (tracks: TimelineTrack[]) => {
    return new Map(tracks.map((track) => [track.id, track.index]));
};

const sortVisualClipsForRender = (
    clips: TimelineClip[],
    tracks: TimelineTrack[],
) => {
    const trackIndexMap = getTrackIndexMap(tracks);

    return [...clips].sort((a, b) => {
        const aTrackIndex = trackIndexMap.get(a.trackId) ?? 0;
        const bTrackIndex = trackIndexMap.get(b.trackId) ?? 0;

        if (aTrackIndex !== bTrackIndex) {
            return aTrackIndex - bTrackIndex;
        }

        return a.from - b.from;
    });
};

const getClipLocalFrame = (clip: TimelineClip, frame: number) => {
    return frame - clip.from;
};

const getBasicClipTransitionStyle = (
    clip: TimelineClip,
    localFrame: number,
    fps: number,
) => {
    const enterDuration = Math.min(12, clip.durationInFrames);
    const exitDuration = Math.min(12, clip.durationInFrames);

    const enterOpacity = interpolate(localFrame, [0, enterDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const enterTranslateY = interpolate(
        localFrame,
        [0, enterDuration],
        [24, 0],
        {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        },
    );

    const exitStart = Math.max(clip.durationInFrames - exitDuration, 0);

    const exitOpacity = interpolate(
        localFrame,
        [exitStart, clip.durationInFrames],
        [1, 0],
        {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        },
    );

    const popInScale = spring({
        frame: localFrame,
        fps,
        config: {
            damping: 200,
            stiffness: 180,
            mass: 0.7,
        },
    });

    const scale = interpolate(popInScale, [0, 1], [0.92, 1]);

    return {
        opacity: Math.min(enterOpacity, exitOpacity),
        translateY: enterTranslateY,
        scale,
    };
};

const TextClipLayer: React.FC<{
    clip: TextClip;
    frame: number;
    trackOrder: number;
}> = ({ clip, frame, trackOrder }) => {
    const { fps } = useVideoConfig();
    const localFrame = getClipLocalFrame(clip, frame);

    const transition = getBasicClipTransitionStyle(clip, localFrame, fps);

    const transform = clip.transform ?? {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        anchorX: 0.5,
        anchorY: 0.5,
    };

    return (
        <div
            style={{
                position: "absolute",
                left: transform.x,
                top: transform.y,
                transform: `
          translate(-50%, -50%)
          translateY(${transition.translateY}px)
          rotate(${transform.rotation}deg)
          scale(${transform.scaleX * transition.scale}, ${transform.scaleY * transition.scale})
        `,
                opacity: (transform.opacity ?? 1) * transition.opacity,
                zIndex: trackOrder,
                whiteSpace: "pre-wrap",
                textAlign: clip.style.textAlign ?? "center",
                color: clip.style.color,
                backgroundColor: clip.style.backgroundColor,
                fontFamily: clip.style.fontFamily,
                fontSize: clip.style.fontSize,
                fontWeight: clip.style.fontWeight,
                fontStyle: clip.style.fontStyle,
                lineHeight: clip.style.lineHeight,
                letterSpacing: clip.style.letterSpacing,
                textDecoration: clip.style.textDecoration,
                textTransform: clip.style.textTransform,
                userSelect: "none",
            }}>
            {clip.text}
        </div>
    );
};

const EditorPreviewComposition: React.FC<EditorPreviewCompositionProps> = ({
    project = fallbackProject,
}) => {
    const frame = useCurrentFrame();
    const { width, height, fps } = useVideoConfig();

    const visibleSortedClips = useMemo(() => {
        const visible = project.clips.filter(
            (clip) => !clip.isHidden && isClipVisibleAtFrame(clip, frame),
        );

        return sortVisualClipsForRender(visible, project.tracks);
    }, [frame, project.clips, project.tracks]);

    const trackIndexMap = useMemo(() => {
        return getTrackIndexMap(project.tracks);
    }, [project.tracks]);

    return (
        <AbsoluteFill
            style={{
                background: project.video.backgroundColor ?? "#000",
                width,
                height,
                overflow: "hidden",
            }}>
            {visibleSortedClips.map((clip) => {
                const trackOrder = trackIndexMap.get(clip.trackId) ?? 0;

                switch (clip.type) {
                    case "text":
                        return (
                            <TextClipLayer
                                key={clip.id}
                                clip={clip}
                                frame={frame}
                                trackOrder={trackOrder}
                            />
                        );

                    default:
                        return null;
                }
            })}
            <span className='text-white text-end p-1'>
                {width} × {height} • {fps} FPS • Frame {frame}
            </span>
        </AbsoluteFill>
    );
};

export default EditorPreviewComposition;
