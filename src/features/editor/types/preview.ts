import { Pixels } from "./primitives";

export type PreviewViewportMode = "fit" | "fill" | "custom";

export type PreviewViewportState = {
    containerWidth: Pixels;
    containerHeight: Pixels;
    zoom: number;
    mode: PreviewViewportMode;
    isFullscreen: boolean;
};

export type PreviewSurfaceLayout = {
    scale: number;
    renderedWidth: Pixels;
    renderedHeight: Pixels;
    offsetX: Pixels;
    offsetY: Pixels;
};
