export const setImmediateInterval = (callback: () => void, ms: number) => {
    callback();
    return setInterval(callback, ms);
};
