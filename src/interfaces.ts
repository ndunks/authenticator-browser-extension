import type { DialogManager } from "./dialog-manager"

export enum OtpAlgoritm {
    UNKNOWN,
    SHA1,
    SHA256,
    SHA512,
    MD5
}

export enum OtpType {
    UNKNOWN,
    HOTP,
    TOTP
}

export interface OtpData {
    // Generated Unique ID
    id: string
    /** base32 */
    secret: string
    name: string
    issuer: string
    algorithm: OtpAlgoritm
    // SIX or EIGHT
    digits: number
    type: OtpType
    /** Optional for HOTP */
    counter?: number
}


export interface Dialog {
    title: string
    content: string | HTMLElement
    onShow?(manager: DialogManager, param?: any): void
}
export interface DialogConstructor {
    new(): Dialog
}