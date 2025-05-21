import type { OtpData } from "./interfaces";
import { aesGcmDecrypt, aesGcmEncrypt } from "./libs/crypto-aes-gcm";
import { decodeGoogleAuthenticatorProto } from "./parser";


export class AppStorage {

    hasData() {
        return !!localStorage.data
    }

    async addItem(item: OtpData, password?: string) {
        return this.addItems([item], password)
    }

    async addItems(items: OtpData[], password?: string) {
        let accounts: OtpData[] = []
        if (this.hasData()) {
            accounts = await this.getData(password)
        }
        accounts.push(...items)
        return this.setData(accounts, password)
    }

    setData(raw: OtpData[], password?: string) {
        return aesGcmEncrypt(JSON.stringify(raw), password).then(
            encrypted => {
                localStorage.data = encrypted;
                return true
            }
        )
    }

    getData(password?: string) {
        return aesGcmDecrypt(localStorage.data, password).then<OtpData[]>(
            decrypted => {
                if (decrypted[0] != '[') {
                    // migrate from old format
                    let str = atob(decrypted);
                    const raw = new Uint8Array(str.length);
                    for (let i = 0; i < str.length; i++) {
                        raw[i] = str.charCodeAt(i);
                    }
                    const accounts = decodeGoogleAuthenticatorProto(raw)
                    console.warn(`Migrating old data to new object`, accounts)
                    this.setData(accounts, password)
                    return accounts
                }
                return JSON.parse(decrypted)
            }
        )
    }
}
