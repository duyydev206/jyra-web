import Playhead from "./components/playhead";
import TimelineRuler from "./components/timeline-ruler";
import TimelineToolbar from "./components/timeline-toolbar";
import TimelineBody from "./components/timeline-body";
import TimelineItem from "./components/timeline-item";
import { TimelineTrack } from "../../types";
import { buildTrackLaneLayouts } from "../../lib/build-track-lane-layouts";
import {
    buildItemLayouts,
    TimelineItemData,
} from "../../lib/build-item-layouts";
import TimelineTrackHeaders from "./components/timeline-track-headers";

const tracks: TimelineTrack[] = [
    {
        id: "track-1",
        groupId: "group-1",
        label: "Title",
        kind: "text",
        index: 0,
        height: 35,
        isLocked: false,
        isMuted: false,
        isHidden: false,
    },
    {
        id: "track-2",
        groupId: "group-1",
        label: "Subtitle",
        kind: "text",
        index: 1,
        height: 35,
        isLocked: false,
        isMuted: false,
        isHidden: false,
    },
    {
        id: "track-3",
        groupId: "group-2",
        label: "Audio",
        kind: "audio",
        index: 2,
        height: 71,
        isLocked: false,
        isMuted: false,
        isHidden: false,
    },
    {
        id: "track-4",
        groupId: "group-2",
        label: "Video",
        kind: "video",
        index: 3,
        height: 71,
        isLocked: false,
        isMuted: false,
        isHidden: false,
    },
];

const items: TimelineItemData[] = [
    {
        id: "item-1",
        trackId: "track-1",
        label: "Edit this video",
        left: 0,
        width: 160,
    },
    {
        id: "item-2",
        trackId: "track-2",
        label: "Demo",
        left: 220,
        width: 120,
    },
    {
        id: "item-3",
        trackId: "track-3",
        label: "Voice over",
        left: 120,
        width: 260,
    },
    {
        id: "item-4",
        trackId: "track-4",
        label: "Main footage",
        left: 420,
        width: 280,
    },
];

const Timeline: React.FC = () => {
    const laneResult = buildTrackLaneLayouts(tracks);
    const itemLayouts = buildItemLayouts(items, tracks, laneResult.layouts);

    return (
        <div className='w-full max-h-full h-full flex flex-col'>
            <TimelineToolbar />
            {/* ===== Resize handdle ===== */}
            <div className='relative w-full'>
                <div
                    className='absolute w-full shrink-0 select-none z-30'
                    style={{
                        transformOrigin: "center bottom",
                        cursor: "row-resize",
                        height: "5px",
                        top: "-2px",
                    }}
                />
            </div>
            {/* ===== Timeline outer ===== */}
            <div className='flex-1 w-full h-full shrink-0 overflow-hidden border'>
                {/* ===== Timeline surface ===== */}
                <div className='relative h-full w-full select-none'>
                    {/* ===== Absolute fill wrapper ===== */}
                    <div className='absolute inset-0 h-full w-full flex flex-col'>
                        {/* ===== Scroll viewport ===== */}
                        <div className='flex h-full w-full overflow-x-scroll overflow-y-scroll'>
                            {/* ===== Track controls ===== */}
                            <div className='sticky left-0 flex flex-col min-h-0 h-full z-20 min-w-28 bg-white'>
                                <TimelineTrackHeaders
                                    tracks={tracks}
                                    lanes={laneResult.layouts}
                                    totalHeight={laneResult.totalHeight}
                                />
                            </div>

                            {/* ===== Track corner ===== */}
                            <div
                                className='absolute top-0 left-0 h-7 w z-20 bg-gray-300'
                                style={{ width: "111px" }}></div>
                            <div className='relative h-full'>
                                {/* ===== Tick header =====*/}
                                <TimelineRuler />
                                {/* ===== Track container ===== */}
                                <TimelineBody
                                    width={1949}
                                    lanes={laneResult.layouts}
                                    totalHeight={laneResult.totalHeight}>
                                    {itemLayouts.map((item) => (
                                        <TimelineItem
                                            key={item.id}
                                            kind={item.kind}
                                            left={item.left}
                                            top={item.top}
                                            width={item.width}
                                            height={item.height}
                                            label={item.label}
                                            background={item.background}
                                            src={item.src}
                                            resizeHandleWidth={
                                                item.resizeHandleWidth
                                            }
                                            isLocked={item.isLocked}
                                            isHidden={item.isHidden}
                                            isMuted={item.isMuted}
                                        />
                                    ))}
                                </TimelineBody>
                                {/* ===== Playhead ===== */}
                                <Playhead />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
