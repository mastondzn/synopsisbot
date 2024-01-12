export function setImmediateInterval(callback: () => void, ms: number) {
    callback();
    return setInterval(callback, ms);
}
