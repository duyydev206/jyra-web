"use client";

import { useEffect, useMemo, useRef } from "react";
import type { PlayerRef } from "@remotion/player";
import { PreviewViewportState } from "../../types/preview";
import { useElementSize } from "./hooks/use-element-size";
import { PreviewViewport } from "./components/preview-viewport";
import {
    useEditorStore,
    useLoopEnabled,
    usePreviewFullscreen,
} from "../../stores";

const EditorPlayer = () => {
    const playerRef = useRef<PlayerRef>(null);
    const { ref, size } = useElementSize<HTMLDivElement>();

    const video = useEditorStore((state) => state.project.video);
    const player = useEditorStore((state) => state.runtime.player);
    const isLoopEnabled = useLoopEnabled();
    const isFullscreen = usePreviewFullscreen();
    const setCurrentFrame = useEditorStore((state) => state.setCurrentFrame);
    const setPlaybackStatus = useEditorStore(
        (state) => state.setPlaybackStatus,
    );
    const setPreviewContainerSize = useEditorStore(
        (state) => state.setPreviewContainerSize,
    );

    const viewport = useMemo<PreviewViewportState>(() => {
        return {
            containerWidth: size.width,
            containerHeight: size.height,
            zoom: 1,
            mode: "fit",
            isFullscreen: false,
        };
    }, [size.width, size.height]);

    useEffect(() => {
        setPreviewContainerSize({
            containerWidth: size.width,
            containerHeight: size.height,
        });
    }, [setPreviewContainerSize, size.width, size.height]);

    // Sync playback status từ store -> Remotion Player
    useEffect(() => {
        const instance = playerRef.current;
        if (!instance) return;

        if (player.status === "playing") {
            if (!instance.isPlaying()) {
                instance.play();
            }
            return;
        }

        if (instance.isPlaying()) {
            instance.pause();
        }
    }, [player.status]);

    // Sync currentFrame từ store -> Remotion Player
    useEffect(() => {
        const instance = playerRef.current;
        if (!instance) return;

        const currentFrameInPlayer = instance.getCurrentFrame();

        if (currentFrameInPlayer !== player.currentFrame) {
            instance.seekTo(player.currentFrame);
        }
    }, [player.currentFrame]);

    return (
        <>
            {!isFullscreen ? (
                <div
                    ref={ref}
                    className='h-full w-full min-h-0 min-w-0 overflow-hidden'>
                    <PreviewViewport
                        playerRef={playerRef}
                        video={video}
                        viewport={viewport}
                        isLoopEnabled={isLoopEnabled}
                        onFrameUpdate={(frame) => {
                            setCurrentFrame(frame);
                        }}
                        onPlay={() => {
                            setPlaybackStatus("playing");
                        }}
                        onPause={() => {
                            setPlaybackStatus(
                                player.currentFrame >=
                                    video.durationInFrames - 1
                                    ? "ended"
                                    : "paused",
                            );
                        }}
                    />
                </div>
            ) : (
                <div className='fixed inset-0 z-50 bg-black flex items-center justify-center'>
                    <div className='w-full h-full flex items-center justify-center'>
                        <PreviewViewport
                            playerRef={playerRef}
                            video={video}
                            viewport={viewport}
                            isLoopEnabled={isLoopEnabled}
                            onFrameUpdate={(frame) => {
                                setCurrentFrame(frame);
                            }}
                            onPlay={() => {
                                setPlaybackStatus("playing");
                            }}
                            onPause={() => {
                                setPlaybackStatus(
                                    player.currentFrame >=
                                        video.durationInFrames - 1
                                        ? "ended"
                                        : "paused",
                                );
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default EditorPlayer;
