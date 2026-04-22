import { EditorState } from "../types/editor";

export const INITIAL_EDITOR_STATE: EditorState = {
    project: {
        id: "project-1",
        name: "Untitled Project",
        video: {
            fps: 30,
            width: 1920,
            height: 1080,
            durationInFrames: 60,
            backgroundColor: "#000000",
            aspectRatioPreset: "16:9",
        },
        trackGroups: [],
        tracks: [],
        clips: [],
    },

    runtime: {
        player: {
            currentFrame: 0,
            status: "idle",
            isMuted: false,
            playbackRate: 1,
        },

        preview: {
            containerWidth: 0,
            containerHeight: 0,
            zoom: 1,
            mode: "fit",
            isFullscreen: false,
        },

        timeline: {
            zoom: {
                zoomLevel: 10,
                minZoomLevel: 1,
                maxZoomLevel: 10,
                pixelsPerFrame: 10,
            },
            viewport: {
                scrollLeft: 0,
                scrollTop: 0,
                viewportWidth: 0,
                viewportHeight: 0,
            },
            toolbar: {
                snapEnabled: true,
                showRuler: true,
                showWaveforms: true,
                showThumbnails: true,
                isLoopEnabled: false,
            },
        },

        selection: {
            selectedClipIds: [],
            selectedTrackId: null,
            selectedGroupId: null,
        },

        interaction: {
            type: "idle",
        },

        textEditing: {
            editingClipId: null,
            draftText: "",
            isEditing: false,
        },
    },
};
