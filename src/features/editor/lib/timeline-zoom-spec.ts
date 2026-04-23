import { Frames } from "@/src/features/editor/types/primitives";

export type TickUnit = "15f" | "1s" | "5s" | "10s" | "30s" | "1m" | "5m";

export type DurationBucketRule = {
    maxDurationSeconds: number;
    zoomMap: Record<number, TickUnit>;
    tailPaddingSeconds: number;
};

export const MIN_TIMELINE_WIDTH = 1949;

export const TIMELINE_DURATION_BUCKET_RULES: DurationBucketRule[] = [
    {
        maxDurationSeconds: 8.99,
        zoomMap: {
            1: "1s",
            2: "1s",
            3: "15f",
            4: "15f",
            5: "15f",
            6: "15f",
            7: "15f",
            8: "15f",
            9: "15f",
            10: "15f",
        },
        tailPaddingSeconds: 1,
    },
    {
        maxDurationSeconds: 12,
        zoomMap: {
            1: "1s",
            2: "1s",
            3: "1s",
            4: "15f",
            5: "15f",
            6: "15f",
            7: "15f",
            8: "15f",
            9: "15f",
            10: "15f",
        },
        tailPaddingSeconds: 3,
    },
    {
        maxDurationSeconds: 15.99,
        zoomMap: {
            1: "5s",
            2: "1s",
            3: "1s",
            4: "1s",
            5: "15f",
            6: "15f",
            7: "15f",
            8: "15f",
            9: "15f",
            10: "15f",
        },
        tailPaddingSeconds: 4,
    },
    {
        maxDurationSeconds: 19.99,
        zoomMap: {
            1: "5s",
            2: "5s",
            3: "1s",
            4: "1s",
            5: "1s",
            6: "1s",
            7: "15f",
            8: "15f",
            9: "15f",
            10: "15f",
        },
        tailPaddingSeconds: 4,
    },
    {
        maxDurationSeconds: 24.99,
        zoomMap: {
            1: "5s",
            2: "5s",
            3: "5s",
            4: "1s",
            5: "1s",
            6: "1s",
            7: "1s",
            8: "1s",
            9: "15f",
            10: "15f",
        },
        tailPaddingSeconds: 5,
    },
    {
        maxDurationSeconds: 59.99,
        zoomMap: {
            1: "5s",
            2: "5s",
            3: "5s",
            4: "5s",
            5: "1s",
            6: "1s",
            7: "1s",
            8: "1s",
            9: "1s",
            10: "1s",
        },
        tailPaddingSeconds: 6,
    },
    {
        maxDurationSeconds: 119.99,
        zoomMap: {
            1: "10s",
            2: "5s",
            3: "5s",
            4: "5s",
            5: "5s",
            6: "5s",
            7: "5s",
            8: "5s",
            9: "1s",
            10: "1s",
        },
        tailPaddingSeconds: 20,
    },
    {
        maxDurationSeconds: 299.99,
        zoomMap: {
            1: "30s",
            2: "10s",
            3: "5s",
            4: "5s",
            5: "5s",
            6: "5s",
            7: "5s",
            8: "5s",
            9: "5s",
            10: "1s",
        },
        tailPaddingSeconds: 30,
    },
    {
        maxDurationSeconds: 359.99,
        zoomMap: {
            1: "30s",
            2: "10s",
            3: "5s",
            4: "5s",
            5: "5s",
            6: "5s",
            7: "5s",
            8: "5s",
            9: "5s",
            10: "5s",
        },
        tailPaddingSeconds: 45,
    },
    {
        maxDurationSeconds: 719.99,
        zoomMap: {
            1: "1m",
            2: "30s",
            3: "10s",
            4: "10s",
            5: "10s",
            6: "5s",
            7: "5s",
            8: "5s",
            9: "5s",
            10: "5s",
        },
        tailPaddingSeconds: 90,
    },
    {
        maxDurationSeconds: 1319.99,
        zoomMap: {
            1: "5m",
            2: "30s",
            3: "30s",
            4: "10s",
            5: "10s",
            6: "10s",
            7: "5s",
            8: "5s",
            9: "5s",
            10: "5s",
        },
        tailPaddingSeconds: 120,
    },
    {
        maxDurationSeconds: Infinity,
        zoomMap: {
            1: "5m",
            2: "1m",
            3: "30s",
            4: "30s",
            5: "10s",
            6: "10s",
            7: "10s",
            8: "10s",
            9: "10s",
            10: "5s",
        },
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
    }
};
