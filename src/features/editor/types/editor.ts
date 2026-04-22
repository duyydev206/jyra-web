import { TimelineInteractionState, TextEditingState } from "./interaction";
import { PlayerState } from "./player";
import { PreviewViewportState } from "./preview";
import { EditorProject } from "./projects";
import { SelectionState, TimelineUIState } from "./timeline";

export type EditorRuntimeState = {
    player: PlayerState;
    preview: PreviewViewportState;
    timeline: TimelineUIState;
    selection: SelectionState;
    interaction: TimelineInteractionState;
    textEditing: TextEditingState;
};

export type EditorState = {
    project: EditorProject;
    runtime: EditorRuntimeState;
};
