import { ClipId, Frame, Frames, Pixels, TrackId } from "./primitives";

export type ClipResizeHandle = "start" | "end";

export type SnapPointType =
    | "playhead"
    | "clip-start"
    | "clip-end"
    | "ruler-mark";

export type SnapPoint = {
    frame: Frame;
    type: SnapPointType;
    sourceId?: string;
};

export type SnapResult = {
    snappedFrame: Frame;
    didSnap: boolean;
    snappedTo?: SnapPoint;
};

export type DragPlayheadInteraction = {
    type: "drag-playhead";
    startFrame: Frame;
    pointerStartX: Pixels;
    pointerCurrentX: Pixels;
};

export type MoveClipInteraction = {
    type: "move-clip";
    clipId: ClipId;

    originTrackId: TrackId;
    originFrom: Frame;

    currentTrackId: TrackId;
    currentFrom: Frame;

    pointerStartX: Pixels;
    pointerCurrentX: Pixels;
    pointerStartY: Pixels;
    pointerCurrentY: Pixels;

    deltaFrames: Frames;

    snapResult?: SnapResult;
};

export type ResizeClipInteraction = {
    type: "resize-clip";
    clipId: ClipId;
    handle: ClipResizeHandle;

    originFrom: Frame;
    originDurationInFrames: Frames;

    currentFrom: Frame;
    currentDurationInFrames: Frames;

    pointerStartX: Pixels;
    pointerCurrentX: Pixels;
    pointerStartY: Pixels;
    pointerCurrentY: Pixels;

    deltaFrames: Frames;

    snapResult?: SnapResult;
};

export type TimelineInteractionState =
    | { type: "idle" }
    | DragPlayheadInteraction
    | MoveClipInteraction
    | ResizeClipInteraction;

export type TextEditingState = {
    editingClipId: ClipId | null;
    draftText: string;
    isEditing: boolean;
};
