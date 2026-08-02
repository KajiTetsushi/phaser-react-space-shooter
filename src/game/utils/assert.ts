export default function assert(value: unknown, message: string): asserts value {
    if (value) {
        return;
    }

    throw new Error(`Invariant violation: ${message}`);
}
