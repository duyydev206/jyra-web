import { clsx } from "clsx";
import { formatTime } from "../../lib/format-time";
import { getEditorPlaybackDurationInFrames } from "../../lib/playback-duration";
import { useEditorStore } from "../../stores";
import type {
    ImageClip,
    ShapeClip,
    TextClip,
    TimelineClip,
    VideoClip,
    AudioClip,
} from "../../types";
import InspectorSection from "./components/inspector-section";

const FONT_FAMILIES = [
    "Inter, Arial, sans-serif",
    "Arial, Helvetica, sans-serif",
    "Georgia, serif",
    "Impact, sans-serif",
    "Courier New, monospace",
];

const getClipTransform = (clip: TimelineClip) => {
    return {
        x: clip.transform?.x ?? 0,
        y: clip.transform?.y ?? 0,
        scaleX: clip.transform?.scaleX ?? 1,
        scaleY: clip.transform?.scaleY ?? 1,
        rotation: clip.transform?.rotation ?? 0,
        opacity: clip.transform?.opacity ?? 1,
        width: clip.transform?.width,
        height: clip.transform?.height,
    };
};

const readNumber = (value: string, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const InspectorField: React.FC<{
    label: string;
    hint?: string;
    children: React.ReactNode;
}> = ({ label, hint, children }) => {
    return (
        <label className='grid gap-1.5'>
            <span className='flex items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-wide text-neutral-500'>
                <span>{label}</span>
                {hint && (
                    <span className='normal-case tracking-normal text-neutral-400'>
                        {hint}
                    </span>
                )}
            </span>
            {children}
        </label>
    );
};

const controlClass =
    "h-9 w-full rounded-md border border-black/10 bg-white px-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 disabled:bg-neutral-50 disabled:text-neutral-500";

const InspectorInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
    className = "",
    ...props
}) => {
    return <input {...props} className={clsx(controlClass, className)} />;
};

const InspectorTextarea: React.FC<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ className = "", ...props }) => {
    return (
        <textarea
            {...props}
            className={clsx(
                "min-h-20 w-full resize-none rounded-md border border-black/10 bg-white px-2.5 py-2 text-sm leading-5 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10",
                className,
            )}
        />
    );
};

const InspectorSelect: React.FC<
    React.SelectHTMLAttributes<HTMLSelectElement>
> = ({ className = "", ...props }) => {
    return <select {...props} className={clsx(controlClass, className)} />;
};

const ColorInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
}> = ({ value, onChange }) => {
    return (
        <div className='flex h-9 items-center gap-2 rounded-md border border-black/10 bg-white px-2'>
            <input
                type='color'
                value={value}
                className='h-5 w-6 shrink-0 cursor-pointer border-0 bg-transparent p-0'
                onChange={(event) => onChange(event.target.value)}
            />
            <input
                value={value}
                className='min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none'
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
};

const SegmentedControl = <T extends string>({
    value,
    options,
    onChange,
}: {
    value: T;
    options: { label: string; value: T }[];
    onChange: (value: T) => void;
}) => {
    return (
        <div className='flex h-9 rounded-md border border-black/10 bg-neutral-50 p-0.5'>
            {options.map((option) => (
                <button
                    key={option.value}
                    type='button'
                    className={clsx(
                        "min-w-0 flex-1 rounded px-2 text-xs font-medium text-neutral-600 transition hover:text-neutral-950",
                        option.value === value &&
                            "bg-white text-neutral-950 shadow-sm",
                    )}
                    onClick={() => onChange(option.value)}>
                    {option.label}
                </button>
            ))}
        </div>
    );
};

const StatRow: React.FC<{ label: string; value: string }> = ({
    label,
    value,
}) => {
    return (
        <div className='flex items-center justify-between gap-3 rounded-md bg-neutral-50 px-3 py-2'>
            <span className='text-xs text-neutral-500'>{label}</span>
            <span className='truncate text-sm font-medium text-neutral-900'>
                {value}
            </span>
        </div>
    );
};

const ProjectInspector = () => {
    const project = useEditorStore((state) => state.project);
    const updateProjectVideoConfig = useEditorStore(
        (state) => state.updateProjectVideoConfig,
    );
    const durationInFrames = getEditorPlaybackDurationInFrames(project);

    return (
        <>
            <InspectorSection
                title='Project'
                description='Canvas and timeline output'>
                <InspectorField label='Name'>
                    <InspectorInput readOnly value={project.name} />
                </InspectorField>

                <div className='grid grid-cols-2 gap-3'>
                    <InspectorField label='Width' hint='px'>
                        <InspectorInput
                            type='number'
                            min={1}
                            value={project.video.width}
                            onChange={(event) =>
                                updateProjectVideoConfig({
                                    width: readNumber(
                                        event.target.value,
                                        project.video.width,
                                    ),
                                })
                            }
                        />
                    </InspectorField>
                    <InspectorField label='Height' hint='px'>
                        <InspectorInput
                            type='number'
                            min={1}
                            value={project.video.height}
                            onChange={(event) =>
                                updateProjectVideoConfig({
                                    height: readNumber(
                                        event.target.value,
                                        project.video.height,
                                    ),
                                })
                            }
                        />
                    </InspectorField>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                    <InspectorField label='FPS'>
                        <InspectorInput
                            type='number'
                            min={1}
                            value={project.video.fps}
                            onChange={(event) =>
                                updateProjectVideoConfig({
                                    fps: readNumber(
                                        event.target.value,
                                        project.video.fps,
                                    ),
                                })
                            }
                        />
                    </InspectorField>
                    <InspectorField label='Duration'>
                        <InspectorInput
                            readOnly
                            value={formatTime(
                                durationInFrames,
                                project.video.fps,
                            )}
                        />
                    </InspectorField>
                </div>

                <InspectorField label='Background'>
                    <ColorInput
                        value={project.video.backgroundColor ?? "#000000"}
                        onChange={(backgroundColor) =>
                            updateProjectVideoConfig({ backgroundColor })
                        }
                    />
                </InspectorField>
            </InspectorSection>

            <InspectorSection title='Export' description='Render settings'>
                <StatRow label='Format' value='MP4 (H.264)' />
                <StatRow
                    label='Size'
                    value={`${project.video.width} x ${project.video.height}`}
                />
                <button
                    type='button'
                    disabled
                    className='h-9 w-full rounded-md bg-neutral-900 px-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-neutral-300'>
                    Render video
                </button>
            </InspectorSection>
        </>
    );
};

const TimingControls: React.FC<{ clip: TimelineClip; fps: number }> = ({
    clip,
    fps,
}) => {
    const updateClipTiming = useEditorStore((state) => state.updateClipTiming);
    const endFrame = clip.from + clip.durationInFrames;

    return (
        <InspectorSection title='Timing' description='Frames and timecode'>
            <div className='grid grid-cols-2 gap-3'>
                <InspectorField label='Start' hint='fr'>
                    <InspectorInput
                        type='number'
                        min={0}
                        value={clip.from}
                        onChange={(event) =>
                            updateClipTiming({
                                clipId: clip.id,
                                from: readNumber(event.target.value, clip.from),
                            })
                        }
                    />
                </InspectorField>
                <InspectorField label='Duration' hint='fr'>
                    <InspectorInput
                        type='number'
                        min={1}
                        value={clip.durationInFrames}
                        onChange={(event) =>
                            updateClipTiming({
                                clipId: clip.id,
                                durationInFrames: readNumber(
                                    event.target.value,
                                    clip.durationInFrames,
                                ),
                            })
                        }
                    />
                </InspectorField>
            </div>
            <div className='grid grid-cols-2 gap-3'>
                <StatRow label='Start' value={formatTime(clip.from, fps)} />
                <StatRow label='End' value={formatTime(endFrame, fps)} />
            </div>
        </InspectorSection>
    );
};

const TransformControls: React.FC<{ clip: TimelineClip }> = ({ clip }) => {
    const updateClipTransform = useEditorStore(
        (state) => state.updateClipTransform,
    );
    const transform = getClipTransform(clip);
    const updateTransform = (key: keyof typeof transform, value: number) => {
        updateClipTransform({
            clipId: clip.id,
            transform: {
                [key]: value,
            },
        });
    };

    return (
        <InspectorSection title='Transform' description='Position and opacity'>
            <div className='grid grid-cols-2 gap-3'>
                <InspectorField label='X' hint='px'>
                    <InspectorInput
                        type='number'
                        value={transform.x}
                        onChange={(event) =>
                            updateTransform(
                                "x",
                                readNumber(event.target.value, transform.x),
                            )
                        }
                    />
                </InspectorField>
                <InspectorField label='Y' hint='px'>
                    <InspectorInput
                        type='number'
                        value={transform.y}
                        onChange={(event) =>
                            updateTransform(
                                "y",
                                readNumber(event.target.value, transform.y),
                            )
                        }
                    />
                </InspectorField>
                <InspectorField label='Scale X'>
                    <InspectorInput
                        type='number'
                        step='0.05'
                        value={transform.scaleX}
                        onChange={(event) =>
                            updateTransform(
                                "scaleX",
                                readNumber(
                                    event.target.value,
                                    transform.scaleX,
                                ),
                            )
                        }
                    />
                </InspectorField>
                <InspectorField label='Scale Y'>
                    <InspectorInput
                        type='number'
                        step='0.05'
                        value={transform.scaleY}
                        onChange={(event) =>
                            updateTransform(
                                "scaleY",
                                readNumber(
                                    event.target.value,
                                    transform.scaleY,
                                ),
                            )
                        }
                    />
                </InspectorField>
                <InspectorField label='Rotation' hint='deg'>
                    <InspectorInput
                        type='number'
                        step='1'
                        value={transform.rotation}
                        onChange={(event) =>
                            updateTransform(
                                "rotation",
                                readNumber(
                                    event.target.value,
                                    transform.rotation,
                                ),
                            )
                        }
                    />
                </InspectorField>
                <InspectorField label='Opacity'>
                    <InspectorInput
                        type='number'
                        step='0.05'
                        min='0'
                        max='1'
                        value={transform.opacity}
                        onChange={(event) =>
                            updateTransform(
                                "opacity",
                                readNumber(
                                    event.target.value,
                                    transform.opacity,
                                ),
                            )
                        }
                    />
                </InspectorField>
            </div>

            {(transform.width != null || transform.height != null) && (
                <div className='grid grid-cols-2 gap-3'>
                    <InspectorField label='Width' hint='px'>
                        <InspectorInput
                            type='number'
                            min={1}
                            value={transform.width ?? ""}
                            onChange={(event) =>
                                updateTransform(
                                    "width",
                                    readNumber(
                                        event.target.value,
                                        transform.width ?? 1,
                                    ),
                                )
                            }
                        />
                    </InspectorField>
                    <InspectorField label='Height' hint='px'>
                        <InspectorInput
                            type='number'
                            min={1}
                            value={transform.height ?? ""}
                            onChange={(event) =>
                                updateTransform(
                                    "height",
                                    readNumber(
                                        event.target.value,
                                        transform.height ?? 1,
                                    ),
                                )
                            }
                        />
                    </InspectorField>
                </div>
            )}
        </InspectorSection>
    );
};

const TextInspector: React.FC<{ clip: TextClip }> = ({ clip }) => {
    const updateTextClipContent = useEditorStore(
        (state) => state.updateTextClipContent,
    );
    const updateTextClipStyle = useEditorStore(
        (state) => state.updateTextClipStyle,
    );

    return (
        <InspectorSection title='Text' description='Content and typography'>
            <InspectorField label='Content'>
                <InspectorTextarea
                    value={clip.text}
                    onChange={(event) =>
                        updateTextClipContent({
                            clipId: clip.id,
                            text: event.target.value,
                        })
                    }
                />
            </InspectorField>

            <InspectorField label='Font'>
                <InspectorSelect
                    value={clip.style.fontFamily}
                    onChange={(event) =>
                        updateTextClipStyle({
                            clipId: clip.id,
                            style: { fontFamily: event.target.value },
                        })
                    }>
                    {FONT_FAMILIES.map((fontFamily) => (
                        <option key={fontFamily} value={fontFamily}>
                            {fontFamily.split(",")[0]}
                        </option>
                    ))}
                </InspectorSelect>
            </InspectorField>

            <div className='grid grid-cols-2 gap-3'>
                <InspectorField label='Size' hint='px'>
                    <InspectorInput
                        type='number'
                        min={1}
                        value={clip.style.fontSize}
                        onChange={(event) =>
                            updateTextClipStyle({
                                clipId: clip.id,
                                style: {
                                    fontSize: readNumber(
                                        event.target.value,
                                        clip.style.fontSize,
                                    ),
                                },
                            })
                        }
                    />
                </InspectorField>
                <InspectorField label='Weight'>
                    <InspectorSelect
                        value={String(clip.style.fontWeight ?? 400)}
                        onChange={(event) =>
                            updateTextClipStyle({
                                clipId: clip.id,
                                style: { fontWeight: event.target.value },
                            })
                        }>
                        <option value='400'>Regular</option>
                        <option value='500'>Medium</option>
                        <option value='600'>Semibold</option>
                        <option value='700'>Bold</option>
                        <option value='900'>Black</option>
                    </InspectorSelect>
                </InspectorField>
            </div>

            <InspectorField label='Align'>
                <SegmentedControl
                    value={clip.style.textAlign ?? "center"}
                    options={[
                        { label: "Left", value: "left" },
                        { label: "Center", value: "center" },
                        { label: "Right", value: "right" },
                    ]}
                    onChange={(textAlign) =>
                        updateTextClipStyle({
                            clipId: clip.id,
                            style: { textAlign },
                        })
                    }
                />
            </InspectorField>

            <div className='grid grid-cols-2 gap-3'>
                <InspectorField label='Text color'>
                    <ColorInput
                        value={clip.style.color}
                        onChange={(color) =>
                            updateTextClipStyle({
                                clipId: clip.id,
                                style: { color },
                            })
                        }
                    />
                </InspectorField>
                <InspectorField label='Background'>
                    <ColorInput
                        value={clip.style.backgroundColor ?? "#000000"}
                        onChange={(backgroundColor) =>
                            updateTextClipStyle({
                                clipId: clip.id,
                                style: { backgroundColor },
                            })
                        }
                    />
                </InspectorField>
            </div>
        </InspectorSection>
    );
};

const MediaInspector: React.FC<{ clip: VideoClip | AudioClip }> = ({
    clip,
}) => {
    const updateMediaClipSettings = useEditorStore(
        (state) => state.updateMediaClipSettings,
    );

    return (
        <InspectorSection title='Media' description='Playback controls'>
            <div className='grid grid-cols-2 gap-3'>
                <InspectorField label='Volume'>
                    <InspectorInput
                        type='number'
                        min={0}
                        max={1}
                        step='0.05'
                        value={clip.volume}
                        onChange={(event) =>
                            updateMediaClipSettings({
                                clipId: clip.id,
                                volume: readNumber(
                                    event.target.value,
                                    clip.volume,
                                ),
                            })
                        }
                    />
                </InspectorField>
                <InspectorField label='Speed'>
                    <InspectorInput
                        type='number'
                        min={0.1}
                        step='0.1'
                        value={clip.playbackRate ?? 1}
                        onChange={(event) =>
                            updateMediaClipSettings({
                                clipId: clip.id,
                                playbackRate: readNumber(
                                    event.target.value,
                                    clip.playbackRate ?? 1,
                                ),
                            })
                        }
                    />
                </InspectorField>
            </div>

            <label className='flex h-9 items-center justify-between rounded-md border border-black/10 bg-white px-3 text-sm'>
                <span className='font-medium text-neutral-700'>Mute clip</span>
                <input
                    type='checkbox'
                    checked={clip.isMuted ?? false}
                    onChange={(event) =>
                        updateMediaClipSettings({
                            clipId: clip.id,
                            isMuted: event.target.checked,
                        })
                    }
                />
            </label>
        </InspectorSection>
    );
};

const ImageInspector: React.FC<{ clip: ImageClip }> = ({ clip }) => {
    const updateImageClipSettings = useEditorStore(
        (state) => state.updateImageClipSettings,
    );

    return (
        <InspectorSection title='Image' description='Frame fitting'>
            <InspectorField label='Object fit'>
                <SegmentedControl
                    value={clip.objectFit ?? "contain"}
                    options={[
                        { label: "Contain", value: "contain" },
                        { label: "Cover", value: "cover" },
                        { label: "Fill", value: "fill" },
                    ]}
                    onChange={(objectFit) =>
                        updateImageClipSettings({
                            clipId: clip.id,
                            objectFit,
                        })
                    }
                />
            </InspectorField>
        </InspectorSection>
    );
};

const ShapeInspector: React.FC<{ clip: ShapeClip }> = ({ clip }) => {
    const updateShapeClipStyle = useEditorStore(
        (state) => state.updateShapeClipStyle,
    );

    return (
        <InspectorSection title='Shape' description='Fill and stroke'>
            <InspectorField label='Type'>
                <SegmentedControl
                    value={clip.shapeType}
                    options={[
                        { label: "Rect", value: "rectangle" },
                        { label: "Circle", value: "circle" },
                    ]}
                    onChange={(shapeType) =>
                        updateShapeClipStyle({
                            clipId: clip.id,
                            shapeType,
                        })
                    }
                />
            </InspectorField>

            <div className='grid grid-cols-2 gap-3'>
                <InspectorField label='Fill'>
                    <ColorInput
                        value={clip.fill}
                        onChange={(fill) =>
                            updateShapeClipStyle({ clipId: clip.id, fill })
                        }
                    />
                </InspectorField>
                <InspectorField label='Stroke'>
                    <ColorInput
                        value={clip.stroke ?? "#000000"}
                        onChange={(stroke) =>
                            updateShapeClipStyle({ clipId: clip.id, stroke })
                        }
                    />
                </InspectorField>
            </div>

            <InspectorField label='Stroke width' hint='px'>
                <InspectorInput
                    type='number'
                    min={0}
                    value={clip.strokeWidth ?? 0}
                    onChange={(event) =>
                        updateShapeClipStyle({
                            clipId: clip.id,
                            strokeWidth: readNumber(
                                event.target.value,
                                clip.strokeWidth ?? 0,
                            ),
                        })
                    }
                />
            </InspectorField>
        </InspectorSection>
    );
};

const ClipTypeInspector: React.FC<{ clip: TimelineClip }> = ({ clip }) => {
    if (clip.type === "text") {
        return <TextInspector clip={clip} />;
    }

    if (clip.type === "video" || clip.type === "audio") {
        return <MediaInspector clip={clip} />;
    }

    if (clip.type === "image") {
        return <ImageInspector clip={clip} />;
    }

    if (clip.type === "shape") {
        return <ShapeInspector clip={clip} />;
    }

    return null;
};

const SelectedClipInspector: React.FC<{ clip: TimelineClip }> = ({ clip }) => {
    const project = useEditorStore((state) => state.project);
    const fps = project.video.fps;

    return (
        <>
            <InspectorSection title='Clip' description='Selected layer'>
                <InspectorField label='Name'>
                    <InspectorInput readOnly value={clip.label} />
                </InspectorField>
                <div className='grid grid-cols-2 gap-3'>
                    <StatRow label='Type' value={clip.type.toUpperCase()} />
                    <StatRow label='Layer' value={String(clip.layerIndex)} />
                </div>
            </InspectorSection>

            <TimingControls clip={clip} fps={fps} />
            <TransformControls clip={clip} />
            <ClipTypeInspector clip={clip} />
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
        <aside className='flex h-full min-h-0 w-full flex-col overflow-hidden bg-neutral-50 text-neutral-900'>
            <div className='border-b border-black/10 bg-white px-4 py-3'>
                <p className='text-[11px] font-medium uppercase tracking-wide text-neutral-500'>
                    Inspector
                </p>
                <h1 className='mt-0.5 truncate text-sm font-semibold'>
                    {selectedClip ? selectedClip.label : project.name}
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
