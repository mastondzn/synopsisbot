export class TTLSet<T> {
    private timers = new Map<T, NodeJS.Timeout>();
    private data = new Set<T>();

    public set(value: T, ttl: number) {
        if (this.timers.has(value)) clearTimeout(this.timers.get(value));
        this.timers.set(
            value,
            setTimeout(() => this.data.delete(value), ttl),
        );
        this.data.add(value);
    }

    public has(value: T) {
        return this.data.has(value);
    }

    public delete(value: T) {
        if (this.timers.has(value)) clearTimeout(this.timers.get(value));
        this.timers.delete(value);
        return this.data.delete(value);
    }

    public clear() {
        this.data.clear();
        for (const value of this.timers.values()) clearTimeout(value);
        this.timers.clear();
    }
}
