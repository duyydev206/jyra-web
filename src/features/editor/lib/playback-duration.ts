import type { EditorProject, Frames } from "../types";

export const getEditorPlaybackDurationInFrames = (
    project: EditorProject,
): Frames => {
    if (project.clips.length === 0) {
        // OLD logic: Empty projects used a fake 10s playback duration.
        // NEW logic: Empty projects stay at 0; ruler visibility is handled by timeline zoom.
        return 0;
    }

    return project.video.durationInFrames;
};

export const getRemotionPlayerDurationInFrames = (
    playbackDurationInFrames: Frames,
): Frames => {
    // Remotion Player requires a positive duration even when the editor has no content.
    return Math.max(1, playbackDurationInFrames);
};
