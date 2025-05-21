
export function makeId(): string {
    const timestamp = Date.now(); // milliseconds since epoch
    const random = Math.floor(Math.random() * 1e6); // random 6-digit number
    const combined = BigInt(timestamp) * BigInt(1_000_000) + BigInt(random);
    return Math.floor(Math.random() * 1e4).toString(36) + combined.toString(36); // base36 encoding
}

export function strToBytes(str: string) {
    const data = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        data[i] = str.charCodeAt(i);
    }
    return data
}