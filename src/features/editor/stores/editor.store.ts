import { create } from "zustand";
import type { EditorStore } from "./editor.types";
import { INITIAL_EDITOR_STATE } from "./editor.initial-state";

const clamp = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(value, max));
};

const clampFrame = (frame: number, durationInFrames: number) => {
    if (durationInFrames <= 0) return 0;
    return clamp(frame, 0, durationInFrames - 1);
};

export const useEditorStore = create<EditorStore>((set, get) => ({
    ...INITIAL_EDITOR_STATE,

    // ===== Player =====
    setCurrentFrame: (frame) => {
        const duration = get().project.video.durationInFrames;

        set((state) => ({
            runtime: {
                ...state.runtime,
                player: {
                    ...state.runtime.player,
                    currentFrame: clampFrame(frame, duration),
                },
            },
        }));
    },

    setPlaybackStatus: (status) => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                player: {
                    ...state.runtime.player,
                    status,
                },
            },
        }));
    },

    play: () => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                player: {
                    ...state.runtime.player,
                    status: "playing",
                },
            },
        }));
    },

    pause: () => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                player: {
                    ...state.runtime.player,
                    status: "paused",
                },
            },
        }));
    },

    togglePlay: () => {
        const currentStatus = get().runtime.player.status;

        set((state) => ({
            runtime: {
                ...state.runtime,
                player: {
                    ...state.runtime.player,
                    status: currentStatus === "playing" ? "paused" : "playing",
                },
            },
        }));
    },

    seekToFrame: (frame) => {
        const duration = get().project.video.durationInFrames;

        set((state) => ({
            runtime: {
                ...state.runtime,
                player: {
                    ...state.runtime.player,
                    currentFrame: clampFrame(frame, duration),
                },
            },
        }));
    },

    seekByFrames: (delta) => {
        const currentFrame = get().runtime.player.currentFrame;
        const duration = get().project.video.durationInFrames;

        set((state) => ({
            runtime: {
                ...state.runtime,
                player: {
                    ...state.runtime.player,
                    currentFrame: clampFrame(currentFrame + delta, duration),
                },
            },
        }));
    },

    setMuted: (muted) => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                player: {
                    ...state.runtime.player,
                    isMuted: muted,
                },
            },
        }));
    },

    toggleMuted: () => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                player: {
                    ...state.runtime.player,
                    isMuted: !state.runtime.player.isMuted,
                },
            },
        }));
    },

    setPlaybackRate: (rate) => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                player: {
                    ...state.runtime.player,
                    playbackRate: rate,
                },
            },
        }));
    },

    // ===== Preview =====
    setPreviewContainerSize: ({ containerWidth, containerHeight }) => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                preview: {
                    ...state.runtime.preview,
                    containerWidth,
                    containerHeight,
                },
            },
        }));
    },

    setPreviewZoom: (zoom) => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                preview: {
                    ...state.runtime.preview,
                    zoom,
                },
            },
        }));
    },

    setPreviewMode: (mode) => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                preview: {
                    ...state.runtime.preview,
                    mode,
                },
            },
        }));
    },

    togglePreviewFullscreen: () => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                preview: {
                    ...state.runtime.preview,
                    isFullscreen: !state.runtime.preview.isFullscreen,
                },
            },
        }));
    },

    setPreviewFullscreen: (isFullscreen) => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                preview: {
                    ...state.runtime.preview,
                    isFullscreen,
                },
            },
        }));
    },

    // ===== Timeline Zoom =====
    setTimelineZoomLevel: (zoomLevel) => {
        const minZoomLevel = get().runtime.timeline.zoom.minZoomLevel;
        const maxZoomLevel = get().runtime.timeline.zoom.maxZoomLevel;

        set((state) => ({
            runtime: {
                ...state.runtime,
                timeline: {
                    ...state.runtime.timeline,
                    zoom: {
                        ...state.runtime.timeline.zoom,
                        zoomLevel: clamp(zoomLevel, minZoomLevel, maxZoomLevel),
                    },
                },
            },
        }));
    },

    zoomTimelineIn: () => {
        const { zoomLevel, minZoomLevel, maxZoomLevel } =
            get().runtime.timeline.zoom;

        set((state) => ({
            runtime: {
                ...state.runtime,
                timeline: {
                    ...state.runtime.timeline,
                    zoom: {
                        ...state.runtime.timeline.zoom,
                        zoomLevel: clamp(
                            zoomLevel + 1,
                            minZoomLevel,
                            maxZoomLevel,
                        ),
                    },
                },
            },
        }));
    },

    zoomTimelineOut: () => {
        const { zoomLevel, minZoomLevel, maxZoomLevel } =
            get().runtime.timeline.zoom;

        set((state) => ({
            runtime: {
                ...state.runtime,
                timeline: {
                    ...state.runtime.timeline,
                    zoom: {
                        ...state.runtime.timeline.zoom,
                        zoomLevel: clamp(
                            zoomLevel - 1,
                            minZoomLevel,
                            maxZoomLevel,
                        ),
                    },
                },
            },
        }));
    },

    setTimelinePixelsPerFrame: (pixelsPerFrame) => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                timeline: {
                    ...state.runtime.timeline,
                    zoom: {
                        ...state.runtime.timeline.zoom,
                        pixelsPerFrame,
                    },
                },
            },
        }));
    },

    // ===== Timeline Viewport =====
    setTimelineViewportSize: ({ viewportWidth, viewportHeight }) => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                timeline: {
                    ...state.runtime.timeline,
                    viewport: {
                        ...state.runtime.timeline.viewport,
                        viewportWidth,
                        viewportHeight,
                    },
                },
            },
        }));
    },

    setTimelineScroll: ({ scrollLeft, scrollTop }) => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                timeline: {
                    ...state.runtime.timeline,
                    viewport: {
                        ...state.runtime.timeline.viewport,
                        scrollLeft:
                            scrollLeft ??
                            state.runtime.timeline.viewport.scrollLeft,
                        scrollTop:
                            scrollTop ??
                            state.runtime.timeline.viewport.scrollTop,
                    },
                },
            },
        }));
    },

    // ===== Timeline Toolbar =====
    toggleSnap: () => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                timeline: {
                    ...state.runtime.timeline,
                    toolbar: {
                        ...state.runtime.timeline.toolbar,
                        snapEnabled:
                            !state.runtime.timeline.toolbar.snapEnabled,
                    },
                },
            },
        }));
    },

    toggleLoop: () => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                timeline: {
                    ...state.runtime.timeline,
                    toolbar: {
                        ...state.runtime.timeline.toolbar,
                        isLoopEnabled:
                            !state.runtime.timeline.toolbar.isLoopEnabled,
                    },
                },
            },
        }));
    },

    toggleShowRuler: () => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                timeline: {
                    ...state.runtime.timeline,
                    toolbar: {
                        ...state.runtime.timeline.toolbar,
                        showRuler: !state.runtime.timeline.toolbar.showRuler,
                    },
                },
            },
        }));
    },

    toggleShowWaveforms: () => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                timeline: {
                    ...state.runtime.timeline,
                    toolbar: {
                        ...state.runtime.timeline.toolbar,
                        showWaveforms:
                            !state.runtime.timeline.toolbar.showWaveforms,
                    },
                },
            },
        }));
    },

    toggleShowThumbnails: () => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                timeline: {
                    ...state.runtime.timeline,
                    toolbar: {
                        ...state.runtime.timeline.toolbar,
                        showThumbnails:
                            !state.runtime.timeline.toolbar.showThumbnails,
                    },
                },
            },
        }));
    },

    // ===== Selection =====
    setSelectedClipIds: (clipIds) => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                selection: {
                    ...state.runtime.selection,
                    selectedClipIds: clipIds,
                },
            },
        }));
    },

    setSelectedTrackId: (trackId) => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                selection: {
                    ...state.runtime.selection,
                    selectedTrackId: trackId,
                },
            },
        }));
    },

    setSelectedGroupId: (groupId) => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                selection: {
                    ...state.runtime.selection,
                    selectedGroupId: groupId,
                },
            },
        }));
    },

    clearSelection: () => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                selection: {
                    selectedClipIds: [],
                    selectedTrackId: null,
                    selectedGroupId: null,
                },
            },
        }));
    },

    // ===== Text Editing =====
    startTextEditing: ({ clipId, draftText }) => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                textEditing: {
                    editingClipId: clipId,
                    draftText,
                    isEditing: true,
                },
            },
        }));
    },

    updateTextDraft: (draftText) => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                textEditing: {
                    ...state.runtime.textEditing,
                    draftText,
                },
            },
        }));
    },

    stopTextEditing: () => {
        set((state) => ({
            runtime: {
                ...state.runtime,
                textEditing: {
                    editingClipId: null,
                    draftText: "",
                    isEditing: false,
                },
            },
        }));
    },

    // ===== Toolbar command stubs =====
    splitSelectedClipAtPlayhead: () => {
        console.log("splitSelectedClipAtPlayhead: not implemented yet");
    },

    deleteSelectedClips: () => {
        console.log("deleteSelectedClips: not implemented yet");
    },

    undo: () => {
        console.log("undo: not implemented yet");
    },

    redo: () => {
        console.log("redo: not implemented yet");
    },
}));
