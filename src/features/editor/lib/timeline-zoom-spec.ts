import { Frames } from "@/src/features/editor/types/primitives";

export type TickUnit =
    | "15f"
    | "1s"
    | "5s"
    | "10s"
    | "30s"
    | "1m"
    | "5m"
    | "10m"
    | "30m"
    | "1h"
    | "5h"
    | "10h"
    | "30h";

export type DurationBucketRule = {
    maxDurationSeconds: number;
    tailPaddingSeconds: number;
};

export const MIN_TIMELINE_VIEWPORT_WIDTH = 320;

export const TIMELINE_TICK_UNITS: TickUnit[] = [
    "15f",
    "1s",
    "5s",
    "10s",
    "30s",
    "1m",
    "5m",
    "10m",
    "30m",
    "1h",
    "5h",
    "10h",
    "30h",
];

export const TIMELINE_DURATION_BUCKET_RULES: DurationBucketRule[] = [
    {
        maxDurationSeconds: 8.99,
        tailPaddingSeconds: 1,
    },
    {
        maxDurationSeconds: 12,
        tailPaddingSeconds: 3,
    },
    {
        maxDurationSeconds: 15.99,
        tailPaddingSeconds: 4,
    },
    {
        maxDurationSeconds: 19.99,
        tailPaddingSeconds: 4,
    },
    {
        maxDurationSeconds: 24.99,
        tailPaddingSeconds: 5,
    },
    {
        maxDurationSeconds: 59.99,
        tailPaddingSeconds: 6,
    },
    {
        maxDurationSeconds: 119.99,
        tailPaddingSeconds: 20,
    },
    {
        maxDurationSeconds: 299.99,
        tailPaddingSeconds: 30,
    },
    {
        maxDurationSeconds: 359.99,
        tailPaddingSeconds: 45,
    },
    {
        maxDurationSeconds: 719.99,
        tailPaddingSeconds: 90,
    },
    {
        maxDurationSeconds: 1319.99,
        tailPaddingSeconds: 120,
    },
    {
        maxDurationSeconds: Infinity,
        tailPaddingSeconds: 180,
    },
];

export const getTickUnitFrames = (tickUnit: TickUnit, fps: number): Frames => {
    switch (tickUnit) {
        case "15f":
            return 15;
        case "1s":
            return fps;
        case "5s":
            return fps * 5;
        case "10s":
            return fps * 10;
        case "30s":
            return fps * 30;
        case "1m":
            return fps * 60;
        case "5m":
            return fps * 300;
        case "10m":
            return fps * 600;
        case "30m":
            return fps * 1800;
        case "1h":
            return fps * 3600;
        case "5h":
            return fps * 18000;
        case "10h":
            return fps * 36000;
        case "30h":
            return fps * 108000;
    }
};
