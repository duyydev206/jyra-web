import { getEditorPlaybackDurationInFrames } from "../../lib/playback-duration";
import { formatTime } from "../../lib/format-time";
import { useEditorStore } from "../../stores";
import type { TimelineClip } from "../../types";
import InspectorSection from "./components/inspector-section";

const getClipTransform = (clip: TimelineClip) => {
    return {
        x: clip.transform?.x ?? 0,
        y: clip.transform?.y ?? 0,
        scaleX: clip.transform?.scaleX ?? 1,
        scaleY: clip.transform?.scaleY ?? 1,
        rotation: clip.transform?.rotation ?? 0,
        opacity: clip.transform?.opacity ?? 1,
    };
};

const InspectorField: React.FC<{
    label: string;
    children: React.ReactNode;
}> = ({ label, children }) => {
    return (
        <label className='grid gap-1.5'>
            <span className='text-xs text-neutral-500'>{label}</span>
            {children}
        </label>
    );
};

const InspectorInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
    props,
) => {
    return (
        <input
            {...props}
            className='h-9 w-full rounded-md border border-black/10 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-sky-500'
        />
    );
};

const InspectorButton: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", ...props }) => {
    return (
        <button
            {...props}
            className={`flex h-9 w-full items-center justify-center rounded-md border border-black/10 bg-white px-3 text-sm text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        />
    );
};

const ProjectInspector = () => {
    const project = useEditorStore((state) => state.project);
    const durationInFrames = getEditorPlaybackDurationInFrames(project);

    return (
        <>
            <InspectorSection title='Canvas'>
                <div className='grid grid-cols-2 gap-3'>
                    <InspectorField label='W'>
                        <InspectorInput readOnly value={project.video.width} />
                    </InspectorField>
                    <InspectorField label='H'>
                        <InspectorInput readOnly value={project.video.height} />
                    </InspectorField>
                </div>
            </InspectorSection>

            <InspectorSection title='Duration'>
                <InspectorInput
                    readOnly
                    value={formatTime(durationInFrames, project.video.fps)}
                />
            </InspectorSection>

            <InspectorSection title='Export'>
                <InspectorInput readOnly value='MP4 (H.264)' />
                <InspectorButton disabled>Render video</InspectorButton>
            </InspectorSection>
        </>
    );
};

const SelectedClipInspector: React.FC<{ clip: TimelineClip }> = ({ clip }) => {
    const project = useEditorStore((state) => state.project);
    const updateClipTransform = useEditorStore(
        (state) => state.updateClipTransform,
    );
    const transform = getClipTransform(clip);
    const fps = project.video.fps;
    const endFrame = clip.from + clip.durationInFrames;

    const handleTransformInput =
        (key: keyof typeof transform) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const nextValue = Number(event.target.value);
            if (!Number.isFinite(nextValue)) return;

            updateClipTransform({
                clipId: clip.id,
                transform: {
                    [key]: nextValue,
                },
            });
        };

    return (
        <>
            <InspectorSection title='Clip'>
                <InspectorField label='Name'>
                    <InspectorInput readOnly value={clip.label} />
                </InspectorField>
                <div className='grid grid-cols-2 gap-3'>
                    <InspectorField label='Type'>
                        <InspectorInput
                            readOnly
                            value={clip.type.toUpperCase()}
                        />
                    </InspectorField>
                    <InspectorField label='Layer'>
                        <InspectorInput
                            readOnly
                            value={String(clip.layerIndex)}
                        />
                    </InspectorField>
                </div>
            </InspectorSection>

            <InspectorSection title='Timing'>
                <div className='grid grid-cols-2 gap-3'>
                    <InspectorField label='Start'>
                        <InspectorInput
                            readOnly
                            value={formatTime(clip.from, fps)}
                        />
                    </InspectorField>
                    <InspectorField label='Duration'>
                        <InspectorInput
                            readOnly
                            value={formatTime(clip.durationInFrames, fps)}
                        />
                    </InspectorField>
                </div>
                <InspectorField label='End'>
                    <InspectorInput
                        readOnly
                        value={formatTime(endFrame, fps)}
                    />
                </InspectorField>
            </InspectorSection>

            <InspectorSection title='Transform'>
                <div className='grid grid-cols-2 gap-3'>
                    <InspectorField label='X'>
                        <InspectorInput
                            type='number'
                            value={transform.x}
                            onChange={handleTransformInput("x")}
                        />
                    </InspectorField>
                    <InspectorField label='Y'>
                        <InspectorInput
                            type='number'
                            value={transform.y}
                            onChange={handleTransformInput("y")}
                        />
                    </InspectorField>
                    <InspectorField label='Scale X'>
                        <InspectorInput
                            type='number'
                            step='0.1'
                            value={transform.scaleX}
                            onChange={handleTransformInput("scaleX")}
                        />
                    </InspectorField>
                    <InspectorField label='Scale Y'>
                        <InspectorInput
                            type='number'
                            step='0.1'
                            value={transform.scaleY}
                            onChange={handleTransformInput("scaleY")}
                        />
                    </InspectorField>
                    <InspectorField label='Rotation'>
                        <InspectorInput
                            type='number'
                            step='1'
                            value={transform.rotation}
                            onChange={handleTransformInput("rotation")}
                        />
                    </InspectorField>
                    <InspectorField label='Opacity'>
                        <InspectorInput
                            type='number'
                            step='0.1'
                            min='0'
                            max='1'
                            value={transform.opacity}
                            onChange={handleTransformInput("opacity")}
                        />
                    </InspectorField>
                </div>
            </InspectorSection>
        </>
    );
};

const Inspector = () => {
    const project = useEditorStore((state) => state.project);
    const selectedClipIds = useEditorStore(
        (state) => state.runtime.selection.selectedClipIds,
    );
    const selectedClip =
        selectedClipIds.length > 0
            ? (project.clips.find((clip) => clip.id === selectedClipIds[0]) ??
              null)
            : null;

    return (
        <aside className='flex h-full min-h-0 w-full flex-col overflow-hidden bg-white text-neutral-900'>
            <div className='border-b border-black/10 px-4 py-3'>
                <h1 className='text-sm font-medium'>
                    {selectedClip ? "Clip" : "Project"}
                </h1>
            </div>

            <div className='min-h-0 flex-1 overflow-y-auto'>
                {selectedClip ? (
                    <SelectedClipInspector clip={selectedClip} />
                ) : (
                    <ProjectInspector />
                )}
            </div>
        </aside>
    );
};

export default Inspector;
