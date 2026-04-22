import { Frame, Frames } from "./primitives";

export type PlaybackStatus = "idle" | "playing" | "paused" | "ended";

export type PlayerState = {
    currentFrame: Frame;
    status: PlaybackStatus;
    isMuted: boolean;
    playbackRate: number;
};

export type PlayerActions = {
    play: () => void;
    pause: () => void;
    togglePlay: () => void;

    seekToFrame: (frame: Frame) => void;
    seekByFrames: (delta: Frames) => void;

    setPlaybackRate: (rate: number) => void;
    setMuted: (muted: boolean) => void;
};

export type PlayerSyncPayload = {
    currentFrame: Frame;
    status: PlaybackStatus;
};
