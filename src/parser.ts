import { OtpAlgoritm, OtpData } from "./interfaces";
import { base32_encode } from "./libs/base32";
import { makeId, strToBytes } from "./utils";

// interface DecodedMigrationPayload {
//     accounts: OtpData[];
//     version: number;
//     batchSize: number;
//     batchIndex: number;
//     batchId: bigint; // Using bigint for potential large IDs
// }

function readVarInt(buffer: Uint8Array, offset: number): { value: number, length: number } {
    let value = 0;
    let shift = 0;
    let length = 0;

    while (true) {
        const byte = buffer[offset++];
        length++;
        value |= (byte & 0x7F) << shift;
        if ((byte & 0x80) === 0) break;
        shift += 7;
    }
    return { value, length };
}

export function parseFromGoogleAuthenticator(qrCodeUrl: string) {
    const url = new URL(qrCodeUrl);

    if (url.protocol !== 'otpauth-migration:') {
        throw new Error('Invalid protocol. Expected otpauth-migration:');
    }

    const dataParam = url.searchParams.get('data');
    if (!dataParam) {
        throw new Error('Missing data parameter in URL.');
    }
    // 1. Base64 Decode
    const str = atob(dataParam);

    // 2. Convert to bytes
    const data = strToBytes(str)

    return decodeGoogleAuthenticatorProto(data)
}

export function decodeGoogleAuthenticatorProto(data: Uint8Array) {
    // 3. Decode protobuf
    let offset = 0;
    const accounts: OtpData[] = []

    while (offset < data.length) {
        const tag = data[offset++];
        const fieldNum = tag >> 3;
        const wireType = tag & 0x07;

        // We only care otp_parameters (repeated field)
        if (fieldNum !== 1) {
            // skip unknown field
            if (wireType === 0) { // varint
                const { value, length } = readVarInt(data, offset)
                console.warn(`Skipped field ${fieldNum} with int value: ${value}`)
                offset += length
            } else if (wireType === 2) { // length-delimited
                const { value: valueLen, length } = readVarInt(data, offset);
                console.warn(`Skipped field ${fieldNum} with value len: ${valueLen}`)
                offset += length + valueLen;
            } else {
                throw new Error(`Unsupported wire type: ${wireType}`);
            }
            continue
        }

        if (wireType !== 2) {
            throw new Error(`Got fieldNum 1 but have invalid wireType: ${wireType}`)
        }

        // repeated otp_parameters
        const { value: len, length: lenBytes } = readVarInt(data, offset);
        offset += lenBytes;
        const accountBuf = data.slice(offset, offset + len);
        offset += len;

        let accOffset = 0;
        const account: Partial<OtpData> = {};
        account.id = makeId()

        while (accOffset < accountBuf.length) {
            const tag = accountBuf[accOffset++];
            const field = tag >> 3;
            const type = tag & 0x07;

            if (type === 2) { // length-delimited (string, bytes)
                const { value: len, length: lenBytes } = readVarInt(accountBuf, accOffset);
                accOffset += lenBytes;
                const valueBytes = accountBuf.slice(accOffset, accOffset + len);
                accOffset += len;

                const str = new TextDecoder().decode(valueBytes);

                if (field === 1) account.secret = base32_encode(valueBytes); // Convert to base32
                if (field === 2) account.name = str;
                if (field === 3) account.issuer = str;

            } else if (type === 0) { // varint (enum/int)
                const { value, length } = readVarInt(accountBuf, accOffset);
                accOffset += length;
                // ["SHA1", "SHA256", "SHA512", "MD5"]
                if (field === 4) account.algorithm = value as OtpAlgoritm
                if (field === 5) account.digits = value === 1 ? 6 : 8;
                if (field === 6) account.type = value //=== 2 ? "TOTP" : "HOTP";
                if (field === 7) account.counter = value;
            }
        }
        accounts.push(account as OtpData);
    }

    return accounts
}