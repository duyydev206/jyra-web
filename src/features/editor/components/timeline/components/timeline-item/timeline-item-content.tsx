import { HiSpeakerWave } from "react-icons/hi2";
import { BsType } from "react-icons/bs";
import { LuRectangleHorizontal } from "react-icons/lu";
import { FiImage } from "react-icons/fi";
import { RiMovie2Line } from "react-icons/ri";
import { TrackMediaKind } from "@/src/features/editor/types";

type TimelineItemContentProps = {
    kind: TrackMediaKind;
    label?: string;
    background?: string;
    src?: string;
    isMuted?: boolean;
};

const getDefaultBackground = (kind: TrackMediaKind) => {
    switch (kind) {
        case "text":
            return "rgb(122, 93, 232)";
        case "shape":
            return "rgb(176, 75, 207)";
        case "audio":
            return "rgb(58, 122, 68)";
        case "video":
            return "rgb(61, 94, 201)";
        case "image":
            return "rgb(255, 127, 80)";
        default:
            return "rgb(122, 93, 232)";
    }
};

const getKindIcon = (kind: TrackMediaKind) => {
    switch (kind) {
        case "text":
            return <BsType className='shrink-0 text-xs' />;
        case "shape":
            return <LuRectangleHorizontal className='shrink-0 text-xs' />;
        case "audio":
            return <HiSpeakerWave className='shrink-0 text-xs' />;
        case "video":
            return <RiMovie2Line className='shrink-0 text-xs' />;
        case "image":
            return <FiImage className='shrink-0 text-xs' />;
        default:
            return null;
    }
};

const TimelineItemContent: React.FC<TimelineItemContentProps> = ({
    kind,
    label,
    background,
    isMuted = false,
}: TimelineItemContentProps) => {
    const resolvedBackground = background ?? getDefaultBackground(kind);

    if (kind === "audio") {
        return (
            <div className='absolute h-full w-full'>
                <div
                    className='relative h-full w-full overflow-hidden'
                    style={{ background: resolvedBackground }}>
                    <div className='flex h-full w-full flex-nowrap gap-1 p-1 text-xs text-white'>
                        {getKindIcon(kind)}
                        <span className='truncate'>{label}</span>
                        {isMuted ? (
                            <span className='ml-auto text-[10px] opacity-80'>
                                Muted
                            </span>
                        ) : null}
                    </div>

                    <div className='absolute bottom-0 left-0 right-0 h-5 bg-black/10'>
                        <div className='absolute inset-y-1 left-0 right-0 opacity-40'>
                            <div className='absolute top-1/2 h-px w-full -translate-y-1/2 bg-white/30' />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (kind === "video" || kind === "image") {
        return (
            <div className='absolute h-full w-full'>
                <div
                    className='relative h-full w-full overflow-hidden'
                    style={{ background: resolvedBackground }}>
                    <div className='flex h-full w-full flex-nowrap gap-1 p-1 text-xs text-white'>
                        {getKindIcon(kind)}
                        <span className='truncate'>{label}</span>
                    </div>

                    <div className='absolute inset-x-0 bottom-0 h-5 bg-black/10'>
                        <div className='absolute inset-0 opacity-30'>
                            <div className='flex h-full gap-0.5 px-1'>
                                {Array.from({ length: 12 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className='h-full flex-1 rounded-b-xs bg-white/20'
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='absolute h-full w-full'>
            <div
                className='flex h-full w-full flex-nowrap gap-1 p-1 text-xs text-white'
                style={{ background: resolvedBackground }}>
                {getKindIcon(kind)}
                <span className='truncate'>{label}</span>
            </div>
        </div>
    );
};

export default TimelineItemContent;
