// Format frame to time display.
// < 60 minutes  => MM:SS:CS
// >= 60 minutes => HH:MM:SS:CS
// CS = centiseconds (00-99)
export const formatTime = (frame: number, fps: number) => {
    const safeFrame = Math.max(0, frame);
    const totalMilliseconds = Math.floor((safeFrame / fps) * 1000);

    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalSeconds / 3600);

    const displayMinutes = Math.floor((totalSeconds % 3600) / 60);
    const displaySeconds = totalSeconds % 60;
    const centiseconds = Math.floor((totalMilliseconds % 1000) / 10);

    const pad2 = (value: number) => String(value).padStart(2, "0");

    if (hours > 0) {
        return `${pad2(hours)}:${pad2(displayMinutes)}:${pad2(displaySeconds)}:${pad2(centiseconds)}`;
    }

    return `${pad2(minutes)}:${pad2(displaySeconds)}:${pad2(centiseconds)}`;
};
