import React from "react";

type TimelineItemsLayerProps = {
    children?: React.ReactNode;
};

const TimelineItemsLayer: React.FC<TimelineItemsLayerProps> = ({
    children,
}: TimelineItemsLayerProps) => {
    return <div className='relative'>{children}</div>;
};

export default TimelineItemsLayer;
