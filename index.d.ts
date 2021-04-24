var key: CryptoKey
var wrapper: HTMLDivElement
var main: HTMLDivElement
var setting: HTMLDivElement
var password: HTMLInputElement
var setPassword: HTMLInputElement
var data: HTMLTextAreaElement
var btnSetting: HTMLButtonElement
var btnSave: HTMLButtonElement
var items: HTMLDivElement

interface Storage {
    /** Encrypted auth data */
    data: string
}

function aesGcmEncrypt(plaintext: string, password: string): Promise<string>;
function aesGcmDecrypt(ciphertext: string, password: string): Promise<string>;