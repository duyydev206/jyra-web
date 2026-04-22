import { Pixels } from "../types";
import { PreviewSurfaceLayout, PreviewViewportMode } from "../types/preview";

type GetPreviewSurfaceLayoutParams = {
    containerWidth: Pixels;
    containerHeight: Pixels;
    compositionWidth: number;
    compositionHeight: number;
    zoom?: number;
    mode?: PreviewViewportMode;
    padding?: number;
};

export const getPreviewSurfaceLayout = ({
    containerWidth,
    containerHeight,
    compositionWidth,
    compositionHeight,
    zoom = 1,
    mode = "fit",
    padding = 24,
}: GetPreviewSurfaceLayoutParams): PreviewSurfaceLayout => {
    const availableWidth = Math.max(containerWidth - padding * 2, 0);
    const availableHeight = Math.max(containerHeight - padding * 2, 0);

    if (
        availableWidth <= 0 ||
        availableHeight <= 0 ||
        compositionWidth <= 0 ||
        compositionHeight <= 0
    ) {
        return {
            scale: 0,
            renderedWidth: 0,
            renderedHeight: 0,
            offsetX: 0,
            offsetY: 0,
        };
    }

    const scaleX = availableWidth / compositionWidth;
    const scaleY = availableHeight / compositionHeight;

    const baseScale =
        mode === "fill" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);

    const scale = baseScale * zoom;

    const renderedWidth = compositionWidth * scale;
    const renderedHeight = compositionHeight * scale;

    const offsetX = (containerWidth - renderedWidth) / 2;
    const offsetY = (containerHeight - renderedHeight) / 2;

    return {
        scale,
        renderedWidth,
        renderedHeight,
        offsetX,
        offsetY,
    };
};
